import { normalize, normalizeTitle, splitArtists } from "./normalize";
import type { Recording } from "./types";

// Matches a track request to the best MusicBrainz recording.
export type TrackRequest = { 
    title: string; 
    artist: string 
};

// Alternative versions that lose points when the request doesn't specify them.
const OTHER_VERSIONS = [
    "live",
    "remix",
    "acoustic",
    "demo",
    "instrumental",
    "karaoke",
    "sped up",
    "slowed",
    "reverb",
    "cover",
    "edit",
    "mix",
    "version",
];

// Measures similarity between two normalized strings based on the words they share (0-1).
export function similarity(a: string, b: string): number {
    if (a === b) return 1;
    if (!a || !b) return 0;
    
    // Pad both strings with spaces to match whole words, not partial words.
    // For example, "daisies" matches "daisies live", but "home" doesn't match "homecoming".
    if (` ${a} `.includes(` ${b} `) || ` ${b} `.includes(` ${a} `)) return 0.85;
    
    const wordsA = new Set(a.split(" "));
    const wordsB = new Set(b.split(" "));

    const shared = [...wordsA].filter((w) => wordsB.has(w)).length;
    return shared / new Set([...wordsA, ...wordsB]).size;
}

export function creditText(recording: Recording): string {
    return recording["artist-credit"].map((c) => c.name + (c.joinphrase ?? "")).join("");
}

function artistScore(request: TrackRequest, recording: Recording): number {
    const wanted = normalize(request.artist);
    const credited = normalize(creditText(recording));
    if (wanted === credited) return 1;

    // Otherwise, check whether the requested main artist appears in the credits.
    const [mainArtist] = splitArtists(request.artist);

    // Check both credit names and canonical ones.
    const names = recording["artist-credit"].flatMap((c) => [normalize(c.name), normalize(c.artist.name)]);
    if (mainArtist && names.includes(mainArtist)) return 1;

    return similarity(wanted, credited);
}

function versionPenalty(request: TrackRequest, recording: Recording): number {
    const asked = normalize(request.title);
    const extra = normalize(`${recording.title} ${recording.disambiguation ?? ""}`);

    const isOtherVersion = OTHER_VERSIONS.some(
        (word) => new RegExp(`\\b${word}\\b`).test(extra) && !new RegExp(`\\b${word}\\b`).test(asked), // matches "live", but not "lively"
    );

    return isOtherVersion ? 0.3 : 0;
}

// Prefers official studio albums, then singles and EPs, and avoids compilations.
function releaseBonus(recording: Recording): number {
    let best = 0;

    for (const release of recording.releases) {
        if (release.status && release.status !== "Official") continue;

        const group = release["release-group"];
        const secondary = group?.["secondary-types"] ?? [];

        if (secondary.length > 0) continue; // compilation, live, soundtrack...

        if (group?.["primary-type"] === "Album") {
            best = Math.max(best, 0.1);
        } else if (group?.["primary-type"]) {
            best = Math.max(best, 0.05);
        }
    }

    return best;
}

export type ScoredRecording = { 
    recording: Recording; 
    score: number;
    titleScore: number; 
    artistScore: number;
};

export function scoreRecording(request: TrackRequest, recording: Recording): ScoredRecording {
    const titleScore = similarity(normalizeTitle(request.title), normalizeTitle(recording.title));
    const artist = artistScore(request, recording);

    const score = 0.55 * titleScore + 0.35 * artist + releaseBonus(recording) - versionPenalty(request, recording);
    return { recording, score, titleScore, artistScore: artist };
}

// Breaks score ties by preferring the earliest known first-release date.
function earliest(a: Recording, b: Recording): number {
    const dateA = a["first-release-date"] || "9999";
    const dateB = b["first-release-date"] || "9999";

    return dateA.localeCompare(dateB);
}

export function pickBest(request: TrackRequest, recordings: Recording[]): Recording | null {
    const candidates = recordings
        .map((r) => scoreRecording(request, r))
        .filter((s) => s.titleScore >= 0.85 && s.artistScore >= 0.85)
        .sort((a, b) => b.score - a.score || earliest(a.recording, b.recording));

    return candidates[0]?.recording ?? null;
}