import { escapeQuery, mbGet } from "./client";
import { AlbumResult, newestAlbumsFirst, toAlbumResults } from "./results";
import { artistSearchSchema, releaseGroupListSchema } from "./types";

export type ArtistResult = {
    mbid: string;
    name: string;
    disambiguation: string | null;
    country: string | null;
};

// Search artists for the taste profile.
export async function searchArtists(query: string, limit = 10): Promise<ArtistResult[]> {
    const data = artistSearchSchema.parse(
        await mbGet("artist", { 
            query: escapeQuery(query), 
            limit: String(limit) 
        }),
    );

    return data.artists.map((a) => ({
        mbid: a.id,
        name: a.name,
        disambiguation: a.disambiguation || null,
        country: a.country ?? null,
    }));
}

// Anyone can add releases to MusicBrainz, including bootlegs (fan-made albums of leaked
// songs, with homemade covers). Chorae only shows music that was officially released.
const OFFICIAL = "status:official";

// Search albums and EPs by title.
export async function searchAlbums(query: string, limit = 15): Promise<AlbumResult[]> {
    const data = releaseGroupListSchema.parse(
        await mbGet("release-group", {
            query: `${escapeQuery(query)} AND (primarytype:album OR primarytype:ep) AND ${OFFICIAL}`,
            limit: String(Math.min(Math.max(limit, 1), 100)),
        }),
    );

    return toAlbumResults(data["release-groups"]);
}

// An artist's albums and EPs, newest first: suggestions after picking artists.
export async function albumsByArtist(artistMbid: string): Promise<AlbumResult[]> {
    const data = releaseGroupListSchema.parse(
        await mbGet("release-group", {
            artist: artistMbid,
            type: "album|ep",
            // Only release groups with an official release, as the MusicBrainz website shows by default.
            "release-group-status": "website-default",
            inc: "artist-credits",
            limit: "100",
        }),
    );
    
    return newestAlbumsFirst(toAlbumResults(data["release-groups"]));
}
