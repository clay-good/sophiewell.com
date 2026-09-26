// spec-v1507 tools 2, 3 and 7: Part B and Part D late penalties and the COBRA clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { partbLatePenalty as pb, partdLatePenalty as pd } from '../../lib/medicare-penalties-v1507.js';
import { cobraClock as cb } from '../../lib/cobra-clock-v1507.js';

test('Part B: 10% per full 12 months on the year\'s premium', () => {
  assert.equal(pb({ monthsLate: '38', year: '2026' }).monthlyPenalty, 60.87);
  assert.equal(pb({ monthsLate: '11', year: '2026' }).percent, 0);
  assert.equal(pb({ monthsLate: '24', year: '2026' }).percent, 20);
});

test('Part B and Part D ask for a year with no published figure, and accept one entered', () => {
  assert.match(pb({ monthsLate: '24', year: '2027' }).message, ASKING);
  assert.equal(pb({ monthsLate: '24', year: '2027', premium: '210' }).monthlyPenalty, 42);
  assert.match(pd({ gap1Start: '2025-01-15', gap1End: '2026-03-31', year: '2028' }).message, ASKING);
});

test('Part D: a 62-day gap does not count, 63 does; the Medicare.gov example rounds to $5.50', () => {
  assert.equal(pd({ gap1Start: '2025-01-01', gap1End: '2025-03-03', year: '2026' }).uncoveredMonths, 0);
  assert.equal(pd({ gap1Start: '2025-01-01', gap1End: '2025-03-04', year: '2026' }).uncoveredMonths, 2);
  const r = pd({ gap1Start: '2025-01-15', gap1End: '2026-03-31', year: '2026' });
  assert.equal(r.uncoveredMonths, 14);
  assert.equal(r.monthlyPenalty, 5.5);
  assert.equal(pd({ gap1Start: '2025-01-15', gap1End: '2026-03-31', year: '2027' }).monthlyPenalty, 5.8);
  assert.equal(pd({ gap1Start: '2025-01-15', gap1End: '2025-02-10', gap2Start: '2025-06-01', gap2End: '2025-09-30', year: '2026' }).uncoveredMonths, 4);
});

test('COBRA: 18, 29 and 36 months; the election window runs from the later date', () => {
  const r = cb({ event: 'employment', eventDate: '2026-08-31', employerAdministers: 'no', noticeDate: '2026-09-20', electionDate: '2026-10-15' });
  assert.equal(r.coverageEnds, '2028-02-29');
  assert.equal(r.electBy, '2026-11-19');
  assert.equal(cb({ event: 'employment', eventDate: '2026-03-15', employerAdministers: 'no', disability: 'yes' }).coverageEnds, '2028-08-15');
  assert.equal(cb({ event: 'other', eventDate: '2026-03-15', employerAdministers: 'yes' }).coverageEnds, '2029-03-15');
  assert.match(cb({ event: 'other', eventDate: '2026-03-15', employerAdministers: 'yes' }).notes.join(' '), /April 28, 2026/);
});

test('blanks that decide the answer are asked for', () => {
  for (const r of [pb({}), pd({}), pd({ gap1Start: '2025-01-01' }), cb({}), cb({ event: 'other' }), cb({ event: 'other', eventDate: '2026-03-15' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});

import { partaPremium as pa } from '../../lib/medicare-penalties-v1507.js';
import { medicareEnrollmentWindow as mw } from '../../lib/medicare-enrollment-window-v1507.js';

test('Part A premium: quarter tiers and the 10%-for-twice-the-years increase', () => {
  assert.equal(pa({ quarters: '40', year: '2026' }).premium, 0);
  assert.equal(pa({ quarters: '39', year: '2026' }).premium, 311);
  assert.equal(pa({ quarters: '29', year: '2026' }).premium, 565);
  const r = pa({ quarters: '34', year: '2026', monthsLate: '30' });
  assert.equal(r.increase, 31.1);
  assert.match(r.band, /for 4 years/);
  assert.match(pa({ quarters: '34', year: '2027' }).message, ASKING);
});

test('enrollment window: a birthday on the first makes the month before the month of eligibility', () => {
  const r = mw({ birthDate: '1961-07-01', enrollDate: '2026-05-10' });
  assert.equal(r.window, 'Initial enrollment period');
  assert.equal(r.coverageStarts, '2026-06-01');
  assert.match(r.band, /March 1, 2026 to September 30, 2026/);
});

test('enrollment window: the 3rd month after eligibility starts the next month; before eligibility, the eligibility month', () => {
  assert.equal(mw({ birthDate: '1961-07-15', enrollDate: '2026-10-02' }).coverageStarts, '2026-11-01');
  assert.equal(mw({ birthDate: '1961-07-15', enrollDate: '2026-05-02' }).coverageStarts, '2026-07-01');
});

test('enrollment window: special period to the 8th full month without employer coverage, and the general period', () => {
  assert.equal(mw({ birthDate: '1958-03-20', enrollDate: '2026-12-31', employerCoverageEnd: '2026-04-15' }).window, 'Special enrollment period');
  assert.equal(mw({ birthDate: '1958-03-20', enrollDate: '2027-01-02', employerCoverageEnd: '2026-04-15' }).window, 'General enrollment period');
  assert.equal(mw({ birthDate: '1958-03-20', enrollDate: '2026-05-10', employerCoverageEnd: '2026-04-15' }).coverageStarts, '2026-05-01');
  assert.equal(mw({ birthDate: '1958-03-20', enrollDate: '2026-07-10' }).window, 'No window open');
  assert.match(mw({ enrollDate: '2026-07-10' }).message, ASKING);
});

import { acaSepWindow as sp } from '../../lib/aca-sep-window-v1507.js';

test('Marketplace SEP: 60 days, 60 before for a loss, 90 after for Medicaid, and late notice', () => {
  assert.equal(sp({ event: 'other', eventDate: '2026-08-12' }).windowCloses, '2026-10-11');
  const loss = sp({ event: 'loss', eventDate: '2026-06-30' });
  assert.deepEqual([loss.windowOpens, loss.windowCloses], ['2026-05-01', '2026-08-29']);
  assert.equal(sp({ event: 'loss-medicaid', eventDate: '2026-06-30' }).windowCloses, '2026-09-28');
  assert.equal(sp({ event: 'other', eventDate: '2026-08-12', learnedDate: '2026-09-15' }).windowCloses, '2026-11-14');
});

test('Marketplace SEP: coverage start dates', () => {
  assert.equal(sp({ event: 'loss', eventDate: '2026-06-30', selectionDate: '2026-06-15' }).coverageStarts, '2026-07-01');
  assert.equal(sp({ event: 'loss', eventDate: '2026-06-30', selectionDate: '2026-07-10' }).coverageStarts, '2026-08-01');
  assert.equal(sp({ event: 'birth', eventDate: '2026-08-12', selectionDate: '2026-09-01' }).coverageStarts, '2026-08-12');
  assert.equal(sp({ event: 'marriage', eventDate: '2026-08-12', selectionDate: '2026-10-20' }).bandLabel, 'Outside the window');
  assert.match(sp({ event: 'loss' }).message, ASKING);
});
