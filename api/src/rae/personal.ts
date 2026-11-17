import { z } from "zod";

// What Rae knows about the user: their taste, a note in their own words, 
// how familiar they like tapes to be, and artists to avoid.

export const DISCOVERY = [
    "familiar", 
    "mix", 
    "fresh",
] as const;
export type Discovery = (typeof DISCOVERY)[number];

export const MAX_NOTE = 300;
export const MAX_AVOIDED = 50;

export const artistSchema = z.object({
    mbid: z.guid(),
    name: z.string().trim().min(1).max(300),
});
export type Artist = z.infer<typeof artistSchema>;

export const albumSchema = z.object({
    mbid: z.guid(),
    name: z.string().trim().min(1).max(300),
    artist: z.string().trim().min(1),
});
export type Album = z.infer<typeof albumSchema>;

// Saved with each job on creation, so a retry makes the tape with the same settings.
export const personalSchema = z.object({
    // Artists and albums chosen as taste items.
    artists: z.array(artistSchema),
    albums: z.array(albumSchema),
    note: z.string().nullable(),
    discovery: z.enum(DISCOVERY).nullable(),
    avoid: z.array(artistSchema).max(MAX_AVOIDED),
});
export type Personal = z.infer<typeof personalSchema>;

export const preferencesUpdate = z.object({
    note: z
        .string()
        .trim()
        .max(MAX_NOTE)
        .transform((text) => text || null) // an empty note clears it
        .optional(),
    discovery: z.enum(DISCOVERY).nullable().optional(), // null resets discovery so Rae can ask each time
});