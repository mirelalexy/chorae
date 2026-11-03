import { Router } from "express";
import { requireUser } from "./user";
import { z } from "zod";
import { pool } from "../db/pool";

// The artists, albums and songs someone loves: picked in onboarding, editable any time.
export const taste = Router();
taste.use(requireUser);

type TasteRow = {
    id: string;
    kind: string;
    mbid: string;
    name: string;
    artist: string | null;
    cover_url: string | null;
    year: string | null;
}

function toItem(row: TasteRow) {
    return {
        id: row.id,
        kind: row.kind,
        mbid: row.mbid,
        name: row.name,
        artist: row.artist,
        coverUrl: row.cover_url,
        year: row.year,
    };
}

const newItem = z.object({
    kind: z.enum(["artist", "album"]),
    mbid: z.guid(),
    name: z.string().trim().min(1).max(300),
    artist: z.string().trim().max(300).nullish(),
    coverUrl: z.string().startsWith("https://coverartarchive.org/").max(300).nullish(),
    year: z.string().regex(/^\d{4}$/).nullish(),
});

// GET /taste  ->  { items: [...] }, oldest first, the order they were picked in
taste.get("/", async (_req, res) => {
    const result = await pool.query<TasteRow>(
        `SELECT id, kind, mbid, name, artist, cover_url, year
         FROM taste_items 
         WHERE user_id = $1 
         ORDER BY created_at`,
         [res.locals.userId],
    );

    res.json({ items: result.rows.map(toItem) });
});

// POST /taste  { kind, mbid, name, artist?, coverUrl? }  ->  201 { item }
// Picking something already picked just returns it, so a double tap does no harm.
taste.post("/", async (req, res) => {
    const parsed = newItem.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({ error: "That pick isn't quite right.", issues: parsed.error.issues });
        return;
    }

    const { kind, mbid, name, artist, coverUrl, year } = parsed.data;

    const result = await pool.query<TasteRow>(
        `INSERT INTO taste_items (user_id, kind, mbid, name, artist, cover_url, year)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, kind, mbid) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, kind, mbid, name, artist, cover_url, year`,
         [res.locals.userId, kind, mbid, name, artist ?? null, coverUrl ?? null, year ?? null],
    );

    res.status(201).json({ item: toItem(result.rows[0]!) });
});

// DELETE /taste/:id  ->  204
taste.delete("/:id", async (req, res) => {
    const params = z.object({ id: z.uuid() }).safeParse(req.params);

    if (!params.success) {
        res.status(404).json({ error: "No such pick." });
        return;
    }

    const result = await pool.query(
        `DELETE FROM taste_items WHERE id = $1 AND user_id = $2`, 
         [params.data.id, res.locals.userId]
    );

    if (!result.rowCount) {
        res.status(404).json({ error: "No such pick." });
        return;
    }

    res.status(204).end();
});