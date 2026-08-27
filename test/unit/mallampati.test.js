import test from 'node:test';
import assert from 'node:assert/strict';
import { mallampati, MALLAMPATI_SENSITIVITY, MALLAMPATI_SPECIFICITY } from '../../lib/mallampati-v810.js';

test('mallampati: the four classes map to their roman numerals', () => {
  const expected = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
  for (const n of [1, 2, 3, 4]) {
    const r = mallampati({ mallampatiClass: n });
    assert.equal(r.valid, true);
    assert.equal(r.classNumber, n);
    assert.equal(r.code, 'Modified Mallampati class ' + expected[n]);
  }
});

test('mallampati: III and IV are the classes associated with difficulty', () => {
  assert.equal(mallampati({ mallampatiClass: 1 }).predictsDifficulty, false);
  assert.equal(mallampati({ mallampatiClass: 2 }).predictsDifficulty, false);
  assert.equal(mallampati({ mallampatiClass: 3 }).predictsDifficulty, true);
  assert.equal(mallampati({ mallampatiClass: 4 }).predictsDifficulty, true);
});

test('mallampati: the pooled performance rides on EVERY class, reassuring ones included', () => {
  // This is the reason the tile exists. A class I read as "airway is fine" is the failure
  // mode, so the sensitivity must be attached to the reassuring classes too, not only the
  // alarming ones.
  for (const n of [1, 2, 3, 4]) {
    const r = mallampati({ mallampatiClass: n });
    assert.equal(r.sensitivity, MALLAMPATI_SENSITIVITY);
    assert.equal(r.specificity, MALLAMPATI_SPECIFICITY);
    assert.ok(r.detail.includes('stand-alone'));
    assert.ok(r.detail.includes('0.35'));
  }
  assert.ok(mallampati({ mallampatiClass: 1 }).detail.includes('not clearance'));
  assert.ok(mallampati({ mallampatiClass: 2 }).detail.includes('not clearance'));
});

test('mallampati: pooled figures match the published meta-analysis', () => {
  assert.equal(MALLAMPATI_SENSITIVITY, 0.35);
  assert.equal(MALLAMPATI_SPECIFICITY, 0.91);
});

test('mallampati: roman numerals are accepted, and there is no class V', () => {
  assert.equal(mallampati({ mallampatiClass: 'iii' }).classNumber, 3);
  assert.equal(mallampati({ mallampatiClass: 'IV' }).classNumber, 4);
  assert.equal(mallampati({ mallampatiClass: 5 }).valid, false);
  assert.equal(mallampati({ mallampatiClass: 0 }).valid, false);
  assert.equal(mallampati({ mallampatiClass: 'v' }).valid, false);
  assert.equal(mallampati({}).valid, false);
  assert.equal(mallampati().valid, false);
});
