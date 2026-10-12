import assert from "node:assert/strict";
import { test } from "node:test";
import { normalize, normalizeTitle, splitArtists } from "./normalize";

test("normalize ignores case, accents and punctuation", () => {
  assert.equal(normalize("Beyoncé"), "beyonce");
  assert.equal(normalize("Don’t Stop!"), "dont stop");
  assert.equal(normalize("NOBODY'S GIRL"), "nobodys girl");
  assert.equal(normalize("Hot & Sexy - Girls Trip"), "hot and sexy girls trip");
});

test("normalizeTitle removes features and remaster notes", () => {
  assert.equal(normalizeTitle("Suffocate (feat. Poppy)"), "suffocate");
  assert.equal(normalizeTitle("Narcissist feat. The 1975"), "narcissist");
  assert.equal(normalizeTitle("Bitter Sweet Symphony - Remastered 2016"), "bitter sweet symphony");
  assert.equal(normalizeTitle("Disarm (2011 Remaster)"), "disarm");
});

test("normalizeTitle keeps parts that belong to the title", () => {
  assert.equal(normalizeTitle("warning signs (interlude)"), "warning signs interlude");
  assert.equal(normalizeTitle("Change (In the House of Flies)"), "change in the house of flies");
});

test("splitArtists splits features but not band names", () => {
  assert.deepEqual(splitArtists("Knocked Loose, Poppy"), ["knocked loose", "poppy"]);
  assert.deepEqual(splitArtists("Wallows feat. Clairo"), ["wallows", "clairo"]);
  assert.deepEqual(splitArtists("Charli xcx featuring Troye Sivan"), ["charli xcx", "troye sivan"]);
  assert.deepEqual(splitArtists("Florence + The Machine"), ["florence and the machine"]);
  assert.deepEqual(splitArtists("Dexter and The Moonrocks"), ["dexter and the moonrocks"]);
  assert.deepEqual(splitArtists("bees & honey"), ["bees and honey"]);
});