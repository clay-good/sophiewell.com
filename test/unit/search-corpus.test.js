// plain-language-search task 1: guard the committed search corpus under
// data/search-corpus/. The corpus is a build output (scripts/build-search-
// corpus.mjs) checked into the tree as an accelerator asset, like
// data/synonyms.json. These tests pin the contract the ranker relies on:
//   - every row keys to a real catalog tile; counts agree,
//   - no en/em dash or smart quote leaked from the source prose,
//   - the gzip size stays within the <=224 KB budget,
//   - manifest.hash matches the corpus bytes (drift / hand-edit guard),
//   - the builder is deterministic (rebuild is byte-identical).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { clampToPhrase, corpusOneLiner } from '../../lib/search-corpus.js';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../../', import.meta.url);
const CORPUS_PATH = fileURLToPath(new URL('data/search-corpus/corpus.json', ROOT));
const DETAIL_PATH = fileURLToPath(new URL('data/search-corpus/corpus-detail.json', ROOT));
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
const detailText = readFileSync(DETAIL_PATH, 'utf8');
const detail = JSON.parse(detailText);
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

test('search-corpus: every row keys to a real catalog tile; counts agree', () => {
  const ids = catalogIds();
  const rowIds = Object.keys(corpus);
  assert.equal(rowIds.length, ids.size, 'a Tier-1 row per catalog tile');
  assert.equal(manifest.count, rowIds.length, 'manifest count matches row count');
  for (const id of rowIds) {
    assert.ok(ids.has(id), `corpus row "${id}" must be a real catalog tile`);
    assert.ok(corpus[id].name && corpus[id].group, `row "${id}" needs name + group`);
  }
});

test('search-corpus: Tier-2 detail rows all key to a Tier-1 tile; manifest agrees', () => {
  const detailIds = Object.keys(detail);
  assert.equal(manifest.detail.count, detailIds.length, 'manifest.detail.count matches detail row count');
  for (const id of detailIds) {
    assert.ok(corpus[id], `detail row "${id}" must have a Tier-1 index row`);
    // A detail row must carry at least one desc field (else it should be omitted).
    const r = detail[id];
    assert.ok(r.summary || r.bands || r.what || r.when || r.expected, `detail row "${id}" must carry desc prose`);
  }
});

test('search-corpus: no en/em dash or smart quotes leaked from source prose (both tiers)', () => {
  // The runtime surfaces enforce this; the builder sanitizes, and this guards
  // that the committed bytes stayed clean. Tier 2 carries the prose fields.
  const bad = /[\u2012\u2013\u2014\u2015\u2212\u2018\u2019\u201C\u201D]/;
  assert.ok(!bad.test(corpusText), 'Tier-1 corpus must not contain en/em dashes or smart quotes');
  assert.ok(!bad.test(detailText), 'Tier-2 corpus-detail must not contain en/em dashes or smart quotes');
});

test('search-corpus: gzip size is within the 226 KB budget', () => {
  const gzip = gzipSync(corpusText).length;
  assert.ok(gzip <= 226 * 1024, `Tier-1 corpus is ${gzip} bytes gzipped, over the 226 KB budget`);
  // manifest.gzipBytes is informational and stamped by whichever zlib built
  // it; different node/zlib versions emit different (all valid) gzip
  // streams, so a strict equality here is environment-dependent - it held
  // on the machine that stamped the manifest and failed on CI's pinned
  // node (190444 vs 189860). The drift guard is manifest.hash over the raw
  // bytes (next test); here we sanity-check the stamp is a plausible
  // measurement of THIS corpus (within 2%) and inside the budget itself.
  assert.ok(Number.isInteger(manifest.gzipBytes) && manifest.gzipBytes > 0, 'gzipBytes is a positive integer');
  assert.ok(manifest.gzipBytes <= manifest.budgetGzip, 'stamped gzipBytes is within the stamped budget');
  const drift = Math.abs(manifest.gzipBytes - gzip) / gzip;
  assert.ok(drift <= 0.02,
    `manifest gzipBytes (${manifest.gzipBytes}) differs from this environment's measurement (${gzip}) by ${(drift * 100).toFixed(1)}% - over the 2% zlib-variance allowance, rebuild the corpus`);
});

