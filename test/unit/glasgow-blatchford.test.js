// spec-v201 2.1: Glasgow-Blatchford Score worked examples and band spread.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glasgowBlatchford } from '../../lib/hepatology-gibleed-v201.js';

test('GBS 0 -> lowest-risk, outpatient candidate', () => {
  const r = glasgowBlatchford({ urea: 5, sex: 'male', hb: 14, sbp: 120 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /outpatient management/);
});

test('GBS 1 -> BSG low-risk extension', () => {
  const r = glasgowBlatchford({ urea: 5, sex: 'male', hb: 14, sbp: 105 });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /BSG extension/);
});

test('high GBS spans to intervention risk (worked example)', () => {
  const r = glasgowBlatchford({ urea: 12, sex: 'male', hb: 11, sbp: 95, pulseHigh: true, melena: true });
  // urea 4 + Hb(male,11) 3 + SBP(95) 2 + pulse 1 + melena 1 = 11
  assert.equal(r.score, 11);
  assert.equal(r.abnormal, true);
  assert.match(r.band, />\s*50%/);
});

test('BUN mg/dL converts to urea mmol/L (BUN 70 -> 25 -> 6 pts)', () => {
  const r = glasgowBlatchford({ ureaUnit: 'mgdl', urea: 70, sex: 'male', hb: 14, sbp: 120 });
  assert.equal(r.score, 6);
  assert.match(r.detail, /BUN 70 mg\/dL/);
});

test('sex-specific haemoglobin band differs', () => {
  const male = glasgowBlatchford({ urea: 5, sex: 'male', hb: 11, sbp: 120 });
  const female = glasgowBlatchford({ urea: 5, sex: 'female', hb: 11, sbp: 120 });
  assert.equal(male.score, 3);   // male 11 g/dL -> 3
  assert.equal(female.score, 1); // female 11 g/dL -> 1
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = glasgowBlatchford({ urea: 12, sex: 'male' });
  assert.equal(r.valid, false);
  assert.match(r.message, /hemoglobin/);
});

test('score never exceeds the published maximum of 23', () => {
  const r = glasgowBlatchford({ urea: 30, sex: 'male', hb: 5, sbp: 80, pulseHigh: true, melena: true, syncope: true, hepatic: true, cardiac: true });
  assert.equal(r.score, 23);
});
