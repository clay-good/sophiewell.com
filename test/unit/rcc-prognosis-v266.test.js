// spec-v266: worked examples for the SSIGN score (the only tile shipped this slice;
// Leibovich + UISS parked per spec-v266 §7). Point table spec-v97 verified against Frank
// 2002 (J Urol) and MDCalc "SSIGN Score": pT1 0 / pT2 1 / pT3 2 / pT4 4; Nx-N0 0 / N1-N2 2;
// M0 0 / M1 4; size <5cm 0 / >=5cm 2; grade 1-2 0 / 3 1 / 4 3; necrosis absent 0 / present 2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ssign } from '../../lib/rcc-prognosis-v266.js';

test('ssign: all lowest bands is a zero low-risk score', () => {
  const r = ssign({ tStage: 'pt1', nStage: 'n0', mStage: 'm0', size: 'lt5', grade: 'g12', necrosis: 'absent' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('SSIGN 0 of 17'));
  assert.ok(r.band.includes('low risk'));
  assert.ok(r.band.includes('96.8%'));
});
test('ssign: a low-score localized case (pT1, grade 3)', () => {
  const r = ssign({ tStage: 'pt1', grade: 'g3' });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('low risk'));
});
test('ssign: a high-score case with a necrosis contribution', () => {
  const r = ssign({ tStage: 'pt3', grade: 'g4', necrosis: 'present' });
  // pT3 (+2) + grade 4 (+3) + necrosis (+2) = 7.
  assert.equal(r.score, 7);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('SSIGN 7 of 17'));
  assert.ok(r.band.includes('high risk'));
  assert.ok(r.band.includes('57.7%'));
  assert.ok(r.detail.includes('tumor necrosis (+2)'));
});
test('ssign: an intermediate-risk case (score 3-5)', () => {
  const r = ssign({ tStage: 'pt2', size: 'ge5', necrosis: 'absent' });
  // pT2 (+1) + size >= 5 (+2) = 3.
  assert.equal(r.score, 3);
  assert.ok(r.band.includes('intermediate risk'));
  assert.ok(r.band.includes('92.5%'));
});
test('ssign: every variable at its maximum reaches 17', () => {
  const r = ssign({ tStage: 'pt4', nStage: 'n1', mStage: 'm1', size: 'ge5', grade: 'g4', necrosis: 'present' });
  // 4 + 2 + 4 + 2 + 3 + 2 = 17.
  assert.equal(r.score, 17);
  assert.ok(r.band.includes('high risk'));
  assert.ok(r.band.includes('18.1%'));
});
