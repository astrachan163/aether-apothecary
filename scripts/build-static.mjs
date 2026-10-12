/**
 * Static export for Firebase Hosting (site aether-apothecary).
 * Cloud Functions live in functions/ and are not part of this Next build.
 */

import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');

function runNextBuild() {
  const nextBin = join(root, 'node_modules/next/dist/bin/next');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextBin, 'build'], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        STATIC_EXPORT: '1',
        CI: 'true',
      },
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`next build exited ${code ?? 1}`));
    });
  });
}

await rm(join(root, '.next'), { recursive: true, force: true });
await rm(join(root, 'out'), { recursive: true, force: true });
await runNextBuild();
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [join(root, 'scripts/apply-csp.mjs')], { cwd: root, stdio: 'inherit' });
  child.on('error', reject);
  child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`csp exited ${code ?? 1}`))));
});
