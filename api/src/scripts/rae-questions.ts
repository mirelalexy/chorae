import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { askQuestions } from "../rae/client";

// Save Rae's answer as a fixture.
const prompt = process.argv[2];

if (!prompt) {
    console.log('Usage: npm run rae:questions -- "What the mixtape is for"');
    process.exit(1);
}

const questions = await askQuestions(prompt);

for (const q of questions.questions) {
    console.log(`\n${q.text}`);
    for (const s of q.suggestions) {
        console.log(`  || ${s}`);
    }
}

const dir = path.resolve(import.meta.dirname, "../../fixtures/rae");
await mkdir(dir, { recursive: true });

const file = path.join(dir, `questions-${Date.now()}.json`);
await writeFile(file, JSON.stringify({ prompt, ...questions }, null, 2));
console.log(`\nSaved to ${path.relative(process.cwd(), file)}`);