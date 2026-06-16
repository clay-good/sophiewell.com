// spec-v89 §2.1: DAS28-ESR / DAS28-CRP rheumatoid-arthritis disease activity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { das28 } from '../../lib/rheum-periop-v89.js';

test('worked example: DAS28-ESR high disease activity', () => {
  // 0.56·√8 + 0.28·√4 + 0.70·ln(30) + 0.014·50
  // = 1.58392 + 0.56 + 2.38084 + 0.70 = 5.22476 -> 5.22
  const r = das28({ tjc28: 8, sjc28: 4, form: 'esr', esr: 30, globalHealth: 50 });
  assert.equal(r.valid, true);
  assert.equal(r.form, 'esr');
  assert.equal(r.score, 5.22);
  assert.equal(r.activity, 'high'); // > 5.1
});

test('worked example: DAS28-CRP low disease activity', () => {
  // 0.56·√2 + 0.28·√1 + 0.36·ln(11) + 0.014·20 + 0.96
  // = 0.79196 + 0.28 + 0.86304 + 0.28 + 0.96 = 3.17500 -> 3.18 (raw 3.175 <= 3.2 -> low)
  const r = das28({ tjc28: 2, sjc28: 1, form: 'crp', crp: 10, globalHealth: 20 });
  assert.equal(r.form, 'crp');
  assert.equal(r.score, 3.18);
  assert.equal(r.activity, 'low');
});

test('band flip: ESR form reaches remission at low counts/marker', () => {
  // 0 + 0 + 0.70·ln(5) + 0 = 1.12661 -> 1.13, remission (< 2.6)
  const r = das28({ tjc28: 0, sjc28: 0, form: 'esr', esr: 5, globalHealth: 0 });
  assert.equal(r.score, 1.13);
  assert.equal(r.activity, 'remission');
});

test('CRP form remission floor: all zero -> 0.96', () => {
  const r = das28({ tjc28: 0, sjc28: 0, form: 'crp', crp: 0, globalHealth: 0 });
  assert.equal(r.score, 0.96); // ln(0+1)=0, just the 0.96 constant
  assert.equal(r.activity, 'remission');
});

test('moderate band (ESR)', () => {
  // 0.56·√5 + 0.28·√3 + 0.70·ln(15) + 0.014·40
  // = 1.25217 + 0.48497 + 1.89571 + 0.56 = 4.19285 -> 4.19, moderate
  const r = das28({ tjc28: 5, sjc28: 3, form: 'esr', esr: 15, globalHealth: 40 });
  assert.equal(r.activity, 'moderate');
});

test('joint counts clamp to the 28-joint range', () => {
  const a = das28({ tjc28: 40, sjc28: 40, form: 'esr', esr: 30, globalHealth: 50 });
  const b = das28({ tjc28: 28, sjc28: 28, form: 'esr', esr: 30, globalHealth: 50 });
  assert.equal(a.score, b.score);
});

test('ESR form guards the logarithm domain (ESR must be > 0)', () => {
  const r = das28({ tjc28: 5, sjc28: 3, form: 'esr', esr: 0, globalHealth: 40 });
  assert.equal(r.valid, false);
  assert.match(r.band, /ESR/);
});

test('a blank marker or VAS renders the complete-the-fields fallback', () => {
  assert.equal(das28({ tjc28: 5, sjc28: 3, form: 'esr', globalHealth: 40 }).valid, false);
  assert.equal(das28({ tjc28: 5, sjc28: 3, form: 'esr', esr: 30 }).valid, false);
});

test('the two forms are not interchangeable (CRP runs lower)', () => {
  const esr = das28({ tjc28: 6, sjc28: 4, form: 'esr', esr: 28, globalHealth: 45 });
  const crp = das28({ tjc28: 6, sjc28: 4, form: 'crp', crp: 28, globalHealth: 45 });
  assert.notEqual(esr.score, crp.score);
  assert.equal(esr.formLabel, 'DAS28-ESR');
  assert.equal(crp.formLabel, 'DAS28-CRP');
});
