import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { describe, expect, it } from 'vitest';

function files(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files(full, acc);
    else if (['.ts', '.tsx', '.js', '.mjs'].includes(extname(entry))) acc.push(full);
  }
  return acc;
}

describe('env access', () => {
  it('does not read env vars dynamically in src', () => {
    const hits = files(join(process.cwd(), 'src')).filter((file) => {
      const text = readFileSync(file, 'utf8');
      return /process\.env\s*\[/.test(text) || /import\.meta\.env\s*\[/.test(text);
    });
    expect(hits).toEqual([]);
  });

  it('never names the sentinel env var in source', () => {
    const hits = files(join(process.cwd(), 'src')).filter((file) => readFileSync(file, 'utf8').includes('NEXT_PUBLIC_SENTINEL'));
    expect(hits).toEqual([]);
  });
});
