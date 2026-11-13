import { Router } from "express";
import { z } from "zod";
import { IMAGE_KINDS, signUpload, uploadsEnabled } from "../images/cloudinary";
import { requireUser } from "./user";

export const uploads = Router();
uploads.use(requireUser);

const signBody = z.object({
    kind: z.enum(IMAGE_KINDS),
});

// Give users that are logged in signed fields for uploading directly to Cloudinary.
uploads.post("/sign", (req, res) => {
    if (!uploadsEnabled) {
        res.status(503).json({ error: "Uploading pictures isn't available right now." });
        return;
    }

    const parsed = signBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid image type." });
        return;
    }

    res.json(signUpload(res.locals.userId, parsed.data.kind));
});