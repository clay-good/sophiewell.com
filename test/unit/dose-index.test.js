// spec-v205 2.3: DOSE index worked examples. mMRC 0-3, FEV1 0-2, smoking 0-1,
// exacerbations 0-2; total 0-8. Map spec-v97 cross-verified (worked example +
// FEV1 cut-points; Jones 2009).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doseIndex as dose } from '../../lib/pulm-copd-v205.js';

test('higher-risk worked example (DOSE 5)', () => {
  const r = dose({ mmrc: '3', fev1: 40, smoker: true, exacerbations: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 5); // mMRC3(2) + FEV40(1) + smoker(1) + exac3(1)
  assert.equal(r.abnormal, true);
  assert.match(r.band, /HR 3.48/);
});

test('lower-risk case (DOSE 0)', () => {
  const r = dose({ mmrc: '1', fev1: 60, smoker: false, exacerbations: 1 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('maximum score 8 -> highest-risk', () => {
  const r = dose({ mmrc: '4', fev1: 25, smoker: true, exacerbations: 5 });
  assert.equal(r.score, 8);
  assert.match(r.band, /HR 8.00/);
});

test('FEV1 bands: >=50 -> 0, 30-49 -> 1, <30 -> 2', () => {
  const base = { mmrc: '0', smoker: false, exacerbations: 0 };
  assert.equal(dose({ ...base, fev1: 50 }).score, 0);
  assert.equal(dose({ ...base, fev1: 40 }).score, 1);
  assert.equal(dose({ ...base, fev1: 29 }).score, 2);
});

test('exacerbation bands: 0-1 -> 0, 2-3 -> 1, >=4 -> 2', () => {
  const base = { mmrc: '0', fev1: 60, smoker: false };
  assert.equal(dose({ ...base, exacerbations: 1 }).score, 0);
  assert.equal(dose({ ...base, exacerbations: 2 }).score, 1);
  assert.equal(dose({ ...base, exacerbations: 4 }).score, 2);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = dose({ mmrc: '2' });
  assert.equal(r.valid, false);
});
