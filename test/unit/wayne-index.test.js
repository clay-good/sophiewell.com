// spec-v527: the Wayne index for the clinical diagnosis of thyrotoxicosis.
// Worked-example tests: every negative weight (the thing implementations get wrong), the three-way items,
// the pulse bands, both band edges at exactly 11 and exactly 19, the derived range, and the guards. Items
// and signed weights transcribed from Crooks, Murray and Wayne 1959 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  wayneIndex, WAYNE_ITEMS, WAYNE_SYMPTOMS, WAYNE_SIGNS, WAYNE_RANGE,
} from '../../lib/wayne-index-v527.js';

// The most euthyroid-looking patient the table allows: every negative option chosen.
function floorAnswers() {
  const a = {};
  for (const item of WAYNE_ITEMS) {
    a[item.key] = item.options.reduce((lo, o) => (o[2] < lo[2] ? o : lo))[0];
  }
  return a;
}
function ceilingAnswers() {
  const a = {};
  for (const item of WAYNE_ITEMS) {
    a[item.key] = item.options.reduce((hi, o) => (o[2] > hi[2] ? o : hi))[0];
  }
  return a;
}
// The "nothing found" exam: every symptom absent or unchanged, every sign absent, pulse 80-90.
// This is NOT a zero score -- see the baseline test below.
function neutral(over = {}) {
  return {
    dyspnea: 'no', palpitations: 'no', tiredness: 'no', temperature: 'neither', sweating: 'no',
    nervousness: 'no', appetite: 'unchanged', weight: 'unchanged',
    thyroid: 'no', bruit: 'no', exophthalmos: 'no', lidRetraction: 'no', lidLag: 'no',
    hyperkinesis: 'no', handsHot: 'no', handsMoist: 'no', af: 'no', pulse: '80to90',
    ...over,
  };
}
const BASELINE = -10;

// Every symptom at its most thyrotoxic option: +21 over baseline.
const ALL_SYMPTOMS = {
  dyspnea: 'yes', palpitations: 'yes', tiredness: 'yes', temperature: 'cold', sweating: 'yes',
  nervousness: 'yes', appetite: 'increased', weight: 'decreased',
};

test('eight symptoms and ten signs, eighteen items in all', () => {
  assert.equal(WAYNE_SYMPTOMS.length, 8);
  assert.equal(WAYNE_SIGNS.length, 10);
  assert.equal(WAYNE_ITEMS.length, 18);
});

test('there is no tremor item', () => {
  assert.ok(!WAYNE_ITEMS.some((i) => /tremor/i.test(i.text)));
});

test('every negative weight is carried, not flattened to zero', () => {
  const expected = {
    temperature: -5,   // prefers heat
    appetite: -3,      // decreased
    weight: -3,        // increased
    thyroid: -3,       // absent palpable thyroid
    bruit: -2,
    hyperkinesis: -2,  // absent
    handsHot: -2,
    handsMoist: -1,
    pulse: -3,         // below 80
  };
  for (const [key, points] of Object.entries(expected)) {
    const item = WAYNE_ITEMS.find((i) => i.key === key);
    const min = Math.min(...item.options.map((o) => o[2]));
    assert.equal(min, points, `${key} should bottom out at ${points}`);
  }
});

test('the three-way items are three-way, with opposite-signed alternatives', () => {
  for (const key of ['temperature', 'appetite', 'weight']) {
    const item = WAYNE_ITEMS.find((i) => i.key === key);
    assert.equal(item.options.length, 3, `${key} must offer three options`);
    const points = item.options.map((o) => o[2]);
    assert.ok(Math.min(...points) < 0 && Math.max(...points) > 0, `${key} must have both signs`);
  }
});

test('an exam with nothing found scores -10, not 0', () => {
  // Five sign items score negatively when ABSENT (thyroid -3, bruit -2, hyperkinesis -2, hands hot -2,
  // hands moist -1), so the instrument has no all-zero state. This is a real property of the table.
  const r = wayneIndex(neutral());
  assert.equal(r.valid, true);
  assert.equal(r.total, BASELINE);
  assert.equal(r.symptomTotal, 0);
  assert.equal(r.signTotal, BASELINE);
  assert.equal(r.reading, 'euthyroid');
});

