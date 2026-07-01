// spec-v187 §2.2: IMDC (Heng) metastatic-RCC risk. Six factors, 1 point each.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imdcRcc } from '../../lib/onc-staging-v187.js';

test('tile example: three factors -> poor risk', () => {
  const r = imdcRcc({ karnofsky: true, anemia: true, hypercalcemia: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 3);
  assert.equal(r.group, 'poor');
  assert.equal(r.bandLabel, 'Poor risk');
});

test('group crosses 0 -> 1-2 -> >= 3', () => {
  assert.equal(imdcRcc({}).group, 'favorable');
  assert.equal(imdcRcc({ anemia: true }).group, 'intermediate');
  assert.equal(imdcRcc({ anemia: true, karnofsky: true }).group, 'intermediate');
  assert.equal(imdcRcc({ anemia: true, karnofsky: true, thrombocytosis: true }).group, 'poor');
});

test('all six factors score 6 (poor)', () => {
  const r = imdcRcc({ karnofsky: true, dxToTx: true, anemia: true, hypercalcemia: true, neutrophilia: true, thrombocytosis: true });
  assert.equal(r.score, 6);
  assert.equal(r.group, 'poor');
});

test('favorable has no adverse factors', () => {
  const r = imdcRcc({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
