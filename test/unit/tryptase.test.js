import test from 'node:test';
import assert from 'node:assert/strict';
import { tryptase as t, MULTIPLIER, ADDEND_NG_ML, MASTOCYTOSIS_BASELINE } from '../../lib/tryptase-v894.js';

test('tryptase: the published rule', () => {
  assert.equal(MULTIPLIER, 1.2);
  assert.equal(ADDEND_NG_ML, 2);
  assert.equal(MASTOCYTOSIS_BASELINE, 20);
});

test('tryptase: the bar moves with the baseline', () => {
  // The reason the tile exists: same rule, different bar.
  assert.equal(t({ baselineTryptase: 5, acuteTryptase: 12 }).threshold, 8);
  assert.equal(t({ baselineTryptase: 25, acuteTryptase: 40 }).threshold, 32);
  assert.equal(t({ baselineTryptase: 5, acuteTryptase: 12 }).meets, true);
  assert.equal(t({ baselineTryptase: 25, acuteTryptase: 12 }).meets, false);
  // Strictly above, not at.
  assert.equal(t({ baselineTryptase: 5, acuteTryptase: 8 }).meets, false);
  assert.equal(t({ baselineTryptase: 5, acuteTryptase: 8.1 }).meets, true);
  assert.equal(t({ baselineTryptase: 5, acuteTryptase: 7 }).shortBy, 1);
});

test('tryptase: a normal-range acute value can meet the rule, and a raised one can fail it', () => {
  // Both halves of the point, with a laboratory range of roughly 1 to 11 ng/mL in mind.
  const lowMeets = t({ baselineTryptase: 2, acuteTryptase: 9 });
  assert.equal(lowMeets.meets, true);
  assert.equal(lowMeets.threshold, 4.4);
  const highFails = t({ baselineTryptase: 30, acuteTryptase: 35 });
  assert.equal(highFails.meets, false);
  for (const input of [lowMeets, highFails]) {
    assert.match(input.notAThresholdNote, /not a fixed threshold/);
    assert.match(input.notAThresholdNote, /inside the laboratory reference range can meet it/);
  }
});

test('tryptase: both levels are required, and the refusal says why', () => {
  assert.equal(t({ acuteTryptase: 12 }).valid, false);
  assert.equal(t({ baselineTryptase: 5 }).valid, false);
  assert.match(t({ acuteTryptase: 12 }).message, /neither value answers it alone/);
  assert.match(t({ baselineTryptase: 5, acuteTryptase: 12 }).singleValueNote, /Without a baseline there is no rule to apply/);
});

test('tryptase: a rise that does not meet the rule does not exclude anaphylaxis', () => {
  assert.match(t({ baselineTryptase: 5, acuteTryptase: 6 }).notExcludedNote, /does not exclude anaphylaxis/);
  assert.match(t({ baselineTryptase: 5, acuteTryptase: 6 }).notExcludedNote, /food-triggered reactions/);
  assert.equal(t({ baselineTryptase: 5, acuteTryptase: 12 }).notExcludedNote, null);
});

test('tryptase: a high baseline is flagged as a separate question', () => {
  assert.match(t({ baselineTryptase: 25, acuteTryptase: 40 }).baselineHighNote, /minor criterion for systemic mastocytosis/);
  assert.match(t({ baselineTryptase: 25, acuteTryptase: 40 }).baselineHighNote, /alpha-tryptasemia/);
  assert.equal(t({ baselineTryptase: 20, acuteTryptase: 40 }).baselineHighNote, null);
});

test('tryptase: the timing is stated on every result', () => {
  for (const acute of [6, 12]) {
    assert.match(t({ baselineTryptase: 5, acuteTryptase: acute }).timingNote, /thirty minutes to four hours/);
    assert.match(t({ baselineTryptase: 5, acuteTryptase: acute }).timingNote, /raises the bar/);
    assert.match(t({ baselineTryptase: 5, acuteTryptase: acute }).scopeNote, /does not diagnose anaphylaxis/);
  }
});

test('tryptase: out-of-range values are refused', () => {
  assert.equal(t({ baselineTryptase: -1, acuteTryptase: 12 }).valid, false);
  assert.equal(t({ baselineTryptase: 5, acuteTryptase: 2001 }).valid, false);
});

test('tryptase: the documented example', () => {
  const r = t({ acuteTryptase: '12', baselineTryptase: '5' });
  assert.equal(r.threshold, 8);
  assert.equal(r.meets, true);
});
