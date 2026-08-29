import test from 'node:test';
import assert from 'node:assert/strict';
import { methacholine as m, PD20_NORMAL, PD20_MILD, PD20_MODERATE, PC20_NORMAL, PC20_MILD, PC20_MODERATE, METRICS } from '../../lib/methacholine-v890.js';

test('methacholine: the published cutpoints for both metrics', () => {
  assert.deepEqual([PD20_NORMAL, PD20_MILD, PD20_MODERATE], [400, 100, 25]);
  assert.deepEqual([PC20_NORMAL, PC20_MILD, PC20_MODERATE], [16, 4, 1]);
  assert.deepEqual(METRICS.map((x) => x.value), ['pd20', 'pc20']);
});

test('methacholine: the PD20 bands, read strictly', () => {
  assert.equal(m({ value: 401 }).grade, 'normal');
  assert.equal(m({ value: 400 }).grade, 'borderline');
  assert.equal(m({ value: 100 }).grade, 'borderline');
  assert.equal(m({ value: 99 }).grade, 'mild');
  assert.equal(m({ value: 25 }).grade, 'mild');
  assert.equal(m({ value: 24 }).grade, 'moderate-severe');
});

test('methacholine: the PC20 bands, read strictly', () => {
  const pc = (value) => m({ metric: 'pc20', value }).grade;
  assert.equal(pc(17), 'normal');
  assert.equal(pc(16), 'borderline');
  assert.equal(pc(4), 'borderline');
  assert.equal(pc(3.9), 'mild');
  assert.equal(pc(1), 'mild');
  assert.equal(pc(0.9), 'moderate-severe');
});

test('methacholine: the metric decides the cutpoints, and the tile says which it used', () => {
  // The reason the tile exists: 10 is moderate-severe as a dose and normal-ish as nothing.
  assert.equal(m({ value: 10 }).grade, 'moderate-severe');
  assert.equal(m({ metric: 'pc20', value: 10 }).grade, 'borderline');
  assert.match(m({ metric: 'pc20', value: 10 }).metricNote, /not comparable with a PC20 from another/);
  assert.match(m({ value: 10 }).metricNote, /a delivered dose is comparable between laboratories/);
  assert.match(m({ value: 10 }).band, /^PD20 10 micrograms/);
  assert.match(m({ metric: 'pc20', value: 10 }).band, /^PC20 10 mg\/mL/);
});

test('methacholine: the negative test is the informative one', () => {
  assert.match(m({ value: 800 }).negativeNote, /negative predictive value/);
  assert.equal(m({ value: 800 }).abnormal, false);
  assert.equal(m({ value: 800 }).positiveNote, null);
  // Borderline is not flagged abnormal, and still carries the positive caveat.
  assert.equal(m({ value: 200 }).abnormal, false);
  assert.match(m({ value: 200 }).positiveNote, /does not diagnose asthma on its own/);
});

test('methacholine: an unwithheld medication is called out on a normal result', () => {
  assert.match(m({ value: 800 }).withholdNote, /falsely negative test is usually a drug that was not withheld/);
  assert.match(m({ value: 800, medicationsWithheld: true }).withholdNote, /recorded as withheld/);
  // On an abnormal result the point is general rather than an indictment of that result.
  assert.match(m({ value: 10 }).withholdNote, /hard to read/);
});

test('methacholine: safety and scope are stated, not implied', () => {
  for (const value of [800, 10]) {
    assert.match(m({ value }).safetyNote, /decided before the test, not read from the result/);
    assert.match(m({ value }).scopeNote, /does not diagnose asthma/);
  }
});

test('methacholine: a missing or out-of-range value is refused, and the limit follows the metric', () => {
  assert.equal(m({}).valid, false);
  assert.equal(m({ value: 0 }).valid, false);
  assert.equal(m({ value: 10001 }).valid, false);
  assert.equal(m({ metric: 'pc20', value: 201 }).valid, false);
  assert.equal(m({ metric: 'pc20', value: 150 }).valid, true);
  assert.equal(m({ metric: 'made-up', value: 50 }).metric, 'pd20');
});

test('methacholine: the documented example', () => {
  const r = m({ metric: 'pd20', value: '50' });
  assert.equal(r.grade, 'mild');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /PD20 50 micrograms: mild bronchial hyperresponsiveness/);
});
