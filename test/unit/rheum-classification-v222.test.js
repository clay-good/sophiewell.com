// spec-v222: worked examples for the rheumatology classification & activity
// instruments. Point systems spec-v97 cross-verified (see module header).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  iimEularAcr, pmrEularAcr, bohanPeter, ssc2013, mrss, sjogren2016, esspri,
} from '../../lib/rheum-classification-v222.js';

test('iim: weighted definite', () => {
  const r = iimEularAcr({ ageBand: '2.1', proximalUpper: true, heliotrope: true, antiJo1: true });
  assert.equal(r.score, 9.8);
  assert.match(r.band, /definite/);
});
test('iim: below threshold', () => {
  const r = iimEularAcr({ proximalUpper: true });
  assert.ok(r.score < 5.3);
  assert.equal(r.abnormal, false);
});

test('pmr: >= 4 classifies', () => {
  const r = pmrEularAcr({ stiffness: true, absentRfAcpa: true });
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
});
test('pmr: below threshold', () => {
  assert.equal(pmrEularAcr({ hip: true }).abnormal, false);
});

test('bohan: dermatomyositis definite', () => {
  const r = bohanPeter({ weakness: true, enzymes: true, emg: true, rash: true });
  assert.match(r.bandLabel, /definite dermatomyositis/);
});
test('bohan: polymyositis definite needs 4', () => {
  const r = bohanPeter({ weakness: true, enzymes: true, emg: true, biopsy: true });
  assert.match(r.bandLabel, /definite polymyositis/);
});
test('bohan: rash alone not met', () => {
  assert.equal(bohanPeter({ rash: true }).abnormal, false);
});

test('ssc: proximal MCP is sufficient', () => {
  const r = ssc2013({ proximalMcp: true });
  assert.equal(r.score, 9);
  assert.equal(r.abnormal, true);
});
test('ssc: weighted sum >= 9', () => {
  const r = ssc2013({ skinFingers: '4', raynaud: true, autoantibodies: true });
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, true);
});
test('ssc: below threshold', () => {
  assert.equal(ssc2013({ raynaud: true }).abnormal, false);
});

test('mrss: sums 17 sites', () => {
  const r = mrss({ fingersR: '2', fingersL: '2', face: '1', chest: '3' });
  assert.equal(r.score, 8);
});
test('mrss: caps at 51', () => {
  const all = {};
  for (const k of ['fingersR', 'fingersL', 'handsR', 'handsL', 'forearmsR', 'forearmsL', 'upperArmsR', 'upperArmsL', 'face', 'chest', 'abdomen', 'thighsR', 'thighsL', 'legsR', 'legsL', 'feetR', 'feetL']) all[k] = '3';
  assert.equal(mrss(all).score, 51);
});

test('sjogren: >= 4 classifies', () => {
  const r = sjogren2016({ focusScore: true, antiSsa: true });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
});
test('sjogren: below threshold', () => {
  assert.equal(sjogren2016({ ocularStaining: true, schirmer: true }).abnormal, false);
});

test('esspri: mean of three', () => {
  const r = esspri({ dryness: 6, fatigue: 5, pain: 4 });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('esspri: invalid without all three', () => { assert.equal(esspri({ dryness: 5 }).valid, false); });
