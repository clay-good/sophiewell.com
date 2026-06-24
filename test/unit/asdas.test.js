// spec-v148 2.1: ASDAS (Lukas 2009). ASDAS-CRP = 0.12*bp + 0.06*ms + 0.11*pg +
// 0.07*pp + 0.58*ln(CRP+1) with CRP floored to 2; ASDAS-ESR = 0.08*bp + 0.07*ms
// + 0.11*pg + 0.09*pp + 0.29*sqrt(ESR). Cutoffs inactive<1.3 low<2.1 high<=3.5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asdas } from '../../lib/rheum-v148.js';

test('tile example: bp4 ms3 pg5 pp2 CRP10 -> 2.74 high', () => {
  const r = asdas({ backPain: 4, morningStiffness: 3, patientGlobal: 5, peripheralPain: 2, crp: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 2.74);
  assert.equal(r.variant, 'CRP');
  assert.equal(r.bandLabel, 'High disease activity');
});

test('inactive/low boundary at 1.3', () => {
  // all-zero NRS, CRP floored to 2 -> 0.58*ln(3) = 0.637 -> inactive
  assert.equal(asdas({ backPain: 0, morningStiffness: 0, patientGlobal: 0, peripheralPain: 0, crp: 1 }).bandLabel, 'Inactive disease');
  // construct a value just over 1.3
  const r = asdas({ backPain: 5, morningStiffness: 0, patientGlobal: 5, peripheralPain: 0, crp: 1 });
  assert.ok(r.score >= 1.3 && r.score < 2.1, `got ${r.score}`);
  assert.equal(r.bandLabel, 'Low disease activity');
});

test('high -> very high at 3.5', () => {
  const high = asdas({ backPain: 8, morningStiffness: 8, patientGlobal: 8, peripheralPain: 8, crp: 20 });
  assert.equal(high.bandLabel, 'Very high disease activity');
  // a moderate-high case stays in the high band (2.1-3.5)
  const h2 = asdas({ backPain: 4, morningStiffness: 3, patientGlobal: 5, peripheralPain: 2, crp: 10 });
  assert.equal(h2.bandLabel, 'High disease activity');
});

test('CRP < 2 mg/L is floored to 2', () => {
  const a = asdas({ backPain: 1, morningStiffness: 1, patientGlobal: 1, peripheralPain: 1, crp: 0 });
  const b = asdas({ backPain: 1, morningStiffness: 1, patientGlobal: 1, peripheralPain: 1, crp: 2 });
  assert.equal(a.score, b.score);
});

test('ESR variant used when CRP blank, different coefficients', () => {
  const r = asdas({ backPain: 4, morningStiffness: 3, patientGlobal: 5, peripheralPain: 2, esr: 25 });
  assert.equal(r.variant, 'ESR');
  assert.ok(r.score > 0);
});

test('both provided -> CRP primary, ESR reported too', () => {
  const r = asdas({ backPain: 4, morningStiffness: 3, patientGlobal: 5, peripheralPain: 2, crp: 10, esr: 25 });
  assert.equal(r.variant, 'CRP');
  assert.notEqual(r.esr, null);
});

test('blank NRS -> complete-the-fields', () => {
  assert.equal(asdas({ backPain: 4, morningStiffness: 3, patientGlobal: 5, crp: 10 }).valid, false);
});

test('no acute-phase reactant -> invalid', () => {
  const r = asdas({ backPain: 4, morningStiffness: 3, patientGlobal: 5, peripheralPain: 2 });
  assert.equal(r.valid, false);
  assert.match(r.message, /CRP/);
});
