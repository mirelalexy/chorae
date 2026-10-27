import assert from "node:assert/strict";
import { test } from "node:test";
import { hashToken, newToken } from "./tokens";

test("every token is new, long and safe to put in a header", () => {
    const first = newToken();
    const second = newToken();
    assert.notEqual(first, second);
    assert.equal(first.length, 43); // 32 bytes in base64url
    assert.match(first, /^[A-Za-z0-9_-]+$/);
});

test("the same token always hashes the same, and the hash isn't the token", () => {
    const token = newToken();
    assert.equal(hashToken(token), hashToken(token));
    assert.notEqual(hashToken(token), token);
    assert.notEqual(hashToken(token), hashToken(newToken()));
});