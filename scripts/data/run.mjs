#!/usr/bin/env node
// scripts/data/run.mjs -- spec-v1621 §2 and §4.
//
// Runs the live dataset builders (scripts/data/builders/*.mjs, listed in
// builders/index.mjs), and for each one: discover the newest edition, fetch it
// with the last run's validators, hash it, parse, check, and write shards and
// a manifest v2 with `coverage: 'full'`. Curated datasets still come from
// scripts/build-data.mjs.
//
// A builder that throws keeps the previous data and is reported `failed`.
// A source whose hash has not moved writes nothing. Everything the workflow
// needs to decide whether to merge is in data-refresh-summary.json.
//
// Usage: node scripts/data/run.mjs [--dataset ID] [--offline] [--summary PATH]
// SOPHIEWELL_OFFLINE=1 touches no live dataset.

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, getText } from './http.mjs';
import { checkDataset, decidePublish } from './check.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const HASH_FILE = join(ROOT, 'scripts', 'expected-hashes.json');
const SHARD_MAX_RECORDS = 5000;

const sha256 = (b) => createHash('sha256').update(b).digest('hex');

async function writeIfChanged(dest, text) {
  if (existsSync(dest) && (await readFile(dest, 'utf8')) === text) return false;
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, text, 'utf8');
  return true;
}

