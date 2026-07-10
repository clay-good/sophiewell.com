// plain-language-search (v8 batch): guard the real hand-curated synonym table
// in data/synonyms.json. synonyms.test.js already pins tile-id validity,
// audience presence, and non-empty phrases; this file adds the v8 guards:
//   - every phrase is lowercase-normalized with no duplicate across entries,
//   - the marquee misroutes the batch was authored to fix now route correctly,
//   - the existing good routes it must not regress still resolve.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolvePrompt } from '../../lib/prompt.js';
import { normalizePhrase } from '../../lib/synonyms.js';

function catalogTiles() {
  const src = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const m = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error('synonyms-catalog: could not find UTILITIES array in app.js');
  const tiles = [];
  const re = /\{ id: '([^']+)',\s*name: '([^']*)'/g;
  let mm;
  while ((mm = re.exec(m[1]))) tiles.push({ id: mm[1], name: mm[2], audiences: [], desc: '' });
  return tiles;
}

function loadEntries() {
  const doc = JSON.parse(readFileSync(new URL('../../data/synonyms.json', import.meta.url), 'utf8'));
  return doc;
}

test('synonyms.json: phrases are lowercase and unique across the whole table', () => {
  const { entries } = loadEntries();
  assert.ok(entries.length >= 40, 'expected the expanded v8 table');
  const seen = new Map();
  for (const e of entries) {
    for (const p of e.phrases) {
      assert.equal(p, p.toLowerCase(), `phrase "${p}" must be lowercase`);
      const n = normalizePhrase(p);
      assert.ok(n, `phrase "${p}" must not normalize to empty`);
      assert.ok(!seen.has(n), `phrase "${p}" duplicates one already mapped to ${seen.get(n)}`);
      seen.set(n, e.tile);
    }
  }
});

test('synonyms.json: version was bumped for the v8 batch', () => {
  const doc = loadEntries();
  assert.match(doc.version, /^v[0-9]/, 'version should be a bumped v-string');
});

// The proposal misroute table (measured against the live catalog): these are the
// canonical-intent routes the v8 synonym batch exists to fix. Pass-1 synonym
// precedence guarantees them regardless of the token ranker.
test('synonyms.json: marquee canonical-intent routes resolve', () => {
  const tiles = catalogTiles();
  const { entries } = loadEntries();
  const route = (q) => resolvePrompt(q, tiles, entries, 'all')?.tileId;
  assert.equal(route('stroke risk in afib'), 'chads');
  assert.equal(route('what is the stroke risk for my patient with atrial fibrillation'), 'chads');
  assert.equal(route('afib'), 'chads');
});

// v9 batch: natural-language intents surfaced by the ranker differential that
// synonyms route deterministically (pass-1) instead of leaving to fragile ties.
test('synonyms.json: v9 natural-language intents resolve', () => {
  const tiles = catalogTiles();
  const { entries } = loadEntries();
  const route = (q) => resolvePrompt(q, tiles, entries, 'all')?.tileId;
  assert.equal(route('estimate kidney function'), 'egfr');
  assert.equal(route('risk of falling'), 'morse-falls');
  assert.equal(route('pressure injuries'), 'braden');
  assert.equal(route('convert opioids'), 'opioid-mme');
  assert.equal(route('sodium correction rate'), 'sodium-correction');
  // v10: gap fixes for queries that misrouted to an unrelated tile.
  assert.equal(route('serotonin syndrome'), 'serotonin-toxicity');
  assert.equal(route('when to admit copd'), 'ottawa-copd');
  assert.equal(route('frailty score'), 'sof-frailty-index');
  assert.equal(route('gfr in kids'), 'schwartz-egfr');
});

// Routes that already worked before the v8 batch must not regress once the
// broader synonym set is in play.
test('synonyms.json: pre-existing good routes do not regress', () => {
  const tiles = catalogTiles();
  const { entries } = loadEntries();
  const route = (q) => resolvePrompt(q, tiles, entries, 'all')?.tileId;
  assert.equal(route('alcohol withdrawal severity'), 'ciwa');
  assert.equal(route('burn fluid'), 'burn-fluid');
  assert.equal(route('kidney function'), 'egfr');
  assert.equal(route('bmi'), 'bmi');
});
