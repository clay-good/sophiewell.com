// spec-v126 2.1: CDAI (Best 1976). 8 weighted items; <150 remission, 150-220 mild,
// 221-450 moderate, >450 severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdaiCrohns } from '../../lib/gi-v126.js';

const ex = { stools: 20, pain: 14, wellbeing: 7, complications: 1, antidiarrheal: true, abdMass: 2, female: false, hct: 40, weight: 60, standardWeight: 70 };

test('worked example -> 285, moderate', () => {
  const r = cdaiCrohns(ex);
  assert.equal(r.valid, true);
  assert.equal(r.total, 285);
  assert.match(r.band, /moderate/);
});

test('remission band (< 150) not flagged', () => {
  const r = cdaiCrohns({ hct: 45, weight: 70, standardWeight: 70 });
  assert.ok(r.total < 150);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /remission/);
});

test('hematocrit deficit weight is x6 and sex-specific (men ref 47)', () => {
  const base = cdaiCrohns({ hct: 47, weight: 70, standardWeight: 70 }).total; // deficit 0
  const low = cdaiCrohns({ hct: 37, weight: 70, standardWeight: 70 }).total;  // deficit 10 x6 = 60
  assert.equal(low - base, 60);
});

test('missing labs -> valid:false (no division by zero standard)', () => {
  assert.equal(cdaiCrohns({ stools: 5 }).valid, false);
  assert.equal(cdaiCrohns({ hct: 40, weight: 60, standardWeight: 0 }).valid, false);
  assert.equal(cdaiCrohns(9).valid, false);
});

// spec-v1077: a diary item nobody filled in is not a week without symptoms.
//
// `clampInt` returns its low bound for anything non-finite, so an unfilled
// seven-day tally arrived as 0 -- which is also what a patient in remission
// genuinely reports, making silence and remission indistinguishable. Omitting
// the stool count alone moved the worked example from CDAI 266 "moderate" to
// 226, and on the shipped example from 265 to 215 "mild disease": a
// de-escalation of Crohn's activity across a band boundary, on a diary nobody
// had kept.
//
// All four diary terms are non-negative with positive coefficients, so a partial
// total is a lower bound: it may rule in, and must not rule out.
test('spec-v1077: a blank diary item is disclosed; a typed zero is not', () => {
  const base = {
    hct: '36', weight: '60', standardWeight: '70',
    stools: '20', pain: '10', wellbeing: '8', complications: '1', abdMass: '2',
  };
  const full = cdaiCrohns(base);
  const blank = cdaiCrohns({ ...base, stools: '' });
  const zero = cdaiCrohns({ ...base, stools: '0' });

  assert.deepEqual(full.notEntered, []);
  assert.equal(full.diaryItemsScored, 4);

  // A gap is named, and the total is called a floor.
  assert.deepEqual(blank.notEntered, ['the 7-day liquid-stool count']);
  assert.equal(blank.diaryItemsScored, 3);
  assert.match(blank.band, /Scored from 3 of the 4 diary items/);
  assert.match(blank.band, /can only raise the total/);

  // A typed zero still means zero: same arithmetic, no disclosure.
  assert.equal(zero.total, blank.total, 'blank and zero must still compute alike');
  assert.deepEqual(zero.notEntered, [], 'a typed 0 is an answer, not a gap');
  assert.doesNotMatch(zero.band, /diary items/);
});

// spec-v1209: `clampInt(v, 0, hi)` turned an impossible diary tally into the
// item's maximum. Seven days of a 0-3 daily grade cannot exceed 21.
test('a diary tally above its arithmetic maximum is refused', () => {
  const r = cdaiCrohns({ ...ex, pain: 9999 });
  assert.equal(r.valid, false);
  assert.match(r.band, /7-day abdominal-pain sum must be between 0 and 21/);
});

test('the top of each diary item still scores', () => {
  assert.equal(cdaiCrohns({ ...ex, pain: 21, wellbeing: 28 }).valid, true);
});

test('an abdominal-mass grade off the 0/2/5 scale is refused', () => {
  assert.match(cdaiCrohns({ ...ex, abdMass: 9999 }).band, /abdominal-mass grade must be between 0 and 5/);
});

test('a blank diary item is still reported as a floor, not out of range', () => {
  const r = cdaiCrohns({ ...ex, stools: undefined });
  assert.equal(r.valid, true);
  assert.match(r.band, /treat this as a floor/);
});
