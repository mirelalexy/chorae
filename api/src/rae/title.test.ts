
import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanSideTitle, finalTitle, writesInLowercase } from "./title";

const request = (prompt: string, title?: string) => ({ prompt, title });

test("detects lowercase writing", () => {
    assert.equal(writesInLowercase(request("the night bus home, a little tired")), true);
});

test("does not treat capitalized writing as lowercase", () => {
    assert.equal(writesInLowercase(request("the night bus home after Mara's wedding")), false);
    assert.equal(writesInLowercase(request("songs like SZA")), false);
});

test("ignores the user's title when checking their writing style", () => {
    assert.equal(writesInLowercase(request("the night bus home", "Bus 37")), true);
});

test("does not treat text without letters as lowercase", () => {
    assert.equal(writesInLowercase(request("2:00 :)")), false);
});

test("lowercases Rae's title when the user writes in lowercase", () => {
    assert.equal(
        finalTitle("The Last Bus Home", request("the night bus home")),
        "the last bus home",
    );
});

test("keeps Rae's capitalization otherwise", () => {
    assert.equal(
        finalTitle("The Last Bus Home", request("The night bus home")),
        "The Last Bus Home",
    );
});

test("uses the user's own title", () => {
    assert.equal(
        finalTitle("The Last Bus Home", request("the night bus home", "  nocturne for the 37  ")),
        "nocturne for the 37",
    );

    assert.equal(
        finalTitle("The Last Bus Home", request("the night bus home", "Bus 37")),
        "Bus 37",
    );
});

test("a side's name loses a leading 'Side A:'", () => {
    assert.equal(cleanSideTitle("side a: the save room"), "the save room");
    assert.equal(cleanSideTitle("Side B - Run"), "Run");
    assert.equal(cleanSideTitle("Side 3 \u2013 Almost"), "Almost");
});

test("a side's name that only looks similar stays as it is", () => {
    assert.equal(cleanSideTitle("Sideways"), "Sideways");
    assert.equal(cleanSideTitle("Side effects"), "Side effects");
    assert.equal(cleanSideTitle("Side A:"), "Side A:"); // nothing would be left
});