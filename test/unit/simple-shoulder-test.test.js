// spec-v793: Simple Shoulder Test.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { simpleShoulderTest, QUESTIONS } from '../../lib/simple-shoulder-test-v793.js';

function allYes() {
  const o = {};
  for (const q of QUESTIONS) o[q.arg] = true;
  return o;
}

test('the instrument has exactly twelve questions', () => {
  assert.equal(QUESTIONS.length, 12);
});

test('no answers -> 0 of 12 at 0 percent', () => {
  const r = simpleShoulderTest({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.percent, 0);
  assert.equal(r.abnormal, true);
});

test('all twelve yes -> 12 of 12 at 100 percent, and that is the good end', () => {
  const r = simpleShoulderTest(allYes());
  assert.equal(r.score, 12);
  assert.equal(r.percent, 100);
  assert.equal(r.abnormal, false);
});

test('every question carries the same weight of one point', () => {
  for (const q of QUESTIONS) {
    const r = simpleShoulderTest({ [q.arg]: true });
    assert.equal(r.score, 1, q.arg);
  }
});

test('worked example: eight of twelve -> 66.7 percent', () => {
  const r = simpleShoulderTest({
    comfortAtRest: 'true', sleepComfortably: 'true', reachSmallOfBack: 'true', handBehindHead: 'true',
    coinOnShelf: 'true', liftOnePound: 'true', washOppositeShoulder: 'true', workFullTime: 'true',
  });
  assert.equal(r.score, 8);
  assert.equal(r.percent, 66.7);
  assert.match(r.band, /8 of 12/);
});

test('the percentage tracks the score exactly, with no rounding drift at the ends', () => {
  assert.equal(simpleShoulderTest({ comfortAtRest: true }).percent, 8.3);
  const six = {};
  QUESTIONS.slice(0, 6).forEach((q) => { six[q.arg] = true; });
  assert.equal(simpleShoulderTest(six).percent, 50);
});
