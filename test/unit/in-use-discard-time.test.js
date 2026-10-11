// spec-v1630 tool 12: an opened container, when to discard (CDC, reporting USP <797>).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inUseDiscardTime as d, MULTI_DOSE_DAYS, SOURCE } from '../../lib/in-use-discard-time-v1630.js';

test('a multi-dose vial with no label date: 28 days from opening', () => {
  assert.equal(MULTI_DOSE_DAYS, 28);
  const r = d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2027-03' });
  assert.deepEqual([r.discardBy, r.setBy, r.limitHours], ['2026-11-02T09:30', 'limit', 672]);
  assert.match(r.band, /^Discard by November 2, 2026, 9:30 am, set by 28 days/);
  assert.equal(SOURCE.route, 'B');
});

test('never later than the expiration date, whether a day or a month and year', () => {
  const day = d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2026-10-20' });
  assert.deepEqual([day.setBy, day.discardBy], ['expiration', '2026-10-21T00:00']);
  assert.match(day.band, /Discard by the end of October 20, 2026/);
  const month = d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2026-10' });
  assert.deepEqual([month.setBy, month.discardBy], ['expiration', '2026-11-01T00:00']);
  assert.match(month.band, /the end of October 2026/);
  // A limit that ends on the expiration day itself is still inside it.
  assert.equal(d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2026-11-02' }).setBy, 'limit');
});

test('a label limit is the reader\'s, in hours or days', () => {
  const bulk = d({ container: 'label-limit', opened: '2026-10-05T09:30', expiration: '2027-03-31', limit: 4, limitUnit: 'hours' });
  assert.deepEqual([bulk.discardBy, bulk.limitHours], ['2026-10-05T13:30', 4]);
  const pen = d({ container: 'label-limit', opened: '2026-10-05T22:30', expiration: '2027-03-31', limit: 56, limitUnit: 'days' });
  assert.equal(pen.discardBy, '2026-11-30T22:30');
  // A manufacturer's own date for an opened multi-dose vial replaces the 28 days.
  assert.equal(d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2027-03-31', limit: 42, limitUnit: 'days' }).discardBy, '2026-11-16T09:30');
  assert.match(d({ container: 'label-limit', opened: '2026-10-05T09:30', expiration: '2027-03-31' }).message, /supplies a limit only for a multi-dose vial/);
  assert.match(d({ container: 'label-limit', opened: '2026-10-05T09:30', expiration: '2027-03-31', limit: 4 }).message, /hours or days/);
  assert.match(d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2027-03-31', limitUnit: 'days' }).message, /unit was chosen with no limit/);
});

test('a single-dose container gets no time', () => {
  const r = d({ container: 'single-dose' });
  assert.deepEqual([r.valid, r.discardAfterSingleUse, r.discardBy], [true, true, undefined]);
  assert.match(r.band, /^Discard after the single use/);
});

test('a vial opened after it expired, and dates that do not parse, are refused', () => {
  assert.match(d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2026-09' }).message, /already expired/);
  assert.match(d({ container: 'multi-dose', opened: '2026-10-05', expiration: '2026-12' }).message, /date and time/);
  assert.match(d({ container: 'multi-dose', opened: '2026-02-30T09:30', expiration: '2026-12' }).message, /date and time/);
  assert.match(d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2026-13' }).message, /expiration date/);
  assert.match(d({ container: 'multi-dose', opened: '2026-10-05T09:30' }).message, /expiration date/);
  assert.match(d({}).message, /Choose the container/);
  assert.match(d({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '2027-03' }).note, /vaccine/);
});

test('a month boundary and a leap day are counted on the calendar', () => {
  assert.equal(d({ container: 'multi-dose', opened: '2028-02-10T08:00', expiration: '2029-01' }).discardBy, '2028-03-09T08:00');
  assert.equal(d({ container: 'multi-dose', opened: '2027-02-10T08:00', expiration: '2029-01' }).discardBy, '2027-03-10T08:00');
});
