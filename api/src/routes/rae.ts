import { Router } from "express";
import { z } from "zod";
import { askQuestions, RaeError } from "../rae/client";
import { draftRequestSchema } from "../rae/schemas";

export const rae = Router();

const questionsBody = z.object({ prompt: draftRequestSchema.shape.prompt });

// POST /rae/questions { "prompt": "..." } -> { "questions": [...] }
rae.post("/questions", async (req, res) => {
    const parsed = questionsBody.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({ error: "Tell Rae what the mixtape is for." });
        return;
    }

    try {
        res.json(await askQuestions(parsed.data.prompt));
    } catch (err) {
        if (err instanceof RaeError) {
            console.error(err);
            res.status(502).json({ error: "Couldn't reach Rae. Try again in a moment." });
            return;
        }
        throw err;
    }
});