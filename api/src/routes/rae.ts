import { Router } from "express";
import { z } from "zod";
import { askQuestions, RaeError } from "../rae/client";
import { draftRequestSchema } from "../rae/schemas";
import { requireUser } from "./user";
import { loadPersonal } from "../rae/load-personal";
import { pool } from "../db/pool";
import { type Artist, artistSchema, MAX_AVOIDED, preferencesUpdate } from "../rae/personal";

export const rae = Router();
rae.use(requireUser);

const questionsBody = z.object({ 
    prompt: draftRequestSchema.shape.prompt,
    seeds: draftRequestSchema.shape.seeds.optional(),
});

// POST /rae/questions { prompt, seeds? } -> { "questions": [...] }
rae.post("/questions", async (req, res) => {
    const parsed = questionsBody.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({ error: "Tell Rae what the mixtape is for." });
        return;
    }

    try {
        const personal = await loadPersonal(res.locals.userId);
        res.json(await askQuestions(parsed.data.prompt, parsed.data.seeds, personal));
    } catch (err) {
        if (err instanceof RaeError) {
            console.error(err);
            res.status(502).json({ error: "Couldn't reach Rae. Try again in a moment." });
            return;
        }
        throw err;
    }
});

// Ways to make Rae more personal to user: note, discovery preferences, and artists to avoid.
// GET /rae/preferences -> { note, discovery, avoid: [{ mbid, name }] }
rae.get("/preferences", async (_req, res) => {
    const userId = res.locals.userId;

    const [user, avoid] = await Promise.all([
        pool.query<{ 
            rae_note: string | null; 
            discovery_preference: string | null;
        }>(
            `SELECT rae_note, discovery_preference FROM users WHERE id = $1`,
            [userId],
        ),
        pool.query<Artist>(
            `SELECT mbid, name 
             FROM avoided_artists
             WHERE user_id = $1 
             ORDER BY created_at`,
            [userId],
        ),
    ]);

    const row = user.rows[0]!;
    res.json({ note: row.rae_note, discovery: row.discovery_preference, avoid: avoid.rows });
});

// PATCH /rae/preferences { note?, discovery? } -> 204
// An empty note clears it, discovery empty goes back to Rae asking each time.
rae.patch("/preferences", async (req, res) => {
    const parsed = preferencesUpdate.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Check the highlighted fields.", issues: parsed.error.issues });
        return;
    }

    const { note, discovery } = parsed.data;

    await pool.query(
        `UPDATE users
         SET rae_note = CASE WHEN $1 THEN $2 ELSE rae_note END,
            discovery_preference = CASE WHEN $3 THEN $4 ELSE discovery_preference END
         WHERE id = $5`,
        [note !== undefined, note ?? null, discovery !== undefined, discovery ?? null, res.locals.userId],
    );
    res.status(204).end();
});

// POST /rae/avoid { mbid, name } -> 201 { artist }
// The ID is what counts, but the name is kept up to date for showing it.
rae.post("/avoid", async (req, res) => {
    const parsed = artistSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "That artist isn't quite right." });
        return;
    }

    const { mbid, name } = parsed.data;
    const userId = res.locals.userId;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Keep changes to the user's list in order.
        await client.query(
            "SELECT id FROM users WHERE id = $1 FOR UPDATE",
            [userId],
        );

        const existing = await client.query(
            `SELECT 1 FROM avoided_artists
             WHERE user_id = $1 AND mbid = $2`,
            [userId, mbid],
        );

        if (existing.rowCount === 0) {
            const count = await client.query<{ n: number }>(
                `SELECT count(*)::int AS n
                 FROM avoided_artists WHERE user_id = $1`,
                [userId],
            );

            if (count.rows[0]!.n >= MAX_AVOIDED) {
                await client.query("ROLLBACK");
                res.status(409).json({
                    error: `That's ${MAX_AVOIDED} artists already. Remove one to add another.`,
                });
                return;
            }
        }

        const result = await client.query<Artist>(
            `INSERT INTO avoided_artists (user_id, mbid, name)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, mbid)
             DO UPDATE SET name = EXCLUDED.name
             RETURNING mbid, name`,
            [userId, mbid, name],
        );

        await client.query("COMMIT");
        res.status(existing.rowCount === 0 ? 201 : 200).json({
            artist: result.rows[0],
        });
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

// DELETE /rae/avoid/:mbid -> 204
rae.delete("/avoid/:mbid", async (req, res) => {
    const params = z.object({ mbid: z.guid() }).safeParse(req.params);
    if (!params.success) {
        res.status(404).json({ error: "That artist isn't on your list." });
        return;
    }

    await pool.query(
        `DELETE FROM avoided_artists 
        WHERE user_id = $1 AND mbid = $2`, 
        [res.locals.userId, params.data.mbid]
    );
    res.status(204).end();
});
