import assert from "node:assert/strict";
import { test } from "node:test";
import { songQuery } from "./query";

test("one word can be in the song's name or its artist", () => {
    assert.equal(songQuery("olivia"), "(recording:olivia OR artist:olivia) AND status:official");
});

test("every word must be found, each in the name or the artist", () => {
    assert.equal(
        songQuery("vampire olivia"),
        "(recording:vampire OR artist:vampire) AND (recording:olivia OR artist:olivia) AND status:official",
    );
});

test("special characters are escaped inside each word", () => {
    assert.equal(songQuery("AC/DC"), "(recording:AC\\/DC OR artist:AC\\/DC) AND status:official");
});

test("song query searches versions in titles and disambiguation", () => {
    assert.equal(
        songQuery("drivers license remix"),
        '(recording:drivers OR artist:drivers) AND (recording:license OR artist:license) AND (recording:"remix" OR comment:"remix") AND status:official'
    );
});

test("song query supports multiple requested versions", () => {
    assert.equal(
        songQuery("drivers license live remix"),
        '(recording:drivers OR artist:drivers) AND (recording:license OR artist:license) AND (recording:"live" OR comment:"live") AND (recording:"remix" OR comment:"remix") AND status:official'
    );
})