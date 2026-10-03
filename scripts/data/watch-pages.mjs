#!/usr/bin/env node
// scripts/data/watch-pages.mjs -- spec-v1517 route B, watcher 2 (the page watcher).
//
// A route-B value is a number a person read from a page or PDF (a fact sheet, a revenue procedure, a
// rate notice) and entered as a dated constant. This fetches each such source page, reduces it to its
// text (an HTML page's <main>, or its body, without scripts and styles; a PDF by its bytes), hashes it,
// and compares the hash with the one recorded in scripts/data/page-hashes.json when the page was last
// read. A change is listed for the weekly data-refresh pull request, with the library modules whose
// values come from that page. It never fails the job.
//
// Usage: node scripts/data/watch-pages.mjs [--json] [--offline]
//        node scripts/data/watch-pages.mjs --record URL|all   (after re-reading the page: store its hash)

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from './http.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const STATE = join(ROOT, 'scripts', 'data', 'page-hashes.json');

// sources(libDir) -> Map url -> [module file], from every module that holds route-B dated values.
export function sources(libDir = join(ROOT, 'lib')) {
  const out = new Map();
  for (const f of readdirSync(libDir).filter((n) => n.endsWith('.js')).sort()) {
    const text = readFileSync(join(libDir, f), 'utf8');
    if (!/route: 'B'/.test(text)) continue;
    for (const m of text.matchAll(/url: '(https?:\/\/[^']+)'/g)) {
      if (!out.has(m[1])) out.set(m[1], []);
      if (!out.get(m[1]).includes(`lib/${f}`)) out.get(m[1]).push(`lib/${f}`);
    }
  }
  return out;
}

// fingerprint(bytes) -> sha256 of the page's text (HTML) or of the file (PDF and anything else binary).
export function fingerprint(bytes) {
  const b = Buffer.from(bytes);
  if (b.subarray(0, 4).toString('latin1') === '%PDF') return createHash('sha256').update(b).digest('hex');
  let t = b.toString('utf8').replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(t);
  if (main) t = main[1];
  t = t.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(t).digest('hex');
}

// compare(sources, state, current) -> rows { url, modules, status: 'changed'|'unchanged'|'no baseline'|'unreachable', recorded }
export function compare(srcs, state, current) {
  return [...srcs.entries()].map(([url, modules]) => {
    const was = state[url]; const now = current.get(url);
    const status = !now ? 'unreachable' : !was ? 'no baseline' : was.sha256 === now ? 'unchanged' : 'changed';
    return { url, modules, status, recorded: was ? was.recorded : null };
  });
}

export function markdown(rows) {
  const lines = ['## Source pages of hand-entered figures', ''];
  const changed = rows.filter((r) => r.status === 'changed');
  if (!changed.length) lines.push(`No watched page changed since it was last read (${rows.filter((r) => r.status === 'unchanged').length} of ${rows.length} compared).`);
  for (const r of changed) lines.push(`- ${r.url} changed since it was read on ${r.recorded}. Re-check the values in ${r.modules.map((m) => `\`${m}\``).join(', ')}, then record it (\`node scripts/data/watch-pages.mjs --record ${r.url}\`).`);
  const none = rows.filter((r) => r.status === 'no baseline');
  if (none.length) lines.push('', `No recorded reading yet for ${none.length} page${none.length === 1 ? '' : 's'}: ${none.map((r) => r.url).join(', ')}.`);
  const down = rows.filter((r) => r.status === 'unreachable');
  if (down.length) lines.push('', `Could not fetch ${down.length} page${down.length === 1 ? '' : 's'}: ${down.map((r) => r.url).join(', ')}.`);
  return lines.join('\n') + '\n';
}

async function fetchAll(urls) {
  const current = new Map();
  for (const url of urls) {
    try { const r = await get(url, { retries: 2, timeoutMs: 60000 }); if (r.bytes) current.set(url, fingerprint(r.bytes)); } catch { /* listed as unreachable */ }
  }
  return current;
}

async function main() {
  const args = process.argv.slice(2);
  const srcs = sources();
  const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
  if (args.includes('--record')) {
    const which = args[args.indexOf('--record') + 1];
    const urls = which === 'all' ? [...srcs.keys()] : [which];
    const current = await fetchAll(urls);
    const today = new Date().toISOString().slice(0, 10);
    for (const [url, sha256] of current) state[url] = { sha256, recorded: today };
    writeFileSync(STATE, JSON.stringify(Object.fromEntries(Object.entries(state).sort()), null, 2) + '\n');
    process.stdout.write(`watch-pages: recorded ${current.size} of ${urls.length} page(s).\n`);
    return;
  }
  if (args.includes('--offline') || process.env.SOPHIEWELL_OFFLINE === '1') {
    process.stdout.write(`## Source pages of hand-entered figures\n\nOffline run: ${srcs.size} pages were not compared.\n`);
    return;
  }
  const rows = compare(srcs, state, await fetchAll([...srcs.keys()]));
  process.stdout.write(args.includes('--json') ? JSON.stringify(rows, null, 2) + '\n' : markdown(rows));
}

if (process.argv[1] && process.argv[1].endsWith('watch-pages.mjs')) {
  main().catch((err) => { process.stdout.write(`## Source pages of hand-entered figures\n\nThe page watcher did not run: ${err.message}\n`); });
}
