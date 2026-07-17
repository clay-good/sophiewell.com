// spec-v378: Delbet (Delbet-Colonna) classification of a pediatric femoral neck fracture (types I-IV).
// Worked-example tests: each type and its anatomic description, the high-AVN-risk flag on types I-II,
// roman + numeric + case-insensitive input, and the invalid-type guard. Types transcribed from Colonna
// 1929, cross-verified against a modern review (JAAOS 2018) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { delbetFemoralNeck } from '../../lib/delbet-femoral-neck-v378.js';

test('type I: transepiphyseal, highest AVN risk, flagged (the META example)', () => {
  const r = delbetFemoralNeck({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.equal(r.highAvnRisk, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /transepiphyseal/);
  assert.match(r.band, /highest risk of avascular necrosis/);
});

test('type II is transcervical, high AVN risk, flagged', () => {
  const r = delbetFemoralNeck({ type: 'II' });
  assert.equal(r.highAvnRisk, true);
  assert.match(r.band, /transcervical/);
  assert.match(r.band, /most common/);
});

test('type III is cervicotrochanteric, lower risk, not flagged', () => {
  const r = delbetFemoralNeck({ type: 'III' });
  assert.equal(r.highAvnRisk, false);
  assert.match(r.band, /cervicotrochanteric/);
});

test('type IV is intertrochanteric, lowest AVN risk, not flagged', () => {
  const r = delbetFemoralNeck({ type: 'IV' });
  assert.equal(r.highAvnRisk, false);
  assert.match(r.band, /intertrochanteric/);
  assert.match(r.band, /lowest risk/);
});

test('numeric and case-insensitive input map to the types', () => {
  assert.equal(delbetFemoralNeck({ type: 1 }).type, 'I');
  assert.equal(delbetFemoralNeck({ type: '4' }).type, 'IV');
  assert.equal(delbetFemoralNeck({ type: 'iii' }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(delbetFemoralNeck({}).valid, false);
  assert.equal(delbetFemoralNeck({ type: 'V' }).valid, false);
  assert.equal(delbetFemoralNeck({ type: '0' }).valid, false);
});
