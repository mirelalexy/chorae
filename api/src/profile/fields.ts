import { z } from "zod";

// What can be changed for a profile, and limits.
export const MAX_FAVORITE_GENRES = 3;
export const MAX_ABOUT = 200;
export const FAVORITE_KINDS = ["artist", "album", "song"] as const;
export type FavoriteKind = (typeof FAVORITE_KINDS)[number];

const genres = z
    .array(z.string().trim().max(30))
    .max(20)
    .transform((list) => {
        const seen = new Set<string>();
        return list
            .filter((genre) => {
                const key = genre.toLowerCase();
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, MAX_FAVORITE_GENRES);
    });

// Only supplied fields are updated and an empty about clears it.
export const profileUpdate = z.object({
    displayName: z.string().trim().min(1).max(50).optional(),
    about: z
        .string()
        .trim()
        .max(MAX_ABOUT)
        .transform((text) => text || null)
        .optional(),
    genres: genres.optional(),
});

// Validate the metadata used for profile favorites.
export const favoriteBody = z.object({
    mbid: z.guid(),
    name: z.string().trim().min(1).max(300),
    artist: z.string().trim().max(300).nullish(),
    year: z.string().regex(/^\d{4}$/).nullish(),
    coverUrl: z.string().startsWith("https://coverartarchive.org/").max(300).nullish(), // only CAA images
});