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
