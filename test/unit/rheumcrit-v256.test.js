// spec-v256: worked examples for the rheumatology + critical-care tools. Point
// systems / formulas spec-v97 verified (Heuft-Dorenbosch 2003; IMACS MMT-8; Adnet
// 1997; Yang & Tobin 1991).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { masesEnthesitis, mmt8, intubationDifficultyScale, cropIndex } from '../../lib/rheumcrit-v256.js';

test('mases: >= 1 enthesitis', () => {
  const r = masesEnthesitis({ cc1R: true, cc1L: true, psisR: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});
test('mases: none', () => {
  const r = masesEnthesitis({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('mmt8: sum 0-80', () => {
  const r = mmt8({ neck: 8, deltoid: 8, biceps: 8, wrist: 8, glutMax: 8, glutMed: 8, quad: 8, ankle: 8 });
  assert.equal(r.score, 64);
});

test('ids: slight-to-moderate', () => {
  const r = intubationDifficultyScale({ extraAttempts: 1, cormack: 2 }); // 1 + 1
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});
test('ids: easy at 0', () => {
  const r = intubationDifficultyScale({ cormack: 1 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('crop: favors extubation', () => {
  const r = cropIndex({ compliance: 50, pimax: 30, pao2: 80, fio2: 0.4, paco2: 40, rr: 20 });
  assert.equal(r.score, 25.2);
  assert.equal(r.abnormal, false);
});
test('crop: below threshold', () => {
  const r = cropIndex({ compliance: 20, pimax: 20, pao2: 60, fio2: 0.5, paco2: 45, rr: 30 });
  assert.ok(r.score < 13);
  assert.equal(r.abnormal, true);
});
