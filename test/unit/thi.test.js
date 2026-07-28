// spec-v555: the Tinnitus Handicap Inventory.
//
// The load-bearing tests are the two source facts a plausible implementation gets wrong: the published band
// gaps are unreachable rather than an off-by-one, and the subscales are withheld on purpose.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  thi, THI_ITEMS, THI_OPTIONS, THI_MAX, ODD_TOTALS_UNREACHABLE,
} from '../../lib/thi-v555.js';

// Build an input summing to an exact (even) total: fill with 4s, then a single 2 if needed.
const totalling = (target) => {
  const o = {};
  let left = target;
  for (const item of THI_ITEMS) {
    const give = left >= 4 ? 4 : left;
    o[item.key] = String(give);
    left -= give;
  }
  return o;
};
const uniform = (v) => Object.fromEntries(THI_ITEMS.map((i) => [i.key, String(v)]));

test('there are 25 items and exactly three answer values', () => {
  assert.equal(THI_ITEMS.length, 25);
  assert.deepEqual(THI_OPTIONS.map((o) => o.value), [4, 2, 0]);
});

test('the range is 0 to 100', () => {
  assert.equal(THI_MAX, 100);
  assert.equal(thi(uniform(0)).total, 0);
  assert.equal(thi(uniform(4)).total, 100);
  assert.equal(thi(uniform(2)).total, 50);
});

// THE structural fact.
test('every reachable total is even', () => {
  for (const v of [0, 2, 4]) {
    assert.equal(thi(uniform(v)).total % 2, 0);
  }
  for (const target of [0, 6, 24, 38, 76, 90, 100]) {
    assert.equal(thi(totalling(target)).total % 2, 0);
  }
});

test('the unreachable totals are the published band gaps', () => {
  assert.deepEqual(ODD_TOTALS_UNREACHABLE, [17, 37, 57, 77]);
  for (const n of ODD_TOTALS_UNREACHABLE) {
    assert.equal(n % 2, 1, `${n} must be odd, hence unreachable`);
  }
});

test('the result explains that the band gaps are unreachable, not an off-by-one', () => {
  const r = thi(uniform(2));
  assert.match(r.bandText, /every total is EVEN/);
  assert.match(r.bandText, /not an off-by-one to be tidied away/);
});

test('an odd item value is rejected', () => {
  const o = uniform(2);
  o.q1 = '3';
  const r = thi(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /Odd values and 1 or 3 are not on this scale/);
});

// Grades.
test('each grade boundary sits where the source puts it', () => {
  const cases = [[0, 1], [16, 1], [18, 2], [36, 2], [38, 3], [56, 3], [58, 4], [76, 4], [78, 5], [100, 5]];
  for (const [total, grade] of cases) {
    const r = thi(totalling(total));
    assert.equal(r.total, total, `constructed total for ${total}`);
    assert.equal(r.grade, grade, `total ${total}`);
  }
});

test('the grade labels are the published ones', () => {
  assert.equal(thi(totalling(0)).gradeLabel, 'Slight or no handicap');
  assert.equal(thi(totalling(18)).gradeLabel, 'Mild handicap');
  assert.equal(thi(totalling(38)).gradeLabel, 'Moderate handicap');
  assert.equal(thi(totalling(58)).gradeLabel, 'Severe handicap');
  assert.equal(thi(totalling(78)).gradeLabel, 'Catastrophic handicap');
});

test('the grades are attributed to their own source, not the questionnaire', () => {
  assert.match(thi(uniform(2)).bandText, /separate British working group published in 2001/);
});

// The withheld subscales.
test('no subscores are emitted, and the result says why', () => {
  const r = thi(uniform(4));
  assert.equal(r.subscalesReported, false);
  assert.equal(r.functional, undefined);
  assert.equal(r.emotional, undefined);
  assert.equal(r.catastrophic, undefined);
  assert.match(r.bandText, /deliberately not reported/);
  assert.match(r.bandText, /disagree on four items/);
});

test('the answer counts are reported', () => {
  const o = uniform(0);
  o.q1 = '4'; o.q2 = '4'; o.q3 = '2';
  const r = thi(o);
  assert.equal(r.yesCount, 2);
  assert.equal(r.sometimesCount, 1);
  assert.equal(r.total, 10);
});

// Input handling.
test('a missing item is refused and named', () => {
  const o = uniform(2);
  delete o.q13;
  const r = thi(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /q13/);
});

test('an out-of-scale item value is refused', () => {
  const o = uniform(2);
  o.q5 = '5';
  assert.equal(thi(o).valid, false);
});

test('the scope note separates handicap from the tinnitus itself and names the red flags', () => {
  const r = thi(uniform(4));
  assert.match(r.note, /neither a loudness match/);
  assert.match(r.note, /unilateral or pulsatile tinnitus/);
  assert.match(r.note, /does not select treatment/);
});
