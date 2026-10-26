// Find one song: from the lookup table first, then MusicBrainz.
// Remember either the match or the fact that nothing was found.

import { pool } from "../db/pool";
import { saveTrack } from "../musicbrainz/cache";
import { matchTrack } from "../musicbrainz/match";
import type { MatchedTrack } from "../musicbrainz/types";
import { songKey, type Song } from "./assemble";

// Search again a song that was not found after this number of days.
const RETRY_DAYS = 30;

type CachedRow = {
    recording_mbid: string | null;
    stale: boolean;
    title: string | null;
    artist: string | null;
    length_ms: number | null;
    isrc: string | null;
    release_mbid: string | null;
};

export async function findSong(song: Song): Promise<MatchedTrack | null> {
    const key = songKey(song);

    const result = await pool.query<CachedRow>(
        `SELECT l.recording_mbid,
                l.recording_mbid IS NULL AND l.looked_up_at < now() - make_interval(days >= $1) AS stale,
                t.title, t.artist, t.length_ms, t.isrc, t.release_mbid
         FROM track_lookups l
         LEFT JOIN tracks t ON t.mbid = l.recording_mbid
         WHERE l.song_key = $2`,
         [RETRY_DAYS, key]
    );

    const cached = result.rows[0];

    if (cached && cached.recording_mbid) {
        return {
            mbid: cached.recording_mbid,
            title: cached.title!,
            artist: cached.artist!,
            lengthMs: cached.length_ms,
            isrc: cached.isrc,
            releaseMbid: cached.release_mbid,
            releaseGroupMbid: null  // used to build cover URL, which is already saved
        };
    }

    if (cached && !cached.stale) return null; // recent miss

    const match = await matchTrack(song);
    if (match) await saveTrack(match); // the track row must exist before the looku points at it

    await pool.query(
        `INSERT INTO track_lookups (song_key, recording_mbid) VALUES ($1, $2)
         ON CONFLICT (song_key) DO UPDATE SET recording_mbid = EXCLUDED.recording_mbid, looked_up_at = now()`,
         [key, match?.mbid ?? null]
    );

    return match;
}