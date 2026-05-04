#!/usr/bin/env node
// Minimal zero-dependency static file server for local development.
// Serves the repository root with the same security headers as production.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withInlineHashes } from './csp.mjs';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const PORT = Number(process.env.PORT || 4173);

const CSP_BASE = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'";

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
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=()',
  'Cache-Control': 'no-cache',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const safe = normalize(urlPath).replace(/^([./\\]+)/, '');
    const filePath = join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
    let s;
    try { s = await stat(filePath); }
    catch { res.writeHead(404, HEADERS); return res.end('Not found'); }
    if (s.isDirectory()) { res.writeHead(403, HEADERS); return res.end('Forbidden'); }
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
