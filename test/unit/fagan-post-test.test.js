// spec-v163 2.1: Fagan post-test probability, computed in odds space so there is
// no float clamp / NaN leak at extreme pre-test probabilities.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { faganPostTest } from '../../lib/ebm-v163.js';

test('tile example: pre-test 20% × LR+ 10 → post-test ~71%', () => {
  // pre-odds = 0.2/0.8 = 0.25; ×10 = 2.5; p = 2.5/3.5 = 0.714 -> 71.4%
  const r = faganPostTest({ mode: 'lr', pretest: 20, lr: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.posttest, 71.4);
  assert.match(r.band, /71\.4%/);
});

test('LR < 1 lowers the probability', () => {
  const r = faganPostTest({ mode: 'lr', pretest: 50, lr: 0.1 });
  assert.equal(r.valid, true);
  // pre-odds 1; ×0.1 = 0.1; p = 0.1/1.1 = 0.0909 -> 9.1%
  assert.equal(r.posttest, 9.1);
  assert.ok(r.posttest < 50);
});

test('sens/spec mode derives LR+ and LR− and reports both post-test probabilities', () => {
  const r = faganPostTest({ mode: 'sensspec', pretest: 20, sens: 90, spec: 90 });
  assert.equal(r.valid, true);
  assert.equal(r.lrPos, 9);
  assert.equal(r.lrNeg, 0.11);
  // positive: pre-odds 0.25 × 9 = 2.25 -> p 0.692 -> 69.2%
  assert.equal(r.postPos, 69.2);
  assert.ok(r.postNeg < 5);
});

test('no NaN/Infinity leak at extreme pre-test probability with a large LR', () => {
  const r = faganPostTest({ mode: 'lr', pretest: 99.9, lr: 1e6 });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.posttest));
  assert.ok(r.posttest <= 100);
  // p→1 with a huge LR clamps to 100, never NaN
  assert.equal(r.posttest, 100);
});

test('guards: pre-test outside (0,100), blank LR, spec=100', () => {
  assert.equal(faganPostTest({ mode: 'lr', pretest: 0, lr: 5 }).valid, false);
  assert.equal(faganPostTest({ mode: 'lr', pretest: 100, lr: 5 }).valid, false);
  assert.equal(faganPostTest({ mode: 'lr', pretest: 20 }).valid, false);
  assert.equal(faganPostTest({ mode: 'sensspec', pretest: 20, sens: 90, spec: 100 }).valid, false);
  assert.equal(faganPostTest({}).valid, false);
});
