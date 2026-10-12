import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool";

// Runs every .sql file in /migrations that hasn't run yet, in name order.
// Each file runs in a transaction, so a failing migration leaves nothing half-done.
const dir = path.resolve(import.meta.dirname, "../../migrations");

async function migrate() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name   text PRIMARY KEY,
            run_at timestamptz NOT NULL DEFAULT now()
        )
    `);

    const { rows } = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
    const done = new Set(rows.map((r) => r.name));
    const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

    for (const file of files) {
        if (done.has(file)) continue;

        const sql = await readFile(path.join(dir, file), "utf8");
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(sql);
            await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
            await client.query("COMMIT");
            console.log(`Ran ${file}`);
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    console.log("Migrations up to date.");
}

migrate()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => pool.end());