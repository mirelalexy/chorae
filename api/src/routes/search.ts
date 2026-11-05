import { Response, Router } from "express";
import { z } from "zod";
import { MusicBrainzError } from "../musicbrainz/client";
import { albumsByArtist, searchAlbums, searchArtists, searchSongs } from "../musicbrainz/search";
import { requireUser } from "./user";

export const search = Router();
export const artists = Router();

search.use(requireUser);
artists.use(requireUser);

const query = z.object({ q: z.string().trim().min(2).max(100) });

// Accept MusicBrainz IDs might be shaped as UUIDs but not match the strict standard from the db.
const idParam = z.object({ mbid: z.guid() });

async function answer(res: Response, work: () => Promise<unknown>) {
    try {
        res.json(await work());
    } catch (err) {
        if (err instanceof MusicBrainzError) {
            console.error(err);
            res.status(502).json({ error: "Couldn't reach MusicBrainz. Try again in a moment." });
            return;
        }
        throw err;
    }
}

function readQuery(req: { query: unknown }, res: Response): string | null {
    const parsed = query.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({ error: "Type at least two characters to search." });
        return null;
    }

    return parsed.data.q;
}

// GET /search/artists?q=bad omens
search.get("/artists", async (req, res) => {
    const q = readQuery(req, res);
    if (q) await answer(res, async () => ({
        artists: await searchArtists(q)
    }));
});

// GET /search/albums?q=sour
search.get("/albums", async (req, res) => {
    const q = readQuery(req, res);
    if (q) await answer(res, async () => ({
        albums: await searchAlbums(q)
    }));
});

// GET /artists/:mbid/albums: albums by an artist, newest first
artists.get("/:mbid/albums", async (req, res) => {
    const params = idParam.safeParse(req.params);

    if (!params.success) {
        res.status(404).json({ error: "No such artist." });
        return;
    }

    await answer(res, async () => ({ 
        albums: await albumsByArtist(params.data.mbid) 
    }));
});

// GET /search/songs?q=vampire olivia: by the song's name, its artist, or both
search.get("/songs", async (req, res) => {
    const q = readQuery(req, res);
    if (q) await answer(res, async () => ({
        songs: await searchSongs(q)
    }));
});