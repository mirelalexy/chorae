
import assert from "node:assert/strict";
import { test } from "node:test";
import { personalSchema, preferencesUpdate, type Personal } from "./personal";
import { draftMessage, personalSection, questionsMessage } from "./prompt";

const nothing: Personal = {
    artists: [],
    albums: [],
    note: null,
    discovery: null,
    avoid: [],
};

const lex: Personal = {
    artists: [
        { mbid: "00000000-0000-4000-8000-000000000001", name: "Bad Omens" },
        { mbid: "00000000-0000-4000-8000-000000000002", name: "Muse" },
    ],
    albums: [
        {
            mbid: "00000000-0000-4000-8000-000000000003",
            name: "THE DEATH OF PEACE OF MIND",
            artist: "Bad Omens",
        },
    ],
    note: "I mostly listen on night shifts.",
    discovery: "fresh",
    avoid: [
        { mbid: "00000000-0000-4000-8000-000000000004", name: "Coldplay" },
        { mbid: "00000000-0000-4000-8000-000000000005", name: "Nirvana" },
    ],
};

test("with nothing set, Rae gets nothing extra", () => {
    assert.equal(personalSection(undefined, "draft"), "");
    assert.equal(personalSection(nothing, "draft"), "");
    assert.equal(personalSection(nothing, "questions"), "");
});

test("taste, note, discovery and never-play reach the draft", () => {
    const text = personalSection(lex, "draft");

    assert.match(text, /Artists they love: Bad Omens, Muse/);
    assert.match(text, /Albums they love: THE DEATH OF PEACE OF MIND by Bad Omens/);
    assert.match(text, /In their own words: I mostly listen on night shifts\./);
    assert.match(text, /they want discoveries/i);
    assert.match(text, /Never put these artists on the tape/);
    assert.match(text, /- Coldplay\n- Nirvana/);
});

test("a set discovery means Rae doesn't ask about it", () => {
    const withDiscovery = personalSection(lex, "questions");
    const withoutDiscovery = personalSection(
        { ...lex, discovery: null },
        "questions",
    );

    assert.match(withDiscovery, /don't ask how familiar or new/);
    assert.doesNotMatch(withoutDiscovery, /don't ask how familiar or new/);
});

test("the person's words stay inside request tags", () => {
    const text = personalSection(lex, "draft");

    const inside = [...text.matchAll(/<request>([\s\S]*?)<\/request>/g)]
        .map((match) => match[1])
        .join("");

    assert.match(inside, /night shifts/);
    assert.match(inside, /Coldplay/);
});

test("messages include personalisation only when provided", () => {
    const request = {
        prompt: "rainy walk",
        answers: [],
        minutes: 60,
        seeds: [],
        story: false,
    };

    assert.doesNotMatch(draftMessage(request), /About them/);
    assert.doesNotMatch(draftMessage({ ...request, personal: nothing }), /About them/);
    assert.match(draftMessage({ ...request, personal: lex }), /About them/);

    assert.match(questionsMessage("rainy walk", [], lex), /About them/);
    assert.doesNotMatch(questionsMessage("rainy walk"), /About them/);
    assert.doesNotMatch(questionsMessage("rainy walk", [], nothing), /About them/);
});

test("personalisation accepts the new artist and album structure", () => {
    assert.deepEqual(personalSchema.parse(lex), lex);

    assert.equal(
        personalSchema.safeParse({
            ...lex,
            avoid: [{ mbid: "invalid", name: "Coldplay" }],
        }).success,
        false,
    );
});

test("an empty note clears it, and discovery can go back to unset", () => {
    assert.equal(preferencesUpdate.parse({ note: "   " }).note, null);
    assert.equal(preferencesUpdate.parse({ discovery: null }).discovery, null);

    assert.deepEqual(
        preferencesUpdate.parse({ note: "  I love synthpop  " }),
        { note: "I love synthpop" },
    );

    assert.equal(
        preferencesUpdate.safeParse({ discovery: "sometimes" }).success,
        false,
    );

    assert.equal(
        preferencesUpdate.safeParse({ note: "a".repeat(301) }).success,
        false,
    );

    assert.deepEqual(preferencesUpdate.parse({}), {});
});