// spec-v163 2.2: diagnostic 2×2 - sens/spec/PPV/NPV/LR with the optional Bayes
// PPV/NPV at a user-supplied prevalence. Every row/column denominator is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagnostic2x2 } from '../../lib/ebm-v163.js';

test('tile example: 90/90 test with a Bayes-recomputed PPV at a different prevalence', () => {
  const r = diagnostic2x2({ tp: 90, fp: 10, fn: 10, tn: 90, prevalence: 5 });
  assert.equal(r.valid, true);
  assert.equal(r.sens, 90);
  assert.equal(r.spec, 90);
  assert.equal(r.ppv, 90); // sample prevalence 50%
  assert.equal(r.npv, 90);
  assert.equal(r.lrPos, 9);
  assert.equal(r.lrNeg, 0.11);
  // Bayes at 5% prevalence: PPV = (0.9*0.05)/(0.9*0.05 + 0.1*0.95) = 0.321 -> 32.1%
  assert.equal(r.bayesPpv, 32.1);
  assert.ok(r.bayesNpv > 99);
});

test('accuracy and sample prevalence', () => {
  const r = diagnostic2x2({ tp: 40, fp: 10, fn: 5, tn: 45 });
  assert.equal(r.valid, true);
  assert.equal(r.accuracy, 85); // (40+45)/100
  assert.equal(r.samplePrev, 45); // (40+5)/100
});

test('perfect specificity → LR+ surfaced as ∞ not a divide-by-zero', () => {
  const r = diagnostic2x2({ tp: 50, fp: 0, fn: 10, tn: 40 });
  assert.equal(r.valid, true);
  assert.equal(r.spec, 100);
  assert.equal(r.lrPos, null);
  assert.match(r.band, /∞/);
});

test('guards: empty disease column and blank cells', () => {
  assert.equal(diagnostic2x2({ tp: 0, fp: 0, fn: 0, tn: 50 }).valid, false); // no diseased
  assert.equal(diagnostic2x2({ tp: 50, fp: 0, fn: 10, tn: 0 }).valid, false); // no well
  assert.equal(diagnostic2x2({ tp: 90, fp: 10, fn: 10 }).valid, false); // missing TN
  assert.equal(diagnostic2x2({}).valid, false);
});
