import { escapeQuery, mbGet } from "./client";
import { artistSearchSchema } from "./types";

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
