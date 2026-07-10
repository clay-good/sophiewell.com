import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrompt, _testing } from '../../lib/prompt.js';

const TILES = [
  { id: 'bmi',         name: 'BMI Calculator',                 group: 'E', audiences: ['patients', 'clinicians'], desc: 'Body Mass Index from weight and height.', tags: ['weight', 'obesity'] },
  { id: 'egfr',        name: 'eGFR (CKD-EPI 2021)',            group: 'E', audiences: ['clinicians'],             desc: 'Estimated glomerular filtration rate, race-free 2021 equation.' },
  { id: 'icd10',       name: 'ICD-10-CM Code Lookup',          group: 'A', audiences: ['billers', 'clinicians'], desc: 'Search the current fiscal year ICD-10-CM tabular list.' },
  { id: 'qtc',         name: 'QTc Correction',                 group: 'E', audiences: ['clinicians'],             desc: 'Bazett, Fridericia, Framingham, Hodges QTc.' },
  { id: 'bill-decode', name: 'Medical Bill Decoder',           group: 'C', audiences: ['patients'],               desc: 'Paste a hospital bill or EOB and decode every line.' },
  { id: 'discharge',   name: 'Discharge Instructions Builder', group: 'H', audiences: ['clinicians'],             desc: 'Build a printable discharge summary.' },
  { id: 'medication',  name: 'Medication Reconciliation',      group: 'F', audiences: ['clinicians'],             desc: 'Side-by-side medication list comparison.' },
];

const SYNONYMS = [
  { tile: 'bill-decode', phrases: ['my medical bill', 'hospital bill', 'this bill'],            audience: 'patients' },
  { tile: 'icd10',       phrases: ['icd 10', 'diagnosis code', 'icd-10-cm code'],               audience: 'billers' },
  { tile: 'medication',  phrases: ['my medication list', 'my pills', 'medication reconciliation'], audience: 'patients' },
  { tile: 'discharge',   phrases: ['discharge instructions', 'going home paperwork'],            audience: 'clinicians' },
];

// --- Pass 1: synonyms ------------------------------------------------------

test('resolvePrompt: synonym hit returns tile + phrase + why=synonym', () => {
  const r = resolvePrompt('my medical bill', TILES, SYNONYMS, 'patients');
  assert.equal(r.tileId, 'bill-decode');
  assert.equal(r.why, 'synonym');
  assert.equal(r.phrase, 'my medical bill');
});

test('resolvePrompt: synonym hit unaffected by trailing punctuation', () => {
  const r = resolvePrompt('  my medical bill!  ', TILES, SYNONYMS, 'patients');
  assert.equal(r?.tileId, 'bill-decode');
});

// --- Pass 2: token ranker -------------------------------------------------

test('resolvePrompt: token ranker hits eGFR by tile name', () => {
  const r = resolvePrompt('egfr', TILES, [], 'all');
  assert.equal(r?.tileId, 'egfr');
  assert.equal(r?.why, 'name-token-match');
});

test('resolvePrompt: token ranker matches on a desc word when name misses', () => {
  const r = resolvePrompt('framingham', TILES, [], 'all');
  assert.equal(r?.tileId, 'qtc');
});

test('resolvePrompt: token ranker prefers exact-phrase-in-name over single-token match', () => {
  // "bmi calculator" beats any single-token competitor by 10+3+3 = 16 vs 3.
  const r = resolvePrompt('bmi calculator', TILES, [], 'all');
  assert.equal(r?.tileId, 'bmi');
});

test('resolvePrompt: ranker honors tags as a discovery vector', () => {
  // "obesity" is not in BMI's name or desc; it lives only in tags.
  const r = resolvePrompt('bmi obesity', TILES, [], 'all');
  assert.equal(r?.tileId, 'bmi');
});

test('resolvePrompt: junk query under threshold returns null', () => {
  assert.equal(resolvePrompt('zzz', TILES, [], 'all'), null);
  assert.equal(resolvePrompt('xyzzy plover', TILES, [], 'all'), null);
});

// --- Pass 3: single-edit synonym fallback ---------------------------------

