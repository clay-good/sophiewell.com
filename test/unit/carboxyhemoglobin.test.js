import test from 'node:test';
import assert from 'node:assert/strict';
import { carboxyhemoglobin as cx, SEVERE_FEATURES } from '../../lib/carboxyhemoglobin-v865.js';

test('cohb: the baseline depends on whether they smoke', () => {
  assert.equal(cx({ level: 3 }).aboveBaseline, false);
  assert.equal(cx({ level: 3.1 }).aboveBaseline, true);
  assert.equal(cx({ level: 8 }).aboveBaseline, true);
  // The same 8 percent is within a smoker's baseline.
  assert.equal(cx({ level: 8, smoker: true }).aboveBaseline, false);
  assert.equal(cx({ level: 10, smoker: true }).aboveBaseline, false);
  assert.equal(cx({ level: 10.1, smoker: true }).aboveBaseline, true);
  assert.equal(cx({ level: 3 }).baseline, 3);
  assert.equal(cx({ level: 3, smoker: true }).baseline, 10);
});

test('cohb: the level is never presented as a severity grade', () => {
  // The reason the tile exists, on every result.
  for (const level of [1, 8, 24, 60]) {
    assert.match(cx({ level }).notSeverityNote, /does not grade it/);
    assert.match(cx({ level }).notSeverityNote, /does not correlate with the severity/);
  }
  // A high level with no features does not manufacture one.
  assert.equal(cx({ level: 40 }).featureCount, 0);
  assert.match(cx({ level: 40 }).featuresNote, /None of the features/);
});

test('cohb: the clinical features are what escalation rests on', () => {
  assert.equal(SEVERE_FEATURES.length, 5);
  for (const f of SEVERE_FEATURES) {
    const r = cx({ level: 5, [f.key]: true });
    assert.equal(r.featureCount, 1, f.key);
    assert.match(r.featuresNote, /not the number/);
  }
  const two = cx({ level: 5, unconscious: true, pregnant: true });
  assert.equal(two.featureCount, 2);
  assert.match(two.featuresNote, /^Features that drive the decision are present/);
  assert.match(cx({ level: 5, unconscious: true }).featuresNote, /^A feature that drives the decision is present/);
});

test('cohb: a level within baseline is abnormal when a feature is present', () => {
  // A modest level in someone who lost consciousness is still a serious poisoning.
  assert.equal(cx({ level: 2 }).abnormal, false);
  assert.equal(cx({ level: 2, unconscious: true }).abnormal, true);
});

test('cohb: a level within baseline is not an exclusion', () => {
  assert.match(cx({ level: 2 }).belowBaselineNote, /does not exclude poisoning/);
  assert.equal(cx({ level: 20 }).belowBaselineNote, null);
});

test('cohb: oxygen before the sample means the level understates the peak', () => {
  assert.match(cx({ level: 20, oxygen: 'high-flow' }).timingNote, /understates the peak/);
  assert.match(cx({ level: 20, oxygen: 'high-flow' }).timingNote, /60 to 90 minutes/);
  assert.match(cx({ level: 20, oxygen: 'hyperbaric' }).timingNote, /20 to 30 minutes/);
  assert.match(cx({ level: 20, oxygen: 'none' }).timingNote, /4 to 5 hours/);
  // Unstated is raised rather than passed over.
  assert.match(cx({ level: 20 }).timingNote, /was not entered/);
  assert.match(cx({ level: 20, oxygen: 'high-flow', hoursOnOxygen: 2 }).timingNote, /2 hours had passed/);
  assert.match(cx({ level: 20, oxygen: 'high-flow', hoursOnOxygen: 1 }).timingNote, /1 hour had passed/);
});

test('cohb: the pulse oximeter reads falsely normal, not falsely low', () => {
  // The opposite failure from methemoglobin, and the tile says so.
  assert.match(cx({ level: 30, spo2: 99 }).oximeterNote, /reading of 99 percent means nothing/);
  assert.match(cx({ level: 30, spo2: 99 }).oximeterNote, /normal or high/);
  assert.match(cx({ level: 30 }).oximeterNote, /Only co-oximetry measures this/);
  assert.match(cx({ level: 30 }).gasNote, /dissolved in plasma/);
});

test('cohb: oxygen comes before the level', () => {
  assert.match(cx({ level: 1 }).oxygenFirstNote, /without waiting for a level/);
});

test('cohb: a missing or implausible level is refused', () => {
  assert.equal(cx({}).valid, false);
  assert.match(cx({}).message, /co-oximetry/);
  assert.equal(cx({ level: -1 }).valid, false);
  assert.equal(cx({ level: 101 }).valid, false);
  assert.equal(cx({ level: 20, spo2: 120 }).valid, false);
  assert.equal(cx({ level: 20, hoursOnOxygen: -1 }).valid, false);
});

test('cohb: string input from the DOM behaves like numbers and checkboxes', () => {
  assert.equal(cx({ level: '8', smoker: 'true' }).aboveBaseline, false);
  assert.equal(cx({ level: '8', smoker: 'false' }).aboveBaseline, true);
  assert.equal(cx({ level: '8', unconscious: 'true' }).featureCount, 1);
});
