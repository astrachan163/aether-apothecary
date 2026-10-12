/**
 * Browser scan of rendered public pages for disease-claim words.
 * The FDA disclaimer is removed before matching.
 */

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { webkit } from 'playwright';

const root = join(import.meta.dirname, '..', 'out');
const disclaimer = 'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';
const words = ['treat', 'cure', 'prevent', 'heal', 'anxiety', 'depression', 'cancer', 'diabetes', 'inflammation', 'immune', 'pain', 'insomnia', 'detox', 'arthritis', 'covid', 'disease', 'blood pressure', 'ailment', 'remedy'];

async function pages() {
  const found = [];
  async function walk(dir, prefix) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('_') || entry.name === '404.html') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, `${prefix}/${entry.name}`);
        continue;
      }
      if (!entry.name.endsWith('.html')) continue;
      if (prefix.startsWith('/admin')) continue;
      found.push(entry.name === 'index.html' ? (prefix || '/') : `${prefix}/${entry.name.replace(/\.html$/, '')}`);
    }
  }
  await walk(root, '');
  return found.sort();
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.PNG': 'image/png', '.jpg': 'image/jpeg', '.JPG': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

function resolvePath(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const relative = clean.replace(/^[/\\]/, '');
  const candidates = [relative, `${relative}.html`, join(relative, 'index.html')].filter(Boolean);
  if (relative === '') candidates.unshift('index.html');
  return candidates.map((item) => join(root, item));
}

async function readFirst(paths) {
  for (const path of paths) {
    try { return await readFile(path); } catch { /* next */ }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  const body = await readFirst(resolvePath(url.pathname));
  if (!body) {
    res.writeHead(404);
    res.end('no');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(url.pathname)] || 'text/html' });
  res.end(body);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = await webkit.launch();
const page = await (await browser.newContext({ viewport: { width: 430, height: 900 } })).newPage();
const hits = [];
for (const path of await pages()) {
  await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'networkidle' });
  const text = (await page.locator('body').innerText()).split(disclaimer).join(' ');
  for (const word of words) {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    if (pattern.test(text)) hits.push(`${path}: ${word}`);
  }
}
await browser.close();
server.close();
if (hits.length > 0) {
  console.error(`disease-word scan: ${hits.length} hit(s)`);
  for (const hit of hits) console.error(hit);
  process.exit(1);
}
console.log('disease-word scan: pass');
