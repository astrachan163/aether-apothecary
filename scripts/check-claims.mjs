/**
 * Banned-claims gate.
 * Scans the README, docs, and user-facing source. Skips lockfiles,
 * vendored UI (src/components/ui), and this file (it contains the patterns).
 *
 * Lines 1-4 are case-insensitive except the MD token, which is case-sensitive
 * so Tailwind's `md:` and `.md` do not match. Line 5 is case-sensitive so the
 * display spelling "MaQkrs" does not match.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

const TEXT_EXT = new Set(['.md', '.mdx', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.html']);

/** Exact URL, path, repo slug, or ID strings removed before matching. */
const ALLOW_EXACT = [
  // No allow-listed slugs in this repo.
];

const CASE_INSENSITIVE = [
  /Doctor of Medicine|\bM\.D\.|M\.D\. Candidate|four years of medical school|medical school graduate/i,
  /federal licensing|two MSDH-licensed businesses|stood up two licensed|hired after licensing|required full FDA/i,
  /Georgia[^.]{0,40}standards|aligned with [^.]{0,30}standards|\bGSE\b|Milestones aligned|30-day (free )?trial/i,
  /God Mode|Cybersecurity Systems Engineer|Clearable|\bFellow\b|Pre-Vetted|Tier 5|His Name|seeking internships\?/i,
];

const CASE_SENSITIVE = [
  /\bMD\b/,
  /Apple ID|\bGBA\b|Game ?Boy|Nintendo|\bMaqkrs\b(?![-/._a-zA-Z0-9])|MaQkRs/,
];

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'ui']);

function walk(dir, files) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (!TEXT_EXT.has(extname(entry))) continue;
    files.push(full);
  }
}

function targets() {
  const files = [];
  const readme = join(ROOT, 'README.md');
  files.push(readme);
  const guide = join(ROOT, 'stripe_integration_guide.md');
  files.push(guide);
  walk(join(ROOT, 'docs'), files);
  walk(join(ROOT, 'src'), files);
  return files;
}

function scrub(line) {
  let next = line;
  for (const allowed of ALLOW_EXACT) {
    next = next.split(allowed).join('');
  }
  return next;
}

const hits = [];

for (const file of targets()) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const cleaned = scrub(line);
    const matched = [...CASE_INSENSITIVE, ...CASE_SENSITIVE].some((pattern) => pattern.test(cleaned));
    if (matched) {
      hits.push(`${relative(ROOT, file)}:${index + 1}`);
    }
  });
}

if (hits.length > 0) {
  console.error(`claims gate: ${hits.length} hit(s)`);
  for (const hit of hits) console.error(hit);
  process.exit(1);
}

console.log('claims gate: pass');
