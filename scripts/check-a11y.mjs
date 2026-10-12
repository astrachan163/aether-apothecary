/**
 * Axe scan of the static Firebase export in WebKit at 430px.
 * Fails on critical or serious violations. Run after `npm run build:static`.
 */

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = join(import.meta.dirname, '..', 'out');

async function pages() {
  const found = [];
  async function walk(dir, prefix) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('_') || entry.name === '404.html') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, `${prefix}/${entry.name}`);
        continue;
      }
      if (!entry.name.endsWith('.html')) continue;
      if (entry.name === 'index.html') {
        found.push(prefix || '/');
        continue;
      }
      found.push(`${prefix}/${entry.name.replace(/\.html$/, '')}`);
    }
  }
  await walk(root, '');
  return found.sort();
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.PNG': 'image/png',
  '.jpg': 'image/jpeg',
  '.JPG': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function resolvePath(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const relative = clean.replace(/^[/\\]/, '');
  const candidates = [relative, `${relative}.html`, join(relative, 'index.html')].filter(Boolean);
  if (relative === '') candidates.unshift('index.html');
  return candidates.map((item) => join(root, item));
}

async function readFirst(paths) {
  for (const path of paths) {
    try {
      return await readFile(path);
    } catch {
      // try the next candidate
    }
  }
  return null;
}

function startServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const body = await readFirst(resolvePath(url.pathname));
    if (!body) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    const type = types[extname(url.pathname)] || types['.html'];
    response.writeHead(200, { 'content-type': type });
    response.end(body);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolve({ server, port });
    });
  });
}

async function main() {
  const { server, port } = await startServer();
  const browser = await webkit.launch();
  const failures = [];
  try {
    const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
    const page = await context.newPage();
    const paths = await pages();
    for (const path of paths) {
      const url = `http://127.0.0.1:${port}${path}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      const status = response ? response.status() : 0;
      if (status >= 400) {
        failures.push(`${path}: HTTP ${status}`);
        continue;
      }
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter(
        (violation) => violation.impact === 'critical' || violation.impact === 'serious',
      );
      if (serious.length > 0) {
        for (const violation of serious) {
          const nodes = violation.nodes.map((node) => node.target.join(' ')).slice(0, 3).join('; ');
          failures.push(`${path}: ${violation.impact} ${violation.id} (${nodes})`);
        }
      } else {
        console.log(`${path}: 0 critical/serious`);
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  if (failures.length > 0) {
    console.error(`axe: ${failures.length} problem(s)`);
    for (const failure of failures) console.error(failure);
    process.exit(1);
  }
  console.log('axe: pass (WebKit, 430px, 0 critical/serious)');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'axe failed';
  console.error(message);
  process.exit(1);
});
