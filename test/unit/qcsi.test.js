// spec-v698: Quick COVID-19 Severity Index (qCSI).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { qcsi } from '../../lib/qcsi-v698.js';

test('healthy vitals -> 0, low risk', () => {
  const r = qcsi({ respiratoryRate: '18', spo2: '98', o2Flow: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('respiratory-rate bands: <=22=0, 23-28=1, >28=2', () => {
  const base = { spo2: '98', o2Flow: '0' };
  assert.equal(qcsi({ ...base, respiratoryRate: '22' }).score, 0);
  assert.equal(qcsi({ ...base, respiratoryRate: '23' }).score, 1);
  assert.equal(qcsi({ ...base, respiratoryRate: '28' }).score, 1);
  assert.equal(qcsi({ ...base, respiratoryRate: '29' }).score, 2);
});

test('SpO2 bands: >92=0, 89-92=2, <=88=5', () => {
  const base = { respiratoryRate: '18', o2Flow: '0' };
  assert.equal(qcsi({ ...base, spo2: '93' }).score, 0);
  assert.equal(qcsi({ ...base, spo2: '92' }).score, 2);
  assert.equal(qcsi({ ...base, spo2: '89' }).score, 2);
  assert.equal(qcsi({ ...base, spo2: '88' }).score, 5);
});

test('O2 flow bands: <=2=0, 3-4=4, >=5=5', () => {
  const base = { respiratoryRate: '18', spo2: '98' };
  assert.equal(qcsi({ ...base, o2Flow: '2' }).score, 0);
  assert.equal(qcsi({ ...base, o2Flow: '3' }).score, 4);
  assert.equal(qcsi({ ...base, o2Flow: '4' }).score, 4);
  assert.equal(qcsi({ ...base, o2Flow: '5' }).score, 5);
  assert.equal(qcsi({ ...base, o2Flow: '8' }).score, 5);
});

test('worked example: RR 26 (1) + SpO2 90 (2) + O2 3 (4) -> 7 (high, ~44%)', () => {
  const r = qcsi({ respiratoryRate: '26', spo2: '90', o2Flow: '3' });
  assert.equal(r.score, 7);
  assert.equal(r.tier, 'high');
  assert.equal(r.risk, 'about 44%');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /qCSI 7 of 12/);
});

test('maximum is 12 (very high)', () => {
  const r = qcsi({ respiratoryRate: '30', spo2: '85', o2Flow: '6' });
  assert.equal(r.score, 12);
  assert.equal(r.tier, 'very-high');
});

test('inputs are validated', () => {
  assert.equal(qcsi({}).valid, false);
  assert.equal(qcsi({}).code, 'MISSING_INPUT');
  assert.equal(qcsi({ respiratoryRate: '20', spo2: '95' }).field, 'o2Flow');
  assert.equal(qcsi({ respiratoryRate: '20', spo2: '0', o2Flow: '0' }).field, 'spo2');
});
