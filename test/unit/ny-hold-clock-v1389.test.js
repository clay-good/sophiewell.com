// spec-v1389: New York psychiatric hold deadlines (MHL 9.39, 9.37, 9.40, 9.13, 9.27).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyMhlHoldClock as ny } from '../../lib/ny-mhl-hold-clock-v1389.js';

test('9.37: 72 hours excluding Sundays and holidays crosses a Sunday and Lincoln\'s Birthday (acceptance)', () => {
  // Thursday 2027-02-11 10:00. Friday is Lincoln's Birthday, Sunday is skipped, and Monday 2027-02-15
  // is Washington's Birthday: 14 (Thu) + 24 (Sat) + 24 (Tue) + 10 (Wed) = 72.
  const r = ny({ status: '9.37', start: '2027-02-11T10:00' });
  assert.equal(r.deadlines[0].at, '2027-02-17T10:00');
  assert.deepEqual(r.skipped, ["2027-02-12 (Lincoln's Birthday)", '2027-02-14 (Sunday)', "2027-02-15 (Washington's Birthday)"]);
});

test('9.39: the 48 hours count Sundays and holidays; 15 days and the 5-day hearing', () => {
  const r = ny({ status: '9.39', start: '2027-02-11T10:00', hearingRequested: '2027-02-12T09:00' });
  assert.equal(r.deadlines[0].at, '2027-02-13T10:00'); // straight through Lincoln's Birthday
  assert.equal(r.deadlines[1].at, '2027-02-26');
  assert.equal(r.deadlines[2].at, '2027-02-17');
});

test('9.40: 6, 24, and 72 hours, all from CPEP registration', () => {
  const r = ny({ status: '9.40', start: '2026-09-18T22:00' });
  assert.deepEqual(r.deadlines.map((d) => d.at), ['2026-09-19T04:00', '2026-09-19T22:00', '2026-09-21T22:00']);
});

test('9.13: 72 hours from receipt of the written notice, with no Sunday exclusion', () => {
  const r = ny({ status: '9.13', start: '2026-09-18T09:00' });
  assert.equal(r.deadlines[0].at, '2026-09-21T09:00');
  assert.match(r.band, /60 days/);
});

test('9.27: the application must be executed within 10 days before admission', () => {
  assert.equal(ny({ status: '9.27', executed: '2026-09-04', start: '2026-09-14T09:00' }).abnormal, false); // 10 days
  const late = ny({ status: '9.27', executed: '2026-09-01', start: '2026-09-14T09:00' });
  assert.equal(late.abnormal, true);
  assert.match(late.band, /outside the 10 days/);
  assert.equal(ny({ status: '9.27', executed: '2026-09-15', start: '2026-09-14T09:00' }).valid, false);
});

test('no status or no start time prints no deadline', () => {
  assert.equal(ny({}).valid, false);
  assert.equal(ny({ status: '9.37' }).valid, false);
  assert.equal(ny({ status: '9.40', start: 'now' }).valid, false);
  assert.equal(ny({ status: '9.99', start: '2026-09-18T09:00' }).valid, false);
});
