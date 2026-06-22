// spec-v139 2.4: IOTA Simple Rules (Timmerman 2008). Five B and five M features;
// benign if >=1 B and no M, malignant if >=1 M and no B, else inconclusive.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iotaSimpleRules } from '../../lib/gyn-v139.js';

test('benign: B features only', () => {
  const r = iotaSimpleRules({ b1: true, b3: true });
  assert.equal(r.verdict, 'benign');
  assert.equal(r.bCount, 2);
  assert.equal(r.mCount, 0);
  assert.equal(r.abnormal, false);
});

test('malignant: M features only', () => {
  const r = iotaSimpleRules({ m1: true, m2: true });
  assert.equal(r.verdict, 'malignant');
  assert.equal(r.mCount, 2);
  assert.equal(r.abnormal, true);
});

test('inconclusive: both B and M present', () => {
  const r = iotaSimpleRules({ b1: true, m1: true });
  assert.equal(r.verdict, 'inconclusive');
  assert.match(r.band, /second-stage test advised/);
});

test('inconclusive: neither B nor M present', () => {
  const r = iotaSimpleRules({});
  assert.equal(r.verdict, 'inconclusive');
  assert.equal(r.bCount, 0);
  assert.equal(r.mCount, 0);
});
