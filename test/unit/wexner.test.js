// spec-v324: Wexner (Cleveland Clinic) fecal incontinence score. Worked-example tests: the
// sum of the five items, the 0 = perfect continence and 20 = complete incontinence extremes,
// the >= 9 "clinically significant" flag, missing items defaulting to 0, and the range
// guards. Scale transcribed from Jorge & Wexner 1993 (Dis Colon Rectum), cross-verified
// against reproductions of the five items and 0-4 frequency scale (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wexner } from '../../lib/wexner-v324.js';

test('the five items sum to the total (the META example: 0+2+3+1+1 = 7)', () => {
  const r = wexner({ solid: '0', liquid: '2', gas: '3', pad: '1', lifestyle: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 7);
  assert.equal(r.significant, false);
  assert.match(r.band, /score 7 of 20/);
});

test('all-zero (or no input) is 0 of 20, perfect continence', () => {
  assert.equal(wexner({}).total, 0);
  const r = wexner({ solid: '0', liquid: '0', gas: '0', pad: '0', lifestyle: '0' });
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /perfect continence/);
});

test('all-four is 20 of 20, complete incontinence, flagged significant', () => {
  const r = wexner({ solid: '4', liquid: '4', gas: '4', pad: '4', lifestyle: '4' });
  assert.equal(r.total, 20);
  assert.equal(r.significant, true);
  assert.equal(r.abnormal, true);
});

test('a total of 9 crosses the commonly-cited clinically-significant threshold', () => {
  const r = wexner({ solid: '2', liquid: '2', gas: '2', pad: '2', lifestyle: '1' });
  assert.equal(r.total, 9);
  assert.equal(r.significant, true);
  const below = wexner({ solid: '2', liquid: '2', gas: '2', pad: '1', lifestyle: '1' });
  assert.equal(below.total, 8);
  assert.equal(below.significant, false);
});

test('missing items default to 0 (never)', () => {
  const r = wexner({ liquid: '3' });
  assert.equal(r.total, 3);
  assert.equal(r.items.solid, 0);
});

test('out-of-range or non-integer items are invalid', () => {
  assert.equal(wexner({ solid: '5' }).valid, false);
  assert.equal(wexner({ gas: '2.5' }).valid, false);
  assert.equal(wexner({ pad: '-1' }).valid, false);
});
