import type { MatchedTrack } from "../musicbrainz/types";
import type { Draft } from "../rae/schemas";
import { type Matches, type Song, songKey } from "./assemble";

// Find the draft's songs: every track, then backups only for the sides that need them.
export type Progress = (checked: number, total: number) => Promise<void>;

export async function matchDraft(
    draft: Draft,
    onProgress: Progress,
    find: (song: Song) => Promise<MatchedTrack | null>
): Promise<Matches> {
    const matches: Matches = new Map();

    async function lookUp(song: Song) {
        const key = songKey(song);
        if (!matches.has(key)) matches.set(key, await find(song));
        return matches.get(key) ?? null;
    }

    const tracks = draft.sides.flatMap((s) => s.tracks);
    for (const [i, track] of tracks.entries()) {
        await lookUp(track);
        await onProgress(i + 1, tracks.length);
    }

    // Decide how many backups each side needs.
    for (const side of draft.sides) {
        let needed = side.tracks.filter((t) => !t.is_seed && !matches.get(songKey(t))).length;
        for (const backup of side.backups) {
            if (needed === 0) break;
            if (await lookUp(backup)) needed--;
        }
    }

    return matches;
}