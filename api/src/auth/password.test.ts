import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "./password";

test("the right password matches, while a wrong one doesn't", async () => {
    const stored = await hashPassword("ra3i5aw3som*3*");
    assert.equal(await verifyPassword("ra3i5aw3som*3*", stored), true);
    assert.equal(await verifyPassword("ra3i5aw33om*4*", stored), false);
})

test("the same password hashes differently each time", async () => {
    const first = await hashPassword("same");
    const second = await hashPassword("same");
    assert.notEqual(first, second);
    assert.equal(await verifyPassword("same", first), true);
    assert.equal(await verifyPassword("same", second), true);
})

test("the stored string keeps the settings and never the password", async () => {
    const stored = await hashPassword("secret");
    assert.match(stored, /^\$argon2id\$v=19\$m=19456,p=1,t=2\$/);
    assert.equal(stored.includes("secret"), false);
});

test("anything that isn't a valid hash never matches", async () => {
    for (const stored of ["!no-login", "", "$argon2id$broken", "plain-text-password", "scrypt$32768$8$3$c2FsdA==$dG9vc2hvcnQ="]) {
        assert.equal(await verifyPassword("plain-text-password", stored), false, stored);
    }
});
