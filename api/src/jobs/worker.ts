import { pool } from "../db/pool";
import { MusicBrainzError } from "../musicbrainz/client";
import { RaeError, writeDraft } from "../rae/client";
import { draftRequestSchema } from "../rae/schemas";
import { assemble } from "./assemble";
import { findSong } from "./find-song";
import { matchDraft } from "./match-draft";
import { saveMixtape } from "./save";

// Run generation jobs, one at a time: draft, match on MusicBrainz, then save.
const IDLE_WAIT_MS = 2000;

type Job = { 
    id: string;
    user_id: string;
    input: unknown 
};

class JobError extends Error {}

// Retrieve the next job waiting to be processed and change its status from queued to drafting.
// Prevent two workers from claiming the same job (FOR UPDATE SKIP LOCKED).
async function claimNextJob(): Promise<Job | null> {
    const result = await pool.query<Job>(
        `UPDATE generation_jobs
         SET status = 'drafting', updated_at = now()
         WHERE id = (
            SELECT id FROM generation_jobs
            WHERE status = 'queued'
            ORDER BY created_at
            FOR UPDATE SKIP LOCKED
            LIMIT 1
         )
         RETURNING id, user_id, input`,
    );

    return result.rows[0] ?? null;
}

type JobFields = Partial<{
    status: "matching" | "saving" | "done" | "failed";
    tracks_total: number;
    tracks_matched: number;
    result_version_id: string;
    error: string;
}>;

async function update(jobId: string, fields: JobFields) {
    const names = Object.keys(fields);
    const sets = names.map((name, i) => `${name} = $${i + 2}`).join(", ");
    await pool.query(
        `UPDATE generation_jobs
         SET ${sets}, updated_at = now() WHERE id = $1`,
         [jobId, ...Object.values(fields)]
    );
}

async function runJob(job: Job) {
    const request = draftRequestSchema.parse(job.input);
    const draft = await writeDraft(request);

    const total = draft.sides.reduce((sum, s) => sum + s.tracks.length, 0);
    await update(job.id, {
        status: "matching", 
        tracks_total: total, 
        tracks_matched: 0
    });

    const matches = await matchDraft(draft, (checked) => update(job.id, { tracks_matched: checked }), findSong);
    await update(job.id, { status: "saving" });

    const assembled = assemble(draft, matches);
    if (assembled.sides.length === 0) {
        throw new JobError("None of the songs could be found on MusicBrainz.");
    }

    if (assembled.dropped.length > 0) {
        console.warn(`Job ${job.id}: dropped ${assembled.dropped.length} track(s) with no backup left.`);
    }

    const { versionId } = await saveMixtape({ userId: job.user_id, request, draft, assembled });
    await update(job.id, { status: "done", result_version_id: versionId });
}

function messageFor(err: unknown): string {
    if (err instanceof JobError) return err.message;
    if (err instanceof RaeError) return "Rae couldn't finish this one. Try again later.";
    if (err instanceof MusicBrainzError) return "MusicBrainz is busy right now. Try again in a few minutes.";
    return "Something went wrong on our side.";
}

// Runs the next queued job, if there is one. Returns false when there is nothing else to do.
export async function runNextJob(): Promise<boolean> {
    const job = await claimNextJob();
    if (!job) return false;

    try {
        await runJob(job);
    } catch (err) {
        console.error(`Job ${job.id} failed: `, err);
        await update(job.id, { status: "failed", error: messageFor(err) });
    }

    return true;
}

// If a server restarts, jobs that were running will never finish.
async function failInterruptedJobs() {
    const { rowCount } = await pool.query(
        `UPDATE generation_jobs
         SET status = 'failed', error = 'Interrupted. Try again.', updated_at = now()
         WHERE status IN ('drafting', 'matching', 'saving')`,
    );

    if (rowCount) console.warn(`Marked ${rowCount} interrupted job(s) as failed.`);
}

export async function startWorker() {
    await failInterruptedJobs();
    console.log("Worker started.");

    while (true) {
        try {
            const didWork = await runNextJob();
            if (!didWork) {
                await new Promise((resolve) => setTimeout(resolve, IDLE_WAIT_MS));
            }
        } catch (err) {
            console.error("Worker error: ", err);
            await new Promise((resolve) => setTimeout(resolve, IDLE_WAIT_MS));
        }
    }
}