test('the casual pulse is one item with three bands', () => {
  const pulse = WAYNE_ITEMS.find((i) => i.key === 'pulse');
  assert.deepEqual(pulse.options.map((o) => o[2]), [-3, 0, 3]);
  assert.equal(wayneIndex(neutral({ pulse: 'under80' })).total, BASELINE - 3);
  assert.equal(wayneIndex(neutral({ pulse: '80to90' })).total, BASELINE);
  assert.equal(wayneIndex(neutral({ pulse: 'over90' })).total, BASELINE + 3);
});

test('the range is derived from the table, not asserted', () => {
  const lo = wayneIndex(floorAnswers());
  const hi = wayneIndex(ceilingAnswers());
  assert.equal(lo.total, WAYNE_RANGE.min);
  assert.equal(hi.total, WAYNE_RANGE.max);
  // Sanity: the floor really is negative and the ceiling really is well above the toxic cut.
  assert.ok(WAYNE_RANGE.min < 0);
  assert.ok(WAYNE_RANGE.max > 19);
});

test('the band edges sit at exactly 11 and exactly 19', () => {
  // Every symptom present is +21 over the -10 baseline, landing exactly on 11: the bottom of equivocal.
  const eleven = wayneIndex(neutral(ALL_SYMPTOMS));
  assert.equal(eleven.total, 11);
  assert.equal(eleven.reading, 'equivocal');

  // Drop the +1 dyspnea and it is 10: euthyroid.
  const ten = wayneIndex(neutral({ ...ALL_SYMPTOMS, dyspnea: 'no' }));
  assert.equal(ten.total, 10);
  assert.equal(ten.reading, 'euthyroid');

  // Add atrial fibrillation (+4) and a thyroid bruit (absent -2 to present +2, a swing of +4): exactly 19,
  // still equivocal, because the toxic band starts ABOVE 19.
  const nineteen = wayneIndex(neutral({ ...ALL_SYMPTOMS, af: 'yes', bruit: 'yes' }));
  assert.equal(nineteen.total, 19);
  assert.equal(nineteen.reading, 'equivocal');

  // One point more is toxic.
  const twenty = wayneIndex(neutral({ ...ALL_SYMPTOMS, af: 'yes', exophthalmos: 'yes', pulse: 'over90' }));
  assert.equal(twenty.total, 20);
  assert.equal(twenty.reading, 'toxic');
});

test('a classically toxic patient scores in the toxic range (the META example)', () => {
  const r = wayneIndex({
    dyspnea: 'yes', palpitations: 'yes', tiredness: 'yes', temperature: 'cold', sweating: 'yes',
    nervousness: 'yes', appetite: 'increased', weight: 'decreased',
    thyroid: 'yes', bruit: 'yes', exophthalmos: 'yes', lidRetraction: 'yes', lidLag: 'yes',
    hyperkinesis: 'yes', handsHot: 'yes', handsMoist: 'yes', af: 'no', pulse: 'over90',
  });
  assert.equal(r.valid, true);
  assert.equal(r.symptomTotal, 21);
  assert.equal(r.signTotal, 20); // 3+2+2+2+1+4+2+1+0+3
  assert.equal(r.total, 41);
  assert.equal(r.reading, 'toxic');
});

test('flattening absent findings to zero would inflate the total, which the negatives prevent', () => {
  const r = wayneIndex(neutral({ pulse: 'under80', temperature: 'heat' }));
  // thyroid -3, bruit -2, hyperkinesis -2, hands hot -2, hands moist -1, pulse -3, prefers heat -5.
  assert.equal(r.negativePoints, -18);
  assert.equal(r.total, -18);
  assert.equal(r.reading, 'euthyroid');
  // An implementation that scored absent findings as 0 would have returned 0 here -- 18 points higher, and
  // 18 points is most of the way from euthyroid to equivocal.
  assert.ok(r.total < BASELINE);
});

test('the copy places the index historically and refuses the lab reading', () => {
  const r = wayneIndex(neutral());
  assert.match(r.note, /before sensitive TSH assays existed/);
  assert.match(r.note, /not a substitute for TSH and free T4/);
  assert.match(r.note, /does not identify the cause/);
  assert.match(r.band, /not a thyroid function test/);
});

test('a missing or unrecognized answer is invalid and names the item', () => {
  assert.equal(wayneIndex({}).valid, false);
  const partial = neutral();
  delete partial.pulse;
  const r = wayneIndex(partial);
  assert.equal(r.valid, false);
  assert.match(r.message, /Casual pulse rate/);

  const bogus = wayneIndex(neutral({ temperature: 'lukewarm' }));
  assert.equal(bogus.valid, false);
  assert.match(bogus.message, /Temperature preference/);
});
