// spec-v1637 tools 19, 20, 21: DSCSA dispenser deadlines, sample size and the small-dispenser exemption.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dscsaSuspectSampleSize } from '../../lib/dscsa-suspect-sample-size-v1637.js';
import { dscsaSmallDispenserCheck } from '../../lib/dscsa-small-dispenser-check-v1637.js';
import { dscsaDispenserClocks } from '../../lib/dscsa-dispenser-clocks-v1637.js';

const now = new Date(2026, 9, 12);
const after = new Date(2027, 10, 28);

test('sample size: at least 3 or 10 percent, whichever is greater, rounded up; all if fewer than 3', () => {
  const v = (packages) => dscsaSuspectSampleSize({ packages, dispenser: 'not-a-small-business-dispenser' }, now).verify;
  assert.deepEqual([1, 2, 3, 10, 30, 31, 40, 41, 1000, 1001].map(v), [1, 2, 3, 3, 3, 4, 4, 5, 100, 101]);
});

test('sample size: a small business dispenser is told of the exemption, until it runs out', () => {
  const s = dscsaSuspectSampleSize({ packages: 50, dispenser: 'small-business-dispenser' }, now);
  assert.deepEqual([s.verify, s.exempt, s.exemptThrough], [5, true, '2027-11-27']);
  assert.equal(dscsaSuspectSampleSize({ packages: 50, dispenser: 'small-business-dispenser' }, new Date(2027, 10, 27)).exempt, true);
  const late = dscsaSuspectSampleSize({ packages: 50, dispenser: 'small-business-dispenser' }, after);
  assert.deepEqual([late.exempt, late.flag], [null, 'exemption-date-passed']);
  assert.match(dscsaSuspectSampleSize({ packages: 50 }, now).message, /^Choose whether this is a small business dispenser/);
  assert.match(dscsaSuspectSampleSize({ dispenser: 'small-business-dispenser' }, now).message, /^Enter the number of packages/);
  assert.match(dscsaSuspectSampleSize({ packages: 2.5, dispenser: 'small-business-dispenser' }, now).message, /whole number/);
});

test('small dispenser: 25 or fewer is exempt, 26 is not, and the exemption is not assumed after November 27, 2027', () => {
  assert.deepEqual([dscsaSmallDispenserCheck({ fullTimeStaff: 25 }, now).flag, dscsaSmallDispenserCheck({ fullTimeStaff: 0 }, now).exempt], ['exempt-until-2027-11-27', true]);
  assert.equal(dscsaSmallDispenserCheck({ fullTimeStaff: 26 }, now).flag, 'not-exempt');
  assert.deepEqual([dscsaSmallDispenserCheck({ fullTimeStaff: 10 }, after).flag, dscsaSmallDispenserCheck({ fullTimeStaff: 10 }, after).exempt], ['exemption-date-passed', null]);
  assert.match(dscsaSmallDispenserCheck({ fullTimeStaff: 10 }, now).note, /Nothing needs to be filed with FDA/);
  assert.match(dscsaSmallDispenserCheck({ fullTimeStaff: 10 }, now).note, /by owner, not by store/);
  assert.match(dscsaSmallDispenserCheck({}, now).message, /^Enter the number of full-time pharmacists/);
});

test('dispenser clocks: 24 hours from the determination, by the clock', () => {
  const r = dscsaDispenserClocks({ event: 'determined-illegitimate', when: '2026-10-09T16:30' });
  assert.equal(r.due, '2026-10-10T16:30');
  assert.match(dscsaDispenserClocks({ event: 'determined-illegitimate', when: '2026-10-09' }).message, /^Enter the time of the determination/);
});

test('dispenser clocks: 2 business days for a records request, with the strict reading beside it', () => {
  // Received Friday October 9, 2026; Monday October 12 is a federal holiday: Tuesday 13, Wednesday 14.
  const r = dscsaDispenserClocks({ event: 'received-records-request', when: '2026-10-09' });
  assert.deepEqual([r.due, r.strictReading], ['2026-10-14', '2026-10-11']);
  const mid = dscsaDispenserClocks({ event: 'received-records-request', when: '2026-10-20T09:00' });
  assert.deepEqual([mid.due, mid.strictReading], ['2026-10-22', '2026-10-22']);
  assert.match(r.note, /the dispenser paragraph is not on that list/);
});

test('dispenser clocks: 6 years of records, and refusals', () => {
  assert.equal(dscsaDispenserClocks({ event: 'concluded-investigation-or-disposition', when: '2026-10-09' }).due, '2032-10-09');
  assert.match(dscsaDispenserClocks({}).message, /^Choose what happened/);
  assert.match(dscsaDispenserClocks({ event: 'received-records-request' }).message, /^Enter the date it happened/);
  assert.equal(dscsaDispenserClocks({ event: 'received-records-request', when: '2026-02-30' }).valid, false);
});
