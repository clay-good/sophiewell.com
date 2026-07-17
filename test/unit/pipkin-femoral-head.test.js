// spec-v375: Pipkin classification of a femoral head fracture (types I-IV). Worked-example tests: each
// type and its description, the complex flag on III-IV, roman + numeric + case-insensitive input, and
// the invalid-type guard. Types transcribed from Pipkin 1957 (JBJS Am), cross-verified against CORR
// "Classifications in Brief" (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pipkinFemoralHead } from '../../lib/pipkin-femoral-head-v375.js';

test('type III: + femoral neck fracture, flagged (the META example)', () => {
  const r = pipkinFemoralHead({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.complex, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /associated femoral neck fracture/);
});

test('types I-II are the isolated femoral head fractures (not flagged)', () => {
  assert.match(pipkinFemoralHead({ type: 'I' }).band, /below\) the fovea centralis/);
  assert.match(pipkinFemoralHead({ type: 'II' }).band, /above\) the fovea centralis/);
  for (const t of ['I', 'II']) {
    assert.equal(pipkinFemoralHead({ type: t }).complex, false, t);
  }
});

test('type IV is + acetabular fracture and flagged', () => {
  const r = pipkinFemoralHead({ type: 'IV' });
  assert.equal(r.complex, true);
  assert.equal(r.type, 'IV');
  assert.match(r.band, /associated acetabular fracture/);
});

test('numeric and case-insensitive input map to the types', () => {
  assert.equal(pipkinFemoralHead({ type: 3 }).type, 'III');
  assert.equal(pipkinFemoralHead({ type: '4' }).type, 'IV');
  assert.equal(pipkinFemoralHead({ type: 'ii' }).type, 'II');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(pipkinFemoralHead({}).valid, false);
  assert.equal(pipkinFemoralHead({ type: 'V' }).valid, false);
  assert.equal(pipkinFemoralHead({ type: '0' }).valid, false);
});
