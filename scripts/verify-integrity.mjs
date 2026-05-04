#!/usr/bin/env node
// scripts/verify-integrity.mjs
//
// Verifies that every shard's SHA-256 matches the value recorded in its
// dataset's manifest.json. Walks the data folder. Zero runtime dependencies.

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
    const shards = manifest.shards || [];
    for (const s of shards) {
      const shardPath = s.name.includes('/') ? join(d, s.name) : join(d, 'shards', s.name);
      // Some manifests place shards directly in the dataset folder.
      let actualPath = shardPath;
      try { await stat(actualPath); }
      catch {
        actualPath = join(d, s.name);
        try { await stat(actualPath); }
        catch {
          console.error(`MISSING shard: ${relative(ROOT, shardPath)} for manifest ${relative(ROOT, candidate)}`);
          problems += 1;
          continue;
        }
      }
      const bytes = await readFile(actualPath);
      const got = sha256(bytes);
      if (got !== s.sha256) {
        console.error(`HASH MISMATCH: ${relative(ROOT, actualPath)} expected ${s.sha256} got ${got}`);
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

main().catch((err) => {
  console.error('verify-integrity: fatal', err);
  process.exit(2);
});
