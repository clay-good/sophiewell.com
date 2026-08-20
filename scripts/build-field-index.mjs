#!/usr/bin/env node
// spec-v753: emit the browser-readable field index.
//
// Every MCP adapter declares a flat `fields` list -- the input key the renderer
// reads (`dom`), its type (`kind`), its unit, whether it is required, its human
// label, and for an enum its allowed values. That is exactly what a
// plain-language query needs to be turned into filled inputs, and it already
// exists for 1540 of the 1564 tiles.
//
// The browser cannot read it directly: `mcp/` is a local stdio server, not a
// browser target, and importing 636 adapter modules at runtime is not a thing
// the SPA is going to do. So the shape the extractor needs is written out once,
// at build time, short-keyed to keep it small:
//
//   { "<tileId>": [ { d, k, u, r, l, v } ] }
//     d  dom key        the input id the renderer uses, and the hash-state key
//     k  kind           'number' | 'bool' | 'enum' | 'string'
//     u  unit           optional, as the adapter declares it
//     r  required       1 when required, omitted otherwise
//     l  label          the human label
//     v  values         enum values only
//
// Bucketed, not whole and not per tile. Whole is 171 KB gzip -- real weight to
// pull down on ward wifi for a file that is never needed whole, since routing
// picks the tile before anything wants its fields. Per tile is 1540 generated
// files in the repo, which churns every diff. Bucketing by the tile id's first
// letter splits the difference: 27 files, a few KB each, one fetch per query,
// cached in memory for the session.
//
// Output: `data/fields/<bucket>.json`, each `{ "<tileId>": [ ...fields ] }`.

import { writeFile, mkdir, rm } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { allCalculators } from '../mcp/catalog.js';
// One definition of the bucket filename, shared with lib/query-fill.js so the
// writer and the reader cannot disagree.
import { bucketFor } from '../lib/field-bucket.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = join(ROOT, 'data', 'fields');

// The guardrail is per bucket, because a bucket is what a reader actually
// downloads. A build failure rather than a warning, for the same reason the
// corpus budget is one: a silent creep is how a budget stops meaning anything.
// If a bucket outgrows this, split on two letters rather than raising it.
const BUCKET_GZIP_BUDGET = 24 * 1024;


// spec-v753: `mcp/fields.js` recognizes kind 'bool'; 90 field descriptors
// across ~14 adapters spell it 'boolean'. That mismatch is a pre-existing
// schema-accuracy bug in the agent contract (scoring is unaffected -- the lib
// computes coerce with their own truthy() helper). The index is not the place
// to fix it, but it IS the place to stop it spreading: normalize on the way in,
// so the extractor sees one spelling.
const KINDS = new Set(['number', 'bool', 'enum', 'string']);
function normalizeKind(kind) {
  if (kind === 'boolean') return 'bool';
  return KINDS.has(kind) ? kind : 'string';
}

export function buildIndex(calculators) {
  const index = {};
  let fieldCount = 0;
  for (const calc of calculators) {
    if (!calc || !Array.isArray(calc.fields) || calc.fields.length === 0) continue;
    const rows = [];
    for (const f of calc.fields) {
      if (!f || !f.dom) continue;
      const row = { d: f.dom, k: normalizeKind(f.kind), l: f.label || f.arg || f.dom };
      if (f.unit) row.u = f.unit;
      if (f.required) row.r = 1;
      if (row.k === 'enum' && Array.isArray(f.values)) row.v = f.values.slice();
      rows.push(row);
      fieldCount += 1;
    }
    if (rows.length) index[calc.id] = rows;
  }
  return { index, fieldCount };
}

async function main() {
  const { index, fieldCount } = buildIndex(allCalculators());
  const ids = Object.keys(index).sort();
  if (ids.length === 0) throw new Error('build-field-index: zero tiles indexed; adapter registry stale?');

  const buckets = new Map();
  for (const id of ids) {
    const b = bucketFor(id);
    if (!buckets.has(b)) buckets.set(b, {});
    buckets.get(b)[id] = index[id];
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  let biggestGzip = 0;
  let biggestBucket = '';
  let totalGzip = 0;
  for (const [b, rows] of [...buckets].sort((x, y) => x[0].localeCompare(y[0]))) {
    const json = JSON.stringify(rows);
    const gzip = gzipSync(Buffer.from(json), { level: 9 }).length;
    if (gzip > BUCKET_GZIP_BUDGET) {
      throw new Error(
        `build-field-index: bucket "${b}" is ${(gzip / 1024).toFixed(1)} KB gzip, over the `
        + `${(BUCKET_GZIP_BUDGET / 1024).toFixed(0)} KB budget. Split the buckets on two letters.`
      );
    }
    if (gzip > biggestGzip) { biggestGzip = gzip; biggestBucket = b; }
    totalGzip += gzip;
    await writeFile(join(OUT_DIR, `${b}.json`), json, 'utf8');
  }

  console.log(
    `build-field-index: wrote ${buckets.size} buckets / ${ids.length} tiles / ${fieldCount} fields `
    + `to data/fields/ (largest ${(biggestGzip / 1024).toFixed(1)} KB gzip on "${biggestBucket}", `
    + `${(totalGzip / 1024).toFixed(1)} KB gzip total, budget ${(BUCKET_GZIP_BUDGET / 1024).toFixed(0)} KB per bucket).`
  );
}

// Only run the build when invoked directly. buildIndex/bucketFor are imported
// by the unit test and by lib/query-fill.js's test harness; importing this file
// must not write files as a side effect.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error('build-field-index: failed', err); process.exit(1); });
}
