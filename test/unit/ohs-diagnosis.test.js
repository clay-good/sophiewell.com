import test from 'node:test';
import assert from 'node:assert/strict';
import { ohsDiagnosis as ohs, BMI_THRESHOLD, PACO2_THRESHOLD, BICARB_THRESHOLD } from '../../lib/ohs-diagnosis-v829.js';

const met = { bmi: 38, sleepDisorderedBreathing: true, paco2: 50, otherCausesExcluded: true };

test('ohs: all four criteria are required', () => {
  assert.equal(ohs(met).diagnosis, true);
  assert.equal(ohs({ ...met, bmi: 28 }).diagnosis, false);
  assert.equal(ohs({ ...met, sleepDisorderedBreathing: false }).diagnosis, false);
  assert.equal(ohs({ ...met, paco2: 40 }).diagnosis, false);
  assert.equal(ohs({ ...met, otherCausesExcluded: false }).diagnosis, false);
});

test('ohs: the thresholds are at-or-above', () => {
  assert.equal(BMI_THRESHOLD, 30);
  assert.equal(PACO2_THRESHOLD, 45);
  assert.equal(ohs({ ...met, bmi: 30 }).criteria.obesity, true);
  assert.equal(ohs({ ...met, bmi: 29.9 }).criteria.obesity, false);
  assert.equal(ohs({ ...met, paco2: 45 }).criteria.hypercapnia, true);
  assert.equal(ohs({ ...met, paco2: 44 }).criteria.hypercapnia, false);
});

test('ohs: a low bicarbonate defers the blood gas ONLY at low to moderate probability', () => {
  const lowProb = ohs({ bmi: 35, bicarbonate: 24 });
  assert.equal(lowProb.screening, 'blood gas can be deferred');
  assert.equal(lowProb.highProbability, false);

  // Above the guideline's BMI 30-40 example, the rule does not apply.
  const byBmi = ohs({ bmi: 52, bicarbonate: 24 });
  assert.equal(byBmi.highProbability, true);
  assert.equal(byBmi.screening, 'blood gas still indicated');
  assert.ok(byBmi.screeningNote.includes('does not rule the syndrome out'));

  // Or when high probability is flagged for another reason.
  const flagged = ohs({ bmi: 35, bicarbonate: 24, highProbability: true });
  assert.equal(flagged.screening, 'blood gas still indicated');
});

test('ohs: a bicarbonate at or above 27 prompts a PaCO2 and is not a diagnosis', () => {
  assert.equal(BICARB_THRESHOLD, 27);
  const r = ohs({ bmi: 35, bicarbonate: 27 });
  assert.equal(r.screening, 'measure the PaCO2');
  assert.equal(r.diagnosis, false);
  assert.ok(r.screeningNote.includes('not itself a diagnosis'));
  assert.equal(ohs({ bmi: 35, bicarbonate: 26.9 }).screening, 'blood gas can be deferred');
});

test('ohs: the screening rule is silent once a PaCO2 exists', () => {
  // Bicarbonate decides whether to measure the gas. With the gas in hand it has no role.
  const r = ohs({ ...met, bicarbonate: 24 });
  assert.equal(r.screening, null);
  assert.equal(r.screeningNote, null);
  assert.equal(r.diagnosis, true);
});

test('ohs: empty and out-of-range input', () => {
  const empty = ohs({});
  assert.equal(empty.valid, true);
  assert.equal(empty.diagnosis, false);
  assert.equal(empty.screening, null);
  assert.equal(ohs({ bmi: 1e308 }).valid, false);
  assert.equal(ohs({ paco2: -1 }).valid, false);
  assert.equal(ohs({ bicarbonate: 500 }).valid, false);
  assert.equal(ohs().valid, true);
  assert.doesNotMatch(JSON.stringify(ohs(met)), /NaN|Infinity/);
});
