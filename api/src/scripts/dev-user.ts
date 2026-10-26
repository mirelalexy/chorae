import { pool } from "../db/pool";

// Create dev user and print its ID.
const EMAIL = "dev@chorae.local";
const NO_LOGIN = "no-login";

const existing = await pool.query<{ id: string }>(
    `SELECT id FROM users 
    WHERE lower(email) = lower($1)`, 
    [EMAIL]
);

const id = existing.rows[0]?.id ?? (
    await pool.query<{ id: string }>(
        `INSERT INTO users (email, display_name, password_hash, age_confirmed_at)
        VALUES ($1, $2, $3, now())
        RETURNING id`, 
        [EMAIL, "Dev", NO_LOGIN]
    )
).rows[0]!.id;

console.log(`Dev user: ${id}`);
console.log(`Add this to .env:\nDEV_USER_ID=${id}`);
await pool.end();