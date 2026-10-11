/**
 * Static export for Firebase Hosting (site aether-apothecary, no Cloud Functions).
 * Route handlers and server actions cannot ship in `output: 'export'`.
 * This script moves src/app/api aside and points the admin screens at the
 * offline page for the build, then restores both.
 */

import { spawn } from 'node:child_process';
import { access, copyFile, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

const root = join(import.meta.dirname, '..');
const apiDir = join(root, 'src/app/api');
const stashDir = join(root, '.static-export-stash/api');
const liveFiles = [
  join(root, 'src/components/admin/AdminLoginLive.tsx'),
  join(root, 'src/components/admin/AdminDashboardLive.tsx'),
];
const offlineStub = "export { default } from './AdminOffline';\n";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

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

async function restoreApi() {
  if (!(await exists(stashDir))) return;
  if (await exists(apiDir)) {
    throw new Error('Refusing to restore src/app/api because both the stash and the original directory exist.');
  }
  await rename(stashDir, apiDir);
}

async function stashLiveScreens() {
  await mkdir(join(root, '.static-export-stash'), { recursive: true });
  for (const file of liveFiles) {
    const dest = join(root, '.static-export-stash', basename(file));
    await copyFile(file, dest);
    await writeFile(file, offlineStub);
  }
}

async function restoreLiveScreens() {
  for (const file of liveFiles) {
    const dest = join(root, '.static-export-stash', basename(file));
    if (await exists(dest)) {
      await copyFile(dest, file);
      await rm(dest);
    }
  }
}

async function main() {
  if ((await exists(stashDir)) && !(await exists(apiDir))) {
    await rename(stashDir, apiDir);
  }
  await mkdir(dirname(stashDir), { recursive: true });
  await rename(apiDir, stashDir);
  await stashLiveScreens();
  await rm(join(root, '.next'), { recursive: true, force: true });
  await rm(join(root, 'out'), { recursive: true, force: true });
  try {
    await runNextBuild();
  } finally {
    await restoreLiveScreens();
    await restoreApi();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Static build failed.';
  console.error(message);
  process.exit(1);
});
