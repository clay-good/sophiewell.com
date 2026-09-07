// spec-v123 2.3: Barnes Akathisia Rating Scale (Barnes 1989). Objective +
// subjective awareness + subjective distress each 0-3 (sum 0-9); global 0-5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barsAkathisia } from '../../lib/psych-v123.js';

// spec-v1110: an examination in which every item was rated and nothing found.
// This assertion used to pass NOTHING and read four blank ratings as four
// findings of "absent", which is the defect that wave fixed.
test('all absent -> global 0, not flagged', () => {
  const r = barsAkathisia({ objective: '0', awareness: '0', distress: '0', global: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.global, 0);
  assert.equal(r.subtotal, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /absent/);
});

test('spec-v1110: an unrated scale states no verdict', () => {
  // The Barnes verdict IS the global rating, not a total, so there is no floor
  // to disclose -- without it there is no reading.
  const r = barsAkathisia({});
  assert.equal(r.valid, true);
  assert.equal(r.global, null);
  assert.equal(r.subtotal, null);
  assert.equal(r.abnormal, false);
  assert.doesNotMatch(r.band, /absent/);
  assert.match(r.band, /global clinical assessment of akathisia \(0 to 5\) is needed/);
  assert.match(r.counted, /objective not rated/);
});

test('spec-v1110: the three item ratings do not stand in for the global one', () => {
  const r = barsAkathisia({ objective: '3', awareness: '3', distress: '3' });
  assert.equal(r.global, null);
  assert.equal(r.subtotal, 9);
  assert.match(r.band, /there is no reading without it/);
});

test('global 1 (questionable) is below the mild flag', () => {
  const r = barsAkathisia({ global: '1' });
  assert.equal(r.global, 1);
  assert.equal(r.abnormal, false);
});

test('global rating step: moderate akathisia with subtotal', () => {
  const r = barsAkathisia({ objective: '2', awareness: '2', distress: '1', global: '3' });
  assert.equal(r.subtotal, 5);
  assert.equal(r.global, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /moderate akathisia/);
});

test('global 5 -> severe akathisia', () => {
  assert.match(barsAkathisia({ global: '5' }).band, /severe akathisia/);
});

test('subtotal caps at 9', () => {
  assert.equal(barsAkathisia({ objective: '3', awareness: '3', distress: '3' }).subtotal, 9);
});

test('scalar / non-object fuzz arg yields a surfaced refusal, never NaN', () => {
  const r = barsAkathisia(9);
  assert.equal(r.valid, true);
  // spec-v1110: nothing was rated, so global and subtotal are null rather than
  // zeros -- and neither is NaN.
  assert.equal(r.global, null);
  assert.equal(r.subtotal, null);
  assert.doesNotMatch(JSON.stringify(r), /NaN|Infinity/);
});
