// spec-v1389: the New Jersey civil commitment clocks (N.J.S.A. 30:4-27.10, 27.12, 27.20).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { njCivilCommitmentClock as nj } from '../../lib/nj-civil-commitment-clock-v1389.js';

test('screening route: 72 hours from the screening certificate, not from arrival', () => {
  const r = nj({ mode: 'screening', start: '2026-09-18T23:00' });
  assert.equal(r.deadlines[0].at, '2026-09-21T23:00');
  assert.match(r.band, /not from arrival/);
});

test('screening route: the 20-day hearing and the 14-day adjournment ceiling', () => {
  const r = nj({ mode: 'screening', start: '2026-09-18T23:00', committed: '2026-09-21' });
  assert.equal(r.deadlines[1].at, '2026-10-11');
  assert.equal(r.deadlines[2].at, '2026-10-25');
});

test('certificate checks are three-state: an unanswered check is not a pass', () => {
  const blank = nj({ mode: 'screening', start: '2026-09-18T23:00' });
  assert.ok(blank.checks.every((c) => /^Not assessed/.test(c)));
  assert.equal(blank.abnormal, false);
  assert.equal(nj({ mode: 'screening', start: '2026-09-18T23:00', psychiatrist: 'no' }).abnormal, true);
  assert.equal(nj({ mode: 'screening', start: '2026-09-18T23:00', relative: 'yes' }).abnormal, true);
});

test('voluntary discharge: the later of 48 hours and the end of the next working day', () => {
  // Friday 15:00: 48 h is Sunday 15:00; the next working day is Monday, which ends later.
  const fri = nj({ mode: 'voluntary', start: '2026-09-18T15:00' });
  assert.match(fri.band, /end of Monday, September 21, 2026/);
  // Tuesday 09:00: the next working day (Wednesday) ends before 48 h (Thursday 09:00).
  const tue = nj({ mode: 'voluntary', start: '2026-09-15T09:00' });
  assert.match(tue.band, /Thursday, September 17, 2026, 9:00 am/);
  // Across Labor Day 2026: Friday 09-04 -> next working day is Tuesday 09-08.
  assert.match(nj({ mode: 'voluntary', start: '2026-09-04T15:00' }).band, /Tuesday, September 8, 2026/);
});

test('the 30:4-27.9a continued hold is not offered, and says why', () => {
  assert.match(nj({ mode: 'screening', start: '2026-09-18T23:00' }).continuedHoldNote, /August 31, 2026/);
});

test('no route or no start prints no deadline', () => {
  assert.equal(nj({}).valid, false);
  assert.equal(nj({ mode: 'screening' }).valid, false);
  assert.equal(nj({ mode: 'voluntary', start: 'x' }).valid, false);
});
