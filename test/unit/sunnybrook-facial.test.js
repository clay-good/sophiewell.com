// spec-v509: Sunnybrook Facial Grading System.
// Worked-example tests: the composite arithmetic, the two anchors (100 normal, 0 complete flaccid
// paralysis), the weights on each axis, and the missing / out-of-range / unknown-choice guards.
// Items and weights transcribed from Ross, Fradet and Nedzelski 1996 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sunnybrookFacial, REST_ITEMS, EXPRESSIONS, MOVEMENT_SCALE, SYNKINESIS_SCALE,
} from '../../lib/sunnybrook-facial-v509.js';

function grade({ eye = 'normal', cheek = 'normal', mouth = 'normal', m = [5, 5, 5, 5, 5], s = [0, 0, 0, 0, 0] }) {
  const o = { eye, cheek, mouth };
  m.forEach((n, i) => { o[`m${i + 1}`] = n; });
  s.forEach((n, i) => { o[`s${i + 1}`] = n; });
  return sunnybrookFacial(o);
}

test('the three axes carry the published shapes', () => {
  assert.equal(REST_ITEMS.length, 3);
  assert.equal(EXPRESSIONS.length, 5);
  assert.equal(MOVEMENT_SCALE.length, 5);
  assert.equal(SYNKINESIS_SCALE.length, 4);
});

test('a mixed exam scores 52 (the META example)', () => {
  const r = grade({ cheek: 'less', mouth: 'drooped', m: [3, 4, 3, 3, 4], s: [1, 1, 2, 1, 1] });
  assert.equal(r.valid, true);
  assert.equal(r.restingScore, 10);   // (0 + 1 + 1) x 5
  assert.equal(r.movementScore, 68);  // (3 + 4 + 3 + 3 + 4) x 4
  assert.equal(r.synkinesisScore, 6);
  assert.equal(r.composite, 52);
  assert.match(r.band, /Sunnybrook composite 52 of 100/);
});

test('a symmetric face scores the 100 anchor', () => {
  const r = grade({});
  assert.equal(r.restingScore, 0);
  assert.equal(r.movementScore, 100);
  assert.equal(r.synkinesisScore, 0);
  assert.equal(r.composite, 100);
});

test('complete flaccid paralysis scores the 0 anchor', () => {
  const r = grade({ eye: 'narrow', cheek: 'absent', mouth: 'drooped', m: [1, 1, 1, 1, 1], s: [0, 0, 0, 0, 0] });
  assert.equal(r.restingScore, 20);   // (1 + 2 + 1) x 5
  assert.equal(r.movementScore, 20);  // (1 x 5) x 4
  assert.equal(r.composite, 0);
});

test('each axis carries its published weight', () => {
  // One extra resting point costs 5.
  assert.equal(grade({ mouth: 'drooped' }).composite, 95);
  // One step down on one expression costs 4.
  assert.equal(grade({ m: [4, 5, 5, 5, 5] }).composite, 96);
  // One synkinesis point costs 1.
  assert.equal(grade({ s: [1, 0, 0, 0, 0] }).composite, 99);
});

test('the resting choices that share a point value are all accepted', () => {
  assert.equal(grade({ eye: 'wide' }).composite, 95);
  assert.equal(grade({ eye: 'surgery' }).composite, 95);
  assert.equal(grade({ cheek: 'more' }).composite, 95);
  assert.equal(grade({ mouth: 'pulled' }).composite, 95);
  assert.equal(grade({ cheek: 'absent' }).composite, 90);
});

test('string answers are accepted', () => {
  const r = grade({ cheek: 'less', mouth: 'drooped', m: ['3', '4', '3', '3', '4'], s: ['1', '1', '2', '1', '1'] });
  assert.equal(r.composite, 52);
});

test('the worst possible combination computes below the 0 anchor', () => {
  const r = grade({ eye: 'narrow', cheek: 'absent', mouth: 'drooped', m: [1, 1, 1, 1, 1], s: [3, 3, 3, 3, 3] });
  assert.equal(r.synkinesisScore, 15);
  assert.equal(r.composite, -15);
});

test('a missing item is invalid', () => {
  assert.equal(sunnybrookFacial({}).valid, false);
  const partial = { eye: 'normal', cheek: 'normal', mouth: 'normal', m1: 5, m2: 5, m3: 5, m4: 5, m5: 5, s1: 0, s2: 0, s3: 0, s4: 0 };
  assert.equal(sunnybrookFacial(partial).valid, false);
});

test('out-of-range, non-integer, or unknown choices are invalid', () => {
  assert.equal(grade({ m: [0, 5, 5, 5, 5] }).valid, false);
  assert.equal(grade({ m: [6, 5, 5, 5, 5] }).valid, false);
  assert.equal(grade({ m: [3.5, 5, 5, 5, 5] }).valid, false);
  assert.equal(grade({ s: [4, 0, 0, 0, 0] }).valid, false);
  assert.equal(grade({ s: [-1, 0, 0, 0, 0] }).valid, false);
  assert.equal(grade({ eye: 'squinty' }).valid, false);
  assert.equal(grade({ m: ['x', 5, 5, 5, 5] }).valid, false);
});
