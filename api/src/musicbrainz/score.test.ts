import assert from "node:assert/strict";
import { test } from "node:test";
import { pickBest } from "./score";
import type { Recording } from "./types";

// Create fake MusicBrainz recording.
function recording(
    overrides: Partial<Recording> & { 
        id: string; 
        title: string; 
        artist?: string;
    }
): Recording {
    const { artist = "Bradley Simpson", ...rest } = overrides;
    
    return {
        "artist-credit": [
            { 
                name: artist, 
                joinphrase: "", 
                artist: { 
                    id: "a1", 
                    name: artist
                },
            },
        ],
        releases: [
            { 
                id: "r1", 
                title: "Album", 
                status: "Official", 
                "release-group": { 
                    id: "g1", 
                    "primary-type": "Album",
                    "secondary-types": []
                },
            },
        ],
        ...rest,
    };
}

test("finds the song when title and artist match", () => {
    const best = pickBest({ title: "Daisies", artist: "Bradley Simpson" }, [
        recording({ id: "other", title: "Daisy", artist: "Someone Else" }),
        recording({ id: "right", title: "Daisies" }),
    ]);

    assert.equal(best?.id, "right");
});

test("returns nothing rather than a different song", () => {
    const best = pickBest({ title: "Daisies", artist: "Bradley Simpson" }, [
        recording({ id: "wrong-artist", title: "Daisies", artist: "Another Band" }),
        recording({ id: "wrong-title", title: "Roses" }),
    ]);

    assert.equal(best, null);
});

test("prefers the studio version over live and remix versions", () => {
    const best = pickBest({ title: "Holy Roller", artist: "Spiritbox" }, [
        recording({ id: "live", title: "Holy Roller", artist: "Spiritbox", disambiguation: "live" }),
        recording({ id: "remix", title: "Holy Roller (Remix)", artist: "Spiritbox" }),
        recording({ id: "studio", title: "Holy Roller", artist: "Spiritbox" }),
    ]);

    assert.equal(best?.id, "studio");
});

test("picks the live version when that's what was asked for", () => {
    const best = pickBest({ title: "Holy Roller (Live)", artist: "Spiritbox" }, [
        recording({ id: "studio", title: "Holy Roller", artist: "Spiritbox" }),
        recording({ id: "live", title: "Holy Roller (Live)", artist: "Spiritbox" }),
    ]);

    assert.equal(best?.id, "live");
});

test("prefers the album release over a compilation", () => {
    const compilation = recording({ id: "compilation", title: "Snuff", artist: "Slipknot" });

    compilation.releases = [
        { id: "c", title: "Hits", status: "Official", "release-group": { id: "cg", "primary-type": "Album", "secondary-types": ["Compilation"] } },
    ];
    
    const best = pickBest({ title: "Snuff", artist: "Slipknot" }, [
        compilation, 
        recording({ id: "album", title: "Snuff", artist: "Slipknot" })
    ]);

    assert.equal(best?.id, "album");
});

test("matches a featured artist from the request", () => {
    const best = pickBest({ title: "Suffocate", artist: "Knocked Loose, Poppy" }, [
        {
            ...recording({ id: "feat", title: "Suffocate" }),
            "artist-credit": [
                { name: "Knocked Loose", joinphrase: " feat. ", artist: { id: "k", name: "Knocked Loose" } },
                { name: "Poppy", joinphrase: "", artist: { id: "p", name: "Poppy" } },
            ],
        },
    ]);

    assert.equal(best?.id, "feat");
});

test("handles different spellings of the same title", () => {
    const best = pickBest({ title: "Telepatia", artist: "Kali Uchis" }, [
        recording({ id: "k", title: "telepatía", artist: "Kali Uchis" }),
    ]);

    assert.equal(best?.id, "k");
});

test("doesn't treat a longer word as the same title", () => {
    const best = pickBest({ title: "Home", artist: "Bradley Simpson" }, [
        recording({ id: "longer", title: "Homecoming" })
    ]);

    assert.equal(best, null);
});

test("matches an artist by sort name when the official name has symbols", () => {
    const best = pickBest({ title: "This Is a Trick", artist: "Crosses" }, [
        {
        ...recording({ id: "crosses", title: "This Is a Trick" }),
        "artist-credit": [{ name: "†††", joinphrase: "", artist: { id: "c", name: "†††", "sort-name": "Crosses" } }],
        },
    ]);
    
    assert.equal(best?.id, "crosses");
});