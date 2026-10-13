// Cover art is provided by the Cover Art Archive, alongside MusicBrainz.
// Using the release group (the album) finds a cover even when the exact
// release Rae matched has none.

export function coverArtUrl(releaseGroupMbid: string | null, size: 250 | 500 = 250): string | null {
    if (!releaseGroupMbid) return null;
    return `https://coverartarchive.org/release-group/${releaseGroupMbid}/front-${size}`;
}