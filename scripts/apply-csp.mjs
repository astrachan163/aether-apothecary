/**
 * Replace script-src with hashes of every inline script in out/.
 * Drops 'unsafe-inline' for scripts. Style attributes stay on style-src-attr.
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const hashes = new Set();

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!name.endsWith('.html')) continue;
    const html = readFileSync(full, 'utf8');
    const pattern = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
    for (const match of html.matchAll(pattern)) {
      if (!match[1]) continue;
      const digest = createHash('sha256').update(match[1], 'utf8').digest('base64');
      hashes.add(`'sha256-${digest}'`);
    }
  }
}

walk(join(root, 'out'));
if (hashes.size === 0) {
  console.error('csp: no inline scripts found');
  process.exit(1);
}
const scriptSrc = `script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ ${[...hashes].sort().join(' ')}`;
const firebasePath = join(root, 'firebase.json');
const current = readFileSync(firebasePath, 'utf8');
if (!current.includes("script-src 'self'")) {
  console.error('csp: firebase.json has no script-src');
  process.exit(1);
}
const next = current.replace(/script-src [^;]*/g, scriptSrc);
if (next.includes("'unsafe-inline'") && next.includes('script-src')) {
  const scriptParts = [...next.matchAll(/script-src [^;]*/g)].map((match) => match[0]);
  if (scriptParts.some((part) => part.includes('unsafe-inline'))) {
    console.error('csp: unsafe-inline remains on script-src');
    process.exit(1);
  }
}
writeFileSync(firebasePath, next);
console.log(`csp: ${hashes.size} script hashes, unsafe-inline removed from script-src`);
