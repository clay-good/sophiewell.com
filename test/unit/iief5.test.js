// spec-v153 2.2: IIEF-5 / SHIM (Rosen 1999). Five items; Q1 scored 1-5, Q2-Q5
// scored 0-5; total banded 22-25 no ED, 17-21 mild, 12-16 mild-to-moderate,
// 8-11 moderate, 5-7 severe. The 21/22 (no-ED) and 7/8 (severe) boundaries are
// exercised; a blank item is valid:false.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iief5 } from '../../lib/urology-v153.js';

test('tile example: 19 -> mild ED', () => {
  const r = iief5({ q1: 4, q2: 4, q3: 4, q4: 4, q5: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 19);
  assert.equal(r.bandLabel, 'Mild ED');
});

test('21/22 mild->no-ED boundary', () => {
  const at21 = iief5({ q1: 5, q2: 4, q3: 4, q4: 4, q5: 4 });
  assert.equal(at21.score, 21);
  assert.equal(at21.bandLabel, 'Mild ED');
  assert.match(at21.band, /meets the diagnostic threshold for ED/);
  const at22 = iief5({ q1: 5, q2: 5, q3: 4, q4: 4, q5: 4 });
  assert.equal(at22.score, 22);
  assert.equal(at22.bandLabel, 'No erectile dysfunction');
  assert.equal(at22.abnormal, false);
});

test('7/8 severe->moderate boundary', () => {
  const at7 = iief5({ q1: 3, q2: 1, q3: 1, q4: 1, q5: 1 });
  assert.equal(at7.score, 7);
  assert.equal(at7.bandLabel, 'Severe ED');
  const at8 = iief5({ q1: 4, q2: 1, q3: 1, q4: 1, q5: 1 });
  assert.equal(at8.score, 8);
  assert.equal(at8.bandLabel, 'Moderate ED');
});

test('max 25 -> no ED; the Q2-Q5 zero option is a valid answer', () => {
  assert.equal(iief5({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 }).score, 25);
  assert.equal(iief5({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 }).bandLabel, 'No erectile dysfunction');
  // All no-attempt zeros on Q2-Q5 with Q1=1 -> total 1, severe band (<=7).
  const z = iief5({ q1: 1, q2: 0, q3: 0, q4: 0, q5: 0 });
  assert.equal(z.valid, true);
  assert.equal(z.score, 1);
  assert.equal(z.bandLabel, 'Severe ED');
});

test('blank item -> valid:false complete-the-fields', () => {
  assert.equal(iief5({ q1: 4, q2: 4, q3: 4, q4: 4 }).valid, false);
  assert.equal(iief5({ q1: 4, q2: 4, q3: 4, q4: 4, q5: '' }).valid, false);
  assert.match(iief5({ q1: 4 }).message, /Answer all 5/);
});
