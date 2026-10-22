import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

function files(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files(full, acc);
    else if (entry.endsWith('.ts')) acc.push(full);
  }
  return acc.sort();
}

describe('vendored byok', () => {
  it('matches VERSION', () => {
    const root = join(process.cwd(), 'vendor/byok-gemini');
    const hash = createHash('sha256');
    for (const file of files(root)) {
      if (file.endsWith('VERSION')) continue;
      hash.update(relative(root, file));
      hash.update(readFileSync(file));
    }
    expect(hash.digest('hex')).toBe(readFileSync(join(root, 'VERSION'), 'utf8').trim());
  });
});
