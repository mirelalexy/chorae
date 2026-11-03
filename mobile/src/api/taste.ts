import { api } from "./client";

// The shapes the API sends back and the calls used on the onboarding screens.
export type TasteItem = {
    id: string;
    kind: "artist" | "album";
    mbid: string;
    name: string;
    artist: string | null;
    coverUrl: string | null;
};

export type ArtistResult = {
    mbid: string;
    name: string;
    disambiguation: string | null;
    country: string | null;
};

export type AlbumResult = {
    mbid: string;
    title: string;
    artist: string;
    year: string | null;
    type: string;
    coverUrl: string | null;
};

export async function getTaste(): Promise<TasteItem[]> {
    const res = await api<{ items: TasteItem[] }>("/taste");
    return res.items;
}

export async function addTaste(item: Omit<TasteItem, "id">): Promise<TasteItem> {
    const res = await api<{ item: TasteItem }>("/taste", { method: "POST", body: item });
    return res.item;
}

export async function removeTaste(id: string): Promise<void> {
    await api<null>(`/taste/${id}`, { method: "DELETE" });
}

export async function searchArtists(q: string): Promise<ArtistResult[]> {
    const res = await api<{ artists: ArtistResult[] }>(`/search/artists?q=${encodeURIComponent(q)}`);
    return res.artists;
}

export async function searchAlbums(q: string): Promise<AlbumResult[]> {
    const res = await api<{ albums: AlbumResult[] }>(`/search/albums?q=${encodeURIComponent(q)}`);
    return res.albums;
}

export async function albumsByArtist(mbid: string): Promise<AlbumResult[]> {
    const res = await api<{ albums: AlbumResult[] }>(`/artists/${mbid}/albums`);
    return res.albums;
}