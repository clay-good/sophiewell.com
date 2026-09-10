// spec-v126 2.2: UCEIS (Travis 2012). Vascular 0-2 + bleeding 0-3 + erosions 0-3
// = 0-8 (0-based). Remission 0-1, mild 2-4, moderate 5-6, severe 7-8.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uceis } from '../../lib/gi-v126.js';

test('severe example', () => {
  const r = uceis({ vascular: 2, bleeding: 3, erosions: 2 });
  assert.equal(r.total, 7);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /severe/);
});

test('remission (0-1)', () => {
  const r = uceis({ vascular: 1, bleeding: 0, erosions: 0 });
  assert.equal(r.total, 1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /remission/);
});

test('max 8', () => {
  assert.equal(uceis({ vascular: 2, bleeding: 3, erosions: 3 }).total, 8);
});

// spec-v1209: this test used to assert the CLAMP -- three descriptors of 9
// scoring 8/8 "severe endoscopic activity". The vascular pattern is defined on
// 0-2; a 9 is not the worst grade, it is not a grade.
test('a descriptor off the scale is refused, not read as the worst one', () => {
  const r = uceis({ vascular: 9, bleeding: 9, erosions: 9 });
  assert.equal(r.valid, false);
  assert.match(r.band, /vascular-pattern grade must be between 0 and 2/);
});

test('the top of the scale still scores', () => {
  assert.equal(uceis({ vascular: 2, bleeding: 3, erosions: 3 }).total, 8);
});

test('scalar fuzz safe', () => {
  assert.equal(uceis(9).total, 0);
});
