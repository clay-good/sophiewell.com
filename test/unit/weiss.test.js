// spec-v648: Weiss system for adrenocortical carcinoma.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { weissAdrenal, WEISS_CRITERIA } from '../../lib/weiss-v648.js';

test('nine criteria, each 1 point, max 9', () => {
  assert.equal(WEISS_CRITERIA.length, 9);
  const all = {};
  for (const c of WEISS_CRITERIA) all[c.key] = '1';
  assert.equal(weissAdrenal(all).total, 9);
});

test('threshold is 3: 2 is benign adenoma, 3 is carcinoma', () => {
  const two = weissAdrenal({ necrosis: '1', nuclearGrade: '1' });
  assert.equal(two.total, 2);
  assert.equal(two.malignant, false);
  assert.match(two.bandLabel, /adenoma \(benign\)/);
  const three = weissAdrenal({ necrosis: '1', nuclearGrade: '1', mitoticRate: '1' });
  assert.equal(three.total, 3);
  assert.equal(three.malignant, true);
  assert.match(three.bandLabel, /carcinoma \(malignant\)/);
});

test('META example: high grade + mitoses + necrosis = 3, malignant', () => {
  const r = weissAdrenal({ 'nuclearGrade': '1', 'mitoticRate': '1', 'necrosis': '1' });
  assert.equal(r.total, 3);
  assert.equal(r.malignant, true);
  assert.match(r.bandLabel, /Weiss 3 of 9/);
});

test('empty is a benign read of 0, valid', () => {
  const r = weissAdrenal({});
  assert.equal(r.total, 0);
  assert.equal(r.malignant, false);
  assert.equal(r.valid, true);
});

test('each of the nine criteria contributes exactly one point', () => {
  for (const c of WEISS_CRITERIA) {
    assert.equal(weissAdrenal({ [c.key]: '1' }).total, 1);
  }
});
