// MusicBrainz search queries.

export function escapeQuery(text: string): string {
    return text.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&");
}

// Anyone can add releases to MusicBrainz, including bootlegs (fan-made albums of leaked
// songs, with homemade covers). Chorae only shows music that was officially released.
export const OFFICIAL = "status:official";

export const VERSIONS = [
    "live",
    "remix",
    "demo",
    "acoustic",
    "instrumental",
    "karaoke",
    "sped up",
    "slowed",
    "edit",
] as const;

export function requestedVersions(query: string): string[] {
    return VERSIONS.filter((version) =>
        new RegExp(`\\b${version}\\b`, "i").test(query)
    );
}

// Search by song title or artist, including versions stored in disambiguation.
export function songQuery(query: string): string {
    const requested = requestedVersions(query);

    const words = query
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .filter((word) => !requested.includes(word.toLowerCase()))
        .map(escapeQuery);

    const terms = words.map(
        (word) => `(recording:${word} OR artist:${word})`
    );

    // Version labels can appear in the title or the recording disambiguation.
    const versions = requested.map(
        (version) => `(recording:"${version}" OR comment:"${version}")`
    );

    return [...terms, ...versions, OFFICIAL].join(" AND ");
}