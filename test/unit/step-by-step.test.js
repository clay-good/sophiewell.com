import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepByStep } from '../../lib/scoring-v4.js';

test('step-by-step all negative (tile example) -> LOW', () => {
  const r = stepByStep({});
  assert.equal(r.risk, 'low');
  assert.match(r.band, /LOW risk per Gomez 2016/);
});

test('step-by-step unwell alone -> HIGH (step 1 short-circuits)', () => {
  const r = stepByStep({ unwellAppearance: true });
  assert.equal(r.risk, 'high');
  assert.match(r.reason, /unwell appearance/);
});

test('step-by-step age <=21 d alone -> HIGH (step 2)', () => {
  const r = stepByStep({ ageLte21Days: true });
  assert.equal(r.risk, 'high');
  assert.match(r.reason, /age <=21 days/);
});

test('step-by-step UA abnormal alone -> HIGH (step 3)', () => {
  const r = stepByStep({ urinalysisAbnormal: true });
  assert.equal(r.risk, 'high');
});

test('step-by-step PCT >=0.5 alone -> HIGH (step 4)', () => {
  const r = stepByStep({ procalcitoninGte0Point5: true });
  assert.equal(r.risk, 'high');
});

test('step-by-step CRP/ANC alone -> INTERMEDIATE (step 5)', () => {
  const r = stepByStep({ crpGt20OrAncGt10: true });
  assert.equal(r.risk, 'intermediate');
  assert.match(r.reason, /CRP >20 mg\/L or ANC >10/);
});

test('step-by-step short-circuits on earliest positive (all true -> HIGH from step 1)', () => {
  const r = stepByStep({
    unwellAppearance: true, ageLte21Days: true, urinalysisAbnormal: true,
    procalcitoninGte0Point5: true, crpGt20OrAncGt10: true,
  });
  assert.equal(r.risk, 'high');
  assert.match(r.reason, /unwell appearance/);
});
