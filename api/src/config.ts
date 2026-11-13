import { z } from "zod";

// Check .env config is correct before starting server.
const schema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),
    MUSICBRAINZ_CONTACT: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().optional(),
    DAILY_MIXTAPE_LIMIT: z.coerce.number().int().min(1).default(5),
    CLOUDINARY_URL: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string()
            .regex(
                /^cloudinary:\/\/[^:]+:[^@]+@[\w-]+$/,
                "should look like cloudinary://<key>:<secret>@<cloud name>",
            )
            .optional(),
    ),
    CLOUDINARY_FOLDER: z.string()
        .regex(/^[\w-]+$/)
        .default("chorae"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.error("Missing or invalid settings in .env:");
    for (const issue of parsed.error.issues) {
        console.error(` ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
}

export const config = parsed.data;