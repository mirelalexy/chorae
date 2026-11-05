import { coverArtUrl } from "./coverart";
import { normalize } from "./normalize";
import { requestedVersions } from "./query";
import { selectRelease } from "./release";
import { Recording, type ReleaseGroup } from "./types";

// Turns MusicBrainz's search answers into what the app shows.
export type MusicResult = {
    mbid: string;
    title: string;
    artist: string;
    year: string | null;
    coverUrl: string | null;
};

export type AlbumResult = MusicResult & {
    type: string; // album or EP
};

export type SongResult = MusicResult;

function credit(credits: { name: string; joinphrase?: string }[]): string {
    return credits.map((c) => c.name + (c.joinphrase ?? "")).join("");      // "Knocked Loose" + " feat. " + "Poppy"
}

function year(date: string | undefined): string | null {
    return date && /^\d{4}/.test(date) ? date.slice(0, 4) : null;
}

// Keeps albums and EPs only.
export function toAlbumResults(groups: ReleaseGroup[]): AlbumResult[] {
    return groups
        .filter((g) => (g["primary-type"] === "Album" || g["primary-type"] === "EP")
                        && (g["secondary-types"] ?? []).length === 0)
        .map((g) => ({
            mbid: g.id,
            title: g.title,
            artist: credit(g["artist-credit"]),
            year: year(g["first-release-date"]),
            type: g["primary-type"]!,
            coverUrl: coverArtUrl(g.id),
        }));
}

// Newest first, for albums by artists user picked.
export function newestAlbumsFirst(albums: AlbumResult[]): AlbumResult[] {
    return [...albums].sort((a, b) => (b.year ?? "0").localeCompare(a.year ?? "0"));
}

// One result per song.
export function toSongResults(recordings: Recording[], query: string): SongResult[] {
    const requested = requestedVersions(query);
    const seen = new Set<string>();
    const songs: SongResult[] = [];

    for (const r of recordings) {
        const label = `${r.title} ${r.disambiguation ?? ""}`;
        const versions = requestedVersions(label);

        // Keep originals by default, or recordings containing every requested version.
        if (requested.length === 0 && versions.length > 0) continue;
        if (!requested.every((v) => versions.includes(v))) continue;

        const artist = credit(r["artist-credit"]);
        const key = `${normalize(r.title)}|${normalize(artist)}|${normalize(r.disambiguation ?? "")}`;

        if (seen.has(key)) continue;
        seen.add(key);

        songs.push({
            mbid: r.id,
            title: r.title,
            artist,
            year: year(r["first-release-date"]),
            coverUrl: coverArtUrl(selectRelease(r)?.["release-group"]?.id ?? null),
        });
    }
    
    return songs;
}