// spec-v187 §2.3: MSKCC (Motzer) metastatic-RCC risk. Five factors, 1 point each.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mskccRcc } from '../../lib/onc-staging-v187.js';

test('tile example: two factors -> intermediate risk', () => {
  const r = mskccRcc({ karnofsky: true, ldh: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 2);
  assert.equal(r.group, 'intermediate');
});

test('group crosses 0 -> 1-2 -> >= 3', () => {
  assert.equal(mskccRcc({}).group, 'favorable');
  assert.equal(mskccRcc({ ldh: true }).group, 'intermediate');
  assert.equal(mskccRcc({ ldh: true, anemia: true, hypercalcemia: true }).group, 'poor');
});

test('all five factors score 5 (poor)', () => {
  const r = mskccRcc({ karnofsky: true, ldh: true, anemia: true, hypercalcemia: true, dxToTx: true });
  assert.equal(r.score, 5);
  assert.equal(r.group, 'poor');
});

test('favorable has no adverse factors', () => {
  assert.equal(mskccRcc({}).score, 0);
  assert.equal(mskccRcc({}).abnormal, false);
});
