// spec-v552: the 22-item Sino-Nasal Outcome Test.
//
// The load-bearing tests are the two places a plausible implementation goes wrong: treating 0-7 as the mild
// band, and letting the "most important items" selection touch the total.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  snot22, SNOT22_ITEMS, SNOT22_OPTIONS, SNOT22_MAX, SNOT22_MCID, MOST_IMPORTANT_LIMIT,
} from '../../lib/snot22-v552.js';

const all = (v, extra = {}) => {
  const o = { ...extra };
  for (const item of SNOT22_ITEMS) o[item.key] = String(v);
  return o;
};
// Build an input summing to an exact total, by putting it all in the first items.
const totalling = (target, extra = {}) => {
  const o = { ...extra };
  let left = target;
  for (const item of SNOT22_ITEMS) {
    const points = Math.min(5, left);
    o[item.key] = String(points);
    left -= points;
  }
  return o;
};

test('there are exactly 22 items and 6 response options', () => {
  assert.equal(SNOT22_ITEMS.length, 22);
  assert.deepEqual(SNOT22_OPTIONS.map((o) => o.value), [0, 1, 2, 3, 4, 5]);
});

test('the maximum is 110 and the floor is 0', () => {
  assert.equal(SNOT22_MAX, 110);
  assert.equal(snot22(all(5)).total, 110);
  assert.equal(snot22(all(0)).total, 0);
});

// THE band trap.
test('a score below 8 is not mild and is flagged as having no named band', () => {
  for (const total of [0, 1, 7]) {
    const r = snot22(totalling(total));
    assert.equal(r.total, total);
    assert.equal(r.namedBand, false, `total ${total}`);
    assert.notEqual(r.band, 'Mild');
    assert.match(r.bandText, /NOT the mild band/);
  }
});

test('the band boundaries sit exactly where the source puts them', () => {
  assert.equal(snot22(totalling(7)).band, 'Below the mild threshold');
  assert.equal(snot22(totalling(8)).band, 'Mild');
  assert.equal(snot22(totalling(20)).band, 'Mild');
  assert.equal(snot22(totalling(21)).band, 'Moderate');
  assert.equal(snot22(totalling(50)).band, 'Moderate');
  assert.equal(snot22(totalling(51)).band, 'Severe');
  assert.equal(snot22(totalling(110)).band, 'Severe');
});

test('every named band reports that the bands are not part of the questionnaire', () => {
  for (const total of [10, 30, 70]) {
    assert.match(snot22(totalling(total)).bandText, /not part of the questionnaire/);
  }
});

// The most-important selection must never touch the total.
test('marking items most important does not change the total', () => {
  const bare = snot22(all(2));
  const marked = snot22(all(2, { mostImportant: ['cough', 'sad', 'fatigue'] }));
  assert.equal(marked.total, bare.total);
  assert.equal(marked.band, bare.band);
  assert.deepEqual(marked.mostImportant, ['cough', 'sad', 'fatigue']);
});

test('the most-important selection is capped at five and reports the truncation', () => {
  const keys = SNOT22_ITEMS.slice(0, 7).map((i) => i.key);
  const r = snot22(all(1, { mostImportant: keys }));
  assert.equal(r.mostImportant.length, MOST_IMPORTANT_LIMIT);
  assert.equal(r.mostImportantTruncated, true);
});

test('unknown keys in the most-important selection are dropped, not scored', () => {
  const r = snot22(all(1, { mostImportant: ['cough', 'not-an-item', ''] }));
  assert.deepEqual(r.mostImportant, ['cough']);
  assert.equal(r.total, 22);
});

test('a comma-separated string is accepted for the most-important selection', () => {
  const r = snot22(all(0, { mostImportant: 'cough, sad' }));
  assert.deepEqual(r.mostImportant, ['cough', 'sad']);
});

test('the band text mentions the not-scored rule only when items were marked', () => {
  assert.match(snot22(all(1, { mostImportant: ['cough'] })).bandText, /not summed, not weighted/);
  assert.doesNotMatch(snot22(all(1)).bandText, /not summed, not weighted/);
});

// The MCID belongs to a comparison.
test('the MCID is exposed and described as applying to a difference', () => {
  assert.equal(SNOT22_MCID, 8.9);
  const r = snot22(all(3));
  assert.equal(r.mcid, 8.9);
  assert.match(r.bandText, /DIFFERENCE between two SNOT-22 scores/);
});

test('the recall period is fixed at two weeks', () => {
  assert.match(snot22(all(0)).recallPeriod, /past two weeks/i);
});

// Input handling.
test('a missing item is refused and named', () => {
  const o = all(2);
  delete o.cough;
  const r = snot22(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /cough/);
});

test('an out-of-range or non-integer item is refused', () => {
  assert.equal(snot22(all(6)).valid, false);
  assert.equal(snot22({ ...all(2), cough: '-1' }).valid, false);
  assert.equal(snot22({ ...all(2), cough: '2.5' }).valid, false);
});

test('string answers are accepted', () => {
  assert.equal(snot22(all('4')).total, 88);
});

test('the scope note names the non-specific items and refuses to indicate surgery', () => {
  const r = snot22(all(4));
  assert.match(r.note, /not specific to the nose/);
  assert.match(r.note, /not an indication for surgery/);
  assert.match(r.note, /does not diagnose chronic rhinosinusitis/);
});
