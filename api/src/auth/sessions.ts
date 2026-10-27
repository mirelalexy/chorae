import { pool } from "../db/pool";
import { hashToken, newToken } from "./tokens";

// A session lasts this long after it was last used. Using the app keeps you logged in.
const SESSION_DAYS = 30;

// Start a session and return the token. Hand it to the app and keep only its hash.
export async function createSession(userId: string): Promise<string> {
    const token = newToken();
    await pool.query(
        `INSERT INTO sessions (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + make_interval(days => $3))`,
         [userId, hashToken(token), SESSION_DAYS]
    );
    return token;
}

// Find user ID while moving the expiry forward.
export async function findSessionUser(token: string): Promise<string | null> {
    const result = await pool.query<{ user_id: string}>(
        `UPDATE sessions
         SET last_used_at = now(), expires_at = now() + make_interval(days => $1)
         WHERE token_hash = $2 AND expires_at > now()
         RETURNING user_id`,
         [SESSION_DAYS, hashToken(token)]
    );
    return result.rows[0]?.user_id ?? null;
}

// Delete token at log out.
export async function deleteSession(token: string): Promise<void> {
    await pool.query(
        `DELETE FROM sessions
         WHERE token_hash = $1`,
         [hashToken(token)]
    );
}