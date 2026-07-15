// spec-v316: GOLD ABE assessment tool (COPD group A / B / E). Worked-example tests:
// the two independent axes (symptom burden via mMRC or CAT; exacerbation risk), each
// group boundary, the "either instrument suffices" rule, the mMRC/CAT thresholds
// (>= 2 / >= 10), the >= 2-moderate and >= 1-hospitalized paths into group E, and the
// validation guards. Cut-points from the GOLD 2025 Report ABE tool (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goldAbe } from '../../lib/gold-abe-v316.js';

test('more symptoms + low exacerbation risk is group B (the META example)', () => {
  const r = goldAbe({ mmrc: '2', moderateExacerbations: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'B');
  assert.equal(r.moreSymptoms, true);
  assert.equal(r.highExacRisk, false);
  assert.match(r.band, /Group B/);
  assert.match(r.band, /more symptoms \(mMRC 2 >= 2\)/);
  assert.match(r.band, /low future-exacerbation risk \(1 moderate exacerbation, none hospitalized in the past year\)/);
});

test('less symptoms + low exacerbation risk is group A', () => {
  const r = goldAbe({ mmrc: '1', cat: '5', moderateExacerbations: '0' });
  assert.equal(r.group, 'A');
  assert.equal(r.moreSymptoms, false);
  assert.equal(r.abnormal, false);
});

test('>= 2 moderate exacerbations is group E regardless of low symptoms', () => {
  const r = goldAbe({ mmrc: '0', moderateExacerbations: '2' });
  assert.equal(r.group, 'E');
  assert.equal(r.highExacRisk, true);
  assert.equal(r.moreSymptoms, false);
  assert.equal(r.abnormal, true);
});

test('>= 1 hospitalized exacerbation is group E even with high symptoms', () => {
  const r = goldAbe({ cat: '30', hospitalizedExacerbation: true });
  assert.equal(r.group, 'E');
  assert.equal(r.highExacRisk, true);
  assert.equal(r.moreSymptoms, true);
});

test('CAT alone drives the symptom axis: CAT 10 is the >= 10 "more symptoms" boundary', () => {
  assert.equal(goldAbe({ cat: '10' }).group, 'B');
  assert.equal(goldAbe({ cat: '9' }).group, 'A');
});

test('mMRC alone drives the symptom axis: mMRC 2 is the >= 2 boundary', () => {
  assert.equal(goldAbe({ mmrc: '2' }).group, 'B');
  assert.equal(goldAbe({ mmrc: '1' }).group, 'A');
});

test('either instrument crossing its threshold makes it more symptoms (OR, not AND)', () => {
  // mMRC 2 (>= 2) with a low CAT 2 still counts as more symptoms.
  const r = goldAbe({ mmrc: '2', cat: '2', moderateExacerbations: '0' });
  assert.equal(r.group, 'B');
  assert.equal(r.moreSymptoms, true);
});

test('one moderate exacerbation, none hospitalized, stays in the A/B row (not E)', () => {
  const r = goldAbe({ cat: '5', moderateExacerbations: '1' });
  assert.equal(r.highExacRisk, false);
  assert.equal(r.group, 'A');
});

test('a hospitalized exacerbation with zero moderate ones is still group E', () => {
  const r = goldAbe({ mmrc: '1', moderateExacerbations: '0', hospitalizedExacerbation: true });
  assert.equal(r.group, 'E');
});

test('no symptom measure entered is invalid (mMRC or CAT is required)', () => {
  const r = goldAbe({ moderateExacerbations: '3' });
  assert.equal(r.valid, false);
  assert.match(r.message, /at least one symptom measure is required/);
});

test('out-of-range mMRC and CAT are rejected', () => {
  assert.equal(goldAbe({ mmrc: '5' }).valid, false);
  assert.equal(goldAbe({ cat: '41' }).valid, false);
  assert.equal(goldAbe({ mmrc: '2', moderateExacerbations: '-1' }).valid, false);
});
