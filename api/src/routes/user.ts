import { RequestHandler } from "express";
import { config } from "../config";

// Work out who is making the request and put their ID in.
// Using dev user until accounts exist.
export const requireUser: RequestHandler = (_req, res, next) => {
    if (!config.DEV_USER_ID) {
        res.status(500).json({ error: "DEV_USER_ID isn't set. Run npm run dev-user." });
        return;
    }
    res.locals.userId = config.DEV_USER_ID;
    next();
};