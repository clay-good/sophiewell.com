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

test('clamps and scalar fuzz safe', () => {
  assert.equal(uceis({ vascular: 9, bleeding: 9, erosions: 9 }).total, 8);
  assert.equal(uceis(9).total, 0);
});
