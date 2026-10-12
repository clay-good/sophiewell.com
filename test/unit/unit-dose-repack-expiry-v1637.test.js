// spec-v1637 tool 22: FDA's July 2020 unit-dose repackaging expiration policy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unitDoseRepackExpiry, CONDITIONS } from '../../lib/unit-dose-repack-expiry-v1637.js';

const yes = Object.fromEntries(CONDITIONS.map((c) => [c.arg, 'yes']));
const r = (o) => unitDoseRepackExpiry({ repackaged: '2026-10-01', ...yes, ...o });

test('a long-dated product is bound by 6 months', () => {
  const x = r({ manufacturerExpiry: '2029-10-01' });
  assert.deepEqual([x.latestExpiration, x.binding, x.sixMonths], ['2027-04-01', '6-months', '2027-04-01']);
});

test('a short-dated product is bound by 25 percent of the time left, rounded down', () => {
  // 365 days left: 25 percent is 91.25, rounded down to 91 days.
  const x = r({ manufacturerExpiry: '2027-10-01' });
  assert.deepEqual([x.daysBetween, x.latestExpiration, x.binding], [365, '2026-12-31', '25-percent']);
  // 3 days left: 25 percent is 0.75, rounded down to 0: the date of repackaging itself.
  assert.equal(r({ manufacturerExpiry: '2026-10-04' }).latestExpiration, '2026-10-01');
});

test('a month-and-year expiration is the last day of that month', () => {
  const x = r({ manufacturerExpiry: '2027-02' });
  assert.equal(x.daysBetween, 150);
  assert.match(x.note, /February 28, 2027 \(a month and year is read as the last day/);
});

test('a missing circumstance takes the policy away, and names it', () => {
  const x = r({ manufacturerExpiry: '2029-10-01', unopened: 'no', noCaution: 'no' });
  assert.deepEqual([x.flag, x.failedConditions.length], ['circumstances-not-all-present', 2]);
  assert.match(x.band, /2 of its five circumstances are not present/);
  assert.equal(CONDITIONS.length, 5);
});

test('refusals: every circumstance must be answered', () => {
  assert.match(unitDoseRepackExpiry({}).message, /^Enter the date of repackaging/);
  assert.match(r({}).message, /^Enter the expiration date on the manufacturer's container/);
  assert.match(r({ manufacturerExpiry: '2026-09-30' }).message, /after the date of repackaging/);
  assert.match(r({ manufacturerExpiry: '2029-10-01', light: '' }).message, /^Choose yes or no: light protection/);
  assert.equal(r({ manufacturerExpiry: '2027-13' }).valid, false);
});
