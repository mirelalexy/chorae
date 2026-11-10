import { Router } from "express";
import { requireUser } from "./user";
import { FAVORITE_KINDS, favoriteBody, FavoriteKind, profileUpdate } from "../profile/fields";
import { z } from "zod";
import { pool } from "../db/pool";

// The profile page: display name, email, about, genres, and favorites (artist, song, and album).
export const profile = Router();
profile.use(requireUser);

type FavoriteRow = {
    kind: FavoriteKind;
    mbid: string;
    name: string;
    artist: string | null;
    cover_url: string | null;
    year: string | null;
};

function toFavorite(row: FavoriteRow) {
    return {
        mbid: row.mbid,
        name: row.name,
        artist: row.artist,
        coverUrl: row.cover_url,
        year: row.year,
    };
}

type StatsRow = {
    tapes: number;
    songs: number;
    stories: number;
};

type ProfileRow = {
    display_name: string;
    email: string;
    about: string | null;
    genres: string[];
    created_at: Date;
};

const kindParam = z.object({
    kind: z.enum(FAVORITE_KINDS),
});

// GET /profile -> { profile, favorites: { artist, album, song }, stats }
profile.get("/", async (_req, res) => {
    const userId = res.locals.userId;

    const [user, favorites, stats] = await Promise.all([
        pool.query<ProfileRow>(
            `SELECT display_name, email, about, genres, created_at
             FROM users
             WHERE id = $1`,
             [userId]
        ),
        pool.query<FavoriteRow>(
            `SELECT kind, mbid, name, artist, year, cover_url
             FROM taste_items
             WHERE user_id = $1 AND is_favorite`,
             [userId]
        ),
        // Count number of mixtapes, the number of stories from them, 
        // and songs only from each mixtape's current version.
         pool.query<StatsRow>(
            `SELECT count(DISTINCT m.id)::int AS tapes,
                    count(vt.*)::int AS songs,
                    count(DISTINCT m.id) 
                        FILTER (WHERE v.is_story)::int AS stories
             FROM mixtapes m
             JOIN mixtape_versions v ON v.id = m.current_version_id
             LEFT JOIN version_tracks vt ON vt.version_id = v.id
             WHERE m.user_id = $1`,
             [userId],
         ),
    ]);

    const u = user.rows[0];
    const byKind = Object.fromEntries(favorites.rows.map((row) => [row.kind, toFavorite(row)]));
    const s = stats.rows[0];

    res.json({
        profile: {
            displayName: u.display_name,
            email: u.email,
            about: u.about,
            genres: u.genres,
            createdAt: u.created_at,
        },
        favorites: {
            artist: byKind.artist ?? null,
            album: byKind.album ?? null,
            song: byKind.song ?? null,
        },
        stats: {
            tapes: s.tapes,
            songs: s.songs,
            stories: s.stories,
        },
    });
});

// PATCH /profile { displayName?, about?, genres? } -> 204
profile.patch("/", async (req, res) => {
    const userId = res.locals.userId;
    const parsed = profileUpdate.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({ error: "Check the highlighted fields.", issues: parsed.error.issues });
        return;
    }

    const { displayName, about, genres } = parsed.data;

    await pool.query(
        `UPDATE users
         SET display_name = coalesce($2, display_name),
             about = CASE WHEN $3 THEN $4 ELSE about END,
             genres = coalesce($5, genres)
         WHERE id = $1`,
         [userId, displayName ?? null, about !== undefined, about ?? null, genres ?? null],
    );

    res.status(204).end();
});

// PUT /profile/favorites/:kind { mbid, name, artist?, year?, coverUrl? } -> { favorite }
// Becomes favorite of that kind and part of taste if not already.
profile.put("/favorites/:kind", async (req, res) => {
    const userId = res.locals.userId;

    const params = kindParam.safeParse(req.params);
    const body = favoriteBody.safeParse(req.body);

    if (!params.success || !body.success) {
        res.status(400).json({ error: "That favorite isn't quite right." });
        return;
    }

    const { kind } = params.data;
    const pick = body.data;

    // There are no artist photos yet.
    const coverUrl = kind === "artist" ? null : (pick.coverUrl ?? null);

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        // Remove old favorite when changing (but keep in taste).
        await client.query(
            `UPDATE taste_items
             SET is_favorite = false
             WHERE user_id = $1 AND kind = $2 AND is_favorite`,
             [userId, kind],
        );

        const saved = await client.query<FavoriteRow>(
            `INSERT INTO taste_items (user_id, kind, mbid, name, artist, year, cover_url, is_favorite)
             VALUES ($1, $2, $3, $4, $5, $6, $7, true)
             ON CONFLICT (user_id, kind, mbid) DO UPDATE
                SET is_favorite = true
                    name = EXCLUDED.name,
                    cover_url = coalesce(EXCLUDED.cover_url, taste_items.cover_url)
             RETURNING kind, mbid, name, artist, year, cover_url`,
             [userId, kind, pick.mbid, pick.name, pick.artist ?? null, pick.year ?? null, coverUrl],
        );

        await client.query("COMMIT");
        res.json({ favorite: toFavorite(saved.rows[0]!) });
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

// DELETE /profile/favorites/:kind -> 204 (stays in taste, just not favorites)
profile.delete("/favorites/:kind", async (req, res) => {
    const userId = res.locals.userId;
    const params = kindParam.safeParse(req.params);

    if (!params.success) {
        res.status(400).json({ error: "No such favorite." });
        return;
    }

    await pool.query(
        `UPDATE taste_items 
         SET is_favorite = false
         WHERE user_id = $1 AND kind = $2`,
         [userId, params.data.kind]
    );

    res.status(204).end();
});