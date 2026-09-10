// spec-v1191: the most repeated arithmetic in critical care, answered by the
// wrong tile.
//
// `normalizePhrase` strips punctuation, so "mcg/kg/min to ml/hr" becomes the six
// very common tokens `mcg kg min to ml hr`. A token in a tile's NAME is worth
// three points -- the heaviest per-token signal there is -- so the tiles whose
// names happen to contain those units won:
//
//   "mcg/kg/min to ml/hr"  ->  Oxytocin mU/min <-> mL/hr        (rank 1)
//                              Glucose Infusion Rate (mg/kg/min)
//                              Neonatal feeding volume
//                              Concentration-to-Rate            (rank 4)
//
// Both leaders are drug-specific. `conc-rate` is the general converter, and its
// own summary names the exact units asked for: "Converts an ordered drug dose
// (mcg/kg/min, mcg/min, mg/min, units/hr, units/min) plus bag concentration into
// a pump rate in mL/hr."
//
// Fixed the way spec-v1187 fixed brand names -- through the hand-curated synonym
// table, which is matched before ranking -- rather than by reweighting units in
// the rubric. A unit token is only noise in SOME queries: `gir` should still win
// "glucose infusion rate mg/kg/min", and a rubric change cannot tell those apart
// while a phrase table can. The same discipline applies: route only where the
// landing tile's own text answers the question.
//
// RANK 1 IS ASSERTED, as in brand-name-routes.test.js: a synonym is matched
// before ranking and cannot go stale when a tile is added, which is why the
// ranker-dependent gates assert membership instead.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { META } from '../../lib/meta.js';
import { corpusDesc } from '../../lib/search-corpus.js';
import { resolvePromptRanked, rankableWords } from '../../lib/prompt.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));
const corpus = read('data/search-corpus/corpus.json');
const detail = read('data/search-corpus/corpus-detail.json');
const SYNONYMS = read('data/synonyms.json').entries;

const TILES = Object.keys(corpus).map((id) => ({
  id,
  name: corpus[id].name,
  group: corpus[id].group,
  audiences: corpus[id].audiences || [],
  desc: corpusDesc({ ...corpus[id], ...(detail[id] || {}) }),
  tags: [],
  specialties: (META[id] && Array.isArray(META[id].specialties)) ? META[id].specialties : [],
}));

const top = (q) => (resolvePromptRanked(rankableWords(q) || q, TILES, SYNONYMS, 'all', 3) || [])
  .map((x) => x.tileId)[0];

for (const q of [
  'mcg/kg/min to ml/hr',
  'ml/hr to mcg/kg/min',
  'mcg/min to ml/hr',
  'mg/hr to ml/hr',
  'units/hr to ml/hr',
  'convert mcg/kg/min to ml/hr',
]) {
  test(`"${q}" reaches the general converter`, () => {
    assert.equal(top(q), 'conc-rate');
  });
}

test('conc-rate still names the units it is routed for', () => {
  // The routes are only defensible while the tile actually converts these. If
  // its summary stops naming them, the routes are a claim nothing backs -- the
  // same rule brand-name-routes.test.js asserts about drug names.
  const summary = String((detail['conc-rate'] || {}).summary || '').toLowerCase();
  assert.ok(summary, 'conc-rate must carry a summary');
  for (const unit of ['mcg/kg/min', 'mcg/min', 'mg/min', 'units/hr', 'ml/hr']) {
    assert.ok(summary.includes(unit),
      `conc-rate is routed for "${unit}" but its summary no longer names it`);
  }
});

// The drug-specific tiles must keep their own questions: this routes the GENERIC
// unit pair, and must not swallow a query that names a drug.
test('a drug-specific infusion question still reaches its own tile', () => {
  assert.equal(top('oxytocin mu/min to ml/hr'), 'oxytocin-titration');
  const gir = (resolvePromptRanked(rankableWords('glucose infusion rate mg/kg/min') || '', TILES, SYNONYMS, 'all', 3) || [])
    .map((x) => x.tileId);
  assert.ok(gir.includes('gir'), `glucose infusion rate should still reach gir; got ${gir.join(', ')}`);
});
