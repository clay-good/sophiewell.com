import test from 'node:test';
import assert from 'node:assert/strict';
import { systemicMastocytosis } from '../../lib/systemic-mastocytosis-v813.js';

test('mastocytosis: one major plus one minor meets the criteria', () => {
  const r = systemicMastocytosis({ multifocalInfiltrates: true, kitMutation: true });
  assert.equal(r.criteriaMet, true);
  assert.equal(r.majorMet, true);
  assert.equal(r.minorCount, 1);
});

test('mastocytosis: the major criterion alone does not meet them', () => {
  const r = systemicMastocytosis({ multifocalInfiltrates: true });
  assert.equal(r.criteriaMet, false);
  assert.ok(r.band.includes('no minor criterion'));
});

test('mastocytosis: three minor criteria meet them with no major', () => {
  const r = systemicMastocytosis({ atypicalMorphology: true, kitMutation: true, aberrantMarkers: true });
  assert.equal(r.majorMet, false);
  assert.equal(r.minorCount, 3);
  assert.equal(r.criteriaMet, true);
});

test('mastocytosis: two minor criteria do not', () => {
  const r = systemicMastocytosis({ atypicalMorphology: true, kitMutation: true });
  assert.equal(r.minorCount, 2);
  assert.equal(r.criteriaMet, false);
});

test('mastocytosis: the hereditary alpha-tryptasemia correction can flip the diagnosis', () => {
  // The consensus worked example: 30 ng/mL with one extra alpha copy corrects to 15, and
  // is therefore NOT a minor criterion. Read raw, it would be - and here that single item
  // is the third minor criterion carrying the whole diagnosis.
  const raw = systemicMastocytosis({ atypicalMorphology: true, kitMutation: true, tryptase: 30 });
  assert.equal(raw.correctedTryptase, 30);
  assert.equal(raw.tryptaseMinorMet, true);
  assert.equal(raw.minorCount, 3);
  assert.equal(raw.criteriaMet, true);

  const corrected = systemicMastocytosis({ atypicalMorphology: true, kitMutation: true, tryptase: 30, extraAlphaCopies: 1 });
  assert.equal(corrected.correctedTryptase, 15);
  assert.equal(corrected.tryptaseMinorMet, false);
  assert.equal(corrected.minorCount, 2);
  assert.equal(corrected.criteriaMet, false);
  assert.ok(corrected.tryptaseNote.includes('divided by 2'));
});

test('mastocytosis: the threshold is strictly above 20 ng/mL', () => {
  assert.equal(systemicMastocytosis({ tryptase: 20 }).tryptaseMinorMet, false);
  assert.equal(systemicMastocytosis({ tryptase: 20.1 }).tryptaseMinorMet, true);
  // Two extra copies: 63 / 3 = 21, still over.
  assert.equal(systemicMastocytosis({ tryptase: 63, extraAlphaCopies: 2 }).tryptaseMinorMet, true);
  assert.equal(systemicMastocytosis({ tryptase: 60, extraAlphaCopies: 2 }).tryptaseMinorMet, false);
});

test('mastocytosis: the tryptase criterion is void with an associated myeloid neoplasm', () => {
  const r = systemicMastocytosis({ tryptase: 100, associatedMyeloidNeoplasm: true });
  assert.equal(r.tryptaseMinorMet, false);
  assert.equal(r.minorCount, 0);
  assert.ok(r.tryptaseNote.includes('associated myeloid neoplasm'));
});

test('mastocytosis: absent or invalid entries are handled without inventing a criterion', () => {
  const empty = systemicMastocytosis({});
  assert.equal(empty.valid, true);
  assert.equal(empty.correctedTryptase, null);
  assert.equal(empty.minorCount, 0);
  assert.equal(empty.criteriaMet, false);
  assert.equal(systemicMastocytosis({ tryptase: -1 }).valid, false);
  assert.equal(systemicMastocytosis({ extraAlphaCopies: 1.5 }).valid, false);
  assert.equal(systemicMastocytosis({ extraAlphaCopies: -1 }).valid, false);
  assert.equal(systemicMastocytosis().valid, true);
});
