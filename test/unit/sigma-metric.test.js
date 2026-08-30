// spec-v921: the sigma metric. The tests that matter are the bias budget and the floor at three.

import test from 'node:test';
import assert from 'node:assert/strict';
import { sigmaMetric, SIGMA_NOTE } from '../../lib/sigma-metric-v921.js';

test('sigma-metric: all three numbers are required, and each message says why', () => {
  assert.match(sigmaMetric({}).message, /total allowable error/);
  assert.match(sigmaMetric({ totalAllowableError: 10 }).message, /bias/);
  assert.match(sigmaMetric({ totalAllowableError: 10, bias: 2 }).message, /divisor/);
  assert.equal(sigmaMetric({ totalAllowableError: 0, bias: 2, cv: 1 }).valid, false);
  assert.equal(sigmaMetric({ totalAllowableError: 10, bias: 2, cv: 0 }).valid, false);
});

test('sigma-metric: sigma is (TEa - |bias|) / CV', () => {
  const r = sigmaMetric({ totalAllowableError: 10, bias: 2, cv: 1.5 });
  assert.equal(r.sigma, 5.33);
  assert.equal(r.budget, 8);
});

test('sigma-metric: the sign of the bias does not change the arithmetic', () => {
  assert.equal(sigmaMetric({ totalAllowableError: 10, bias: -2, cv: 1.5 }).sigma,
    sigmaMetric({ totalAllowableError: 10, bias: 2, cv: 1.5 }).sigma);
  assert.match(sigmaMetric({ totalAllowableError: 10, bias: -2, cv: 1.5 }).signNote, /enters as its size/);
});

test('sigma-metric: a bias beyond the goal leaves no budget, and that is not a small sigma', () => {
  const r = sigmaMetric({ totalAllowableError: 10, bias: 11, cv: 1.5 });
  assert.equal(r.noBudget, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /not a small sigma; it is a method that cannot meet this goal/);
  assert.equal(sigmaMetric({ totalAllowableError: 10, bias: 10, cv: 1.5 }).noBudget, true);
});

test('sigma-metric: the published bands land where they should', () => {
  const at = (cv) => sigmaMetric({ totalAllowableError: 12, bias: 0, cv }).bandLabel;
  assert.match(at(2), /world class/);
  assert.match(at(2.2), /excellent/);
  assert.match(at(2.7), /good/);
  assert.match(at(3.5), /marginal/);
  assert.match(at(5), /unacceptable/);
});

test('sigma-metric: three is a floor, and the result says so at every level', () => {
  for (const cv of [2, 3.5, 5]) {
    assert.match(sigmaMetric({ totalAllowableError: 12, bias: 0, cv }).floorNote, /not a bit worse than three/);
  }
});

test('sigma-metric: every result names the goal it belongs to', () => {
  const r = sigmaMetric({ totalAllowableError: 10, bias: 2, cv: 1.5 });
  assert.match(r.goalNote, /belongs to a total allowable error of 10%/);
  assert.match(r.goalNote, /CLIA, the biological-variation goals, RCPA and EFLM/);
});

test('sigma-metric: the bias line reports what it took and what was left', () => {
  const r = sigmaMetric({ totalAllowableError: 10, bias: 2, cv: 1.5 });
  assert.match(r.biasNote, /took 2% of the 10% allowed, leaving 8%/);
  assert.match(r.biasNote, /can fail on sigma while looking precise/);
});

test('sigma-metric: four sigma and above is not flagged, below it is', () => {
  assert.equal(sigmaMetric({ totalAllowableError: 12, bias: 0, cv: 2 }).abnormal, false);
  assert.equal(sigmaMetric({ totalAllowableError: 12, bias: 0, cv: 3 }).abnormal, false);
  assert.equal(sigmaMetric({ totalAllowableError: 12, bias: 0, cv: 3.5 }).abnormal, true);
  assert.match(SIGMA_NOTE, /never of the method alone/);
});
