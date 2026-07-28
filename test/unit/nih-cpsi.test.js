// spec-v566: the NIH Chronic Prostatitis Symptom Index.
//
// The load-bearing tests are the 9-questions/13-items reconciliation, the heterogeneous item ranges (one
// item is worth ten yes/no items), and the fact that the bands are not from the original paper.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nihCpsi, CPSI_ITEMS, SUBSCALE_MAXIMA, CPSI_MAX, MGUPI_MAX,
  NUMBERED_QUESTIONS, SCORED_ITEMS,
} from '../../lib/nih-cpsi-v566.js';

const zero = () => Object.fromEntries(CPSI_ITEMS.map((i) => [i.key, '0']));
const maxed = () => Object.fromEntries(CPSI_ITEMS.map((i) => [i.key, String(Math.max(...i.options.map((o) => o.value)))]));

test('nine numbered questions and thirteen scored items both hold', () => {
  assert.equal(SCORED_ITEMS, 13);
  assert.equal(CPSI_ITEMS.length, SCORED_ITEMS);
  assert.equal(NUMBERED_QUESTIONS, 9);
  const questions = new Set(CPSI_ITEMS.map((i) => i.question.replace(/[a-d]$/, '')));
  assert.equal(questions.size, NUMBERED_QUESTIONS);
});

test('the subscale maxima and total are the published ones', () => {
  assert.deepEqual(SUBSCALE_MAXIMA, { pain: 21, urinary: 10, qol: 12 });
  assert.equal(CPSI_MAX, 43);
  assert.equal(SUBSCALE_MAXIMA.pain + SUBSCALE_MAXIMA.urinary + SUBSCALE_MAXIMA.qol, CPSI_MAX);
});

test('the extremes are 0 and 43', () => {
  assert.equal(nihCpsi(zero()).total, 0);
  const top = nihCpsi(maxed());
  assert.equal(top.total, CPSI_MAX);
  assert.equal(top.pain, SUBSCALE_MAXIMA.pain);
  assert.equal(top.urinary, SUBSCALE_MAXIMA.urinary);
  assert.equal(top.qol, SUBSCALE_MAXIMA.qol);
});

// THE heterogeneity.
test('the item ranges are heterogeneous in exactly the published distribution', () => {
  const spread = {};
  for (const item of CPSI_ITEMS) {
    const max = Math.max(...item.options.map((o) => o.value));
    spread[max] = (spread[max] || 0) + 1;
  }
  assert.deepEqual(spread, { 1: 6, 3: 2, 5: 3, 6: 1, 10: 1 });
});

test('the average-pain item is worth ten times a yes/no item', () => {
  const base = zero();
  const withPain = { ...base, q4: '10' };
  const withYesNo = { ...base, q1a: '1' };
  assert.equal(nihCpsi(withPain).total, 10);
  assert.equal(nihCpsi(withYesNo).total, 1);
});

test('the result warns that the items are not comparable', () => {
  assert.match(nihCpsi(zero()).bandText, /worth ten times any one yes\/no item/);
});

// Subscale assignment.
test('items are assigned to the published subscales', () => {
  const keysIn = (s) => CPSI_ITEMS.filter((i) => i.subscale === s).map((i) => i.key);
  assert.deepEqual(keysIn('pain'), ['q1a', 'q1b', 'q1c', 'q1d', 'q2a', 'q2b', 'q3', 'q4']);
  assert.deepEqual(keysIn('urinary'), ['q5', 'q6']);
  assert.deepEqual(keysIn('qol'), ['q7', 'q8', 'q9']);
});

// Bands and their provenance.
test('the band boundaries are the later-cohort ones', () => {
  const at = (target) => {
    const o = zero();
    o.q4 = String(Math.min(10, target));
    let left = target - Number(o.q4);
    for (const item of CPSI_ITEMS) {
      if (item.key === 'q4' || left <= 0) continue;
      const max = Math.max(...item.options.map((x) => x.value));
      const give = Math.min(max, left);
      o[item.key] = String(give);
      left -= give;
    }
    return nihCpsi(o);
  };
  assert.equal(at(0).band, 'Mild');
  assert.equal(at(14).band, 'Mild');
  assert.equal(at(15).band, 'Moderate');
  assert.equal(at(29).band, 'Moderate');
  assert.equal(at(30).band, 'Severe');
  assert.equal(at(43).band, 'Severe');
});

test('the bands are attributed to a later cohort, not the development paper', () => {
  assert.match(nihCpsi(zero()).bandText, /NOT from the development paper, which published none/);
});

// The variant.
test('the MGUPI variant is named and its total differs', () => {
  assert.equal(MGUPI_MAX, 45);
  assert.notEqual(MGUPI_MAX, CPSI_MAX);
  assert.match(nihCpsi(zero()).bandText, /DIFFERENT instrument/);
});

// The conditional item.
test('no pain frequency with a positive pain rating is flagged, not silently accepted', () => {
  const o = zero();
  o.q3 = '0';
  o.q4 = '7';
  const r = nihCpsi(o);
  assert.equal(r.valid, true);
  assert.equal(r.painFrequencyConflict, true);
  assert.equal(r.total, 7, 'the score still stands as the instrument computes it');
  assert.match(r.bandText, /the two answers disagree/);
});

test('a consistent pair raises no conflict', () => {
  const o = zero();
  o.q3 = '3';
  o.q4 = '7';
  assert.equal(nihCpsi(o).painFrequencyConflict, false);
  const none = zero();
  assert.equal(nihCpsi(none).painFrequencyConflict, false);
});

// Question 9.
test('the satisfaction ladder runs 0 to 6 with a non-midpoint neutral', () => {
  const q9 = CPSI_ITEMS.find((i) => i.key === 'q9');
  assert.equal(Math.max(...q9.options.map((o) => o.value)), 6);
  assert.match(q9.options.find((o) => o.value === 3).text, /Mixed/);
  assert.equal(q9.options[0].text, 'Delighted');
});

// Input handling.
test('a missing item is refused and named', () => {
  const o = zero();
  delete o.q6;
  const r = nihCpsi(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /q6/);
});

test('a value outside an item’s own range is refused', () => {
  const o = zero();
  o.q1a = '2';
  assert.equal(nihCpsi(o).valid, false);
  const p = zero();
  p.q7 = '4';
  assert.equal(nihCpsi(p).valid, false);
});

test('the scope note refuses to diagnose or indicate antibiotics', () => {
  const r = nihCpsi(maxed());
  assert.match(r.note, /does not diagnose chronic prostatitis/);
  assert.match(r.note, /not by itself an indication for antibiotics/);
  assert.match(r.note, /bladder pain syndrome/);
});
