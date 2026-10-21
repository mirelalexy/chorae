import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { writeDraft } from "../rae/client";
import { draftProblems, draftRequestSchema } from "../rae/schemas";

// Ask Rae for a mixtape based on a request file and save it as a fixture.
const input = process.argv[2];
if (!input) {
    console.log("Usage: npm run rae:draft -- path/to/request.json");
    process.exit(1);
}

// Check request using the same schema the app will use.
const request = draftRequestSchema.parse(JSON.parse(await readFile(input, "utf8")));

// See how long it takes for Rae to create the mixtape.
const started = Date.now();
const draft = await writeDraft(request);
const seconds = Math.round((Date.now() - started) / 1000);

console.log(`\n${draft.title}\n\n${draft.intro}`);
for (const side of draft.sides) {
    console.log(`\n* ${side.title} *\n${side.mood_line}\n`);
    side.tracks.forEach((t, i) => {
        console.log(`${i + 1}. ${t.title} - ${t.artist}${t.is_seed ? "  (your pick)  " : ""}`);
        console.log(`\n${t.note}`);
    })
    console.log(`\nBackups: ${side.backups.map((b) => `${b.title} - ${b.artist}`).join("; ")}`);
}

const tracks = draft.sides.reduce((sum, s) => sum + s.tracks.length, 0);
const sides = draft.sides.length;
console.log(`\n${tracks} tracks over ${sides} side${sides === 1 ? "" : "s"}, in ${seconds}s.`);

const problems = draftProblems(draft);
console.log(problems.length ? `Problems:\n- ${problems.join("\n- ")}` : "No problems found.");

const dir = path.resolve(import.meta.dirname, "../../fixtures/rae");
await mkdir(dir, { recursive: true });

const file = path.join(dir, `draft-${Date.now()}.json`);
await writeFile(file, JSON.stringify({ request, draft }, null, 2));
console.log(`\nSaved to ${path.relative(process.cwd(), file)}`);