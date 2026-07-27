// spec-v517: Premature Infant Pain Profile (PIPP).
// Worked-example tests: the contextual head start (the point of the instrument), both interpretive
// boundaries (6 and 12), the range, and the missing / out-of-range guards. Indicators and cut points
// transcribed from Stevens and colleagues 1996 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pipp, PIPP_INDICATORS } from '../../lib/pipp-v517.js';

function score({ ga = 0, state = 0, hr = 0, spo2 = 0, brow = 0, squeeze = 0, furrow = 0 } = {}) {
  return pipp({ ga, state, hr, spo2, brow, squeeze, furrow });
}

test('seven indicators, each with four options', () => {
  assert.equal(PIPP_INDICATORS.length, 7);
  for (const ind of PIPP_INDICATORS) assert.equal(ind.options.length, 4);
  assert.deepEqual(PIPP_INDICATORS.map((i) => i.key), ['ga', 'state', 'hr', 'spo2', 'brow', 'squeeze', 'furrow']);
});

test('a preterm infant during a heel stick scores 13 (the META example)', () => {
  const r = score({ ga: 2, state: 3, hr: 2, spo2: 2, brow: 2, squeeze: 1, furrow: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 13);
  assert.equal(r.contextual, 5);
  assert.equal(r.moderateToSevere, true);
  assert.match(r.band, /PIPP total 13 of 21/);
});

test('the contextual pair alone can reach 6 before anything is observed', () => {
  // 26 weeks, quiet sleep: 3 + 3 = 6 with no facial or physiologic change at all.
  const r = score({ ga: 3, state: 3 });
  assert.equal(r.total, 6);
  assert.equal(r.contextual, 6);
  assert.equal(r.minimalPain, true);

  // A term infant, awake, with the identical observed response scores 6 lower.
  const term = score({ ga: 0, state: 0, hr: 3, spo2: 3 });
  assert.equal(term.total, 6);
  assert.equal(term.contextual, 0);
});

test('the minimal-pain boundary sits at 6', () => {
  const six = score({ ga: 3, state: 3 });
  assert.equal(six.total, 6);
  assert.equal(six.minimalPain, true);
  assert.match(six.band, /commonly read as minimal or no pain/);

  const seven = score({ ga: 3, state: 3, hr: 1 });
  assert.equal(seven.total, 7);
  assert.equal(seven.minimalPain, false);
});

test('the moderate-to-severe boundary is strictly above 12', () => {
  const twelve = score({ ga: 3, state: 3, hr: 3, spo2: 3 });
  assert.equal(twelve.total, 12);
  assert.equal(twelve.moderateToSevere, false);

  const thirteen = score({ ga: 3, state: 3, hr: 3, spo2: 3, brow: 1 });
  assert.equal(thirteen.total, 13);
  assert.equal(thirteen.moderateToSevere, true);
  assert.match(thirteen.band, /commonly read as moderate to severe pain/);
});

test('the floor is 0 and the ceiling is 21', () => {
  assert.equal(score().total, 0);
  const hi = score({ ga: 3, state: 3, hr: 3, spo2: 3, brow: 3, squeeze: 3, furrow: 3 });
  assert.equal(hi.total, 21);
});

test('string scores are accepted', () => {
  assert.equal(score({ ga: '2', state: '3', hr: '2', spo2: '2', brow: '2', squeeze: '1', furrow: '1' }).total, 13);
});

test('a missing indicator is invalid', () => {
  assert.equal(pipp({}).valid, false);
  assert.equal(pipp({ ga: 0, state: 0, hr: 0, spo2: 0, brow: 0, squeeze: 0 }).valid, false);
});

test('out-of-range or non-integer scores are invalid', () => {
  assert.equal(score({ ga: 4 }).valid, false);
  assert.equal(score({ state: -1 }).valid, false);
  assert.equal(score({ hr: 1.5 }).valid, false);
  assert.equal(score({ furrow: 'x' }).valid, false);
});
