// spec-v176 §2.6: CDC STEADI fall-risk screening pathway -> low/moderate/high.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { steadiAlgorithm } from '../../lib/ltcga-v176.js';

const neg = { fellPastYear: 'no', feelsUnsteady: 'no', worriesAboutFalling: 'no', gaitBalanceProblem: 'no' };

test('Negative screen -> low risk', () => {
  const r = steadiAlgorithm(neg);
  assert.equal(r.valid, true);
  assert.equal(r.risk, 'low');
});

test('Positive screen, no recurrent/injurious fall, no gait problem -> moderate', () => {
  assert.equal(steadiAlgorithm({ ...neg, feelsUnsteady: 'yes' }).risk, 'moderate');
  assert.equal(steadiAlgorithm({ ...neg, worriesAboutFalling: 'yes' }).risk, 'moderate');
});

test('Positive screen + gait/balance problem -> high', () => {
  assert.equal(steadiAlgorithm({ ...neg, feelsUnsteady: 'yes', gaitBalanceProblem: 'yes' }).risk, 'high');
});

test('Recurrent (2+) or injurious fall -> high', () => {
  assert.equal(steadiAlgorithm({ fellPastYear: 'yes', numberOfFalls: 2, fallWithInjury: 'no', feelsUnsteady: 'no', worriesAboutFalling: 'no', gaitBalanceProblem: 'no' }).risk, 'high');
  assert.equal(steadiAlgorithm({ fellPastYear: 'yes', numberOfFalls: 1, fallWithInjury: 'yes', feelsUnsteady: 'no', worriesAboutFalling: 'no', gaitBalanceProblem: 'no' }).risk, 'high');
});

test('Single non-injurious fall, no gait problem -> moderate', () => {
  assert.equal(steadiAlgorithm({ fellPastYear: 'yes', numberOfFalls: 1, fallWithInjury: 'no', feelsUnsteady: 'no', worriesAboutFalling: 'no', gaitBalanceProblem: 'no' }).risk, 'moderate');
});

test('A reported fall requires its count and injury detail; otherwise complete-the-fields', () => {
  assert.equal(steadiAlgorithm({ ...neg, fellPastYear: 'yes' }).valid, false);
  assert.equal(steadiAlgorithm({ feelsUnsteady: 'no' }).valid, false);
  assert.equal(steadiAlgorithm({}).valid, false);
});
