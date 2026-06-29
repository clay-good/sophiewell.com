// spec-v174 §2.1: Nu-DESC (Nursing Delirium Screening Scale). 5 items 0-2,
// total 0-10; >= 2 is a positive delirium screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nuDesc } from '../../lib/ltcga-v174.js';

const z = { disorientation: 0, inappropriateBehavior: 0, inappropriateCommunication: 0, illusionsHallucinations: 0, psychomotorRetardation: 0 };

test('Nu-DESC 0/10 (all absent) -> negative screen', () => {
  const r = nuDesc(z);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.match(r.band, /negative screen/);
});

test('Nu-DESC 1 -> negative and 2 -> positive (the >= 2 delirium-cut flip)', () => {
  const one = nuDesc({ ...z, disorientation: 1 });
  assert.equal(one.total, 1);
  assert.match(one.band, /negative screen/);
  const two = nuDesc({ ...z, disorientation: 1, inappropriateBehavior: 1 });
  assert.equal(two.total, 2);
  assert.equal(two.positive, true);
  assert.match(two.band, /delirium indicated/);
});

test('Nu-DESC tile example = 2 -> positive', () => {
  const r = nuDesc({ ...z, disorientation: 1, inappropriateBehavior: 1 });
  assert.equal(r.total, 2);
  assert.match(r.band, /Nu-DESC 2\/10/);
});

test('Nu-DESC 10/10 (all severe) -> positive', () => {
  const r = nuDesc({ disorientation: 2, inappropriateBehavior: 2, inappropriateCommunication: 2, illusionsHallucinations: 2, psychomotorRetardation: 2 });
  assert.equal(r.total, 10);
  assert.equal(r.positive, true);
});

test('Nu-DESC rejects out-of-range and blank items', () => {
  assert.equal(nuDesc({ ...z, disorientation: 3 }).valid, false);
  assert.equal(nuDesc({ ...z, disorientation: '' }).valid, false);
  assert.equal(nuDesc({}).valid, false);
});
