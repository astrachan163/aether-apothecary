import { readFileSync } from 'node:fs';

const text = readFileSync(new URL('../firebase.json', import.meta.url), 'utf8');
if (text.includes('sha256-')) {
  console.error('firebase.json contains generated script hashes. Leave those out of git. npm run build:static writes them locally before a hosting deploy.');
  process.exit(1);
}
const scriptParts = [...text.matchAll(/script-src [^;]*/g)].map((match) => match[0]);
if (scriptParts.some((part) => part.includes('unsafe-inline'))) {
  console.error('script-src must not use unsafe-inline');
  process.exit(1);
}
if (!text.includes("style-src 'self' 'unsafe-inline'")) {
  console.error("style-src must allow unsafe-inline for dropdown and dialog style tags");
  process.exit(1);
}
console.log('committed csp: pass');