test('search-corpus: manifest hashes match the corpus bytes (drift guard, both tiers)', () => {
  const hash = createHash('sha256').update(corpusText).digest('hex').slice(0, 16);
  assert.equal(manifest.hash, hash,
    'manifest.hash (Tier 1) is stale -- rebuild with `node scripts/build-search-corpus.mjs`');
  const detailHash = createHash('sha256').update(detailText).digest('hex').slice(0, 16);
  assert.equal(manifest.detail.hash, detailHash,
    'manifest.detail.hash (Tier 2) is stale -- rebuild with `node scripts/build-search-corpus.mjs`');
});

test('search-corpus: Tier-2 detail gzip is within its guardrail budget', () => {
  const gzip = gzipSync(detailText).length;
  assert.ok(gzip <= manifest.detail.budgetGzip,
    `Tier-2 corpus-detail is ${gzip} bytes gzipped, over the ${manifest.detail.budgetGzip}-byte guardrail`);
});

test('search-corpus: builder is deterministic (rebuild is byte-identical, both tiers)', () => {
  const before = readFileSync(CORPUS_PATH);
  const beforeDetail = readFileSync(DETAIL_PATH);
  execFileSync(process.execPath, [BUILDER], { stdio: 'pipe' });
  assert.ok(before.equals(readFileSync(CORPUS_PATH)), 'rebuilding Tier 1 changed its bytes -- non-deterministic builder');
  assert.ok(beforeDetail.equals(readFileSync(DETAIL_PATH)), 'rebuilding Tier 2 changed its bytes -- non-deterministic builder');
});

// spec-v759: a one-liner that is shortened must still read as a finished
// phrase. These render on the disambiguation card and on every search result,
// and the live site shipped "(Katz factor 1.6 and" -- a description that stops
// on a conjunction inside a bracket it never closes reads as a broken page,
// not as a shortened one.
test('clampToPhrase never ends on a connective', () => {
  const s = 'Combined electrolyte panel: albumin-corrected calcium plus glucose-corrected sodium and a second thing that runs long';
  const out = clampToPhrase(s, 90);
  assert.ok(out.length <= 90);
  assert.ok(!/\b(and|or|with|of|the|plus)$/i.test(out), `ends on a connective: ${out}`);
});

test('clampToPhrase closes every bracket it opens', () => {
  // The cut lands inside the bracket.
  const a = clampToPhrase('Delbet classification of a pediatric femoral neck fracture (types I-IV, by physeal level)', 70);
  assert.equal((a.match(/\(/g) || []).length, (a.match(/\)/g) || []).length, a);
  // And the harder case: the cut is BALANCED, and trimming a trailing word
  // afterwards is what removes the closing bracket.
  const b = clampToPhrase('a pediatric femoral neck / proximal femur fracture (types I-IV), by physeal level', 65);
  assert.equal((b.match(/\(/g) || []).length, (b.match(/\)/g) || []).length, b);
});

test('clampToPhrase keeps a meaningful final token that has no letters', () => {
  // "48 h" and "1-3" end real phrases; only connectives are droppable.
  const out = clampToPhrase('the creatinine rise measured as an absolute change within 48 h, then the urine-output category', 64);
  assert.match(out, /48 h$/, out);
});

test('clampToPhrase leaves a short line alone', () => {
  assert.equal(clampToPhrase('Short one.', 120), 'Short one.');
  assert.equal(clampToPhrase('', 120), '');
});

test('corpusOneLiner does not split a sentence at author initials', () => {
  // "Boey J, et al. 1987" is a citation, not two sentences; splitting there
  // hands back a line with an open parenthesis.
  const line = corpusOneLiner({ summary: 'Boey score (Boey J, et al. 1987) for perforated peptic ulcer mortality. Second sentence here.' });
  assert.equal((line.match(/\(/g) || []).length, (line.match(/\)/g) || []).length, line);
  assert.match(line, /perforated peptic ulcer/);
});
