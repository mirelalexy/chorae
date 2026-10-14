import { z } from "zod";
import { normalize } from "../musicbrainz/normalize";

// Defines the shapes Rae answers in.
// The SDK turns these schemas into a JSON schema the model must follow,
// then checks again with Zod. Descriptions provide additional instructions.

// Seed songs don't count toward the artist limit.
export const MAX_TRACKS_PER_ARTIST = 3;

// The questions Rae asks before creating a mixtape.
export const questionsSchema = z.object({
    questions: 
        z.array(
            z.object({
                text: z.string().min(1).max(200).describe("One short question, in Rae's voice."),
                suggestions:
                    z.array(z.string().min(1).max(60))
                     .max(4)
                     .describe("Up to four short answers to tap. Empty when the question needs the person's own words."),
            }),
        )
        .min(2)
        .max(4),
});

export type Questions = z.infer<typeof questionsSchema>;

// What the user asks for.
// Allow prompts up to 2000 characters, 30 seed songs, and mixtapes up to 10 hours.
export const draftRequestSchema = z.object({
    prompt: z.string().trim().min(1).max(2000),
    answers:
        z.array(
            z.object({
                question: z.string(),
                answer: z.string(),
            }),
        )
        .max(4),
    minutes: z.number().int().min(15).max(600),
    seeds:
        z.array(
            z.object({
                title: z.string(),
                artist: z.string(),
            }),
        )
        .max(30),
    story: z.boolean(),
});

export type DraftRequest = z.infer<typeof draftRequestSchema>;

// What a single track in Rae's mixtape must have.
const track = z.object({
    title: z.string().min(1).max(200).describe("The song title, as released."),
    artist: z.string().min(1).max(200).describe("The main artist, as credited."),
    note: z.string().min(1).max(500).describe("Rae's note on this track: a sentence or two."),
    is_seed: z.boolean().describe("True if the person asked for this song."),
});

export type DraftTrack = z.infer<typeof track>;

// In case Rae cannot find a track, it will be replaced with a backup.
const backup = track.omit({ is_seed: true });

// A side is a section of a mixtape.
const side = z.object({
    title: z.string().min(1).max(60),
    mood_line: z.string().min(1).max(120).describe("One line under the side title."),
    tracks: z.array(track).min(1),
    backups:
        z.array(backup)
         .min(1)
         .max(5)
         .describe("Spare tracks that fit this side, used if a track can't be found."),
});

// The mixtape. For longer mixtapes, 6 sides should be enough, while for smaller ones 2-4.
export const draftSchema = z.object({
    title: z.string().min(1).max(80),
    intro: z.string().min(1).max(800).describe("Rae's opening note for the whole mixtape."),
    sides: z.array(side).min(1).max(6),
});

export type Draft = z.infer<typeof draftSchema>;