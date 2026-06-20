// spec-v134 2.5: DIPSS for primary myelofibrosis (Passamonti F, et al, Blood
// 2010;115:1703-1708). Age > 65 = 1; WBC > 25 = 1; hemoglobin < 10 = 2 (the
// weighted-2 term); blasts >= 1% = 1; constitutional symptoms = 1. Total 0-6 ->
// low (0) / int-1 (1-2) / int-2 (3-4) / high (5-6). The hemoglobin-weighted-2
// term and the group boundaries are pinned.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dipssMf } from '../../lib/onc-v134.js';

test('no risk factors -> total 0, Low', () => {
  const r = dipssMf({ age: 50, wbc: 8, hgb: 13, blasts: 0, constitutional: 'no' });
  assert.equal(r.total, 0);
  assert.equal(r.group, 'Low');
});

test('hemoglobin < 10 contributes 2 points, not 1', () => {
  const r = dipssMf({ age: 50, wbc: 8, hgb: 9.5, blasts: 0, constitutional: 'no' });
  assert.equal(r.total, 2);
  assert.equal(r.group, 'Intermediate-1');
});

test('group boundaries: 0 Low, 1-2 int-1, 3-4 int-2, 5-6 high', () => {
  assert.equal(dipssMf({ age: 70, wbc: 8, hgb: 13, blasts: 0, constitutional: 'no' }).group, 'Intermediate-1'); // 1
  assert.equal(dipssMf({ age: 70, wbc: 8, hgb: 9, blasts: 0, constitutional: 'no' }).group, 'Intermediate-2'); // 1+2=3
  // age + WBC + hgb(2) + blasts + constitutional = 6 -> high
  assert.equal(dipssMf({ age: 70, wbc: 30, hgb: 9, blasts: 2, constitutional: 'yes' }).total, 6);
  assert.equal(dipssMf({ age: 70, wbc: 30, hgb: 9, blasts: 2, constitutional: 'yes' }).group, 'High');
});

test('age > 65 and WBC > 25 are strict; blasts >= 1% inclusive', () => {
  assert.equal(dipssMf({ age: 65, wbc: 25, hgb: 13, blasts: 0.9, constitutional: 'no' }).total, 0);
  assert.equal(dipssMf({ age: 66, wbc: 25.1, hgb: 13, blasts: 1, constitutional: 'no' }).total, 3);
});

test('blank fields surface the fallback', () => {
  assert.equal(dipssMf({ age: 70, wbc: 8, hgb: 13, blasts: 0 }).valid, false);
  assert.equal(dipssMf({}).valid, false);
});
