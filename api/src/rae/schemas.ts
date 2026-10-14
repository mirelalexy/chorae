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