test('resolvePrompt: pass-3 recovers a one-character typo against the synonym corpus', () => {
  // "papperwork" (one-edit insertion of an extra p) misses the
  // tile token ranker entirely (no tile name or desc contains it).
  // Pass 3 rewrites to "paperwork" via the synonym corpus token
  // from "going home paperwork", then routes to discharge.
  const r = resolvePrompt('going home papperwork', TILES, SYNONYMS, 'clinicians');
  assert.equal(r?.tileId, 'discharge');
  assert.equal(r?.why, 'synonym-edit-distance');
});

test('resolvePrompt: pass-3 recovers a one-character deletion typo', () => {
  // "medicaton" misses "medication" by one letter (one-edit deletion);
  // pass 1 misses, pass 2 misses, pass 3 rewrites + routes.
  const r = resolvePrompt('my medicaton list', TILES, SYNONYMS, 'patients');
  assert.equal(r?.tileId, 'medication');
});

test('resolvePrompt: multi-typo queries do not recover', () => {
  // "medkation" is two edits away from "medication" (sub + ins).
  assert.equal(resolvePrompt('my medkation lyst', TILES, SYNONYMS, 'patients'), null);
});

// --- Audience modulation --------------------------------------------------

test('rankTiles: audience-aligned tile beats a misaligned competitor', () => {
  // "code" matches ICD-10 (billers/clinicians) and nothing else with
  // enough token overlap to clear threshold. With audience='billers'
  // it stays the top hit; with audience='patients' the alignment
  // penalty still leaves it as the only above-threshold tile.
  const billers = _testing.rankTiles('icd 10 code', TILES, 'billers');
  assert.equal(billers?.tileId, 'icd10');
});

// --- Empty / defensive ----------------------------------------------------

test('resolvePrompt: empty query returns null', () => {
  assert.equal(resolvePrompt('', TILES, SYNONYMS, 'all'), null);
  assert.equal(resolvePrompt('   ', TILES, SYNONYMS, 'all'), null);
});

test('resolvePrompt: empty tiles + empty synonyms returns null', () => {
  assert.equal(resolvePrompt('bmi', [], [], 'all'), null);
});

test('resolvePrompt: synonym tile that does not exist in tiles is skipped', () => {
  const orphan = [{ tile: 'unknown-id', phrases: ['my mystery'] }];
  // Falls through to the ranker (which misses) then to fallback (no
  // corpus match for "mystery" either).
  assert.equal(resolvePrompt('my mystery', TILES, orphan, 'all'), null);
});

// --- withinOneEdit primitive ----------------------------------------------

test('withinOneEdit: equal strings are within one edit', () => {
  assert.equal(_testing.withinOneEdit('abc', 'abc'), true);
});

test('withinOneEdit: substitution, deletion, insertion all count as one', () => {
  assert.equal(_testing.withinOneEdit('cat', 'bat'), true);    // sub
  assert.equal(_testing.withinOneEdit('cat', 'cats'), true);   // ins
  assert.equal(_testing.withinOneEdit('cats', 'cat'), true);   // del
});

test('withinOneEdit: two edits rejected', () => {
  assert.equal(_testing.withinOneEdit('cat', 'dog'), false);
  assert.equal(_testing.withinOneEdit('discharge', 'dscharg'), false);
});

// --- specialty tokens in ranking (spec-v11 §4.3) --------------------------
// `META[id].specialties` (filled for every clinical tile by the meta.js
// SPECIALTIES_BACKFILL) are tokenized into the search doc and weighted +1 per
// matched token, the same as audiences and tags. They are tie-breakers / score
// boosters, not primary routes: a single specialty match (+1) sits below the
// ranker threshold (3), so a specialty term surfaces a tile only in combination
// with a name/desc hit. This pins that contribution, which the fixture corpus
// above (no specialties) did not exercise.

test('rankTiles: a matching specialty token breaks a name-token tie', () => {
  const { rankTiles } = _testing;
  const tiles = [
    { id: 'no-spec', name: 'Renal panel', desc: '' },
    { id: 'with-spec', name: 'Renal panel', desc: '', specialties: ['nephrology'] },
  ];
  // "renal" alone ties both at +3 (token-in-name); the first listed wins.
  assert.equal(rankTiles('renal', tiles, 'all').tileId, 'no-spec');
  // adding the specialty term gives the tagged tile +1, overtaking the tie.
  assert.equal(rankTiles('renal nephrology', tiles, 'all').tileId, 'with-spec');
});

