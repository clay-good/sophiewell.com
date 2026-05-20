import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cam } from '../../lib/scoring-v4.js';

test('cam (tile example: no features) -> negative', () => {
  const r = cam({});
  assert.equal(r.positive, false);
  assert.match(r.text, /CAM negative/);
});

test('cam 1+2 only -> negative (needs 3 or 4)', () => {
  const r = cam({ acuteFluctuating: true, inattention: true });
  assert.equal(r.positive, false);
});

test('cam 1+2+3 -> positive', () => {
  const r = cam({ acuteFluctuating: true, inattention: true, disorganizedThinking: true });
  assert.equal(r.positive, true);
});

test('cam 1+2+4 -> positive', () => {
  const r = cam({ acuteFluctuating: true, inattention: true, alteredLoc: true });
  assert.equal(r.positive, true);
});

test('cam 1+3+4 -> negative (feature 2 is required)', () => {
  const r = cam({ acuteFluctuating: true, disorganizedThinking: true, alteredLoc: true });
  assert.equal(r.positive, false);
});

test('cam 2+3+4 (no feature 1) -> negative', () => {
  const r = cam({ inattention: true, disorganizedThinking: true, alteredLoc: true });
  assert.equal(r.positive, false);
});

test('cam all four features -> positive', () => {
  const r = cam({
    acuteFluctuating: true, inattention: true,
    disorganizedThinking: true, alteredLoc: true,
  });
  assert.equal(r.positive, true);
});
