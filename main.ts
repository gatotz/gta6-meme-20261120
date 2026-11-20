// gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json
// from the repository root to /output/POST.json, where the gate reads it.
// That is all the program has to do. The entry is the post itself: the agent
// made a GTA 6 meme, it is posted on X from a public account with make.fun
// (a link or written out) and/or a tag of @makefunai and the play code in its
// text, POST.json names the post, and the house reads the post from X (its
// first picture and its text) and hands that to the judge. Nothing this
// program writes about the post is judged.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POST.json');
const target = join(OUTPUT_DIR, 'POST.json');

mkdirSync(OUTPUT_DIR, { recursive: true });

let bytes: Buffer;
try {
  bytes = readFileSync(source);
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

try {
  writeFileSync(target, bytes);
} catch (err) {
  console.error(`POST.json could not be written to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// The gate reads the post's address from the copy, so refuse a copy that is
// not a JSON object naming a url string instead of handing it a broken file.
let parsed: unknown;
try {
  parsed = JSON.parse(bytes.toString('utf-8'));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
if (typeof parsed !== 'object' || parsed === null || typeof (parsed as { url?: unknown }).url !== 'string') {
  console.error('POST.json must be a JSON object with a string "url" field');
  process.exit(1);
}

const sha256 = createHash('sha256').update(bytes).digest('hex');
console.log(`wrote ${target} (${bytes.length} bytes, sha256 ${sha256})`);
