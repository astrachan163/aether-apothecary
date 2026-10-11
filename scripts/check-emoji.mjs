/**
 * Emoji gate. Fails on emoji and dingbat code points in tracked-style text.
 * Arrows U+2190-21FF are allowed. Lockfiles, fonts, images, and vendored
 * trees (node_modules, .next) are skipped.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'coverage', 'out', '.vercel']);

const SKIP_FILES = new Set(['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml']);

const SKIP_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.avif',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.pdf', '.zip', '.gz',
]);

const BANNED = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\uFE0F\u2705\u2714\u2716\u274C\u274E]/u;

function walk(dir, files) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (SKIP_FILES.has(entry)) continue;
    if (SKIP_EXT.has(extname(entry).toLowerCase())) continue;
    files.push(full);
  }
}

const files = [];
walk(ROOT, files);

const hits = [];

for (const file of files) {
  let text;
  try {
    const bytes = readFileSync(file);
    if (bytes.includes(0)) continue;
    text = bytes.toString('utf8');
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (BANNED.test(line)) {
      hits.push(`${relative(ROOT, file)}:${index + 1}`);
    }
  });
}

if (hits.length > 0) {
  console.error(`emoji gate: ${hits.length} hit(s)`);
  for (const hit of hits) console.error(hit);
  process.exit(1);
}

console.log('emoji gate: pass');
