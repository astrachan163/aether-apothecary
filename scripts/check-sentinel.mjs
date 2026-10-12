import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const needle = process.env.NEXT_PUBLIC_SENTINEL_SECRET;
if (!needle) {
  console.error('Set NEXT_PUBLIC_SENTINEL_SECRET to a unique value before the static build.');
  process.exit(1);
}

function files(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files(full, acc);
    else acc.push(full);
  }
  return acc;
}

const hits = files(join(import.meta.dirname, '..', 'out')).filter((file) => {
  if (file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.JPG') || file.endsWith('.woff2')) return false;
  return readFileSync(file).includes(needle);
});

if (hits.length > 0) {
  console.error(`sentinel gate: ${hits.length} file(s)`);
  process.exit(1);
}
console.log('sentinel gate: pass');
