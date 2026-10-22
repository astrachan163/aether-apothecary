import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { runInNewContext } from 'node:vm';

const filename = fileURLToPath(new URL('../../functions/index.js', import.meta.url));
const localRequire = createRequire(filename);

export function loadFunctions(options: { app: any; Stripe?: any; allowlist?: unknown; secrets?: Record<string, string> }) {
  class HttpsError extends Error {
    constructor(public code: string, message: string) { super(message); }
  }
  const mocks: Record<string, unknown> = {
    'firebase-functions/v2/https': { onCall: (_options: unknown, handler: unknown) => handler, onRequest: (_options: unknown, handler: unknown) => handler, HttpsError },
    'firebase-functions/v2/scheduler': { onSchedule: (_options: unknown, handler: unknown) => handler },
    'firebase-functions/params': { defineSecret: (name: string) => ({ value: () => options.secrets?.[name] }) },
    'firebase-functions/v2': { setGlobalOptions: () => undefined },
    'firebase-admin': { apps: [options.app], app: () => options.app },
    'node:fs': { ...localRequire('node:fs'), readFileSync: (path: string, encoding: string) => path.endsWith('stripe-price-allowlist.json') ? JSON.stringify(options.allowlist ?? []) : readFileSync(path, encoding as BufferEncoding) },
    stripe: options.Stripe ?? class {},
  };
  const entry = { exports: {} as Record<string, (...args: any[]) => Promise<any>> };
  runInNewContext(readFileSync(filename, 'utf8'), {
    require: (name: string) => name in mocks ? mocks[name] : localRequire(name),
    module: entry, exports: entry.exports, __dirname: dirname(filename), process: { env: {} },
  }, { filename });
  return entry.exports;
}
