// spec-v587: the quick Pitt (qPitt) bacteremia score.
//
// The load-bearing tests are that fever scores nothing, that every item is worth the same, and that the
// mortality figure for 5 is the source's lumped one rather than an extrapolation.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  qPitt, ITEMS, QPITT_MAX, HIGH_RISK_THRESHOLD, TEMP_THRESHOLD_C, RR_THRESHOLD,
  PREDECESSOR_MAX, MORTALITY_BY_SCORE, DERIVATION_BELOW_THRESHOLD, DERIVATION_AT_OR_ABOVE_THRESHOLD,
} from '../../lib/qpitt-v587.js';

const NONE = Object.fromEntries(ITEMS.map((i) => [i.key, 'no']));
const at = (over = {}) => qPitt({ ...NONE, ...over });

test('there are five items each worth one point', () => {
  assert.equal(ITEMS.length, QPITT_MAX);
  assert.equal(QPITT_MAX, 5);
  for (const i of ITEMS) assert.equal(i.points, 1);
});

// THE inverted expectation.
test('the temperature item is hypothermia only and fever is not an input at all', () => {
  const temp = ITEMS.find((i) => i.key === 'hypothermia');
  assert.match(temp.text, new RegExp(`under ${TEMP_THRESHOLD_C} degrees C`));
  assert.match(temp.detail, /Fever scores nothing at all/);
  assert.equal(ITEMS.some((i) => /fever/i.test(i.text)), false, 'there is no fever item to answer');
  assert.match(at().bandText, /HYPOTHERMIA ONLY/);
  assert.match(at().bandText, /40\.5 degrees C scores the same as one at 37\.0/);
});

test('the missing-input message warns about the temperature item', () => {
  const r = qPitt({});
  assert.equal(r.valid, false);
  assert.match(r.message, /HYPOTHERMIA only - fever scores nothing/);
});

// THE flattened weighting.
test('cardiac arrest is worth exactly as much as a raised respiratory rate', () => {
  assert.equal(at({ cardiacArrest: 'yes' }).total, at({ respiratory: 'yes' }).total);
  assert.equal(at({ cardiacArrest: 'yes' }).band, at({ respiratory: 'yes' }).band);
  assert.match(at().bandText, new RegExp(`worth exactly as much as a respiratory rate of ${RR_THRESHOLD}`));
});

test('the predecessor is named as a different arithmetic over the same domains', () => {
  assert.equal(PREDECESSOR_MAX, 14);
  assert.notEqual(PREDECESSOR_MAX, QPITT_MAX);
  assert.match(at().bandText, /cannot be carried between the two/);
});

// THE low threshold.
test('the high-risk threshold is two of five', () => {
  assert.equal(HIGH_RISK_THRESHOLD, 2);
  assert.equal(at({ hypotension: 'yes' }).highRisk, false);
  assert.equal(at({ hypotension: 'yes', respiratory: 'yes' }).highRisk, true);
  assert.match(at().bandText, new RegExp(`${DERIVATION_BELOW_THRESHOLD} to ${DERIVATION_AT_OR_ABOVE_THRESHOLD} percent`));
});

test('any two items reach the threshold, whichever two', () => {
  const keys = ITEMS.map((i) => i.key);
  for (let a = 0; a < keys.length; a += 1) {
    for (let b = a + 1; b < keys.length; b += 1) {
      const r = at({ [keys[a]]: 'yes', [keys[b]]: 'yes' });
      assert.equal(r.total, 2, `${keys[a]} + ${keys[b]}`);
      assert.equal(r.highRisk, true);
    }
  }
});

// THE lumped top row.
test('a score of 5 carries the source-lumped figure for 4 or more', () => {
  const all = qPitt(Object.fromEntries(ITEMS.map((i) => [i.key, 'yes'])));
  assert.equal(all.total, QPITT_MAX);
  assert.equal(all.predictedMortalityPercent, MORTALITY_BY_SCORE[4]);
  assert.equal(all.mortalityFigureLumped, true);
  assert.match(all.bandText, /A score of 5 has NO figure of its own/);
});

test('scores below four carry their own figures and are not flagged as lumped', () => {
  for (const [score, expected] of [[0, 3], [1, 9], [2, 22], [3, 45]]) {
    const keys = ITEMS.slice(0, score).map((i) => i.key);
    const r = at(Object.fromEntries(keys.map((k) => [k, 'yes'])));
    assert.equal(r.total, score);
    assert.equal(r.predictedMortalityPercent, expected);
    assert.equal(r.mortalityFigureLumped, false, `score ${score}`);
  }
});

// Sourcing disclosure.
test('the diverging hypotension operator is disclosed on the item', () => {
  const bp = ITEMS.find((i) => i.key === 'hypotension');
  assert.match(bp.detail, /90 or below/);
  assert.match(bp.detail, /derivation reads below 90/);
});

// Input handling.
test('every item is required', () => {
  assert.equal(qPitt({ hypothermia: 'yes' }).valid, false);
  assert.match(qPitt({ ...NONE, cardiacArrest: 'maybe' }).message, /must be yes or no/);
});

test('the scope note refuses diagnosis and antibiotic selection', () => {
  const r = at();
  assert.match(r.note, /does not diagnose bacteremia/);
  assert.match(r.note, /NOT a reason to withhold or narrow empiric therapy/);
  assert.match(r.note, /not a sepsis screening tool/);
});
