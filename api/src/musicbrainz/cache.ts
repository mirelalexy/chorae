import { pool } from "../db/pool";
import { coverArtUrl } from "./coverart";
import type { MatchedTrack } from "./types";

// Save a matched recording in the tracks table.
// Refresh details if it already exists.

export async function saveTrack(track: MatchedTrack): Promise<void> {
    await pool.query(
        `INSERT INTO tracks (mbid, title, artist, length_ms, isrc, release_mbid, cover_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (mbid) DO UPDATE SET
            title = EXCLUDED.title,
            artist = EXCLUDED.artist,
            length_ms = EXCLUDED.length_ms,
            isrc = COALESCE(EXCLUDED.isrc, tracks.isrc),
            release_mbid = EXCLUDED.release_mbid,
            cover_url = EXCLUDED.cover_url,
            fetched_at = now()`,
        [
            track.mbid,
            track.title,
            track.artist,
            track.lengthMs,
            track.isrc,
            track.releaseMbid,
            coverArtUrl(track.releaseGroupMbid),
        ],
    );
}