import { z } from "zod";

// Define the MusicBrainz fields that Chorae needs.
const artistCredit = z.array(
    z.object({
        name: z.string(),                  // name as credited on this recording
        joinphrase: z.string().optional(), // two artists or more can be united through something like " & " or " feat. "
        artist: z.object({ 
            id: z.string(), 
            name: z.string(),               // name of the linked artist entity can differ from the credited name
            "sort-name": z.string().optional(),
        }),
    }),
);

// A release represents a particular published version of music, such as an album edition, single release, or CD edition.
const release = z.object({
    id: z.string(),
    title: z.string(),
    status: z.string().optional(),                                  // such as Official
    date: z.string().optional(),
    "release-group":   
        z.object({                                                  // groups different releases of the same album or single together
            id: z.string(),
            "primary-type": z.string().nullish(),                   // such as Single or Album
            "secondary-types": z.array(z.string()).optional(),      // such as Compilation or Live
        })
        .optional(),
});

// A recording represents a particular recorded performance of a piece of music. 
// The same recording can appear on multiple releases.
export const recordingSchema = z.object({
    id: z.string(),
    title: z.string(),
    length: z.number().nullish(),
    disambiguation: z.string().optional(),          // distinguishes this recording from another recording with a similar or identical name
    "first-release-date": z.string().optional(),
    "artist-credit": artistCredit.default([]),
    releases: z.array(release).default([]),
    isrcs: z.array(z.string()).optional(),
});

// The search endpoint returns multiple possible matches.
export const recordingSearchSchema = z.object({
    recordings: z.array(recordingSchema).default([]),
});

export const artistSearchSchema = z.object({
    artists: 
        z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                score: z.number().optional(),
                type: z.string().optional(),
                country: z.string().optional(),
                disambiguation: z.string().optional(),
            }),
        )
        .default([]),
});

export type Recording = z.infer<typeof recordingSchema>;

// What a successful match gives back to Chorae.
export type MatchedTrack = {
    mbid: string;
    title: string;
    artist: string;
    lengthMs: number | null;
    isrc: string | null;
    releaseMbid: string | null;
    releaseGroupMbid: string | null;
};
