import assert from "node:assert/strict";
import { test } from "node:test";
import type { MatchedTrack } from "../musicbrainz/types";
import type { Draft } from "../rae/schemas";
import { assemble, songKey, type Matches, type Song } from "./assemble";

// A fake recording for a song.
function recording(song: Song, mbid = `mb-${song.title}`): MatchedTrack {
    return { 
        mbid, 
        title: song.title, 
        artist: song.artist, 
        lengthMs: 200000,
        isrc: null, 
        releaseMbid: null, 
        releaseGroupMbid: null,
        artistMbids: [],
    };
}

function matchesFor(draft: Draft, missing: string[] = []): Matches {
    const map: Matches = new Map();

    for (const side of draft.sides) {
        for (const song of [...side.tracks, ...side.backups]) {
            map.set(songKey(song), missing.includes(song.title) ? null : recording(song));
        }
    }

    return map;
}

function track(title: string, artist = "Artist " + title, is_seed = false) {
    return { title, artist, note: `Note for ${title}.`, is_seed };
}

function backup(title: string, artist = "Artist " + title) {
    return { title, artist, note: `Backup note for ${title}.` };
}

function draftWith(tracks: ReturnType<typeof track>[], backups: ReturnType<typeof backup>[]): Draft {
    return { title: "T", summary: "S", intro: "I", sides: [{ title: "Side A", mood_line: "M", tracks, backups }] };
}

const titles = (r: ReturnType<typeof assemble>) => r.sides.flatMap((s) => s.tracks.map((t) => t.track.title));

test("keeps every track when everything is found", () => {
    const draft = draftWith([track("One"), track("Two")], [backup("Spare")]);
    const result = assemble(draft, matchesFor(draft));

    assert.deepEqual(titles(result), ["One", "Two"]);
    assert.deepEqual(result.missingSeeds, []);
});

test("replaces one of Rae's missing picks with a backup, in the same place", () => {
    const draft = draftWith([track("One"), track("Two"), track("Three")], [backup("Spare")]);
    const result = assemble(draft, matchesFor(draft, ["Two"]));

    assert.deepEqual(titles(result), ["One", "Spare", "Three"]);
    assert.equal(result.sides[0]!.tracks[1]!.note, "Backup note for Spare.");
});

test("skips backups that weren't found either", () => {
    const draft = draftWith([track("One")], [backup("Lost"), backup("Spare")]);
    const result = assemble(draft, matchesFor(draft, ["One", "Lost"]));

    assert.deepEqual(titles(result), ["Spare"]);
});

test("drops a pick when no backup is left", () => {
    const draft = draftWith([track("One"), track("Two")], [backup("Lost")]);
    const result = assemble(draft, matchesFor(draft, ["Two", "Lost"]));

    assert.deepEqual(titles(result), ["One"]);
    assert.deepEqual(result.dropped, [{ title: "Two", artist: "Artist Two" }]);
});

test("never replaces a missing seed; lists it instead", () => {
    const draft = draftWith([track("Mine", "Me", true), track("Two")], [backup("Spare")]);
    const result = assemble(draft, matchesFor(draft, ["Mine"]));

    assert.deepEqual(titles(result), ["Two"]);
    assert.deepEqual(result.missingSeeds, [{ title: "Mine", artist: "Me" }]);
});

test("doesn't use the same recording twice", () => {
    const draft = draftWith([track("One"), track("One (again)")], [backup("Spare")]);
    const matches = matchesFor(draft);

    matches.set(songKey(track("One (again)")), recording(track("One")));
    assert.deepEqual(titles(assemble(draft, matches)), ["One", "Spare"]);
});

test("replaces a fourth track by one artist, but not a seed", () => {
    const by = (title: string, is_seed = false) => track(title, "Portishead", is_seed);
    const draft = draftWith([by("A"), by("B"), by("C", true), by("D"), by("E")], [backup("Spare")]);
    // A, B, D count toward the cap, C is a seed, and E is the fourth of Rae's and is replaced.
    assert.deepEqual(titles(assemble(draft, matchesFor(draft))), ["A", "B", "C", "D", "Spare"]);
});

test("leaves out a side where nothing was found", () => {
    const draft: Draft = {
        title: "T",
        summary: "S",
        intro: "I",
        sides: [
            { title: "A", mood_line: "M", tracks: [track("One")], backups: [backup("Spare A")] },
            { title: "B", mood_line: "M", tracks: [track("Two")], backups: [backup("Spare B")] },
        ],
    };
    const result = assemble(draft, matchesFor(draft, ["Two", "Spare B"]));

    assert.deepEqual(result.sides.map((s) => s.title), ["A"]);
});

// The artist to avoid in these tests.
const COLDPLAY = { mbid: "cp", name: "Coldplay" };

// Recordings that know who made them, by artist ID.
function matchesWithIds(draft: Draft, ids: Record<string, string[]>): Matches {
    const map = matchesFor(draft);
    for (const [key, match] of map) {
        if (match) map.set(key, { ...match, artistMbids: ids[match.title] ?? ["someone-else"] });
    }
    return map;
}

test("a never-play artist is recognised by ID, whatever name they're credited under", () => {
    const draft = draftWith([track("One", "C.P."), track("Two")], [backup("Spare")]);
    const matches = matchesWithIds(draft, { One: ["cp"] });
    assert.deepEqual(titles(assemble(draft, matches, [COLDPLAY])), ["Spare", "Two"]);
});

test("a featured never-play artist counts too", () => {
    const draft = draftWith([track("One", "Wallows feat. Coldplay")], [backup("Spare")]);
    const matches = matchesWithIds(draft, { One: ["wallows", "cp"] });
    assert.deepEqual(titles(assemble(draft, matches, [COLDPLAY])), ["Spare"]);
});

test("a different artist who only shares the name still plays", () => {
    const draft = draftWith([track("One", "Coldplay")], [backup("Spare")]);
    const matches = matchesWithIds(draft, { One: ["another-coldplay"] });
    assert.deepEqual(titles(assemble(draft, matches, [COLDPLAY])), ["One"]);
});

test("songs cached without artist IDs are checked by name, featured ones too", () => {
    const draft = draftWith(
        [track("One", "COLDPLAY"), track("Two", "Wallows feat. Coldplay"), track("Three")],
        [backup("Spare"), backup("Spare 2")],
    );
    assert.deepEqual(titles(assemble(draft, matchesFor(draft), [COLDPLAY])), ["Spare", "Spare 2", "Three"]);
});

test("a never-play artist's backup is skipped too", () => {
    const draft = draftWith([track("One", "Gone")], [backup("Bad spare"), backup("Good spare")]);
    const matches = matchesWithIds(draft, { "Bad spare": ["cp"] });
    matches.set(songKey({ title: "One", artist: "Gone" }), null);
    assert.deepEqual(titles(assemble(draft, matches, [COLDPLAY])), ["Good spare"]);
});

test("a song they asked for stays, even by a never-play artist", () => {
    const draft = draftWith([track("Mine", "Coldplay", true)], [backup("Spare")]);
    assert.deepEqual(titles(assemble(draft, matchesWithIds(draft, { Mine: ["cp"] }), [COLDPLAY])), ["Mine"]);
});
