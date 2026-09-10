// spec-v126 2.5: CTSI Balthazar (1990). grade 0-4 + necrosis 0/2/4/6 = 0-10.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ctsiBalthazar } from '../../lib/gi-v126.js';

test('max -> 10, severe', () => {
  const r = ctsiBalthazar({ grade: 4, necrosis: 6 });
  assert.equal(r.total, 10);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /severe/);
});

test('mild band 0-3', () => {
  const r = ctsiBalthazar({ grade: 2, necrosis: 0 });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /mild/);
});

test('moderate band 4-6', () => {
  const r = ctsiBalthazar({ grade: 2, necrosis: 4 });
  assert.equal(r.total, 6);
  assert.match(r.band, /moderate/);
});

// spec-v1209: this test used to assert the CLAMP -- a grade of 9 scoring 10/10
// "severe acute pancreatitis". The Balthazar grade is A-E, so a 9 is not a
// severe finding, it is a value nobody can have entered from the scale.
test('a grade off the scale is refused, not read as the worst one', () => {
  const r = ctsiBalthazar({ grade: 9, necrosis: 9 });
  assert.equal(r.valid, false);
  assert.match(r.band, /Balthazar CT grade must be between 0 and 4/);
});

test('the top of the scale still scores', () => {
  assert.equal(ctsiBalthazar({ grade: 4, necrosis: 6 }).total, 10);
});

test('scalar fuzz safe', () => {
  assert.equal(ctsiBalthazar(9).total, 0);
});
