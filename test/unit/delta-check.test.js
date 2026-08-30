// spec-v925: the delta check. The tests that matter are that no threshold means no flag, and
// that the rate is reported whether or not anyone set a threshold for it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { deltaCheck, DELTA_CHECK_NOTE } from '../../lib/delta-check-v925.js';

test('delta-check: both results and the interval are required', () => {
  assert.match(deltaCheck({}).message, /previous and the current result/);
  assert.match(deltaCheck({ previousResult: 1, currentResult: 2 }).message, /hours between/);
  assert.equal(deltaCheck({ previousResult: 1, currentResult: 2, hoursBetween: 0 }).valid, false);
});

test('delta-check: the three deltas are computed from the same pair', () => {
  const r = deltaCheck({ previousResult: 1.0, currentResult: 2.4, hoursBetween: 12 });
  assert.equal(r.absoluteDelta, 1.4);
  assert.equal(r.percentDelta, 140);
  assert.equal(r.ratePerDay, 2.8);
});

test('delta-check: with no threshold entered nothing is flagged', () => {
  const r = deltaCheck({ previousResult: 1.0, currentResult: 99, hoursBetween: 1 });
  assert.equal(r.abnormal, false);
  assert.equal(r.thresholdsEntered, 0);
  assert.match(r.band, /the thresholds are local and nothing here supplies them/);
});

test('delta-check: a threshold flags only what it was set for', () => {
  const r = deltaCheck({ previousResult: 1.0, currentResult: 2.4, hoursBetween: 12, absoluteThreshold: 0.5 });
  assert.deepEqual(r.flaggedOn, ['Absolute delta']);
  assert.equal(r.checks.find((c) => c.key === 'percent').flagged, null);
  assert.equal(r.abnormal, true);
});

test('delta-check: slow drift passes an absolute threshold and a rate threshold catches nothing', () => {
  const r = deltaCheck({ previousResult: 1.0, currentResult: 1.1, hoursBetween: 144, absoluteThreshold: 0.5, rateThreshold: 1 });
  assert.equal(r.abnormal, false);
  assert.match(r.band, /inside every threshold entered/);
  assert.ok(Math.abs(r.ratePerDay) <= 0.02);
});

test('delta-check: the same difference over a shorter interval is a bigger rate', () => {
  const fast = deltaCheck({ previousResult: 1, currentResult: 2, hoursBetween: 6 });
  const slow = deltaCheck({ previousResult: 1, currentResult: 2, hoursBetween: 144 });
  assert.equal(fast.absoluteDelta, slow.absoluteDelta);
  assert.ok(fast.ratePerDay > slow.ratePerDay * 10);
});

test('delta-check: a fall is reported as a fall, and flagged on its size', () => {
  const r = deltaCheck({ previousResult: 4, currentResult: 1, hoursBetween: 24, absoluteThreshold: 2 });
  assert.match(r.band, /fallen by 3/);
  assert.equal(r.abnormal, true);
  assert.equal(r.absoluteDelta, -3);
});

test('delta-check: a previous result of zero has no percent delta but keeps the rest', () => {
  const r = deltaCheck({ previousResult: 0, currentResult: 2, hoursBetween: 12 });
  assert.equal(r.percentDelta, null);
  assert.equal(r.absoluteDelta, 2);
  assert.equal(r.ratePerDay, 4);
  assert.match(r.zeroNote, /no percent delta to report/);
});

test('delta-check: the rate is reported whether or not a threshold exists for it', () => {
  assert.match(deltaCheck({ previousResult: 1, currentResult: 2, hoursBetween: 12 }).rateNote, /whether or not a threshold exists/);
  assert.match(deltaCheck({ previousResult: 1, currentResult: 2, hoursBetween: 12, rateThreshold: 1 }).rateNote, /against a threshold of 1/);
});

test('delta-check: local thresholds, not-an-error and the RCV pointer print on every result', () => {
  const r = deltaCheck({ previousResult: 1, currentResult: 2, hoursBetween: 12 });
  assert.match(r.localNote, /no published universal set/);
  assert.match(r.notAnErrorNote, /change, not an error/);
  assert.match(r.rcvNote, /reference change value is the principled threshold/);
  assert.match(r.scopeNote, /or a specimen problem/);
  assert.match(DELTA_CHECK_NOTE, /flag slow drift and miss fast change/);
});
