
import { pool } from "../db/pool";
import type { Personal } from "./personal";

// How much of someone's taste goes to Rae. Favorites first, then newest.
const MAX_ARTISTS = 30;
const MAX_ALBUMS = 20;

type TasteRow = {
    kind: "artist" | "album";
    mbid: string;
    name: string;
    artist: string | null;
};

export async function loadPersonal(userId: string): Promise<Personal> {
    const [user, taste, avoid] = await Promise.all([
        pool.query<{
            rae_note: string | null;
            discovery_preference: Personal["discovery"];
        }>(
            `SELECT rae_note, discovery_preference
            FROM users
            WHERE id = $1`,
            [userId],
        ),
        pool.query<TasteRow>(
            `(SELECT kind, mbid, name, artist
            FROM taste_items
            WHERE user_id = $1 AND kind = 'artist'
            ORDER BY is_favorite DESC, created_at DESC
            LIMIT $2)
            UNION ALL
            (SELECT kind, mbid, name, artist
            FROM taste_items
            WHERE user_id = $1 AND kind = 'album'
            ORDER BY is_favorite DESC, created_at DESC
            LIMIT $3)`,
            [userId, MAX_ARTISTS, MAX_ALBUMS],
        ),
        pool.query<Personal["avoid"][number]>(
            `SELECT mbid, name
            FROM avoided_artists
            WHERE user_id = $1
            ORDER BY created_at`,
            [userId],
        ),
    ]);

    const row = user.rows[0];

    return {
        artists: taste.rows
            .filter((t) => t.kind === "artist")
            .map((t) => ({ mbid: t.mbid, name: t.name })),

        albums: taste.rows
            .filter((t) => t.kind === "album")
            .map((t) => ({
                mbid: t.mbid,
                name: t.name,
                artist: t.artist!,
            })),

        note: row?.rae_note ?? null,
        discovery: row?.discovery_preference ?? null,
        avoid: avoid.rows,
    };
}