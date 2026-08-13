// spec-v725: Glickman furcation involvement grade.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { glickmanFurcation } from '../../lib/glickman-furcation-v725.js';

test('Grade I -> incipient (not flagged)', () => {
  const r = glickmanFurcation({ furcation: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'I');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Glickman Grade I/);
});

test('Grade II -> partial / cul-de-sac (not through-and-through)', () => {
  const r = glickmanFurcation({ furcation: 'II' });
  assert.equal(r.grade, 'II');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /partial/);
});

test('Grade III -> through-and-through, occluded (flagged)', () => {
  const r = glickmanFurcation({ furcation: 'III' });
  assert.equal(r.grade, 'III');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /not visible/);
});

test('Grade IV -> through-and-through, visible (flagged)', () => {
  const r = glickmanFurcation({ furcation: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /clinically visible/);
});

test('the furcation finding is required and validated', () => {
  assert.equal(glickmanFurcation({}).valid, false);
  assert.equal(glickmanFurcation({}).field, 'furcation');
  assert.equal(glickmanFurcation({ furcation: 'V' }).valid, false);
});
