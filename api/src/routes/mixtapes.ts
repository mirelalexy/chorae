import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireUser } from "./user";
import { draftRequestSchema } from "../rae/schemas";
import { config } from "../config";

export const mixtapes = Router();
export const jobs = Router();

mixtapes.use(requireUser);
jobs.use(requireUser);

const idParam = z.object({ id: z.uuid() });

// The daily limit: mixtapes started in the last 24 hours. A job that failed before
// Rae wrote anything costs nothing, so it doesn't count. Retries reuse their jobs.
async function mixtapesToday(userId: string) {
    const result = await pool.query<{ used: number; resets_at: Date | null }>(
        `SELECT count(*)::int AS used, min(created_at) + interval '24 hours' AS resets_at
         FROM generation_jobs
         WHERE user_id = $1
            AND created_at > now() - interval '24 hours'
            AND (status <> 'failed' OR draft IS NOT NULL)`,
         [userId],
    );
    const { used, resets_at } = result.rows[0]!;

    return {
        used, 
        limit: config.DAILY_MIXTAPE_LIMIT, 
        resetsAt: resets_at,
    };
}

// GET /mixtapes/today -> { used, limit, resetsAt }, for "2 of 5 left today"
mixtapes.get("/today", async (_req, res) => {
    res.json(await mixtapesToday(res.locals.userId));
});

// GET /mixtapes -> { mixtapes: [...] }, newest first, with what a list needs:
// the track count, the total length, and up to four covers for the artwork.
mixtapes.get("/", async (_req, res) => {
    const { rows } = await pool.query(
        `SELECT m.id, m.title, m.created_at, v.is_story,
                stats.track_count, stats.total_ms, stats.covers
         FROM mixtapes m
         JOIN mixtape_versions v ON v.id = m.current_version_id
         CROSS JOIN LATERAL (
             SELECT count(*)::int AS track_count,
                    coalesce(sum(t.length_ms), 0) AS total_ms,
                    (array_remove(array_agg(t.cover_url ORDER BY vt.position), NULL)) AS covers
             FROM version_tracks vt
             JOIN tracks t ON t.mbid = vt.recording_mbid
             WHERE vt.version_id = v.id
         ) stats
         WHERE m.user_id = $1
         ORDER BY m.created_at DESC`,
        [res.locals.userId],
    );

    res.json({
        mixtapes: rows.map((m) => ({
            id: m.id,
            title: m.title,
            createdAt: m.created_at,
            isStory: m.is_story,
            trackCount: m.track_count,
            totalMs: Number(m.total_ms), // bigint comes back from pg as a string
            covers: [...new Set<string>(m.covers ?? [])].slice(0, 4),
        })),
    });
});

// POST /mixtapes { prompt, answers, minutes, seeds, story } -> 202 {jobId}
// Does not wait for the mixtape: it queues a job and answers right away.
mixtapes.post("/", async(req, res) => {
    const parsed = draftRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "That request isn't quite right.", issues: parsed.error.issues });
        return;
    }

    const today = await mixtapesToday(res.locals.userId);
    if (today.used >= today.limit) {
        res.status(429).json({
            error: `That's ${today.used} mixtapes today. Come back tomorrow.`,
            resetsAt: today.resetsAt,
        })
    }

    const result = await pool.query<{ id: string }>(
        `INSERT INTO generation_jobs (user_id, input)
         VALUES ($1, $2)
         RETURNING id`,
         [res.locals.userId, JSON.stringify(parsed.data)]
    );

    res.status(202).json({ jobId: result.rows[0]!.id });
});

// GET /jobs/active -> { job: { id, status, prompt } | null }, the newest mixtape
// still being made, so Home can show it if the person left the working screen.
jobs.get("/active", async (_req, res) => {
    const result = await pool.query<{ id: string; status: string; prompt: string }>(
        `SELECT id, status, input->>'prompt' AS prompt
         FROM generation_jobs
         WHERE user_id = $1
           AND mixtape_id IS NULL
           AND status IN ('queued', 'drafting', 'matching', 'saving')
         ORDER BY created_at DESC
         LIMIT 1`,
         [res.locals.userId],
    );
    
    res.json({ job: result.rows[0] ?? null });
});

