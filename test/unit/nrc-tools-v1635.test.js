// spec-v1635 tools 32 and 35: sealed source leak test (10 CFR 35.67) and occupational dose limits
// (10 CFR 20.1201, 20.1208).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { occupationalDoseLimitCheck as dose, LIMITS } from '../../lib/occupational-dose-limit-check-v1635.js';
import { sealedSourceLeakTest as leak } from '../../lib/sealed-source-leak-test-v1635.js';

test('the five limits, in rem', () => {
  assert.deepEqual(LIMITS.map((l) => [l.arg, l.limit]), [['tede', 5], ['organ', 50], ['lens', 15], ['skin', 50], ['fetus', 0.5]]);
});

test('percent of each limit, in any of the three units', () => {
  const r = dose({ unit: 'mrem', tede: 1200, lens: 3000 });
  assert.deepEqual(r.rows.map((x) => [x.rem, x.percent]), [[1.2, 24], [3, 20]]);
  assert.equal(dose({ unit: 'msv', tede: 12 }).rows[0].percent, 24);
  assert.equal(dose({ unit: 'rem', tede: 1.2 }).rows[0].percent, 24);
  assert.equal(dose({ unit: 'msv', fetus: 2 }).rows[0].percent, 40);
});

test('at the limit is flagged; the projection is plain proportion and skips the pregnancy limit', () => {
  assert.equal(dose({ unit: 'rem', tede: 5 }).flag, 'limit-reached');
  assert.equal(dose({ unit: 'rem', tede: 4.99 }).flag, 'below-limits');
  const p = dose({ unit: 'rem', tede: 2, fetus: 0.1, monthsElapsed: 4 });
  assert.deepEqual([p.rows[0].projectedRem, p.rows[0].reachesLimitInMonth], [6, 10]);
  assert.equal(p.rows[1].projectedRem, undefined);
  assert.equal(dose({ unit: 'rem', tede: 1, monthsElapsed: 6 }).rows[0].reachesLimitInMonth, null);
});

test('dose refusals', () => {
  assert.match(dose({}).message, /^Enter at least one/);
  assert.match(dose({ tede: 1 }).message, /^Choose the unit/);
  assert.equal(dose({ unit: 'rem', tede: -1 }).valid, false);
  assert.equal(dose({ unit: 'rem', tede: 1, monthsElapsed: 13 }).valid, false);
  assert.equal(dose(null).valid, false);
});

test('leak test: counts to microcuries, the 0.005 level, and the dates', () => {
  const ok = leak({ exemption: 'none', netCpm: 500, efficiencyPercent: 10, testDate: '2026-10-01' });
  assert.ok(Math.abs(ok.microcuries - 500 / 0.1 / 2.22e6) < 1e-8);
  assert.deepEqual([ok.leaking, ok.nextTestDue, ok.reportDue], [false, '2027-04-01', undefined]);
  const bad = leak({ exemption: 'none', netCpm: 5000, efficiencyPercent: 30, testDate: '2026-10-01' });
  assert.deepEqual([bad.leaking, bad.reportDue, bad.nextTestDue], [true, '2026-10-06', undefined]);
  // Exactly 0.005 microcurie is leaking: "185 Bq (0.005 microcurie) or more".
  assert.equal(leak({ exemption: 'none', netCpm: 11100, efficiencyPercent: 100 }).leaking, true);
  assert.equal(leak({ exemption: 'none', netCpm: 11000, efficiencyPercent: 100 }).leaking, false);
  // A 6-month step from August 31 lands on the last day of February.
  assert.equal(leak({ exemption: 'none', netCpm: 0, efficiencyPercent: 10, testDate: '2026-08-31' }).nextTestDue, '2027-02-28');
});

test('leak test: exemptions and refusals', () => {
  assert.equal(leak({ exemption: 'gas' }).flag, 'exempt');
  assert.match(leak({ exemption: 'stored' }).band, /before any use or transfer/);
  assert.equal(leak({ exemption: 'stored', netCpm: 100, efficiencyPercent: 10, testDate: '2026-10-01' }).nextTestDue, undefined);
  assert.match(leak({}).message, /^Choose whether/);
  assert.match(leak({ exemption: 'none' }).message, /^Enter the net counts/);
  assert.match(leak({ exemption: 'none', netCpm: 100 }).message, /^Enter the counter efficiency/);
  assert.equal(leak({ exemption: 'none', netCpm: 100, efficiencyPercent: 0 }).valid, false);
  assert.match(leak({ exemption: 'none', netCpm: 100, efficiencyPercent: 10, testDate: 'x' }).message, /^Enter the date/);
  assert.equal(leak(null).valid, false);
});
