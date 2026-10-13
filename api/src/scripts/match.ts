import { matchTrack } from "../musicbrainz/match";

const [title, artist] = process.argv.slice(2);

if (!title || !artist) {
    console.log('Usage: npm run match -- "Song title" "Artist"');
    process.exit(1);
}

const result = await matchTrack({ title, artist });
console.log(result ?? "No match found.");