import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireUser } from "./user";
import { draftRequestSchema } from "../rae/schemas";

export const mixtapes = Router();
export const jobs = Router();

mixtapes.use(requireUser);
jobs.use(requireUser);

const idParam = z.object({ id: z.uuid() });

// POST /mixtapes { prompt, answers, minutes, seeds, story } -> 202 {jobId}
// Does not wait for the mixtape: it queues a job and answers right away.
mixtapes.post("/", async(req, res) => {
    const parsed = draftRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "That request isn't quite right.", issues: parsed.error.issues });
        return;
    }

    const result = await pool.query<{ id: string }>(
        `INSERT INTO generation_jobs (user_id, input)
         VALUES ($1, $2)
         RETURNING id`,
         [res.locals.userId, JSON.stringify(parsed.data)]
    );

    res.status(202).json({ jobId: result.rows[0]!.id });
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