import { config } from "../config";

// Make requests to MusicBrainz using Chorae's info.
const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = `Chorae/0.1.0 ( ${config.MUSICBRAINZ_CONTACT} )`;

// MusicBrainz's rules state at most one request per second. Assure staying under limit.
const MIN_GAP_MS = 1100;

// Assure waiting and trying again after 503 response.
const MAX_ATTEMPTS = 5;

// Create error type to separate MusicBrainz errors from server errors.
export class MusicBrainzError extends Error {};

// Create helper to wait for a request's turn or pause before retrying.
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let nextSlot = 0

// Requests made at the same time go out one second apart,
// because each caller reserves the next free slot before waiting.
async function waitForTurn() {
    const now = Date.now();
    const slot = Math.max(now, nextSlot);
    nextSlot = slot + MIN_GAP_MS;
    if (slot > now) await sleep(slot - now);
}

export async function mbGet(path: string, params: Record<string, string>): Promise<unknown> {
    const url = new URL(`${BASE_URL}/${path}`);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    url.searchParams.set("fmt", "json");

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        await waitForTurn();

        let res: Response;

        try {
            res = await fetch(url, {
                headers: {
                    "User-Agent": USER_AGENT,
                    Accept: "application/json",
                },
                signal: AbortSignal.timeout(10000),
            });
        } catch (err) {
            // Network problem or timeout: try again, unless this was the last attempt.
            if (attempt === MAX_ATTEMPTS) throw new MusicBrainzError(`Couldn't reach Musicbrainz: ${err}`);
            continue;
        }

        if (res.ok) return res.json();

        // After sending too many requests, back off a little longer each time.
        if (res.status === 503 && attempt < MAX_ATTEMPTS) {
            await sleep(2000 * 2 ** (attempt - 1));
            continue;
        }

        throw new MusicBrainzError(`MusicBrainz answered ${res.status} for ${path}`);
    }

    throw new MusicBrainzError("Unreachable");
}

export function escapeQuery(text: string) {
    return text.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&"); // "warning signs (interlude)" -> "warning signs \(interlude)\"
}