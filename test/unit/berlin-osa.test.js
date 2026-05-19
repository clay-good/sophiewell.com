import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berlinOsa } from '../../lib/scoring-v4.js';

test('berlin-osa all no (tile example) -> LOW risk, 0 categories positive', () => {
  const r = berlinOsa({});
  assert.equal(r.positiveCount, 0);
  assert.equal(r.highRisk, false);
  assert.match(r.band, /LOW risk for obstructive sleep apnea/);
});

test('berlin-osa cat 1 alone with 2 yeses -> cat 1 positive, overall LOW', () => {
  const r = berlinOsa({ q1Snore: true, q2LouderThanTalking: true });
  assert.equal(r.cat1Yes, 2);
  assert.equal(r.cat1Positive, true);
  assert.equal(r.positiveCount, 1);
  assert.equal(r.highRisk, false);
});

test('berlin-osa cat 1 with 1 yes -> cat 1 not positive (below threshold)', () => {
  const r = berlinOsa({ q1Snore: true });
  assert.equal(r.cat1Yes, 1);
  assert.equal(r.cat1Positive, false);
});

test('berlin-osa cat 3 positive via hypertension alone', () => {
  const r = berlinOsa({ hasHypertension: true });
  assert.equal(r.cat3Positive, true);
  assert.equal(r.positiveCount, 1);
  assert.equal(r.highRisk, false);
});

test('berlin-osa cat 3 positive via BMI > 30 alone', () => {
  const r = berlinOsa({ bmiGt30: true });
  assert.equal(r.cat3Positive, true);
});

test('berlin-osa HTN + BMI both checked still one positive category', () => {
  const r = berlinOsa({ hasHypertension: true, bmiGt30: true });
  assert.equal(r.cat3Positive, true);
  assert.equal(r.positiveCount, 1);
  assert.equal(r.highRisk, false);
});

test('berlin-osa cat 1 + cat 3 positive -> HIGH risk', () => {
  const r = berlinOsa({
    q1Snore: true, q2LouderThanTalking: true,
    hasHypertension: true,
  });
  assert.equal(r.cat1Positive, true);
  assert.equal(r.cat3Positive, true);
  assert.equal(r.positiveCount, 2);
  assert.equal(r.highRisk, true);
  assert.match(r.band, /HIGH risk for obstructive sleep apnea/);
});

test('berlin-osa all yes -> 3 categories positive, HIGH risk', () => {
  const r = berlinOsa({
    q1Snore: true, q2LouderThanTalking: true, q3FreqAtLeast3to4PerWeek: true,
    q4BotheredOthers: true, q5ObservedApneaAtLeast3to4PerWeek: true,
    q6TiredAfterSleepAtLeast3to4PerWeek: true,
    q7TiredDuringDayAtLeast3to4PerWeek: true, q8NoddedOffWhileDriving: true,
    hasHypertension: true, bmiGt30: true,
  });
  assert.equal(r.cat1Yes, 5);
  assert.equal(r.cat2Yes, 3);
  assert.equal(r.positiveCount, 3);
  assert.equal(r.highRisk, true);
});

test('berlin-osa cat 2 with 2 yeses + cat 3 positive -> HIGH risk', () => {
  const r = berlinOsa({
    q6TiredAfterSleepAtLeast3to4PerWeek: true,
    q7TiredDuringDayAtLeast3to4PerWeek: true,
    bmiGt30: true,
  });
  assert.equal(r.cat2Yes, 2);
  assert.equal(r.cat2Positive, true);
  assert.equal(r.highRisk, true);
});
