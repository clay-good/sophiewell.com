// spec-v143 2.5: CARG Chemotherapy Toxicity Tool (Hurria 2011). Low/int/high bands.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cargToxicity } from '../../lib/frailty-v143.js';

test('no risk factors -> 0, low risk', () => {
  const r = cargToxicity({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.band, 'low');
  assert.equal(r.abnormal, false);
});

test('the low -> intermediate band change at the 5/6 cutoff', () => {
  // three 2-point factors = 6 -> intermediate
  const r6 = cargToxicity({ age72: 1, giGu: 1, standardDose: 1 });
  assert.equal(r6.score, 6);
  assert.equal(r6.band, 'intermediate');
  assert.equal(r6.abnormal, true);
  // drop one -> 4 -> low
  const r4 = cargToxicity({ age72: 1, giGu: 1 });
  assert.equal(r4.score, 4);
  assert.equal(r4.band, 'low');
});

test('weighted predictors: hemoglobin, CrCl, and falls are each 3 points', () => {
  assert.equal(cargToxicity({ anemia: 1 }).score, 3);
  assert.equal(cargToxicity({ lowCrCl: 1 }).score, 3);
  assert.equal(cargToxicity({ falls: 1 }).score, 3);
  assert.equal(cargToxicity({ medHelp: 1 }).score, 1);
  assert.equal(cargToxicity({ socialDecreased: 1 }).score, 1);
});

test('high-risk band at >= 10 and arithmetic maximum is 23', () => {
  const r = cargToxicity({ age72: 1, giGu: 1, standardDose: 1, polychemo: 1, anemia: 1 });
  assert.equal(r.score, 11);
  assert.equal(r.band, 'high');
  assert.match(r.rate, /83%/);
  const max = cargToxicity({ age72: 1, giGu: 1, standardDose: 1, polychemo: 1, anemia: 1, lowCrCl: 1, hearing: 1, falls: 1, medHelp: 1, walkLimited: 1, socialDecreased: 1 });
  assert.equal(max.score, 23);
  assert.equal(max.band, 'high');
});
