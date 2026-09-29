#!/usr/bin/env node
// scripts/verify-integrity.mjs
//
// Verifies that every shard's SHA-256 matches the value recorded in its
// dataset's manifest.json. Walks the data folder. Zero runtime dependencies.
//
// spec-v1622 step 1: every dataset manifest is manifest v2 (spec-v1614 §1).
// It states its coverage, edition, the date a person last checked it and when
// it expires; `fetchedAt` only appears on data a builder actually downloaded,
// never on a sample or a curated subset; and the old `fetchDate`, which the
// weekly run restamped on data nobody fetched, appears nowhere under data/.

import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DATA = join(ROOT, 'data');

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function* walkDirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  yield dir;
  for (const entry of entries) {
    if (entry.isDirectory()) {
      yield* walkDirs(join(dir, entry.name));
    }
  }
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const COVERAGES = new Set(['full', 'subset', 'sample']);

// manifestProblems(manifest) -> [string]. Pure, so the unit test can pin it.
export function manifestProblems(m) {
  const out = [];
  if (m.manifestVersion !== 2) out.push('manifestVersion is not 2');
  if (!COVERAGES.has(m.coverage)) out.push(`coverage "${m.coverage}" is not full, subset or sample`);
  if (m.coverage !== 'full' && !m.coverageNote) out.push('a subset or sample needs a coverageNote');
  if (!m.sourceEdition) out.push('sourceEdition is missing');
  for (const k of ['contentChangedAt', 'expiresOn']) if (!ISO.test(m[k] || '')) out.push(`${k} is not YYYY-MM-DD`);
  if (m.coverage === 'full') {
    if (!ISO.test(m.fetchedAt || '')) out.push('a full dataset needs fetchedAt');
    if (!m.sourceSha256) out.push('a full dataset needs sourceSha256');
  } else {
    if ('fetchedAt' in m) out.push(`a ${m.coverage} was not fetched, so it cannot carry fetchedAt`);
    if (!ISO.test(m.curatedAt || '')) out.push('curatedAt is not YYYY-MM-DD');
  }
  if ('fetchDate' in m) out.push('fetchDate is retired (spec-v1622); use fetchedAt or curatedAt');
  if ('offlineSeed' in m) out.push('offlineSeed is retired (spec-v1622); coverage says whether data was fetched');
  return out;
}

async function main() {
  let problems = 0;
  let manifests = 0;
  for await (const d of walkDirs(DATA)) {
    const candidate = join(d, 'manifest.json');
    try {
      await stat(candidate);
    } catch {
      continue;
    }
    manifests += 1;
    const manifest = JSON.parse(await readFile(candidate, 'utf8'));
    if (manifest.dataset) {
      for (const p of manifestProblems(manifest)) {
        console.error(`MANIFEST v2: ${relative(ROOT, candidate)}: ${p}`);
        problems += 1;
      }
    }
    const shards = manifest.shards || [];
    const layout = manifest.shardLayout === 'shards' ? 'shards' : 'root';
    for (const s of shards) {
      const shardPath = s.name.includes('/')
        ? join(d, s.name)
        : (layout === 'shards' ? join(d, 'shards', s.name) : join(d, s.name));
      let actualPath = shardPath;
      try { await stat(actualPath); }
      catch {
        console.error(`MISSING shard: ${relative(ROOT, shardPath)} for manifest ${relative(ROOT, candidate)}`);
        problems += 1;
        continue;
      }
      const bytes = await readFile(actualPath);
      const got = sha256(bytes);
      if (got !== s.sha256) {
        console.error(`HASH MISMATCH: ${relative(ROOT, actualPath)} expected ${s.sha256} got ${got}`);
        problems += 1;
      }
    }
  }
  for await (const d of walkDirs(DATA)) {
    for (const entry of await readdir(d, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const file = join(d, entry.name);
      if ((await readFile(file, 'utf8')).includes('"fetchDate"')) {
        console.error(`RETIRED FIELD: ${relative(ROOT, file)} carries fetchDate (spec-v1622)`);
        problems += 1;
      }
    }
  }
  if (manifests === 0) {
    console.log('verify-integrity: no manifests found.');
    process.exit(0);
  }
  if (problems === 0) {
    console.log(`verify-integrity: ok. ${manifests} manifests verified.`);
    process.exit(0);
  }
  console.error(`verify-integrity: ${problems} problem(s) across ${manifests} manifests.`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith('verify-integrity.mjs')) main().catch((err) => {
  console.error('verify-integrity: fatal', err);
  process.exit(2);
});