test('rankTiles: a hyphenated specialty is tokenized (nursing-icu matches "icu")', () => {
  const { rankTiles } = _testing;
  const tiles = [
    { id: 'no-spec', name: 'Drip rate', desc: '' },
    { id: 'with-spec', name: 'Drip rate', desc: '', specialties: ['nursing-icu'] },
  ];
  // normalizePhrase splits the hyphen, so 'nursing-icu' tokenizes to
  // ['nursing', 'icu']. "drip" ties both; adding "icu" matches only the tagged
  // tile's tokenized specialty (+1), breaking the tie in its favor.
  assert.equal(rankTiles('drip', tiles, 'all').tileId, 'no-spec');
  assert.equal(rankTiles('drip icu', tiles, 'all').tileId, 'with-spec');
});

test('rankTiles: a specialty match alone stays below the surfacing threshold', () => {
  const { rankTiles } = _testing;
  const tiles = [{ id: 'a', name: 'Glomerular estimate', desc: '', specialties: ['nephrology'] }];
  // "nephrology" matches only the specialty token (+1) < threshold (3) -> no route.
  assert.equal(rankTiles('nephrology', tiles, 'all'), null);
});

// --- resolvePromptRanked (plain-language-search task 3.5) ------------------
// The ranked, top-N variant. resolvePrompt is its head; these pin the list
// contract the answer-card / MCP find_calculator surfaces build on.
import { resolvePromptRanked } from '../../lib/prompt.js';

test('resolvePromptRanked: head equals resolvePrompt across varied queries', () => {
  for (const q of ['egfr', 'framingham', 'bmi calculator', 'my medical bill', 'zzz', '']) {
    const single = resolvePrompt(q, TILES, SYNONYMS, 'all');
    const ranked = resolvePromptRanked(q, TILES, SYNONYMS, 'all');
    assert.equal(ranked[0]?.tileId ?? null, single?.tileId ?? null, `head mismatch for "${q}"`);
  }
});

test('resolvePromptRanked: returns synonym hit first, then ranker results', () => {
  const r = resolvePromptRanked('bmi', TILES, SYNONYMS, 'all', 5);
  assert.ok(r.length >= 1);
  assert.equal(r[0].tileId, 'bmi');
});

test('resolvePromptRanked: results are score-ordered, distinct, and capped by limit', () => {
  const r = resolvePromptRanked('code', TILES, SYNONYMS, 'billers', 3);
  assert.ok(r.length <= 3);
  const ids = r.map((x) => x.tileId);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate tiles');
  for (let i = 1; i < r.length; i += 1) {
    if (typeof r[i].score === 'number' && typeof r[i - 1].score === 'number') {
      assert.ok(r[i - 1].score >= r[i].score, 'scores are non-increasing');
    }
  }
});

test('resolvePromptRanked: a synonym tile is not duplicated by the ranker', () => {
  // "egfr" hits the egfr synonym AND the egfr name token; it must appear once.
  const r = resolvePromptRanked('egfr', TILES, [{ tile: 'egfr', phrases: ['egfr'] }], 'all');
  const egfrHits = r.filter((x) => x.tileId === 'egfr');
  assert.equal(egfrHits.length, 1);
  assert.equal(egfrHits[0].why, 'synonym');
});

test('resolvePromptRanked: empty query and empty tiles return []', () => {
  assert.deepEqual(resolvePromptRanked('', TILES, SYNONYMS, 'all'), []);
  assert.deepEqual(resolvePromptRanked('bmi', [], [], 'all'), []);
});

// --- Question-scaffold strip + plural fold (plain-language-search 3.2/3.3) --

// The ranking view of the query drops interrogative scaffolding and pure
// function words, and folds bare plurals on both the query and doc sides.
// The raw query still drives the exact-phrase bonuses.

test('scaffold strip: a question-phrased query routes on its clinical terms', () => {
  // "what is the ..." tokens would otherwise collect +1 desc hits everywhere.
  const r = resolvePrompt('what is the egfr for my patient', TILES, [], 'all');
  assert.equal(r?.tileId, 'egfr');
});