// shard(records, key) -> [{ name, items }], grouped by key and split so no
// file holds more than SHARD_MAX_RECORDS rows. Names sort in key order.
export function shard(records, key) {
  const groups = new Map();
  for (const r of records) {
    const k = String(key(r)).replace(/[^A-Za-z0-9_-]/g, '_') || '_';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  const out = [];
  for (const k of [...groups.keys()].sort()) {
    const items = groups.get(k);
    for (let i = 0, part = 0; i < items.length; i += SHARD_MAX_RECORDS, part += 1) {
      out.push({ name: part ? `${k}-${part}.json` : `${k}.json`, items: items.slice(i, i + SHARD_MAX_RECORDS) });
    }
  }
  return out;
}

async function readJsonOr(path, fallback) {
  return existsSync(path) ? JSON.parse(await readFile(path, 'utf8')) : fallback;
}

// writeDataset(dataDir, builder, found, records, extra) -> manifest. Replaces
// the folder's shard set (a sample's leftover shards are removed) and writes
// the manifest v2 for fetched data.
export async function writeDataset(dataDir, builder, found, records, { sourceSha256, today, ancillary = {} }) {
  const folder = join(dataDir, builder.id);
  const shardDir = join(folder, 'shards');
  const shards = shard(records, builder.shardKey);
  const written = new Set();
  const shardMeta = [];
  for (const s of shards) {
    const json = JSON.stringify(s.items);
    await writeIfChanged(join(shardDir, s.name), json);
    written.add(s.name);
    shardMeta.push({ name: s.name, sha256: sha256(json), records: s.items.length, bytes: Buffer.byteLength(json) });
  }
  if (existsSync(shardDir)) for (const f of await readdir(shardDir)) if (!written.has(f)) await rm(join(shardDir, f));
  const keep = new Set(['manifest.json', 'shards', ...Object.keys(ancillary)]);
  // A .js ancillary is a module's text, written as is (poverty-guidelines); anything else is JSON.
  for (const [name, value] of Object.entries(ancillary)) await writeIfChanged(join(folder, name), name.endsWith('.js') ? value : JSON.stringify(value, null, 2) + '\n');
  for (const f of await readdir(folder)) if (!keep.has(f)) await rm(join(folder, f), { recursive: true });
  const recordsSha256 = sha256(shardMeta.map((s) => s.sha256).join('') + JSON.stringify(ancillary));
  const manifest = {
    manifestVersion: 2,
    dataset: builder.id,
    label: builder.label,
    sourceUrl: builder.sourceUrl,
    agency: builder.agency,
    status: builder.status || 'public-domain',
    cadence: builder.cadence,
    recordCount: records.length,
    shardLayout: 'shards',
    shards: shardMeta,
    ...(Object.keys(ancillary).length ? { ancillary: Object.keys(ancillary) } : {}),
    ...(builder.notes ? { notes: builder.notes } : {}),
    coverage: 'full',
    sourceEdition: found.edition,
    ...(found.effectiveFrom ? { effectiveFrom: found.effectiveFrom } : {}),
    fetchedAt: today,
    contentChangedAt: today,
    expiresOn: found.expiresOn,
    ...(found.nextExpected ? { nextExpected: found.nextExpected } : {}),
    sourceSha256,
    recordsSha256,
    recordBounds: builder.recordBounds,
  };
  await writeIfChanged(join(folder, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

// runBuilder(builder, ctx) -> summary row. ctx: { dataDir, hashes, today, http }
export async function runBuilder(builder, ctx) {
  const { dataDir, hashes, today } = ctx;
  const http = ctx.http || { get, getText };
  const prevHash = hashes[builder.id] || null;
  const prevManifest = await readJsonOr(join(dataDir, builder.id, 'manifest.json'), null);
  const row = { id: builder.id, status: 'unchanged', editionBefore: prevManifest && prevManifest.sourceEdition, problems: [] };
  try {
    const found = await builder.discover(http);
    if (!found || !found.url) throw new Error('no download link matched on the landing page');
    row.edition = found.edition;
    // An edition can span several files (three MUE settings; this year's and
    // next year's DRG table). `found.parts` lists the others; all are fetched
    // and hashed together, so a correction to any one of them is a change.
    // Only a single-file source uses conditional requests.
    const parts = found.parts || [];
    const sameUrl = !parts.length && prevHash && prevHash.url === found.url;
    const res = await http.get(found.url, sameUrl ? { etag: prevHash.etag, lastModified: prevHash.lastModified } : {});
    if (res.notModified) return row;
    found.partBytes = {};
    for (const url of parts) found.partBytes[url] = (await http.get(url)).bytes;
    const sourceSha256 = parts.length
      ? sha256([res.bytes, ...parts.map((u) => found.partBytes[u])].map((b) => sha256(b)).join(''))
      : sha256(res.bytes);
    if (prevHash && prevHash.sha256 === sourceSha256 && prevManifest && prevManifest.coverage === 'full') return row;
    const { records, ancillary } = await builder.parse(res.bytes, found);
    // A builder may date the edition from the file itself (orange-book reads its products.txt date).
    row.edition = found.edition;
    const canaries = [...(builder.stableCanaries || []), ...((builder.canaries && builder.canaries[found.edition]) || [])];
    const check = checkDataset({
      records,
      ancillary: ancillary || {},
      recordBounds: builder.recordBounds,
      previousCount: prevManifest && prevManifest.coverage === 'full' ? prevManifest.recordCount : null,
      canaries,
      shape: builder.shape,
    });
    row.problems.push(...check.problems);
    row.canaries = check.canaryResults;
    row.recordCount = records.length;
    // `canaries: null` says the stable canaries are the whole check (weekly
    // data has no per-edition publication to read them from).
    row.editionWithoutCanaries = builder.canaries !== null && !(builder.canaries && builder.canaries[found.edition]);
    row.sameEditionHashChange = Boolean(prevHash && prevHash.edition === found.edition && prevHash.sha256 !== sourceSha256);
    await writeDataset(dataDir, builder, found, records, { sourceSha256, today, ancillary });
    hashes[builder.id] = { url: found.url, edition: found.edition, sha256: sourceSha256, etag: res.etag || null, lastModified: res.lastModified || null, fetchedAt: today };
    row.status = 'updated';
  } catch (err) {
    row.status = 'failed';
    row.problems.push(err.message);
  }
  return row;
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes('--dataset') ? args[args.indexOf('--dataset') + 1] : null;
  const offline = args.includes('--offline') || process.env.SOPHIEWELL_OFFLINE === '1';
  const summaryPath = args.includes('--summary') ? resolve(args[args.indexOf('--summary') + 1]) : join(ROOT, 'data-refresh-summary.json');
  const { BUILDERS } = await import('./builders/index.mjs');
  const hashes = await readJsonOr(HASH_FILE, {});
  const today = new Date().toISOString().slice(0, 10);
  const datasets = [];
  for (const b of BUILDERS) {
    if (only && b.id !== only) continue;
    if (offline) { datasets.push({ id: b.id, status: 'unchanged', problems: [], note: 'offline run' }); continue; }
    const row = await runBuilder(b, { dataDir: join(ROOT, 'data'), hashes, today });
    datasets.push(row);
    console.log(`  ${row.id}: ${row.status}${row.edition ? ` (${row.edition})` : ''}${row.problems.length ? ` -- ${row.problems.join('; ')}` : ''}`);
  }
  if (!offline) await writeIfChanged(HASH_FILE, JSON.stringify(hashes, null, 2) + '\n');
  const summary = { generatedAt: new Date().toISOString(), datasets };
  summary.decision = decidePublish(summary);
  await writeFile(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
  console.log(`data/run: ${datasets.length} live dataset(s); decision: ${summary.decision.action}`);
}

if (process.argv[1] && process.argv[1].endsWith(join('data', 'run.mjs'))) {
  main().catch((err) => { console.error('data/run: fatal', err); process.exit(2); });
}
