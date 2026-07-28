// spec-v558: the Ocular Surface Disease Index.
//
// The load-bearing tests are the variable denominator, the fractional scores it produces, and the half-open
// interval bands that are the only rendering able to express them.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  osdi, OSDI_ITEMS, OSDI_SECTIONS, OSDI_OPTIONS, NOT_APPLICABLE,
  OSDI_MAX, OSDI_MULTIPLIER, MIN_DENOMINATOR,
} from '../../lib/osdi-v558.js';

const all = (v) => Object.fromEntries(OSDI_ITEMS.map((i) => [i.key, String(v)]));

test('there are 12 items in three sections, with 5 response levels', () => {
  assert.equal(OSDI_ITEMS.length, 12);
  assert.equal(OSDI_SECTIONS.length, 3);
  assert.deepEqual(OSDI_OPTIONS.map((o) => o.value), [4, 3, 2, 1, 0]);
});

test('only the second and third sections allow "not applicable"', () => {
  assert.equal(OSDI_SECTIONS[0].allowsNotApplicable, false);
  assert.equal(OSDI_SECTIONS[1].allowsNotApplicable, true);
  assert.equal(OSDI_SECTIONS[2].allowsNotApplicable, true);
  assert.equal(OSDI_ITEMS.filter((i) => i.allowsNotApplicable).length, 7);
});

test('the range is 0 to 100 at both ends', () => {
  assert.equal(osdi(all(0)).total, 0);
  assert.equal(osdi(all(4)).total, OSDI_MAX);
});

// THE variable denominator.
test('the divisor is the number answered, not 12', () => {
  const o = all(4);
  o.q6 = NOT_APPLICABLE; o.q7 = NOT_APPLICABLE;
  const r = osdi(o);
  assert.equal(r.questionsAnswered, 10);
  assert.equal(r.sum, 40);
  assert.equal(r.total, (40 * OSDI_MULTIPLIER) / 10);
  assert.deepEqual(r.notApplicable, ['q6', 'q7']);
});

test('not-applicable answers leave the score at the ceiling rather than lowering it', () => {
  const o = all(4);
  for (const item of OSDI_ITEMS.filter((i) => i.allowsNotApplicable)) o[item.key] = NOT_APPLICABLE;
  const r = osdi(o);
  assert.equal(r.questionsAnswered, MIN_DENOMINATOR);
  assert.equal(r.sum, 20);
  assert.equal(r.total, 100);
});

test('the score is fractional in the ordinary case', () => {
  const o = all(0);
  o.q1 = '4'; o.q2 = '1'; // sum 5 over 12 answered
  const r = osdi(o);
  assert.equal(r.sum, 5);
  assert.equal(r.questionsAnswered, 12);
  assert.equal(r.total, 10.4);
  assert.notEqual(r.total, Math.round(r.total));
});

// THE band rendering.
test('the half-open interval boundaries sit where the source puts them', () => {
  const at = (target) => {
    // 12 answered: total = sum * 25 / 12, so sum = target * 12 / 25
    const o = all(0);
    let left = Math.round((target * 12) / OSDI_MULTIPLIER);
    for (const item of OSDI_ITEMS) {
      const give = Math.min(4, left);
      o[item.key] = String(give);
      left -= give;
    }
    return osdi(o);
  };
  assert.equal(at(0).band, 'Normal');
  assert.equal(at(12.5).band, 'Normal');
  assert.equal(at(25).band, 'Moderate');
  assert.equal(at(50).band, 'Severe');
});

test('a fractional score that the integer rendering cannot band is still banded here', () => {
  const o = all(0);
  o.q1 = '4'; o.q2 = '2'; // sum 6 over 12 = 12.5
  const r = osdi(o);
  assert.equal(r.total, 12.5);
  assert.equal(r.band, 'Normal');
});

test('the result explains why the interval form is used', () => {
  const r = osdi(all(1));
  assert.match(r.bandText, /half-open intervals/);
  assert.match(r.bandText, /leaves a fractional score such as 12\.5 or 22\.7 in no band/);
});

test('the bands are attributed to the secondary literature, not the instrument', () => {
  assert.match(osdi(all(1)).bandText, /encodes its severity bands graphically and prints no numeric cut points/);
});

// Input handling.
test('"not applicable" on items 1 to 5 is refused', () => {
  const o = all(2);
  o.q3 = NOT_APPLICABLE;
  const r = osdi(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /cannot be answered "not applicable"/);
  assert.match(r.message, /q3/);
});

test('"not applicable" on items 6 to 12 is accepted', () => {
  const o = all(2);
  o.q9 = NOT_APPLICABLE;
  assert.equal(osdi(o).valid, true);
});

test('a missing item is refused and named', () => {
  const o = all(2);
  delete o.q11;
  const r = osdi(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /q11/);
});

test('an out-of-range item is refused', () => {
  const o = all(2);
  o.q1 = '5';
  assert.equal(osdi(o).valid, false);
});

test('the denominator can never fall below five, so division by zero cannot occur', () => {
  const o = all(0);
  for (const item of OSDI_ITEMS.filter((i) => i.allowsNotApplicable)) o[item.key] = NOT_APPLICABLE;
  const r = osdi(o);
  assert.equal(r.valid, true);
  assert.equal(r.questionsAnswered, MIN_DENOMINATOR);
  assert.equal(r.total, 0);
});

test('the scope note separates symptoms from signs and names the red flags', () => {
  const r = osdi(all(3));
  assert.match(r.note, /does not diagnose dry eye disease/);
  assert.match(r.note, /correlate poorly/);
  assert.match(r.note, /pain with photophobia/);
});
