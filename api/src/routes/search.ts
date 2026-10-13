import { Router } from "express";
import { z } from "zod";
import { MusicBrainzError } from "../musicbrainz/client";
import { searchArtists } from "../musicbrainz/search";

export const search = Router();

const artistQuery = z.object({ q: z.string().trim().min(2).max(100) });

// GET /search/artists?q=bad omens, to search for artists by name for the taste profile.
search.get("/artists", async (req, res) => {
    const parsed = artistQuery.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({ error: "Type at least two characters to search." });
        return;
    }

    try {
        res.json({ artists: await searchArtists(parsed.data.q) });
    } catch (err) {
        if (err instanceof MusicBrainzError) {
            console.error(err);
            res.status(502).json({ error: "Couldn't reach MusicBrainz. Try again in a moment." });
            return;
        }
        throw err;
    }
});