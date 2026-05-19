import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apfel } from '../../lib/scoring-v4.js';

const zero = {
  female: false, nonsmoker: false,
  historyPonvOrMotionSickness: false, postopOpioids: false,
};

test('apfel 0 -> ~10% PONV per Apfel 1999', () => {
  const r = apfel(zero);
  assert.equal(r.score, 0);
  assert.match(r.band, /~10%/);
});

test('apfel 1 -> ~20% PONV', () => {
  const r = apfel({ ...zero, female: true });
  assert.equal(r.score, 1);
  assert.match(r.band, /~20%/);
});

test('apfel 2 (tile example: female nonsmoker) -> ~40% PONV', () => {
  const r = apfel({ ...zero, female: true, nonsmoker: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /~40%/);
});

test('apfel 3 -> ~60% PONV', () => {
  const r = apfel({ ...zero, female: true, nonsmoker: true, historyPonvOrMotionSickness: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /~60%/);
});

test('apfel 4 (maximum) -> ~80% PONV', () => {
  const r = apfel({ female: true, nonsmoker: true, historyPonvOrMotionSickness: true, postopOpioids: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /~80%/);
});
