// spec-v804: Rome proposal COPD exacerbation severity.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { romeEcopd } from '../../lib/rome-ecopd-v804.js';

const CALM = { dyspneaVas: 3, respiratoryRate: 20, heartRate: 80, spo2: 95, crp: 5 };

test('nothing above cutoff -> mild', () => {
  const r = romeEcopd(CALM);
  assert.equal(r.valid, true);
  assert.equal(r.severity, 'mild');
  assert.equal(r.aboveCount, 0);
  assert.equal(r.abnormal, false);
});

test('TWO above cutoff is still mild; three is moderate', () => {
  const two = romeEcopd({ ...CALM, dyspneaVas: 6, respiratoryRate: 26 });
  assert.equal(two.aboveCount, 2);
  assert.equal(two.severity, 'mild');

  const three = romeEcopd({ ...CALM, dyspneaVas: 6, respiratoryRate: 26, heartRate: 100 });
  assert.equal(three.aboveCount, 3);
  assert.equal(three.severity, 'moderate');
});

test('each of the five cutoffs is exact', () => {
  assert.equal(romeEcopd({ ...CALM, dyspneaVas: 4 }).aboveCount, 0);
  assert.equal(romeEcopd({ ...CALM, dyspneaVas: 5 }).aboveCount, 1);
  assert.equal(romeEcopd({ ...CALM, respiratoryRate: 23 }).aboveCount, 0);
  assert.equal(romeEcopd({ ...CALM, respiratoryRate: 24 }).aboveCount, 1);
  assert.equal(romeEcopd({ ...CALM, heartRate: 94 }).aboveCount, 0);
  assert.equal(romeEcopd({ ...CALM, heartRate: 95 }).aboveCount, 1);
  assert.equal(romeEcopd({ ...CALM, crp: 9 }).aboveCount, 0);
  assert.equal(romeEcopd({ ...CALM, crp: 10 }).aboveCount, 1);
  assert.equal(romeEcopd({ ...CALM, spo2: 92 }).aboveCount, 0);
  assert.equal(romeEcopd({ ...CALM, spo2: 91 }).aboveCount, 1);
});

test('the saturation variable counts on EITHER the absolute value or the fall', () => {
  assert.equal(romeEcopd({ ...CALM, spo2DropFromBaseline: 3 }).aboveCount, 0, 'a fall of exactly 3 does not count');
  assert.equal(romeEcopd({ ...CALM, spo2DropFromBaseline: 4 }).aboveCount, 1);
  // Both routes together still count once, not twice.
  assert.equal(romeEcopd({ ...CALM, spo2: 88, spo2DropFromBaseline: 6 }).aboveCount, 1);
});

test('severe needs BOTH hypercapnia and acidosis', () => {
  const busy = { dyspneaVas: 6, respiratoryRate: 26, heartRate: 100, spo2: 88, crp: 20 };
  assert.equal(romeEcopd({ ...busy, paco2: 55, ph: 7.3 }).severity, 'severe');
  assert.equal(romeEcopd({ ...busy, paco2: 55, ph: 7.4 }).severity, 'moderate', 'hypercapnia alone is not severe');
  assert.equal(romeEcopd({ ...busy, paco2: 40, ph: 7.3 }).severity, 'moderate', 'acidosis alone is not severe');
});

test('the blood gas gate can make an otherwise mild episode severe', () => {
  const r = romeEcopd({ ...CALM, paco2: 55, ph: 7.3 });
  assert.equal(r.aboveCount, 0);
  assert.equal(r.severity, 'severe');
});

test('out-of-range values are rejected', () => {
  assert.equal(romeEcopd({ dyspneaVas: 11 }).field, 'dyspneaVas');
  assert.equal(romeEcopd({ spo2: 30 }).field, 'spo2');
  assert.equal(romeEcopd({ ph: 9 }).field, 'ph');
});
