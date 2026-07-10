// plain-language-search task 1: guard the committed search corpus under
// data/search-corpus/. The corpus is a build output (scripts/build-search-
// corpus.mjs) checked into the tree as an accelerator asset, like
// data/synonyms.json. These tests pin the contract the ranker relies on:
//   - every row keys to a real catalog tile; counts agree,
//   - no en/em dash or smart quote leaked from the source prose,
//   - the gzip size stays within the <=200 KB budget,
//   - manifest.hash matches the corpus bytes (drift / hand-edit guard),
//   - the builder is deterministic (rebuild is byte-identical).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../../', import.meta.url);
const CORPUS_PATH = fileURLToPath(new URL('data/search-corpus/corpus.json', ROOT));
const MANIFEST_PATH = fileURLToPath(new URL('data/search-corpus/manifest.json', ROOT));
const BUILDER = fileURLToPath(new URL('scripts/build-search-corpus.mjs', ROOT));

function catalogIds() {
  const src = readFileSync(fileURLToPath(new URL('app.js', ROOT)), 'utf8');
  const m = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error('search-corpus: could not find UTILITIES in app.js');
  return new Set([...m[1].matchAll(/\bid:\s*'([^']+)'/g)].map((mm) => mm[1]));
}

const corpusText = readFileSync(CORPUS_PATH, 'utf8');
const corpus = JSON.parse(corpusText);
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

test('search-corpus: every row keys to a real catalog tile; counts agree', () => {
  const ids = catalogIds();
  const rowIds = Object.keys(corpus);
  assert.equal(rowIds.length, ids.size, 'a row per catalog tile');
  assert.equal(manifest.count, rowIds.length, 'manifest count matches row count');
  for (const id of rowIds) {
    assert.ok(ids.has(id), `corpus row "${id}" must be a real catalog tile`);
    assert.ok(corpus[id].name && corpus[id].group, `row "${id}" needs name + group`);
  }
});

test('search-corpus: no en/em dash or smart quotes leaked from source prose', () => {
  // The runtime surfaces enforce this; the builder sanitizes, and this guards
  // that the committed bytes stayed clean.
  assert.ok(!/[\u2012\u2013\u2014\u2015\u2212\u2018\u2019\u201C\u201D]/.test(corpusText),
    'corpus must not contain en/em dashes or smart quotes');
});

test('search-corpus: gzip size is within the 200 KB budget', () => {
  const gzip = gzipSync(corpusText).length;
  assert.ok(gzip <= 200 * 1024, `corpus is ${gzip} bytes gzipped, over the 200 KB budget`);
  assert.equal(manifest.gzipBytes, gzip, 'manifest gzipBytes matches the committed corpus');
});

test('search-corpus: manifest hash matches the corpus bytes (drift guard)', () => {
  const hash = createHash('sha256').update(corpusText).digest('hex').slice(0, 16);
  assert.equal(manifest.hash, hash,
    'manifest.hash is stale -- rebuild with `node scripts/build-search-corpus.mjs`');
});

test('search-corpus: builder is deterministic (rebuild is byte-identical)', () => {
  const before = readFileSync(CORPUS_PATH);
  execFileSync(process.execPath, [BUILDER], { stdio: 'pipe' });
  const after = readFileSync(CORPUS_PATH);
  assert.ok(before.equals(after), 'rebuilding the corpus changed its bytes -- non-deterministic builder');
});
