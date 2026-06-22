// spec-v138 2.5: Barnhart minimal serial-hCG rise (Barnhart 2004). Observed rise =
// (repeat-initial)/initial*100; minimal expected scaled from the 53%/48h anchor as
// 1.53^(hours/48). A sub-minimal rise is abnormal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barnhartHcg } from '../../lib/ob-v138.js';

test('worked example 1000 -> 1400 at 48h -> 40% < 53% (sub-minimal)', () => {
  const r = barnhartHcg({ initial: 1000, repeat: 1400, hours: 48 });
  assert.equal(r.valid, true);
  assert.equal(r.observed, 40);
  assert.equal(r.expectedMin, 53);
  assert.equal(r.abnormal, true);
});

test('a brisk rise at 48h is at or above the minimum (not flagged)', () => {
  const r = barnhartHcg({ initial: 1000, repeat: 1700, hours: 48 });
  assert.equal(r.observed, 70);
  assert.equal(r.abnormal, false);
});

test('expected minimum scales below 53% for a shorter interval', () => {
  const r = barnhartHcg({ initial: 1000, repeat: 1300, hours: 24 });
  assert.ok(r.expectedMin < 53 && r.expectedMin > 0);
});

test('falling hCG -> negative observed rise, flagged', () => {
  const r = barnhartHcg({ initial: 1000, repeat: 900, hours: 48 });
  assert.ok(r.observed < 0);
  assert.equal(r.abnormal, true);
});

test('zero / missing initial -> valid:false (no divide by zero)', () => {
  assert.equal(barnhartHcg({ initial: 0, repeat: 1400, hours: 48 }).valid, false);
  assert.equal(barnhartHcg({ repeat: 1400, hours: 48 }).valid, false);
});
