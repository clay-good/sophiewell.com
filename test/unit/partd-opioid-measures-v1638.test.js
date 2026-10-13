// spec-v1638 tool 13: OHD, OMP and IOP-LD by CMS's published method.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdOpioidMeasures as om } from '../../lib/partd-opioid-measures-v1638.js';

const run = (members, fills) => om({ measurementYear: 2024, members, fills });
const row = (r, id) => r.rows.find((x) => x.member === id);
const M = (id, extra = '') => `${id}, 50, 12, 2024-12-31${extra}`;

test('OHD: an average of 90 MME or more over the episode', () => {
  const r = run([M('A'), M('B')].join('\n'), ['A, 2024-01-01, 30, 120, p1, x1', 'A, 2024-01-31, 30, 120, p1, x1', 'B, 2024-01-01, 30, 60, p1, x1', 'B, 2024-01-31, 30, 60, p1, x1'].join('\n'));
  assert.deepEqual([row(r, 'A').ohd.averageMmePerEpisodeDay, row(r, 'A').ohd.inNumerator, row(r, 'B').ohd.inNumerator], [120, true, false]);
  assert.deepEqual([r.ohd.denominatorMemberYears, r.ohd.numeratorMemberYears, r.ohd.ratePercent], [2, 1, 50]);
});

test('OHD: a gap in supply makes the two averages differ, and that is said', () => {
  // 30 days at 150 MME, a 60-day gap, 30 more: 9,000 MME over 120 episode days (75) or 60 covered days (150).
  const r = run(M('A'), 'A, 2024-01-01, 30, 150, p1, x1\nA, 2024-03-31, 30, 150, p1, x1');
  const a = row(r, 'A').ohd;
  assert.deepEqual([a.averageMmePerEpisodeDay, a.averageMmePerCoveredDay, a.readingsDisagree, a.inNumerator], [75, 150, true, true]);
  assert.match(r.note, /two readings of "average daily MME" fall on different sides of 90/);
});

test('the shared denominator: two dates, 15 days, 90 days of enrollment from the first claim', () => {
  assert.match(row(run(M('A'), 'A, 2024-01-01, 30, 50, p1, x1'), 'A').ohd.reason, /fewer than two opioid claims/);
  assert.match(row(run(M('A'), 'A, 2024-01-01, 7, 50, p1, x1\nA, 2024-02-01, 7, 50, p1, x1'), 'A').ohd.reason, /14 cumulative days/);
  assert.match(row(run('A, 50, 12, 2024-12-31', 'A, 2024-10-03, 30, 50, p1, x1\nA, 2024-11-03, 30, 50, p1, x1'), 'A').ohd.reason, /runs 89 days from the first opioid claim/);
  assert.equal(row(run(M('A', ', cancer'), 'A, 2024-01-01, 30, 50, p1, x1\nA, 2024-02-01, 30, 50, p1, x1'), 'A').omp.reason, 'excluded: cancer');
  assert.match(row(run('A, 17, 12, 2024-12-31', 'A, 2024-01-01, 30, 50, p1, x1\nA, 2024-02-01, 30, 50, p1, x1'), 'A').iop.reason, /under 18/);
});

test('OMP: four prescribers and four pharmacies inside 180 days', () => {
  const four = (gap) => [0, 1, 2, 3].map((k) => `A, 2024-0${1 + k * gap}-01, 10, 20, p${k}, x${k}`).join('\n');
  assert.equal(row(run(M('A'), four(1)), 'A').omp.inNumerator, true);
  // January, March, May, July: 182 days from first to last, so no 180-day window holds all four.
  assert.equal(row(run(M('A'), four(2)), 'A').omp.inNumerator, false);
  const three = [0, 1, 2, 3].map((k) => `A, 2024-0${1 + k}-01, 10, 20, p${k}, x${Math.min(k, 2)}`).join('\n');
  assert.equal(row(run(M('A'), three), 'A').omp.inNumerator, false);
});

test('IOP-LD: a 90-day lookback, then more than 7 days inside the 3-day window; member-years weight the rate', () => {
  const r = run(['A, 50, 12, 2024-12-31', 'B, 50, 6, 2024-06-30', 'C, 50, 12, 2024-12-31', 'D, 50, 12, 2024-12-31'].join('\n'), [
    'A, 2024-05-01, 5, 30, p1, x1', 'A, 2024-05-03, 3, 30, p1, x1',
    'B, 2024-05-01, 7, 30, p1, x1',
    'C, 2023-12-15, 30, 30, p1, x1', 'C, 2024-02-01, 30, 30, p1, x1',
    'D, 2024-05-01, 5, 30, p1, x1', 'D, 2024-05-04, 5, 30, p1, x1'].join('\n'));
  assert.deepEqual([row(r, 'A').iop.inNumerator, row(r, 'B').iop.inNumerator, row(r, 'D').iop.inNumerator], [true, false, false]);
  assert.match(row(r, 'C').iop.reason, /another opioid claim in the 90 days before it/);
  // Denominator member-years: A 1 + B 0.5 + D 1 = 2.5; numerator: A 1.
  assert.deepEqual([r.iopLd.denominatorMemberYears, r.iopLd.numeratorMemberYears, r.iopLd.ratePercent], [2.5, 1, 40]);
});

test('nothing is dropped silently', () => {
  assert.match(om({}).message, /measurement year/);
  assert.match(run('', 'x').message, /^Enter the members/);
  assert.match(run('A, 50, 12', 'A, 2024-01-01, 30, 50, p1, x1').message, /last day of enrollment in 2024/);
  assert.match(run(M('A'), 'A, 2024-01-01, 30, 50, p1').message, /prescriber and a pharmacy/);
  assert.match(run(M('A'), 'Z, 2024-01-01, 30, 50, p1, x1').message, /not listed/);
  assert.match(run(M('A'), 'A, 2024-01-01, 30, 50, p1, x1\nA, 2025-02-01, 30, 50, p1, x1').note, /1 fill dated after 2024/);
});
