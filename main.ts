// gta6-meme-x-01 entrypoint (Node 22, standard library only).
//
// The entry is the X post itself: the meme was made by the agent, posted on X
// from a public account with make.fun / @makefunai and the play code in its
// text. This program's only job is to hand the house the post's address: it
// reads POST.json from the repository root, checks it names a real X status
// URL, and writes it to /output/POST.json where the gate reads it.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repoDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const STATUS_URL = /^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+\/?$/;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const sourcePath = join(repoDir, 'POST.json');

let raw: string;
try {
  raw = readFileSync(sourcePath, 'utf8');
} catch (err) {
  fail(`could not read ${sourcePath}: ${(err as Error).message}`);
}

let post: unknown;
try {
  post = JSON.parse(raw);
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

const url =
  post !== null && typeof post === 'object'
    ? (post as { url?: unknown }).url
    : undefined;

if (typeof url !== 'string' || !STATUS_URL.test(url)) {
  fail(
    'POST.json must name an X status URL, e.g. https://x.com/<handle>/status/<id>',
  );
}

mkdirSync(outDir, { recursive: true });
try {
  writeFileSync(join(outDir, 'POST.json'), JSON.stringify({ url }) + '\n');
} catch (err) {
  fail(`could not write POST.json to ${outDir}: ${(err as Error).message}`);
}

console.log('POST.json copied for ' + url);
