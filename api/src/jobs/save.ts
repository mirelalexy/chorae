import { randomBytes } from "node:crypto";
import { pool } from "../db/pool";
import { type Draft, type DraftRequest } from "../rae/schemas"
import { type Assembled } from "./assemble";

// Writes a finished mixtape to the db.
export type SaveInput = {
    userId: string;
    request: DraftRequest;
    draft: Pick<Draft, "title" | "intro">;
    assembled: Assembled;
}

export async function saveMixtape({ userId, request, draft, assembled }: SaveInput) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // A random share link: /mixtape/<share_slug>.
        const shareSlug = randomBytes(9).toString("base64url");

        const mixtape = await client.query<{ id: string }>(
            `INSERT INTO mixtapes (user_id, title, origin, share_slug)
             VALUES ($1, $2, 'rae_generated', $3)
             RETURNING id`,
             [userId, draft.title, shareSlug]
        );
        const mixtapeId = mixtape.rows[0]!.id;

        const version = await client.query<{ id: string }>(
            `INSERT INTO mixtape_versions (mixtape_id, version_number, source, prompt, answers, intro, is_story, missing_seeds)
             VALUES ($1, 1, 'rae', $2, $3, $4, $5, $6)
             RETURNING id`,
             [mixtapeId, request.prompt, JSON.stringify(request.answers), draft.intro, request.story, JSON.stringify(assembled.missingSeeds)]
        );
        const versionId = version.rows[0]!.id;

        let position = 0;
        for (const [sidePosition, side] of assembled.sides.entries()) {
            await client.query(
                `INSERT INTO version_sides (version_id, position, title, mood_line)
                 VALUES ($1, $2, $3, $4)`,
                 [versionId, sidePosition, side.title, side.moodLine]
            );

            for (const t of side.tracks) {
                await client.query(
                    `INSERT INTO version_tracks (version_id, position, side_position, recording_mbid, note, is_seed)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                     [versionId, position, sidePosition, t.track.mbid, t.note, t.isSeed]
                );
                position++;
            }
        }

        await client.query(
            `UPDATE mixtapes
             SET current_version_id = $1, updated_at = now()
             WHERE id = $2`,
             [versionId, mixtapeId]
        );

        await client.query("COMMIT");
        return { mixtapeId, versionId };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}