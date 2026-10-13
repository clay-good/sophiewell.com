// spec-v1638 tool 11: COB, Poly-ACH and Poly-CNS by CMS's published method.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdConcurrentUseMeasures as cu } from '../../lib/partd-concurrent-use-measures-v1638.js';

const run = (members, fills) => cu({ measurementYear: 2025, members, fills });
const row = (r, id) => r.rows.find((x) => x.member === id);

test('COB: two opioid claims, 15 days, an index date 30 days before year end, 30 overlap days', () => {
  const r = run('A, 50, yes\nB, 50, yes\nC, 50, yes, cancer\nD, 17, yes\nE, 50, no', [
    'A, 2025-01-01, 30, oxycodone, opioid', 'A, 2025-02-01, 30, oxycodone, opioid', 'A, 2025-01-01, 30, lorazepam, benzodiazepine', 'A, 2025-02-05, 30, lorazepam, benzodiazepine',
    'B, 2025-01-01, 30, oxycodone, opioid', 'B, 2025-02-01, 30, oxycodone, opioid', 'B, 2025-01-01, 29, lorazepam, benzodiazepine', 'B, 2025-06-01, 30, lorazepam, benzodiazepine',
    'C, 2025-01-01, 30, oxycodone, opioid', 'C, 2025-02-01, 30, oxycodone, opioid', 'D, 2025-01-01, 30, oxycodone, opioid', 'D, 2025-02-01, 30, oxycodone, opioid', 'E, 2025-01-01, 30, oxycodone, opioid'].join('\n'));
  assert.deepEqual([r.cob.denominator, r.cob.numerator, r.cob.ratePercent], [2, 1, 50]);
  // A: opioid Jan 1-30 and Feb 1-Mar 2; benzo Jan 1-30 and Feb 5-Mar 6: 30 + 26 = 56 overlap days.
  assert.deepEqual([row(r, 'A').cob.overlapDays, row(r, 'A').cob.inNumerator], [56, true]);
  assert.deepEqual([row(r, 'B').cob.overlapDays, row(r, 'B').cob.inNumerator], [29, false]);
  assert.equal(row(r, 'C').cob.reason, 'excluded: cancer');
  assert.match(row(r, 'D').cob.reason, /under 18/);
  assert.equal(row(r, 'E').cob.reason, 'not continuously enrolled');
});

test('COB: 15 cumulative days, two dates, and the 30-day index line', () => {
  assert.match(row(run('A, 50, yes', 'A, 2025-01-01, 7, oxycodone, opioid\nA, 2025-02-01, 7, oxycodone, opioid'), 'A').cob.reason, /14 cumulative days/);
  assert.match(row(run('A, 50, yes', 'A, 2025-01-01, 30, oxycodone, opioid\nA, 2025-01-01, 30, morphine, opioid'), 'A').cob.reason, /fewer than two opioid claims on different dates/);
  assert.match(row(run('A, 50, yes', 'A, 2025-12-02, 10, oxycodone, opioid\nA, 2025-12-12, 10, oxycodone, opioid'), 'A').cob.reason, /29 days before the end of the year/);
  assert.equal(row(run('A, 50, yes', 'A, 2025-12-01, 10, oxycodone, opioid\nA, 2025-12-12, 10, oxycodone, opioid'), 'A').cob.inDenominator, true);
});

test('Poly-ACH needs two medications overlapping 30 days; Poly-CNS needs three', () => {
  const two = ['A, 2025-01-01, 30, oxybutynin, anticholinergic', 'A, 2025-02-01, 30, oxybutynin, anticholinergic', 'A, 2025-01-10, 30, amitriptyline, anticholinergic', 'A, 2025-02-10, 30, amitriptyline, anticholinergic'].join('\n');
  const r = run('A, 70, yes\nB, 64, yes', two + '\nB, 2025-01-01, 30, oxybutynin, anticholinergic\nB, 2025-02-01, 30, oxybutynin, anticholinergic');
  assert.deepEqual([r.polyAch.denominator, r.polyAch.numerator], [1, 1]);
  assert.match(row(r, 'B').polyAch.reason, /under 65/);
  // One medication with two claims: in the denominator, not in the numerator.
  const one = run('A, 70, yes', 'A, 2025-01-01, 30, oxybutynin, anticholinergic\nA, 2025-02-01, 30, oxybutynin, anticholinergic\nA, 2025-01-01, 60, amitriptyline, anticholinergic');
  assert.deepEqual([row(one, 'A').polyAch.inDenominator, row(one, 'A').polyAch.qualifyingMedications, row(one, 'A').polyAch.inNumerator], [true, 1, false]);
  const cns = (n) => ['zolpidem', 'gabapentin', 'sertraline'].slice(0, n).flatMap((m) => [`A, 2025-03-01, 30, ${m}, cns`, `A, 2025-04-01, 30, ${m}, cns`]).join('\n');
  assert.equal(row(run('A, 70, yes', cns(3)), 'A').polyCns.inNumerator, true);
  assert.equal(row(run('A, 70, yes', cns(2)), 'A').polyCns.inNumerator, false);
  assert.equal(row(run('A, 70, yes, seizure', cns(3)), 'A').polyCns.reason, 'excluded: seizure');
  // Poly-ACH has a 30-day index line; Poly-CNS states none.
  const late = (c) => `A, 2025-12-10, 10, x, ${c}\nA, 2025-12-20, 10, x, ${c}`;
  assert.equal(row(run('A, 70, yes', late('anticholinergic')), 'A').polyAch.inDenominator, false);
  assert.equal(row(run('A, 70, yes', late('cns')), 'A').polyCns.inDenominator, true);
});

test('supply stops at December 31, and nothing is dropped silently', () => {
  const r = run('A, 50, yes', 'A, 2025-11-01, 90, oxycodone, opioid\nA, 2025-11-15, 5, oxycodone, opioid\nA, 2025-11-01, 90, lorazepam, benzodiazepine\nA, 2025-11-02, 1, lorazepam, benzodiazepine\nA, 2026-01-05, 30, lorazepam, benzodiazepine');
  assert.equal(row(r, 'A').cob.overlapDays, 61);
  assert.match(r.note, /1 fill dated outside 2025 was not counted/);
  assert.match(cu({}).message, /measurement year/);
  assert.match(run('', 'x').message, /^Enter the members/);
  assert.match(run('A, 50, yes', 'Z, 2025-01-01, 30, x, opioid').message, /not listed/);
  assert.match(run('A, 50, yes', 'A, 2025-01-01, 30, x, sedative').message, /class on fill line 1/);
  assert.match(run('A, 50, yes', 'A, 2025-01-01, 30, , opioid').message, /medication/);
  assert.match(run('A, 50, yes, gout', 'A, 2025-01-01, 30, x, opioid').message, /exclusions from the list/);
});
