import { coverArtUrl } from "./coverart";
import { type ReleaseGroup } from "./types";

// Turns MusicBrainz's search answers into what the app shows.
export type AlbumResult = {
    mbid: string;
    title: string;
    artist: string;
    year: string | null;
    type: string;
    coverUrl: string | null;
};

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