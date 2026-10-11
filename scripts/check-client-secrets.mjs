/**
 * Client-secret gate.
 * Fails when a password, email, or key-shaped value is hardcoded in src,
 * when .env.example is missing or non-blank, or when gitignore would hide it.
 * Prints rule and path only. Never prints a matched value.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css']);

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const ASSIGNED_SECRET = /(PASSWORD|SECRET|PRIVATE_KEY|API_KEY|TOKEN)\s*=\s*['"`][^'"`\n]+['"`]/;
const KEY_SHAPE = /AIza[0-9A-Za-z\-_]{10,}|(?:sk|pk)_(?:live|test)_[0-9A-Za-z]{8,}|whsec_[0-9A-Za-z]{8,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/;
const PUBLIC_PAID_KEY = /NEXT_PUBLIC_[A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD)|VITE_[A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD)/;

const failures = [];

function checkEnvExample() {
  const examplePath = join(ROOT, '.env.example');
  if (!existsSync(examplePath)) {
    failures.push('missing-env-example: .env.example');
    return;
  }
  const lines = readFileSync(examplePath, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (!match) {
      failures.push(`env-example-unparsed: .env.example:${index + 1}`);
      return;
    }
    if (match[2].trim() !== '') {
      failures.push(`env-example-not-blank: .env.example:${index + 1}:${match[1]}`);
    }
  });
}

function checkGitignore() {
  // `git check-ignore -q` exits 0 when the path is ignored and 1 when it is not.
  // `-v` is not used: a negation pattern still prints and exits 0 in that mode.
  try {
    execFileSync('git', ['check-ignore', '-q', '.env.example'], {
      cwd: ROOT,
      stdio: 'ignore',
    });
    failures.push('env-example-ignored: .gitignore');
  } catch (error) {
    const status = error && typeof error === 'object' && 'status' in error ? error.status : 1;
    if (status !== 1) {
      failures.push('env-example-ignore-check-failed: .gitignore');
    }
  }
}

function walk(dir, files) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (TEXT_EXT.has(extname(entry))) files.push(full);
  }
}

function checkSource() {
  const files = [];
  walk(join(ROOT, 'src'), files);
  for (const file of files) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      const where = `${rel}:${index + 1}`;
      if (EMAIL.test(line)) failures.push(`email-in-source: ${where}`);
      if (ASSIGNED_SECRET.test(line)) failures.push(`secret-literal: ${where}`);
      if (KEY_SHAPE.test(line)) failures.push(`key-shaped-literal: ${where}`);
      if (PUBLIC_PAID_KEY.test(line)) failures.push(`public-key-env: ${where}`);
    });
  }
}

checkEnvExample();
checkGitignore();
checkSource();

if (failures.length > 0) {
  console.error(`client-secrets gate: ${failures.length} hit(s)`);
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log('client-secrets gate: pass');
