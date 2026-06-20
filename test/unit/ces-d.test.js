// spec-v123 2.5: CES-D (Radloff 1977, NIMH public domain). 20 items 0-3, total
// 0-60; items 4/8/12/16 reverse-scored; >= 16 flags significant symptoms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cesD } from '../../lib/psych-v123.js';

test('all items explicitly 0 -> the 4 positive items reverse to 3 each = 12', () => {
  const all = {};
  for (let i = 1; i <= 20; i += 1) all[`q${i}`] = '0';
  const r = cesD(all);
  assert.equal(r.valid, true);
  assert.equal(r.total, 12); // reverse-scored 4/8/12/16 each contribute 3
  assert.equal(r.abnormal, false);
});

test('reverse-scoring key: answering the positive items at "most of the time" -> 0 points', () => {
  const r = cesD({ q4: '3', q8: '3', q12: '3', q16: '3' });
  assert.equal(r.total, 0); // 3 -> 0 for each reverse item; others default 0 (but reverse defaults add nothing here)
});

test('negative items raise the score: band-flip across the >= 16 threshold', () => {
  // baseline (all 0) is 12; add 4 points -> 16
  const r = cesD({ q6: '2', q9: '2' }); // 12 + 4 = 16
  assert.equal(r.total, 16);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /clinically significant depressive symptoms/);
});

test('worked depressed profile -> >= 16', () => {
  const r = cesD({ q6: '3', q9: '3', q14: '3', q18: '3' });
  assert.equal(r.total, 24);
  assert.equal(r.abnormal, true);
});

test('maximum: all negative items 3 and positive items 0 -> 60', () => {
  const all = {};
  for (let i = 1; i <= 20; i += 1) all[`q${i}`] = [4, 8, 12, 16].includes(i) ? '0' : '3';
  assert.equal(cesD(all).total, 60);
});

test('scalar / non-object fuzz arg yields a valid finite total, never NaN', () => {
  const r = cesD(9);
  assert.equal(r.valid, true);
  assert.equal(Number.isFinite(r.total), true);
});
