/**
 * Banned-claims gate.
 * Scans the README, docs, and user-facing source. Skips lockfiles,
 * vendored UI (src/components/ui), and this file (it contains the patterns).
 *
 * Lines 1-4 are case-insensitive except the MD token, which is case-sensitive
 * so Tailwind's `md:` and `.md` do not match. The spelling line is
 * case-sensitive. This repo does not apply the MaQkrs spelling rule.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

const TEXT_EXT = new Set(['.md', '.mdx', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.html']);

/** Exact strings removed before matching. The footer disclaimer names the
 * words it disclaims, so it is not itself a product claim. */
const ALLOW_EXACT = [
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.',
];

const HEALTH_VERB = 'cures?|curing|cured|treats?|treating|treated|prevents?|preventing|prevented|fights?|fighting|fought';
const DISEASE_WORD = 'diseases?|cancers?|tumou?rs?|infections?|illness(?:es)?|insomnia|wounds?|burns?|diabetes|heart disease|depression';
const HEALTH_CLAIM = new RegExp(
  `\\b(?:${HEALTH_VERB})\\b[^\\n]{0,60}\\b(?:${DISEASE_WORD})\\b|\\b(?:${DISEASE_WORD})\\b[^\\n]{0,60}\\b(?:${HEALTH_VERB})\\b`,
  'i',
);

const CASE_INSENSITIVE = [
  /Doctor of Medicine|\bM\.D\.|M\.D\. Candidate|four years of medical school|medical school graduate/i,
  /federal licensing|two MSDH-licensed businesses|stood up two licensed|hired after licensing|required full FDA/i,
  /Georgia[^.]{0,40}standards|aligned with [^.]{0,30}standards|\bGSE\b|Milestones aligned|30-day (free )?trial/i,
  /God Mode|Cybersecurity Systems Engineer|Clearable|\bFellow\b|Pre-Vetted|Tier 5|His Name|seeking internships\?/i,
];

const CASE_SENSITIVE = [
  /\bMD\b/,
  /Apple ID|\bGBA\b|Game ?Boy|Nintendo/,
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
    const matched = [...CASE_INSENSITIVE, ...CASE_SENSITIVE, HEALTH_CLAIM].some((pattern) => pattern.test(cleaned));
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
