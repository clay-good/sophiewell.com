// spec-v1603 tool 3: pa-metrics-compare, against 42 CFR 422.122(c), 438.210(f), 440.230(e)(3), 457.732(c)
// and 45 CFR 156.223(c).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paMetricsCompare as m } from '../../lib/pa-metrics-compare.js';

const full = {
  program: 'ma', reportYear: '2025', list: 'yes',
  stdApprovedPct: '92.4', stdDeniedPct: '7.6', appealApprovedPct: '81', extendedApprovedPct: '64', expApprovedPct: '95', expDeniedPct: '5',
  stdAvg: '4.1', stdMedian: '3', expAvg: '30', expMedian: '20', timeUnit: 'hours',
  stdTotal: '1000', stdApproved: '924', stdDenied: '76',
};

test('a complete report whose counts reproduce its rates has no problem', () => {
  const r = m(full);
  assert.equal(r.findings.length, 0);
  assert.equal(r.missing.length, 0);
  assert.equal(r.checked, 2);
  assert.match(r.band, /^Medicare Advantage report for 2025 \(42 CFR 422\.122\(c\), posted at the contract level by March 31, 2026\): 9 of 9 required elements entered, 2 stated rates checked against counts\. No problem found/);
});

test('counts that do not reproduce the stated rate are flagged; rounding to the stated precision is not', () => {
  const off = m({ ...full, stdApproved: '904' });
  assert.ok(off.findings.some((f) => /stated standard approved rate, 92\.4%, does not match its counts: 904 of 1,000 is 90\.4%/.test(f)));
  assert.equal(m({ ...full, stdApprovedPct: '92', stdDeniedPct: '8' }).findings.length, 0, '92.4 rounds to the stated 92');
  assert.equal(m({ ...full, stdApproved: '925', stdDenied: '75' }).findings.length, 2, '92.5 is not the stated 92.4');
});

test('a report missing a required element lists it', () => {
  const r = m({ ...full, appealApprovedPct: '', expMedian: '' });
  assert.deepEqual(r.missing, ['(4) the percentage of standard requests approved after appeal', '(9) the average and median decision time for expedited requests']);
  assert.ok(r.notes.some((n) => /^Required elements not entered: \(4\).*If the report does not post them, it is missing them/.test(n)));
  assert.ok(m({ ...full, list: 'no' }).findings.some((f) => /does not post the list/.test(f)));
});

test('a rate posted without counts is carried, never back-computed', () => {
  const r = m({ ...full, stdTotal: '', stdApproved: '', stdDenied: '' });
  assert.equal(r.checked, 0);
  assert.equal(r.findings.length, 0);
  assert.ok(r.notes.some((n) => /never back-computed/.test(n)));
});

test('impossible figures are flagged', () => {
  assert.ok(m({ ...full, stdDeniedPct: '9' }).findings.some((f) => /add to 101\.4%, more than 100%/.test(f)));
  assert.ok(m({ ...full, stdApproved: '1200' }).findings.some((f) => /counts are inconsistent/.test(f)));
});

test('median decision times are set beside the deadline for the year reported', () => {
  assert.equal(m({ ...full, stdMedian: '240' }).findings.length, 0, '10 days is inside the 2025 14-day standard deadline');
  assert.ok(m({ ...full, reportYear: '2026', stdMedian: '240' }).findings.some((f) => /past the 7-calendar-day deadline for 2026 \(42 CFR 422\.568\(b\)\(1\)\)/.test(f)));
  assert.ok(m({ ...full, expMedian: '80' }).findings.some((f) => /past the 72-hour deadline/.test(f)));
  assert.equal(m({ ...full, program: 'medicaid-ffs', expMedian: '80' }).findings.length, 0, 'the FFS deadlines start in 2026');
  assert.ok(m({ ...full, program: 'qhp' }).notes.some((n) => /sets no prior authorization decision deadline/.test(n)));
});

test('blanks and out-of-range values are asked for', () => {
  assert.match(m({}).message, /^Choose the kind of plan/);
  assert.match(m({ program: 'ma' }).message, /^Enter the calendar year/);
  assert.match(m({ program: 'ma', reportYear: '2024' }).message, /The first reports cover 2025/);
  assert.match(m({ ...full, stdApprovedPct: '120' }).message, /must be between 0 and 100/);
  assert.match(m({ ...full, timeUnit: '' }).message, /^Choose whether the decision times are in days or hours/);
  assert.match(m({ ...full, stdTotal: '10.5' }).message, /whole number/);
});

test('spec-v1605: each entered rate is set beside the bundled market for the same program and year', () => {
  const r = m({ ...full, stdDeniedPct: '20', stdApprovedPct: '80', expDeniedPct: '9.91' });
  assert.ok(r.market.some((l) => /^Standard denied: 20% is above the middle half of 193 reports \(median 10\.69%, middle half 7\.14% to 15\.88%\)\.$/.test(l)));
  assert.ok(r.market.some((l) => /^Expedited denied: 9\.91% is within the middle half/.test(l)));
  assert.ok(r.notes.some((n) => /^Medicare Advantage contract reports for 2025 in the bundled table: 193 from Aetna \(CVS Health\), Centene, Humana, Kaiser Permanente, UnitedHealthcare, read October 7, 2026\. Each report counts once/.test(n)));
});

test('spec-v1605: with no reports for the program or year, the result says so and compares nothing', () => {
  for (const o of [{ ...full, program: 'medicaid-ffs' }, { ...full, reportYear: '2026' }]) {
    const r = m(o);
    assert.deepEqual(r.market, []);
    assert.ok(r.notes.some((n) => /^The bundled table has no .* reports for 202[56] yet, so these rates are not set beside other payers\.$/.test(n)));
  }
});

test('spec-v1605: Marketplace and Medicaid managed care rates are set beside their own markets', () => {
  assert.ok(m({ ...full, program: 'qhp' }).market.some((l) => /^Standard denied: 7\.6% is below the middle half of 55 reports \(median 20\.68%/.test(l)));
  assert.ok(m({ ...full, program: 'medicaid-mco' }).market.some((l) => / of 89 reports \(median /.test(l)));
});
