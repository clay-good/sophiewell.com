import test from 'node:test';
import assert from 'node:assert/strict';
import { cancerCachexia as c, WEIGHT_LOSS_MAIN, WEIGHT_LOSS_SECONDARY, BMI_LOW } from '../../lib/cancer-cachexia-v879.js';

test('cancer-cachexia: the published thresholds', () => {
  assert.equal(WEIGHT_LOSS_MAIN, 5);
  assert.equal(WEIGHT_LOSS_SECONDARY, 2);
  assert.equal(BMI_LOW, 20);
});

test('cancer-cachexia: any one of the three routes is enough', () => {
  assert.equal(c({ weightLossPercent: 6 }).stage, 'cachexia');
  assert.equal(c({ weightLossPercent: 3, bmi: 19 }).stage, 'cachexia');
  assert.equal(c({ weightLossPercent: 3, sarcopenia: true }).stage, 'cachexia');
  // Each threshold is strict.
  assert.equal(c({ weightLossPercent: 5 }).stage, 'not-met');
  assert.equal(c({ weightLossPercent: 2, bmi: 19 }).stage, 'not-met');
  assert.equal(c({ weightLossPercent: 3, bmi: 20 }).stage, 'not-met');
});

test('cancer-cachexia: the body mass index moves the threshold', () => {
  // The reason the tile exists: the same weight loss, two answers.
  assert.equal(c({ weightLossPercent: 3, bmi: 19 }).meetsCachexia, true);
  assert.equal(c({ weightLossPercent: 3, bmi: 30 }).meetsCachexia, false);
  for (const input of [{}, { weightLossPercent: 6 }, { weightLossPercent: 3, bmi: 30 }]) {
    assert.match(c(input).bmiNote, /body mass index changes the threshold/);
    assert.match(c(input).bmiNote, /percentage alone never answers the question/);
  }
});

test('cancer-cachexia: a 2 to 5 percent loss with no BMI says the answer is missing', () => {
  const r = c({ weightLossPercent: 3 });
  assert.equal(r.stage, 'not-met');
  assert.match(r.bmiMissingNote, /turns on the body mass index/);
  // Outside that window there is nothing to say.
  assert.equal(c({ weightLossPercent: 6 }).bmiMissingNote, null);
  assert.equal(c({ weightLossPercent: 1 }).bmiMissingNote, null);
  assert.equal(c({ weightLossPercent: 3, bmi: 30 }).bmiMissingNote, null);
});

test('cancer-cachexia: precachexia needs anorexia and a loss at or below 5 percent', () => {
  assert.equal(c({ weightLossPercent: 3, bmi: 30, anorexiaOrMetabolicChange: true }).stage, 'precachexia');
  // Without the anorexia it is simply not met.
  assert.equal(c({ weightLossPercent: 3, bmi: 30 }).stage, 'not-met');
  // And once a route to cachexia is met, precachexia is not the answer.
  assert.equal(c({ weightLossPercent: 6, anorexiaOrMetabolicChange: true }).stage, 'cachexia');
});

test('cancer-cachexia: refractory needs all three features AND the definition met', () => {
  const cachectic = { weightLossPercent: 8 };
  const three = { cancerNotResponsive: true, performanceStatusThreeOrFour: true, survivalUnderThreeMonths: true };
  assert.equal(c({ ...cachectic, ...three }).stage, 'refractory');
  // Two of three is not the stage, and the tile says so.
  const two = c({ ...cachectic, cancerNotResponsive: true, performanceStatusThreeOrFour: true });
  assert.equal(two.stage, 'cachexia');
  assert.match(two.refractoryNote, /Not all three are recorded/);
  // All three without the definition met is not a shortcut into it.
  const noWeight = c(three);
  assert.equal(noWeight.stage, 'not-met');
  assert.match(noWeight.refractoryNote, /a stage of cachexia, not a substitute for it/);
});

test('cancer-cachexia: the two consensus statements print on every result', () => {
  for (const input of [{}, { weightLossPercent: 6 }, { weightLossPercent: 3, bmi: 19 }]) {
    assert.match(c(input).irreversibilityNote, /not fully reversible by nutritional support/);
    assert.match(c(input).refractoryMeaningNote, /not by the weight loss/);
    assert.match(c(input).scopeNote, /does not decide nutritional or oncologic treatment/);
  }
});

test('cancer-cachexia: out-of-range values are rejected', () => {
  assert.equal(c({ weightLossPercent: 101 }).valid, false);
  assert.equal(c({ bmi: 4 }).valid, false);
  assert.equal(c({ bmi: 101 }).valid, false);
  assert.equal(c({ weightLossPercent: 'abc' }).weightLossPercent, null);
});

test('cancer-cachexia: the documented example', () => {
  const r = c({ weightLossPercent: '3', bmi: '19' });
  assert.equal(r.stage, 'cachexia');
  assert.equal(r.routes.length, 1);
  assert.match(r.band, /body mass index of 19, below 20/);
});
