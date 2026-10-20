// spec-v1661: the two transplant tools buildable without the OPTN guides.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ischemiaTimeClock as clock } from '../../lib/ischemia-time-clock-v1661.js';
import { donorRecipientSizeMatch as size } from '../../lib/donor-recipient-size-match-v1661.js';

test('ischemia clock: intervals between labeled events, across midnight; the limit time', () => {
  const r = clock({ events: 'Cross-clamp, 2026-10-19 22:10\nRemoved from ice, 2026-10-20 09:40\nReperfusion, 2026-10-20 10:25', limitHours: '12' });
  assert.equal(r.totalMinutes, 735);
  assert.equal(r.bandLabel, '12 h 15 min');
  assert.ok(r.notes.includes('Cross-clamp to Removed from ice: 11 h 30 min.'));
  assert.match(r.band, /12 hours from Cross-clamp is 2026-10-20 10:10, before Reperfusion/);
  assert.equal(r.abnormal, true);
  assert.match(clock({ events: 'A, 2026-10-20 10:00\nB, 2026-10-20 09:00' }).message, /B is before A/);
  assert.match(clock({ events: 'A, 2026-02-30 10:00\nB, 2026-03-01 09:00' }).message, /Line 1/);
  assert.equal(clock({ events: 'A, 2026-10-20 10:00' }).valid, false);
});

test('size match: ratios in either unit; BSA by Mosteller; units must be chosen', () => {
  const r = size({ weightUnit: 'kg', heightUnit: 'cm', donorWeight: '80', recipientWeight: '64', donorHeight: '180', recipientHeight: '160' });
  assert.equal(r.weightRatio, 1.25);
  assert.equal(r.heightRatio, 1.13);
  assert.equal(r.bsaRatio, 1.19);
  const lb = size({ weightUnit: 'lb', heightUnit: 'in', donorWeight: '176.37', recipientWeight: '141.1', donorHeight: '70.87', recipientHeight: '62.99' });
  assert.equal(lb.weightRatio, 1.25);
  assert.match(size({ heightUnit: 'cm', donorWeight: '80', recipientWeight: '64', donorHeight: '180', recipientHeight: '160' }).message, /weight unit/);
  assert.equal(size({ weightUnit: 'kg', heightUnit: 'cm', donorWeight: '80', recipientWeight: '0', donorHeight: '180', recipientHeight: '160' }).valid, false);
});
