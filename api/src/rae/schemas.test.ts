import assert from "node:assert/strict";
import { test } from "node:test";
import { draftProblems, draftSchema, questionsSchema, type Draft } from "./schemas";

function validDraft(): Draft {
    return {
        title: "lights out in the east wing",
        intro: "Start quiet. It gets louder once the power goes.",
        sides: [
            {
                title: "the station after hours",
                mood_line: "Corridors, mostly. Slow dread.",
                tracks: [
                { title: "Angel", artist: "Massive Attack", note: "Rain on the front steps. That bassline is your own footsteps on tile, louder than you remember.", is_seed: false },
                { title: "Machine Gun", artist: "Portishead", note: "A generator coughs somewhere below...", is_seed: true },
                ],
                backups: [{ title: "Carrion Flowers", artist: "Chelsea Wolfe", note: "Same weight, slower." }],
            },
        ],
    };
}

test("accepts a valid draft", () => {
    assert.equal(draftSchema.safeParse(validDraft()).success, true);
});

test("rejects a track without a note", () => {
    const draft: any = validDraft();
    delete draft.sides[0].tracks[0].note;
    assert.equal(draftSchema.safeParse(draft).success, false);
});

test("rejects a side without backups", () => {
    const draft = validDraft();
    draft.sides[0].backups = [];
    assert.equal(draftSchema.safeParse(draft).success, false);
});

test("rejects a side without tracks", () => {
    const draft = validDraft();
    draft.sides[0].tracks = [];
    assert.equal(draftSchema.safeParse(draft).success, false);
});

test("rejects the wrong types", () => {
  const draft: any = validDraft();
    draft.sides[0].tracks[0].is_seed = "yes";
    assert.equal(draftSchema.safeParse(draft).success, false);
    assert.equal(draftSchema.safeParse("not even an object").success, false);
    assert.equal(draftSchema.safeParse(null).success, false);
});

test("questions must number between two and four", () => {
    const one = { questions: [{ text: "Who is it for?", suggestions: [] }] };
    assert.equal(questionsSchema.safeParse(one).success, false);

    const three = { questions: [1, 2, 3].map((n) => ({ text: `Question ${n}?`, suggestions: ["Yes", "No"] })) };
    assert.equal(questionsSchema.safeParse(three).success, true);
});

test("a valid draft has no problems", () => {
    assert.deepEqual(draftProblems(validDraft()), []);
});

test("finds the same song twice, even in backups", () => {
    const draft = validDraft();
    draft.sides[0].backups.push({ title: "angel", artist: "MASSIVE ATTACK", note: "Again." });
    assert.equal(draftProblems(draft).length, 1);
});

test("finds too many tracks by one artist, but doesn't count seeds", () => {
    const draft = validDraft();
    const song = (n: number, is_seed: boolean) => ({ title: `Song ${n}`, artist: "Portishead", note: "A note.", is_seed });
    draft.sides[0].tracks.push(song(1, false), song(2, false), song(3, false));
    assert.deepEqual(draftProblems(draft), []); // 3 picked by Rae + 1 seed: fine

    draft.sides[0].tracks[1].is_seed = false;
    assert.equal(draftProblems(draft).length, 1); // now 4 by Rae
});
