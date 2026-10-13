import { escapeQuery, mbGet } from "./client";
import { splitArtistsRaw, stripTitleNoise } from "./normalize";
import { creditText, pickBest, type TrackRequest } from "./score";
import { recordingSearchSchema, type MatchedTrack, type Recording } from "./types";

// Find the MusicBrainz recording for a title and artist, or return null.
export async function matchTrack(request: TrackRequest): Promise<MatchedTrack | null> {
    // No need to normalize (MusicBrainz's search handles case and accents on its side).
    const title = escapeQuery(stripTitleNoise(request.title));
    const artist = escapeQuery(splitArtistsRaw(request.artist)[0] ?? request.artist);

    const queries = [
        `recording:"${title}" AND artist:"${artist}"`, // This exact phrase.
        `recording:(${title}) AND artist:(${artist})`, // These words, in any order.
    ];

    for (const query of queries) {
        const data = recordingSearchSchema.parse(await mbGet("recording", {
            query,
            limit: "25",
        }));

        const best = pickBest(request, data.recordings);
        if (best) return toMatchedTrack(best);
    }

    return null;
}

function toMatchedTrack(recording: Recording): MatchedTrack {
    const release = selectRelease(recording);

    return {
        mbid: recording.id,
        title: recording.title,
        artist: creditText(recording),
        lengthMs: recording.length ?? null,
        isrc: recording.isrcs?.[0] ?? null,
        releaseMbid: release?.id ?? null,
        releaseGroupMbid: release?.["release-group"]?.id ?? null,
    };
}

// Select release to take cover from: first check official album,
// then any official release, then whatever comes next.
function selectRelease(recording: Recording) {
    const rank = (r: Recording["releases"][number]) => {
        const group = r["release-group"];
        const official = !r.status || r.status === "Official";
        const plain = (group?.["secondary-types"] ?? []).length === 0;

        if (official && plain && group?.["primary-type"] === "Album") return 0;
        if (official && plain) return 1;
        if (official) return 2;
        return 3;
    };

    // Earliest date wins ties.
    return [...recording.releases].sort(
        (a, b) => rank(a) - rank(b) || (a.date || "9999").localeCompare(b.date || "9999"),
    )[0];
}