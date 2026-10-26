import assert from "node:assert/strict";
import { test } from "node:test";
import type { MatchedTrack } from "../musicbrainz/types";
import type { Draft } from "../rae/schemas";
import type { Song } from "./assemble";
import { matchDraft } from "./match-draft";

// A fake finder: every song is found except the ones listed.
function fakeFind(missing: string[]) {
    const asked: string[] = [];
    const find = async (song: Song): Promise<MatchedTrack | null> => {
        asked.push(song.title);
        if (missing.includes(song.title)) return null;
        return { 
            mbid: `mb-${song.title}`, 
            title: song.title, 
            artist: song.artist, 
            lengthMs: null, 
            isrc: null, 
            releaseMbid: null,
            releaseGroupMbid: null 
        };
    };

    return { find, asked };
}

const t = (title: string, is_seed = false) => ({ title, artist: "A", note: "N", is_seed });
const b = (title: string) => ({ title, artist: "A", note: "N" });

const draft: Draft = {
    title: "T",
    intro: "I",
    sides: [
        { title: "A", mood_line: "M", tracks: [t("One"), t("Two")], backups: [b("A1"), b("A2")] },
        { title: "B", mood_line: "M", tracks: [t("Three"), t("Mine", true)], backups: [b("B1")] },
    ],
};

test("reports progress after every track", async () => {
    const calls: string[] = [];
    const { find } = fakeFind([]);
    await matchDraft(draft, async (checked, total) => void calls.push(`${checked}/${total}`), find);

    assert.deepEqual(calls, ["1/4", "2/4", "3/4", "4/4"]);
});

test("checks no backups when every track was found", async () => {
    const { find, asked } = fakeFind([]);
    await matchDraft(draft, async () => {}, find);
    
    assert.deepEqual(asked, ["One", "Two", "Three", "Mine"]);
});

test("checks backups only for the side that needs them, and only until there are enough", async () => {
    const { find, asked } = fakeFind(["Two", "A1"]);
    await matchDraft(draft, async () => {}, find);

    assert.deepEqual(asked, ["One", "Two", "Three", "Mine", "A1", "A2"]);
});

test("a missing seed doesn't use up a backup", async () => {
    const { find, asked } = fakeFind(["Mine"]);
    await matchDraft(draft, async () => {}, find);
    
    assert.deepEqual(asked, ["One", "Two", "Three", "Mine"]);
});
