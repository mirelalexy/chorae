import assert from "node:assert/strict";
import { test } from "node:test";
import { profileUpdate } from "./fields";

test("genres are trimmed, deduplicated, and kept to three", () => {
    const parsed = profileUpdate.parse({ genres: [" Metal ", "metal", "", "Pop", "Rock", "Jazz", "Folk", "Soul"] });
    assert.deepEqual(parsed.genres, ["Metal", "Pop", "Rock"]);
});

test("an empty about clears it", () => {
    assert.equal(profileUpdate.parse({ about: "   " }).about, null);
    assert.equal(profileUpdate.parse({ about: " the death of peace of mind rocks " }).about, "the death of peace of mind rocks");
});

test("a name can't be empty, and only sent fields are changed", () => {
    assert.equal(profileUpdate.safeParse({ displayName: "  " }).success, false);
    assert.deepEqual(profileUpdate.parse({}), {});
});

test("an about over 200 characters is turned away", () => {
    assert.equal(profileUpdate.safeParse({ about: "a".repeat(201) }).success, false);
});
