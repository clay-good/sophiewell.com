#!/usr/bin/env node
// Minimal zero-dependency static file server for local development.
// Serves the repository root with the same security headers as production.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withInlineHashes } from './csp.mjs';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
// SERVE_ROOT (relative to the repo root) lets the same server preview the
// pre-rendered static build under dist/ -- the audience hubs (/for/...), topic
// pages (/topics/...), the /commitments/ page, and the /tools/<id>/ pages --
// exactly as Cloudflare Pages serves them in production. Defaults to the repo
// root (the SPA at index.html), so the existing dev/e2e behavior is unchanged.
const ROOT = process.env.SERVE_ROOT ? resolve(REPO_ROOT, process.env.SERVE_ROOT) : REPO_ROOT;
const PORT = Number(process.env.PORT || 4173);

const CSP_BASE = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src https://challenges.cloudflare.com; form-action 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'";

async function buildCsp() {
  try {
    const html = await readFile(join(ROOT, 'index.html'), 'utf8');
    return withInlineHashes(CSP_BASE, html);
  } catch {
    return CSP_BASE;
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const HEADERS = {
  'Content-Security-Policy': CSP_BASE,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=()',
  'Cache-Control': 'no-cache',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    // sw.js caches the shell under a build hash that is the literal string
    // "dev" in the source tree, so in local development the cache never
    // invalidates and every edit is served from a stale copy until the worker
    // is unregistered by hand. Serve a self-unregistering stub instead: the
    // page registers it, it tears down the previous worker and its caches, and
    // localhost always sees the files on disk. Set SERVE_SW=1 to serve the real
    // worker when the offline behavior itself is what you are testing.
    if (urlPath === '/sw.js' && !process.env.SERVE_SW) {
      const stub = 'self.addEventListener("install", () => self.skipWaiting());\n'
        + 'self.addEventListener("activate", (e) => { e.waitUntil((async () => {\n'
        + '  for (const k of await caches.keys()) await caches.delete(k);\n'
        + '  await self.registration.unregister();\n'
        + '  for (const c of await self.clients.matchAll()) c.navigate(c.url);\n'
        + '})()); });\n';
      res.writeHead(200, { ...HEADERS, 'Content-Type': MIME['.js'], 'Content-Length': String(Buffer.byteLength(stub)) });
      return res.end(stub);
    }
    const safe = normalize(urlPath).replace(/^([./\\]+)/, '');
    let filePath = join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
    let s;
    try { s = await stat(filePath); }
    catch { res.writeHead(404, HEADERS); return res.end('Not found'); }
    // Directory → index.html, matching how Cloudflare Pages serves the
    // pre-rendered /for/, /topics/, /commitments/, and /tools/<id>/ pages.
    if (s.isDirectory()) {
      const indexPath = join(filePath, 'index.html');
      try {
        const is = await stat(indexPath);
        if (!is.isFile()) throw new Error('no index');
        filePath = indexPath;
      } catch { res.writeHead(403, HEADERS); return res.end('Forbidden'); }
    }
    const body = await readFile(filePath);
    const headers = { ...HEADERS, 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream', 'Content-Length': String(body.length) };
    res.writeHead(200, headers);
    res.end(body);
  } catch (err) {
    res.writeHead(500); res.end(String(err && err.message || err));
  }
});

buildCsp().then((csp) => {
  HEADERS['Content-Security-Policy'] = csp;
  server.listen(PORT, () => console.log(`sophiewell dev server: http://localhost:${PORT}`));
});
