import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cssrs } from '../../lib/scoring-v4.js';

const none = {
  wishDead: false, thoughtsKilling: false, thoughtsMethods: false,
  someIntent: false, planIntent: false,
  behaviorLifetime: false, behaviorPast3Months: false,
};

test('cssrs all-no (tile example) -> no risk reported', () => {
  const r = cssrs(none);
  assert.equal(r.band, 'no risk reported');
  assert.match(r.text, /Posner 2011/);
});

test('cssrs Q1 alone (wish dead) -> low risk', () => {
  const r = cssrs({ ...none, wishDead: true });
  assert.equal(r.band, 'low risk');
  assert.match(r.text, /988/);
});

test('cssrs Q2 alone (thoughts killing) -> low risk', () => {
  const r = cssrs({ ...none, thoughtsKilling: true });
  assert.equal(r.band, 'low risk');
});

test('cssrs Q3 (methods) -> moderate risk', () => {
  const r = cssrs({ ...none, thoughtsMethods: true });
  assert.equal(r.band, 'moderate risk');
  assert.match(r.text, /safety planning/);
});

test('cssrs Q4 (some intent) -> high risk', () => {
  const r = cssrs({ ...none, someIntent: true });
  assert.equal(r.band, 'high risk');
  assert.match(r.text, /psychiatry evaluation now/);
});

test('cssrs Q5 (plan + intent) -> high risk', () => {
  const r = cssrs({ ...none, planIntent: true });
  assert.equal(r.band, 'high risk');
});

test('cssrs Q6 lifetime not in 3 months -> moderate risk', () => {
  const r = cssrs({ ...none, behaviorLifetime: true });
  assert.equal(r.band, 'moderate risk');
});

test('cssrs Q6 + Q6a (behavior in past 3 months) -> high risk', () => {
  const r = cssrs({ ...none, behaviorLifetime: true, behaviorPast3Months: true });
  assert.equal(r.band, 'high risk');
});

test('cssrs Q1-Q3 escalation: low -> moderate when Q3 added', () => {
  const lowResult = cssrs({ ...none, wishDead: true, thoughtsKilling: true });
  assert.equal(lowResult.band, 'low risk');
  const modResult = cssrs({ ...none, wishDead: true, thoughtsKilling: true, thoughtsMethods: true });
  assert.equal(modResult.band, 'moderate risk');
});

test('cssrs band escalates to high regardless of lower-tier positives', () => {
  const r = cssrs({
    wishDead: true, thoughtsKilling: true, thoughtsMethods: true,
    someIntent: true, planIntent: false,
    behaviorLifetime: false, behaviorPast3Months: false,
  });
  assert.equal(r.band, 'high risk');
});

test('cssrs rejects non-boolean inputs', () => {
  assert.throws(() => cssrs({ ...none, wishDead: 1 }));
  assert.throws(() => cssrs({ ...none, thoughtsKilling: 'yes' }));
  assert.throws(() => cssrs({ ...none, someIntent: null }));
});

test('cssrs rejects inconsistent Q6 / Q6a combination', () => {
  // past 3 months yes but lifetime no = logically inconsistent per the screener
  assert.throws(() => cssrs({ ...none, behaviorLifetime: false, behaviorPast3Months: true }));
});

test('cssrs text mentions Columbia Lighthouse Project banding', () => {
  assert.match(cssrs(none).text, /Columbia Lighthouse Project/);
});
