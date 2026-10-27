import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { hashPassword, verifyPassword } from "../auth/password";
import { createSession, deleteSession } from "../auth/sessions";
import { requireUser } from "./user";

export const auth = Router();

// A real Argon2id hash of a random password, used when the email doesn't exist.
// That's so the answer takes as long as a wrong password, therefore not revealing who has an account.
const NO_USER_HASH = hashPassword(crypto.randomUUID());

// Create rules for sign up.
const signupBody = z.object({
    email: z.email().trim(),
    password: z.string().min(10).max(200),
    displayName: z.string().trim().min(1).max(50),
    ageConfirmed: z.literal(true)                   // checkbox must be ticked
})

// Create rules for login.
const loginBody = z.object({
    email: z.string().trim().min(1).max(254),
    password: z.string().min(1).max(200)
})

type UserRow = {
    id: string;
    email: string;
    display_name: string
}

function publicUser(row: UserRow) {
    return {
        id: row.id,
        email: row.email,
        displayName: row.display_name
    }
}

// POST /auth/signup { email, password, displayName, ageConfirmed: true } -> 201 { token, user }
auth.post("/signup", async (req, res) => {
    const parsed = signupBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Check the highlighted fields.", issues: parsed.error.issues });
        return;
    }

    const { email, password, displayName } = parsed.data;

    let user: UserRow;
    try {
        const result = await pool.query<UserRow>(
            `INSERT INTO users (email, password_hash, display_name, age_confirmed_at)
             VALUES ($1, $2, $3, now())
             RETURNING id, email, display_name`,
             [email, await hashPassword(password), displayName]
        );
        user = result.rows[0]!;
    } catch (err) {
        // Postgres code for breaking a UNIQUE rule (email taken).
        if ((err as { code?: string}).code === "23505") {
            res.status(409).json({ error: "There's already an account with that email." });
            return;
        }
        throw err;
    }

    const token = await createSession(user.id);
    res.status(201).json({ token, user: publicUser(user) });
});

// POST /auth/login { email, password } -> 200 { token, user }
auth.post("/login", async (req, res) => {
    const parsed = loginBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Enter your email and password." });
        return;
    }

    const { email, password } = parsed.data;

    const result = await pool.query<UserRow & { password_hash: string }>(
        `SELECT id, email, display_name, password_hash
         FROM users
         WHERE lower(email) = lower($1)`,
         [email]
    );
    const user = result.rows[0];

    const ok = await verifyPassword(password, user?.password_hash ?? (await NO_USER_HASH));

    if (!user || !ok) {
        res.status(401).json({ error: "That email and password don't match." });
        return;
    }

    const token = await createSession(user.id);
    res.json({ token, user: publicUser(user) });
});

// POST /auth/logout -> 204, token stops working
auth.post("/logout", requireUser, async (_req, res) => {
    await deleteSession(res.locals.token);
    res.status(204).end();
});

// GET/auth/me -> { user } based on token
auth.get("/me", requireUser, async (_req, res) => {
    const result = await pool.query<UserRow>(
        `SELECT id, email, display_name
         FROM users
         WHERE id = $1`,
         [res.locals.userId]
    );
    res.json({ user: publicUser(result.rows[0]!) });
});