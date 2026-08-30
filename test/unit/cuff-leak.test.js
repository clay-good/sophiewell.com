import test from 'node:test';
import assert from 'node:assert/strict';
import { cuffLeak as c, ABSOLUTE_ML, PERCENT_LOW, PERCENT_HIGH, STEROID_HOURS } from '../../lib/cuff-leak-v903.js';

test('cuff-leak: the published cutoffs', () => {
  assert.equal(ABSOLUTE_ML, 110);
  assert.equal(PERCENT_LOW, 10);
  assert.equal(PERCENT_HIGH, 15);
  assert.equal(STEROID_HOURS, 4);
});

test('cuff-leak: the leak is a difference, and the fraction follows the inspired volume', () => {
  const r = c({ inspiredMl: 500, expiredCuffDownMl: 450 });
  assert.equal(r.leakMl, 50);
  assert.equal(r.leakPercent, 10);
  assert.equal(c({ inspiredMl: 500, expiredCuffDownMl: 300 }).leakMl, 200);
  assert.equal(c({ inspiredMl: 500, expiredCuffDownMl: 300 }).leakPercent, 40);
});

test('cuff-leak: both cutoffs are reported, and disagreement is named', () => {
  // The same leak passes the absolute cutoff and fails the percentage one.
  const split = c({ inspiredMl: 1000, expiredCuffDownMl: 880 });
  assert.equal(split.leakMl, 120);
  assert.equal(split.failsAbsolute, false);
  assert.equal(split.failsPercentHigh, true);
  assert.equal(split.agreement, 'disagree');
  assert.match(split.thresholdNote, /disagree at this value/);
  assert.match(split.thresholdNote, /neither is offered here as the answer/);
  // And where they agree it still says both are reported because they do not always.
  const agree = c({ inspiredMl: 500, expiredCuffDownMl: 450 });
  assert.equal(agree.agreement, 'agree');
  assert.match(agree.thresholdNote, /They do not always/);
});

test('cuff-leak: who to test is said on every result', () => {
  // The reason the tile exists.
  assert.match(c({ inspiredMl: 500, expiredCuffDownMl: 450 }).whoToTestNote, /only in patients at high risk/);
  assert.match(c({ inspiredMl: 500, expiredCuffDownMl: 450 }).whoToTestNote, /high risk is not recorded here/);
  assert.match(c({ inspiredMl: 500, expiredCuffDownMl: 450, highRisk: true }).whoToTestNote, /which is the group the guideline recommends testing/);
});

test('cuff-leak: a failed test is not an instruction to keep the tube in', () => {
  assert.match(c({ inspiredMl: 500, expiredCuffDownMl: 450 }).failNote, /not an instruction to keep the tube in/);
  assert.match(c({ inspiredMl: 500, expiredCuffDownMl: 450 }).failNote, /at least 4 hours before extubation/);
  // A leak above both cutoffs has nothing to add.
  assert.equal(c({ inspiredMl: 500, expiredCuffDownMl: 300 }).failNote, null);
  assert.equal(c({ inspiredMl: 500, expiredCuffDownMl: 300 }).abnormal, false);
});

test('cuff-leak: the predictive-value and technique caveats are on every result', () => {
  for (const expired of [300, 450]) {
    assert.match(c({ inspiredMl: 500, expiredCuffDownMl: expired }).predictiveNote, /positive predictive value is poor/);
    assert.match(c({ inspiredMl: 500, expiredCuffDownMl: expired }).techniqueNote, /averaged over several breaths/);
    assert.match(c({ inspiredMl: 500, expiredCuffDownMl: expired }).scopeNote, /does not decide whether to extubate/);
  }
});

test('cuff-leak: an impossible measurement is refused with the likely cause', () => {
  const r = c({ inspiredMl: 300, expiredCuffDownMl: 500 });
  assert.equal(r.valid, false);
  assert.match(r.message, /cannot produce a leak/);
  assert.match(r.message, /which value went in which field/);
  // Both volumes are required.
  assert.equal(c({ inspiredMl: 500 }).valid, false);
  assert.equal(c({ expiredCuffDownMl: 450 }).valid, false);
  assert.equal(c({ inspiredMl: 2001, expiredCuffDownMl: 1 }).valid, false);
});

test('cuff-leak: the documented example', () => {
  const r = c({ inspiredMl: '500', expiredCuffDownMl: '450' });
  assert.equal(r.leakMl, 50);
  assert.equal(r.leakPercent, 10);
  assert.equal(r.abnormal, true);
});
