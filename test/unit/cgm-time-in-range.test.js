// spec-v1472: CGM time in range against the International Consensus targets (Battelino 2019, Table 3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cgmTimeInRange as t } from '../../lib/cgm-time-in-range-v1472.js';

const ALL_MET = { pop: 'standard', vlow: 0.5, low: 2.5, tir: 75, high: 18, vhigh: 4 };
const met = (r, metric) => r.results.find((x) => x.metric.startsWith(metric)).met;

test('every standard target met', () => {
  const r = t(ALL_MET);
  assert.equal(r.valid, true);
  assert.equal(r.abnormal, false);
  assert.equal(r.targetsMet, 5);
  assert.equal(r.targetsTotal, 5);
  assert.match(r.band, /5 of 5 consensus targets met .*every target is met/);
  assert.equal(r.bandLabel, '5 of 5 targets met');
});

test('each standard target fails at its strict boundary', () => {
  // A TIR of exactly 70 cannot fail alone: the other 30% cannot all sit under the 4% and 25% cutoffs.
  let r = t({ ...ALL_MET, tir: 70, high: 22 });
  assert.equal(met(r, 'time in range'), false);
  assert.equal(met(t({ ...ALL_MET, tir: 70.1, high: 22 }), 'time in range'), true);
  r = t({ ...ALL_MET, vlow: 0.5, low: 3.5, tir: 74 });
  assert.equal(met(r, 'time below 70'), false);
  assert.equal(r.targetsMet, 4);
  r = t({ ...ALL_MET, vlow: 1, low: 2, tir: 75 });
  assert.equal(met(r, 'time below 54'), false);
  assert.equal(r.targetsMet, 4);
  r = t({ ...ALL_MET, tir: 72, high: 21, vhigh: 4 });
  assert.equal(met(r, 'time above 180'), false);
  assert.equal(r.targetsMet, 4);
  r = t({ ...ALL_MET, tir: 75, high: 17, vhigh: 5 });
  assert.equal(met(r, 'time above 250'), false);
  assert.equal(r.targetsMet, 4);
});

test('the worked example names the unmet targets with their values', () => {
  const r = t({ pop: 'standard', vlow: 1, low: 3, tir: 65, high: 22, vhigh: 9 });
  assert.equal(r.targetsMet, 0);  // 4% below 70 and 1% below 54 sit ON the strict cutoffs
  assert.equal(r.abnormal, true);
  assert.match(r.band, /time in range \(70 to 180 mg\/dL\) 65% against a target above 70%/);
  assert.match(r.band, /time above 250 mg\/dL 9% against a target below 5%/);
});

test('older or high-risk uses only its three targets', () => {
  const x = { vlow: 0.5, low: 1.5, tir: 60, high: 30, vhigh: 8 };
  const older = t({ ...x, pop: 'older' });
  assert.equal(older.targetsTotal, 3);
  assert.equal(met(older, 'time below 70'), false);
  assert.equal(met(older, 'time in range'), true);
  assert.equal(met(older, 'time above 250'), true);
  const std = t({ ...x, pop: 'standard' });
  assert.equal(met(std, 'time below 70'), true);
  assert.ok(!older.notes.some((n) => n.includes('under 25')));
  assert.ok(std.notes.some((n) => n.includes('under 25')));
});

test('the five must add up to 100 within one point', () => {
  assert.equal(t({ ...ALL_MET, tir: 74 }).valid, true);
  assert.equal(t({ ...ALL_MET, tir: 76 }).valid, true);
  const r = t({ ...ALL_MET, tir: 72 });
  assert.equal(r.valid, false);
  assert.match(r.message, /^Enter the five percentages again: they add up to 97%/);
});

test('blanks are asked for, never defaulted', () => {
  assert.match(t({ ...ALL_MET, pop: '' }).message, /^Choose the population/);
  assert.match(t({ ...ALL_MET, low: '' }).message, /^Enter the percentage of time from 54 to 69 mg\/dL/);
  assert.match(t({ ...ALL_MET, vhigh: undefined }).message, /^Enter the percentage of time above 250 mg\/dL/);
  assert.equal(t({ ...ALL_MET, tir: 140 }).valid, false);
});

test('%CV against 36% or less, with the below-33% footnote only between 33 and 36', () => {
  const at35 = t({ ...ALL_MET, cv: 35 }).notes[0];
  assert.match(at35, /meets the target of 36% or less/);
  assert.match(at35, /below 33%/);
  assert.match(t({ ...ALL_MET, cv: 38 }).notes[0], /above the consensus target/);
  assert.doesNotMatch(t({ ...ALL_MET, cv: 30 }).notes[0], /below 33%/);
  assert.match(t(ALL_MET).notes[0], /was not entered/);
});

test('data sufficiency: 14 days and 70% active', () => {
  assert.match(t({ ...ALL_MET, days: 14, active: 85 }).notes[1], /14 days worn meets .*85% of time active meets/);
  assert.match(t({ ...ALL_MET, days: 10, active: 60 }).notes[1], /fewer than the 14 .*below the 70%/);
  assert.match(t({ ...ALL_MET, days: 14 }).notes[1], /time active not entered/);
  assert.match(t(ALL_MET).notes[1], /were not entered/);
  assert.equal(t({ ...ALL_MET, days: 0 }).valid, false);
});
