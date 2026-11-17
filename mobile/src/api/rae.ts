import { api } from "./client";

export type Discovery = "familiar" | "mix" | "fresh";

export type Artist = { 
    mbid: string; 
    name: string; 
};

export type RaePreferences = {
    note: string | null;
    discovery: Discovery | null;
    avoid: Artist[];
};

export const MAX_NOTE = 300;

// Get Rae's saved preferences.
export async function getRaePreferences(): Promise<RaePreferences> {
    return api<RaePreferences>("/rae/preferences");
}

// Update only the provided preferences. An empty note clears it.
export async function updateRaePreferences(
    changes: { note?: string; discovery?: Discovery | null },
): Promise<void> {
    await api("/rae/preferences", { method: "PATCH", body: changes });
}

// Add an artist to the never-play list.
export async function avoidArtist(artist: Artist): Promise<Artist> {
    const res = await api<{ artist: Artist }>("/rae/avoid", {
        method: "POST",
        body: artist,
    });

    return res.artist;
}

// Remove an artist from the never-play list.
export async function stopAvoiding(mbid: string): Promise<void> {
    await api(`/rae/avoid/${mbid}`, { method: "DELETE" });
}