// GET /jobs/:id -> { status, tracksTotal, tracksMatched, error, mixtapeId }
// The app asks every few seconds while it's working.
jobs.get("/:id", async (req, res) => {
    const params = idParam.safeParse(req.params);
    if (!params.success) {
        res.status(404).json({ error: "No such job." });
        return;
    }

    const result = await pool.query(
        `SELECT j.status, j.tracks_total, j.tracks_matched, j.error, v.mixtape_id
         FROM generation_jobs j
         LEFT JOIN mixtape_versions v ON v.id = j.result_version_id
         WHERE j.id = $1 AND j.user_id = $2`,
         [params.data.id, res.locals.userId]
    );

    const job = result.rows[0];
    if (!job) {
        res.status(404).json({ error: "No such job." });
        return;
    }

    res.json({
        status: job.status,
        tracksTotal: job.tracks_total,
        tracksMatched: job.tracks_matched,
        error: job.error,
        mixtapeId: job.mixtape_id
    });
});

// POST /jobs/:id/retry -> 202, the job is queued again
jobs.post("/:id/retry", async (req, res) => {
    const params = idParam.safeParse(req.params);
    if (!params.success) {
        res.status(404).json({ error: "No such job." });
        return;
    }

    const result = await pool.query<{ status: string }>(
        `SELECT status
         FROM generation_jobs
         WHERE id = $1 AND user_id = $2`,
         [params.data.id, res.locals.userId]
    );

    const job = result.rows[0];
    if (!job) {
        res.status(404).json({ error: "No such job." });
        return;
    }

    if (job.status !== "failed") {
        res.status(409).json({ error: "Only a failed job can be tried again." });
        return;
    }

    await pool.query(
        `UPDATE generation_jobs
         SET status = 'queued', error = NULL, tracks_matched = 0, updated_at = now()
         WHERE id = $1`,
         [params.data.id]
    );

    res.status(202).json({ jobId: params.data.id });
});

// GET /mixtapes/:id -> the finished mixtape
mixtapes.get("/:id", async (req, res) => {
    const params = idParam.safeParse(req.params);
    if (!params.success) {
        res.status(404).json({ error: "No such mixtape." });
        return;
    }

    const header = await pool.query(
        `SELECT m.id, m.title, m.share_slug, v.id AS version_id, v.version_number, v.intro, v.is_story, v.missing_seeds
         FROM mixtapes m
         JOIN mixtape_versions v ON v.id = m.current_version_id
         WHERE m.id = $1 AND m.user_id = $2`,
         [params.data.id, res.locals.userId]
    );

    const mixtape = header.rows[0];
    if (!mixtape) {
        res.status(404).json({ error: "No such mixtape." });
        return;
    }

    const sides = await pool.query(
        `SELECT position, title, mood_line
         FROM version_sides
         WHERE version_id = $1
         ORDER BY position`,
         [mixtape.version_id]
    );

    const tracks = await pool.query(
        `SELECT vt.side_position, vt.note, vt.is_seed, t.mbid, t.title, t.artist, t.length_ms, t.cover_url
         FROM version_tracks vt
         JOIN tracks t ON t.mbid = vt.recording_mbid
         WHERE vt.version_id = $1
         ORDER BY vt.position`,
         [mixtape.version_id]
    );

    res.json({
        id: mixtape.id,
        title: mixtape.title,
        shareSlug: mixtape.share_slug,
        version: mixtape.version_number,
        intro: mixtape.intro,
        isStory: mixtape.is_story,
        missingSeeds: mixtape.missing_seeds,
        sides: sides.rows.map((side) => ({
            title: side.title,
            moodLine: side.mood_line,
            tracks: tracks.rows
                .filter((t) => t.side_position === side.position)
                .map((t) => ({
                    mbid: t.mbid,
                    title: t.title,
                    artist: t.artist,
                    lengthMs: t.length_ms,
                    coverUrl: t.cover_url,
                    note: t.note,
                    isSeed: t.is_seed
                }))
        }))
    });
});