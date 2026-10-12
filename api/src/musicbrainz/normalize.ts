// Normalize artist names and song titles to make them easier to compare.
// For example, "Bad Omens & Poppy" becomes "bad omens and poppy".
// As for a song, the title "what's wrong with me feat. Robert Smith" becomes "whats wrong with me".

export function normalize(text: string): string {
    return text
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")                // remove accent marks ("Beyoncé" -> "Beyonce")
        .toLowerCase()
        .replace(/[\u2018\u2019\u00B4\u0060]/g, "'")    // standardize apostrophes ("rock ’n’ roll" -> "rock 'n' roll")
        .replace(/[\u201C\u201D]/g, '"')                // standardize curly quotation marks
        .replace(/&/g, " and ")
        .replace(/[^\p{L}\p{N}']+/gu, " ")              // replace punctuation with spaces ("b.e.d." -> "b e d")
        .replace(/'/g, "")                              // drop apostrophes
        .trim()
        .replace(/\s+/g, " ");                          // collapse repeated spaces ("bad    omens" -> "bad omens")
}

// Title metadata that can get in the way of matching songs.
const NOISE = [
    /\s*[([]\s*(feat\.?|ft\.?|featuring|with)\s[^)\]]*[)\]]/gi,                                           // "Fireball (feat. John Ryan)" -> "Fireball"
    /\s+(feat\.?|ft\.?|featuring)\s.*$/gi,                                                                // "Talk talk featuring troye sivan" -> "Talk talk"
    /\s*-\s*(\d{4}\s+)?(remaster(ed)?|single version|album version|radio edit)(\s+\d{4})?.*$/gi,          // "Daisies - Remastered 2011" -> "Daisies"
    /\s*[([]\s*(\d{4}\s+)?(remaster(ed)?|single version|album version|radio edit)(\s+\d{4})?\s*[)\]]/gi,  // "Daisies (Radio Edit)" -> "Daisies"
];

// Remove featuring credits and version details without changing the title itself.
export function stripTitleNoise(title: string): string {
    let cleaned = title;

    for (const pattern of NOISE) {
        cleaned = cleaned.replace(pattern, "");
    }

    return cleaned.trim(); // "This Is Not Real Love (feat. Mutya) - Remastered 2006" -> "This Is Not Real Love"
}

export function normalizeTitle(title: string): string {
    return normalize(stripTitleNoise(title));
}

// Split a list of artists into individual names.
// Ignore "&" or "and" since many names contain them (as in "Earth, Wind & Fire").
export function splitArtists(artist: string): string[] {
    return splitArtistsRaw(artist).map(normalize).filter(Boolean); // "Knocked Loose, Poppy" -> ["knocked loose", "poppy"]
}

// Split artist credits while preserving their original spelling.
export function splitArtistsRaw(artist: string): string[] {
    return artist
        .split(/\s*(?:,|\bfeaturing\b|\bfeat\.?|\bft\.?|\bwith\b)\s*/i) // "Wallows feat. Clairo" -> ["Wallows", "Clairo"]
        .map((name) => name.trim())
        .filter(Boolean);
}