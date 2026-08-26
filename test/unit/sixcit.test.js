// spec-v778: 6CIT (Six-item Cognitive Impairment Test).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sixcit } from '../../lib/sixcit-v778.js';

test('no errors -> 0 of 28, normal', () => {
  const r = sixcit({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'normal');
  assert.equal(r.abnormal, false);
});

test('every item wrong -> 28, the maximum', () => {
  const r = sixcit({ yearWrong: true, monthWrong: true, timeWrong: true, countErrors: 2, monthsErrors: 2, addressErrors: 5 });
  assert.equal(r.score, 28);
  assert.equal(r.tier, 'significant');
});

test('worked example: year wrong, one counting error, one address part missed -> 8', () => {
  const r = sixcit({ yearWrong: 'true', countErrors: '1', addressErrors: '1' });
  assert.equal(r.score, 8);
  assert.equal(r.tier, 'mild');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /6CIT 8 of 28/);
});

test('7 is still normal and 8 is the first significant score', () => {
  assert.equal(sixcit({ yearWrong: true, monthWrong: true }).score, 7);
  assert.equal(sixcit({ yearWrong: true, monthWrong: true }).tier, 'normal');
  assert.equal(sixcit({ yearWrong: true, monthWrong: true, addressErrors: 1 }).tier, 'mild');
});

test('10 is the first score in the refer band', () => {
  const r = sixcit({ yearWrong: true, monthWrong: true, timeWrong: true });
  assert.equal(r.score, 10);
  assert.equal(r.tier, 'significant');
});

test('address recall is 2 points per component missed, not a flat weight', () => {
  assert.equal(sixcit({ addressErrors: 1 }).score, 2);
  assert.equal(sixcit({ addressErrors: 3 }).score, 6);
  assert.equal(sixcit({ addressErrors: 5 }).score, 10);
});

test('out-of-range error counts are rejected', () => {
  assert.equal(sixcit({ countErrors: 3 }).valid, false);
  assert.equal(sixcit({ addressErrors: 6 }).valid, false);
  assert.equal(sixcit({ monthsErrors: -1 }).field, 'monthsErrors');
});
