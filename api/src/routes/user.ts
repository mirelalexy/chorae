import { RequestHandler } from "express";
import { findSessionUser } from "../auth/sessions";

// Work out who is making the request (from the login token in the Authorization header)
// and put their ID in res.locals.userId. This is so routes that use it never need to 
// know how logging in works.
export const requireUser: RequestHandler = async (req, res, next) => {
    const header = req.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

    const userId = token ? await findSessionUser(token) : null;
    if (!userId) {
        res.status(401).json({ error: "Log in to continue." });
        return;
    }

    res.locals.userId = userId;
    res.locals.token = token;   // for logging out
    next();
};