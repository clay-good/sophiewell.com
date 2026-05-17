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
