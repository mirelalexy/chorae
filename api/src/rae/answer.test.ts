import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { readAnswer } from "./answer";

const schema = z.object({ title: z.string() });

function reply(text: string, stop_reason: any = "end_turn"): any {
    return { stop_reason, content: [{ type: "text", text }] };
}

test("returns the checked value", () => {
    assert.deepEqual(
        readAnswer(
            reply('{"title":"Side A"}'), 
            schema,
        ), 
    { ok: true, value: { title: "Side A" } });
});

test("asks again for broken JSON", () => {
    const answer = readAnswer(reply('{"title": "Side'), schema);
    assert.equal(answer.ok, false);
    assert.equal(!answer.ok && answer.retry, true);
});

test("asks again for JSON in the wrong shape", () => {
    const answer = readAnswer(reply('{"name":"Side A"}'), schema);
    assert.equal(!answer.ok && answer.retry, true);
});

test("doesn't ask again after a refusal or a cut-off answer", () => {
    for (const stop of ["refusal", "max_tokens"]) {
        const answer = readAnswer(reply("", stop), schema);
        assert.equal(answer.ok, false);
        assert.equal(!answer.ok && answer.retry, false);
    }
});

test("skips blocks that aren't text", () => {
    const message: any = { 
        stop_reason: "end_turn", 
        content: [{ type: "thinking", thinking: "" }, { type: "text", text: '{"title":"B"}' }] 
    };
    
    assert.deepEqual(readAnswer(message, schema), { ok: true, value: { title: "B" } });
});
