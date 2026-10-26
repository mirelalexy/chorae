import { normalize } from "../musicbrainz/normalize";
import type { MatchedTrack } from "../musicbrainz/types";
import { type Draft, MAX_TRACKS_PER_ARTIST } from "../rae/schemas";

// Turn Rae's draft and the results from MusicBrainz into a mixtape to save.

/* 
   Rules:
   - A found track is saved along with its note.
   - A track that was not found is replaced with a backup from the same side.
   - Drop a track that was not found if no backup is left.
   - A seed that was not found is never replaced.
   - The same recording twice/a track that exceeds artist cap counts as unusable and is replaced the same way.
   - Seeds are not included in artist cap. 
*/

export type Song = { title: string; artist: string };
export type Matches = Map<string, MatchedTrack | null>;

export function songKey(song: Song): string {
    return `${normalize(song.title)}|${normalize(song.artist)}`;
}

export type AssembledTrack = { track: MatchedTrack; note: string; isSeed: boolean };
export type AssembledSide = { title: string; moodLine: string; tracks: AssembledTrack[] };

export type Assembled = {
    sides: AssembledSide[];
    missingSeeds: Song[];
    dropped: Song[]; // keep for logs
}

export function assemble(draft: Draft, matches: Matches): Assembled {
    const usedRecordings = new Set<string>();
    const perArtist = new Map<string, number>();
    const missingSeeds: Song[] = [];
    const dropped: Song[] = [];

    // If the song can go on the mixtape, mark it as used and return its recording.
    function take(song: Song, isSeed: boolean): MatchedTrack | null {
        const match = matches.get(songKey(song));
        if (!match || usedRecordings.has(match.mbid)) return null;
        
        const artist = normalize(song.artist);
        const count = perArtist.get(artist) ?? 0;
        if (!isSeed && count >= MAX_TRACKS_PER_ARTIST) return null;

        usedRecordings.add(match.mbid);
        if (!isSeed) perArtist.set(artist, count + 1);
        return match;
    }

    const sides: AssembledSide[] = [];

    for (const side of draft.sides) {
        // Create copy to take from the front.
        const backups = [...side.backups];
        const tracks: AssembledTrack[] = [];

        for (const t of side.tracks) {
            const found = take(t, t.is_seed);
            if (found) {
                tracks.push({ track: found, note: t.note, isSeed: t.is_seed });
                continue;
            }

            if (t.is_seed) {
                missingSeeds.push({ title: t.title, artist: t.artist });
                continue;
            }

            // Try backups in order until one is usable.
            let replaced = false;

            while (backups.length > 0) {
                const backup = backups.shift()!;
                const backupFound = take(backup, false);

                if (backupFound) {
                    tracks.push({ track: backupFound, note: backup.note, isSeed: false });
                    replaced = true;
                    break;
                }
            }

            if (!replaced) dropped.push({ title: t.title, artist: t.artist });
        }

        // A side with no tracks found is dropped.
        if (tracks.length > 0) {
            sides.push({ title: side.title, moodLine: side.mood_line, tracks });
        }
    }

    return { sides, missingSeeds, dropped };
}