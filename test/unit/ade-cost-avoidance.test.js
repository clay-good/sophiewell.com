// spec-v1634 tool 21: cost avoidance by the Nesbit method (as restated in Abushanab 2023).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adeCostAvoidance as d, CLASSES } from '../../lib/ade-cost-avoidance-v1634.js';

test('the five probabilities', () => {
  assert.deepEqual(CLASSES.map((c) => [c.value, c.p]), [['none', 0], ['very low', 0.01], ['low', 0.1], ['medium', 0.4], ['high', 0.6]]);
});

test('probability times cost, summed, by class and in total', () => {
  const r = d({ interventions: 'low, 5000, 10\nmedium, 5000, 4\nhigh, 12000\nnone, 5000, 3' });
  // 0.1 x 5000 x 10 = 5000; 0.4 x 5000 x 4 = 8000; 0.6 x 12000 = 7200; none = 0.
  assert.equal(r.costAvoidance, 20200);
  assert.equal(r.interventions, 18);
  assert.deepEqual(r.byClass.map((x) => [x.class, x.interventions, x.avoided]), [['none', 3, 0], ['low', 10, 5000], ['medium', 4, 8000], ['high', 1, 7200]]);
  assert.equal(d({ interventions: 'very-low, 1000' }).costAvoidance, 10);
  assert.equal(d({ interventions: 'Very Low, $1000' }).costAvoidance, 10);
});

test('net of pharmacist time, which can be negative', () => {
  const r = d({ interventions: 'low, 5000, 10', timeCost: 1200 });
  assert.equal(r.net, 3800);
  assert.match(r.band, /3,800\.00 net of the time cost/);
  assert.equal(d({ interventions: 'very low, 1000', timeCost: 500 }).net, -490);
  assert.equal(d({ interventions: 'low, 5000' }).net, undefined);
});

test('it says it is an estimate', () => {
  const r = d({ interventions: 'high, 10000' });
  assert.match(r.note, /not money saved/);
  assert.match(r.note, /2001 original was not read/);
  assert.equal(r.abnormal, false);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter at least one line/);
  assert.match(d({ interventions: 'low' }).message, /Line 1: enter the class/);
  assert.match(d({ interventions: 'severe, 100' }).message, /Line 1: choose the class/);
  assert.match(d({ interventions: 'low, abc' }).message, /^Enter the cost on line 1/);
  assert.match(d({ interventions: 'low, 100, 1.5' }).message, /whole number/);
  assert.equal(d({ interventions: 'low, 100, 0' }).valid, false);
  assert.equal(d({ interventions: 'low, 100', timeCost: -1 }).valid, false);
  assert.equal(d(null).valid, false);
});
