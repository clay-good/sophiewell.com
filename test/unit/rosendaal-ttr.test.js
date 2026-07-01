// spec-v185 §2.7: time in therapeutic range by Rosendaal linear interpolation.
// Requires >= 2 in-order dated INR values; the total-days divisor is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rosendaalTtr } from '../../lib/gaps-v185.js';

test('tile example: an out-of-range opening interval', () => {
  // 1.5->2.5 over 10 days: in range from day 5 (INR 2.0) onward -> 6 in, 4 below.
  // 2.5->2.8 over 10 days: all 10 in range. Total 20, in-range 16 -> 80%.
  const r = rosendaalTtr({ series: '2026-01-01 1.5\n2026-01-11 2.5\n2026-01-21 2.8', low: 2.0, high: 3.0 });
  assert.equal(r.valid, true);
  assert.equal(r.ttr, 80);
  assert.equal(r.inRange, 16);
  assert.equal(r.total, 20);
  assert.equal(r.below, 4);
  assert.equal(r.above, 0);
  assert.equal(r.bandLabel, 'Good control (≥ 65%)');
});

test('all-in-range series is 100% and defaults to the 2.0-3.0 target', () => {
  const r = rosendaalTtr({ series: '2026-02-01 2.2\n2026-02-15 2.8' });
  assert.equal(r.ttr, 100);
  assert.equal(r.below, 0);
  assert.equal(r.above, 0);
});

test('a poorly-controlled series lands below the good-control mark', () => {
  const r = rosendaalTtr({ series: '2026-03-01 1.2\n2026-03-11 1.6', low: 2.0, high: 3.0 });
  assert.equal(r.inRange, 0);
  assert.equal(r.ttr, 0);
  assert.equal(r.abnormal, true);
  assert.equal(r.bandLabel, 'Below good-control threshold');
});

test('guards: fewer than two valid rows, bad target, and same-day span fall back', () => {
  assert.equal(rosendaalTtr({ series: '2026-01-01 2.5' }).valid, false);
  assert.equal(rosendaalTtr({ series: 'not a date\nalso bad' }).valid, false);
  assert.equal(rosendaalTtr({ series: '2026-01-01 2.5\n2026-01-05 2.6', low: 3.0, high: 2.0 }).valid, false);
  assert.equal(rosendaalTtr({ series: '2026-01-01 2.5\n2026-01-01 2.6' }).valid, false);
  assert.equal(rosendaalTtr({}).valid, false);
});
