#!/usr/bin/env node
// scripts/measure-boot.mjs -- spec-v1541 §4: what a cold boot costs a small phone.
//
// Serves the built dist/ locally and opens the home view and the four tile
// routes .lighthouserc.json samples, each in a fresh browser context (empty
// HTTP cache, no service worker) with the CPU slowed 4x through the DevTools
// protocol. Lighthouse is not used: its dependency tree carries unresolved
// advisories (docs/performance.md).
//
// Reports, per route, the median of three runs:
//   - boot: navigation start to DOMContentLoaded. Module scripts run before
//     DOMContentLoaded, so this is every module fetched, parsed and run.
//   - ready: navigation start to the route's answer on screen (the home box's
//     input, or the tool's worked example in #q-results).
//   - files and bytes loaded, raw and gzipped file by file (a CDN compresses
//     each response on its own), and how long that gzip transfer takes at the
//     Lighthouse profile's 1.6 Mbps.
//
// The network is local and unthrottled, so boot and ready isolate the CPU cost;
// the transfer column is the network cost, computed rather than timed.
//
// Usage: npm run build && node scripts/measure-boot.mjs [--runs N]

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PORT = 4176;
const BASE = `http://localhost:${PORT}`;
const ROUTES = ['/', '/#bmi', '/#egfr', '/#wells-pe', '/#gcs'];
const SLOWDOWN = 4;
const KBPS = 1638.4;
const runsArg = process.argv.indexOf('--runs');
const RUNS = runsArg > 0 ? Number(process.argv[runsArg + 1]) : 3;

const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

async function once(browser, route) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  // The browser keeps 250 resource entries by default; the app loads thousands.
  await context.addInitScript(() => performance.setResourceTimingBufferSize(100000));
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: SLOWDOWN });
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 120000 });
  const id = route.startsWith('/#') ? route.slice(2) : null;
  await page.waitForFunction(
    (tool) => (tool ? (document.getElementById('q-results')?.textContent || '').trim().length > 0 : !!document.getElementById('hero-search')),
    id,
    { polling: 'raf', timeout: 120000 },
  );
  const t = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const files = performance.getEntriesByType('resource')
      .map((r) => new URL(r.name))
      .filter((u) => u.origin === location.origin)
      .map((u) => u.pathname);
    return { boot: nav.domContentLoadedEventEnd, ready: performance.now(), files };
  });
  await context.close();
  let raw = 0;
  let gz = 0;
  let js = 0;
  for (const path of ['/index.html', ...t.files]) {
    const file = join(DIST, decodeURIComponent(path).replace(/\/$/, '/index.html'));
    if (!existsSync(file)) continue;
    const bytes = readFileSync(file);
    raw += bytes.length;
    gz += gzipSync(bytes).length;
    if (file.endsWith('.js')) js += 1;
  }
  return { boot: t.boot, ready: t.ready, files: t.files.length + 1, js, raw, gz };
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('measure-boot: build dist/ first (npm run build)');
  const server = spawn(process.execPath, [join(ROOT, 'scripts', 'serve.mjs')], {
    env: { ...process.env, SERVE_ROOT: 'dist', PORT: String(PORT) },
    stdio: 'ignore',
  });
  try {
    for (let i = 0; i < 50; i += 1) {
      try { if ((await fetch(`${BASE}/`)).ok) break; } catch { /* not up yet */ }
      await new Promise((r) => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    const MB = (n) => (n / 1048576).toFixed(1);
    const lines = [
      `CPU slowed ${SLOWDOWN}x, cold cache, median of ${RUNS} runs, measured ${new Date().toISOString().slice(0, 10)}.`,
      '',
      '| Route | Boot (DOMContentLoaded) | Ready | Files (JS) | Raw | Gzip, file by file | Gzip at 1.6 Mbps |',
      '|---|---|---|---|---|---|---|',
    ];
    for (const route of ROUTES) {
      const runs = [];
      for (let i = 0; i < RUNS; i += 1) runs.push(await once(browser, route));
      const last = runs[runs.length - 1];
      const secs = (ms) => `${(ms / 1000).toFixed(1)} s`;
      lines.push(`| \`${route}\` | ${secs(median(runs.map((r) => r.boot)))} | ${secs(median(runs.map((r) => r.ready)))} | ${last.files} (${last.js}) | ${MB(last.raw)} MB | ${MB(last.gz)} MB | ${secs((last.gz * 8) / (KBPS * 1024) * 1000)} |`);
    }
    await browser.close();
    process.stdout.write(lines.join('\n') + '\n');
  } finally {
    server.kill();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
