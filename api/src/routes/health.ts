import { Router } from "express";
import { pool } from "../db/pool";

export const health = Router();

// GET /health confirms the API is up and can reach the database.
health.get("/", async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ ok: true });
});