// spec-v781: STarT Back Screening Tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { startBack } from '../../lib/startback-v781.js';

test('nothing endorsed -> 0 of 9, low risk', () => {
  const r = startBack({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.subscore, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('bothersomeness scores only for very much or extremely', () => {
  assert.equal(startBack({ bother: 'moderately' }).total, 0);
  assert.equal(startBack({ bother: 'slightly' }).total, 0);
  assert.equal(startBack({ bother: 'very-much' }).total, 1);
  assert.equal(startBack({ bother: 'extremely' }).total, 1);
  assert.equal(startBack({ bother: 'extremely' }).subscore, 1);
});

test('worked example: a total of 7 is only MEDIUM when the subscore is 3', () => {
  const r = startBack({ q1: true, q2: true, q3: true, q4: true, q5: true, q6: true, bother: 'extremely' });
  assert.equal(r.total, 7);
  assert.equal(r.subscore, 3);
  assert.equal(r.tier, 'medium');
});

test('a lower total of 5 is HIGH when all of it is psychosocial', () => {
  const r = startBack({ q5: true, q6: true, q7: true, q8: true, bother: 'extremely' });
  assert.equal(r.total, 5);
  assert.equal(r.subscore, 5);
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
});

test('3 is the top of the low band and 4 is the first medium', () => {
  assert.equal(startBack({ q1: true, q2: true, q3: true }).tier, 'low');
  assert.equal(startBack({ q1: true, q2: true, q3: true, q4: true }).tier, 'medium');
});

test('only items 5 to 9 count toward the subscore', () => {
  const r = startBack({ q1: true, q2: true, q3: true, q4: true });
  assert.equal(r.total, 4);
  assert.equal(r.subscore, 0);
});

test('an unknown bothersomeness level is rejected, not treated as zero', () => {
  const r = startBack({ bother: 'a bit' });
  assert.equal(r.valid, false);
  assert.equal(r.field, 'bother');
});

test('spec-v1122: the one graded item is guarded only where it can cross', () => {
  // Items 1-8 are checkboxes, so an unticked one is a real answer (rule 4).
  // Item 9 is a select worth 1 point, and a total of exactly 3 is the only
  // place that point separates low risk from medium.
  const three = startBack({ q1: true, q2: true, q3: true });
  assert.equal(three.botherStated, false);
  assert.equal(three.floorOnly, true);
  assert.match(three.band, /at least 3 of 9/);
  assert.doesNotMatch(three.band, /low risk/);

  // Stated, the low reading is earned.
  const stated = startBack({ q1: true, q2: true, q3: true, bother: 'not-at-all' });
  assert.equal(stated.floorOnly, false);
  assert.match(stated.band, /low risk/);

  // Anywhere else the point cannot cross a boundary, so the tile answers.
  assert.match(startBack({}).band, /low risk/);
  assert.match(startBack({ q1: true, q2: true, q3: true, q4: true }).band, /medium risk/);
});


test('spec-v1124: the bother point crosses TWO boundaries, not one', () => {
  // spec-v1122 guarded the low/medium boundary at total 3 and missed the
  // medium/high boundary at subscore 3 -- which is the one the stratified-care
  // pathway keys on, since high risk is what sends a patient to
  // psychologically-informed physiotherapy rather than to advice and exercise.
  const highBoundary = startBack({ q1: true, q2: true, q5: true, q6: true, q7: true });
  assert.equal(highBoundary.total, 5);
  assert.equal(highBoundary.subscore, 3);
  assert.equal(highBoundary.floorOnly, true);
  assert.match(highBoundary.band, /subscore at least 3 of 5/);
  assert.match(highBoundary.band, /difference between medium and high risk/);
  assert.doesNotMatch(highBoundary.band, / . medium risk\./);

  // Stated, the medium reading is earned.
  const stated = startBack({ q1: true, q2: true, q5: true, q6: true, q7: true, bother: 'not-at-all' });
  assert.equal(stated.floorOnly, false);
  assert.match(stated.band, /medium risk/);

  // A subscore already at 4 is high whatever item 9 holds (rule 13).
  const alreadyHigh = startBack({ q1: true, q5: true, q6: true, q7: true, q8: true });
  assert.equal(alreadyHigh.floorOnly, false);
  assert.match(alreadyHigh.band, /high risk/);
});
