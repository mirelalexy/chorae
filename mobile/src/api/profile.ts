import { api } from "./client";

// The profile page's data and the calls that change it.
export type Profile = {
    displayName: string;
    email: string;
    about: string | null;
    genres: string[];
    createdAt: string;
};

export type FavoriteKind = "artist" | "album" | "song";

export type Favorite = {
    mbid: string;
    name: string;
    artist: string | null;
    year: string | null;
    coverUrl: string | null;
};

export type Favorites = Record<FavoriteKind, Favorite | null>;

export type Stats = {
    tapes: number;
    songs: number; // across every tape's current take
    stories: number; // tapes told in story mode
};

export type ProfilePage = { 
    profile: Profile; 
    favorites: Favorites; 
    stats: Stats;
};

export async function getProfile(): Promise<ProfilePage> {
    return api<ProfilePage>("/profile");
}

export async function updateProfile(changes: Partial<Pick<Profile, "displayName" | "about" | "genres">>): Promise<void> {
    await api("/profile", { method: "PATCH", body: changes });
}

export async function setFavorite(
    kind: FavoriteKind, 
    pick: Omit<Favorite, "coverUrl"> & { coverUrl?: string | null }
): Promise<Favorite> {
    const res = await api<{ favorite: Favorite }>(`/profile/favorites/${kind}`, { method: "PUT", body: pick });
    return res.favorite;
}

export async function clearFavorite(kind: FavoriteKind): Promise<void> {
    await api(`/profile/favorites/${kind}`, { method: "DELETE" });
}
