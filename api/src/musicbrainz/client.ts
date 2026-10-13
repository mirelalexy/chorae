import { config } from "../config";

// Make requests to MusicBrainz using Chorae's info.
const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = `Chorae/0.1.0 ( ${config.MUSICBRAINZ_CONTACT} )`;

// MusicBrainz's rules state at most one request per second. Assure staying under limit.
const MIN_GAP_MS = 1100;

// Assure waiting and trying again after 503 response.
const MAX_ATTEMPTS = 3;

// Create error type to separate MusicBrainz errors from server errors.
export class MusicBrainzError extends Error {};
