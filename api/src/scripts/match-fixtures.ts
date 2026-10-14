import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../db/pool";
import { saveTrack } from "../musicbrainz/cache";
import { MusicBrainzError } from "../musicbrainz/client";
import { matchTrack } from "../musicbrainz/match";

// Match every song in the CSV files (fixtures) and report the match rate.
// Usually, 160 songs take 3-5 minutes. --save saves matches in the tracks table.

const dir = path.resolve(import.meta.dirname, "../../fixtures");
const save = process.argv.includes("--save");

function parseCsv(text: string): { title: string; artist: string }[] {
    const rows = text.trim().split(/\r?\n/).slice(1)

    return rows.map((line) => {
        // Split CSV fields on commas while keeping commas inside quoted fields intact.
        // Also support escaped quotes ("") within quoted fields.
        const fields = [...line.matchAll(/("([^"]|"")*"|[^,]*)(,|$)/g)]
            .map((m) => m[1] ?? "")
            .map((f) => (f.startsWith('"') ? f.slice(1, -1).replace(/""/g, '"') : f));

        return { title: fields[0] ?? "", artist: fields[1] ?? "" };
    })
}

try {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".csv"));

    const results: {
        file: string;
        title: string;
        artist: string;
        match: unknown;
        error?: string;
    }[] = [];

    let matched = 0;
    let failed = 0;

    for (const file of files) {
        console.log(`\nFile: ${file}`);
        for (const song of parseCsv(await readFile(path.join(dir, file), "utf8"))) {
            let match;
            try {
                match = await matchTrack(song);
            } catch (err) {
                // One failed request is marked with "!" and skipped.
                if (!(err instanceof MusicBrainzError)) throw err;
                failed++;
                console.log(`! ${song.title} - ${song.artist} (${err.message})`);
                results.push({ file, ...song, match: null, error: err.message });
                continue;
            }

            if (match) {
                matched++;
                if (save) await saveTrack(match);
            }
            console.log(`${match ? "✓" : "✗"} ${song.title} - ${song.artist} ${match ? `-> ${match.title} - ${match.artist}` : ""}`);
            results.push({ file, ...song, match })
        }
    }

    const rate = Math.round((matched / results.length) * 100);
    console.log(`\nMatched ${matched} of ${results.length} (${rate}%)`);
    if (failed > 0) console.log(`${failed} tracks couldn't be matched because MusicBrainz didn't answer. Run again to retry them.`);

    await writeFile(path.join(dir, "results.json"), JSON.stringify(results, null, 2));
    console.log("Details saved to fixtures/results.json");
} finally {
    await pool.end();
}