test('plural fold: query plural matches a singular name token and vice versa', () => {
  const tiles = [
    { id: 'maint-fluids', name: 'Maintenance Fluid Rate', audiences: [], desc: 'Hourly rate.' },
    { id: 'discharge', name: 'Discharge Instructions Builder', audiences: [], desc: '' },
  ];
  assert.equal(resolvePrompt('maintenance fluids', tiles, [], 'all')?.tileId, 'maint-fluids');
  assert.equal(resolvePrompt('discharge instruction', tiles, [], 'all')?.tileId, 'discharge');
});

test('plural fold guards: -ss / -us / -is / short tokens are left alone', () => {
  const { rankTilesAll } = _testing;
  const tiles = [
    { id: 'sepsis', name: 'Sepsis Screen Criteria', audiences: [], desc: 'sirs sepsis screen' },
  ];
  // "sepsis" must not be stemmed to "sepsi" on either side.
  assert.equal(rankTilesAll('sepsis screen', tiles, 'all')[0]?.tileId, 'sepsis');
});

test('all-scaffold query falls back to unstripped tokens rather than matching nothing', () => {
  // Contrived tile whose name is made of scaffold words; the fallback keeps
  // pre-strip behavior (tokens still rank) instead of an empty token list.
  const tiles = [{ id: 'howto', name: 'How To', audiences: [], desc: 'how to' }];
  const r = _testing.rankTilesAll('how to', tiles, 'all');
  assert.equal(r[0]?.tileId, 'howto', 'exact-phrase + fallback tokens still rank');
});

test('exact-phrase bonus still uses the raw query (scaffold words included)', () => {
  const tiles = [
    { id: 'wia', name: 'What If Analysis', audiences: [], desc: '' },
    { id: 'other', name: 'Analysis Suite', audiences: [], desc: 'what if analysis notes here' },
  ];
  // Raw phrase "what if analysis" appears verbatim in the first tile's name.
  assert.equal(resolvePrompt('what if analysis', tiles, [], 'all')?.tileId, 'wia');
});

// --- D5 full-vocabulary typo repair (plain-language-search 3.4) -------------

// Pass-2's rankWithRepair rewrites one unknown token against the tile
// vocabulary (length-bucketed, one edit), and the repaired reading may lead
// only when it beats the literal reading by a name-token margin.

test('typo repair: a misspelled name token recovers via the tile vocabulary', () => {
  const tiles = [
    { id: 'braden', name: 'Braden Scale (Pressure Injury Risk)', audiences: [], desc: 'Pressure injury risk.' },
    { id: 'abbey', name: 'Abbey Pain Scale', audiences: [], desc: 'Pain in dementia.' },
  ];
  // "bradan" is not a synonym-table word; only the tile vocabulary can fix it.
  const r = resolvePrompt('bradan scale', tiles, [], 'all');
  assert.equal(r?.tileId, 'braden');
  assert.equal(r?.why, 'token-edit-distance');
});

test('typo repair margin: a rewrite gaining only common-token evidence never displaces the literal top', () => {
  const tiles = [
    { id: 'rsbi', name: 'RSBI Index', audiences: [], desc: 'vent weaning readiness' },
    { id: 'map', name: 'Mean Arterial Pressure', audiences: [], desc: '' },
  ];
  // "wean" is a valid clinical word this vocabulary happens to lack; its
  // one-edit neighbor "mean" would score 3 (name token) - not 3 above the
  // literal reading - so the literal rsbi hit must keep the lead.
  const r = resolvePrompt('rsbi wean', tiles, [], 'all');
  assert.equal(r?.tileId, 'rsbi');
  assert.equal(r?.why, 'name-token-match');
});

test('typo repair skipped entirely when the literal reading is exact-phrase strong', () => {
  const { rankWithRepair, rankTilesAll } = _testing;
  const tiles = [
    { id: 'bmi', name: 'BMI Calculator', audiences: [], desc: '' },
    { id: 'bmp', name: 'BMP Panel', audiences: [], desc: '' },
  ];
  // Literal top scores >= 10 (phrase-in-name); the repaired view must be
  // byte-identical to the unrepaired ranking.
  assert.deepEqual(
    rankWithRepair('bmi calculator', tiles, 'all'),
    rankTilesAll('bmi calculator', tiles, 'all'),
  );
});
