// spec-v1637 tools 15 and 16: the 45-day administer-by date and the disposal deadlines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matInjectionAdminDeadline, CONDITIONS } from '../../lib/mat-injection-admin-deadline-v1637.js';
import { csDisposalClock } from '../../lib/cs-disposal-clock-v1637.js';

const now = new Date(2026, 9, 12);

test('administer-by date: 45 days after receipt, not the older 14', () => {
  const r = matInjectionAdminDeadline({ received: '2026-10-01' }, now);
  assert.deepEqual([r.administerBy, r.daysLeft, r.flag], ['2026-11-15', 34, 'administer-by']);
  assert.equal(matInjectionAdminDeadline({ received: '2026-08-01' }, now).flag, 'past-the-last-day');
  assert.equal(CONDITIONS.length, 6);
  assert.match(r.note, /Older references say 14 days/);
  assert.match(matInjectionAdminDeadline({}, now).message, /^Enter the date the practitioner received/);
});

test('reverse distributor: 30 calendar days after receipt', () => {
  const r = csDisposalClock({ who: 'reverse-distributor-receipt', trigger: '2026-10-01' }, now);
  assert.deepEqual([r.due, r.strictReading], ['2026-10-31', undefined]);
});

test('long-term care: three business days skip the weekend and the holiday, with the strict reading beside it', () => {
  // Stopped Thursday October 8, 2026. Friday 9 is day 1; Monday 12 is Columbus Day; Tuesday 13, Wednesday 14.
  const r = csDisposalClock({ who: 'ltc-resident-stopped', trigger: '2026-10-08' }, now);
  assert.deepEqual([r.due, r.strictReading], ['2026-10-14', '2026-10-11']);
  assert.match(r.note, /Read most strictly, three days is Sunday, October 11, 2026/);
  // Monday to Thursday with no weekend between: both readings agree.
  const m = csDisposalClock({ who: 'ltc-inner-liner-removed', trigger: '2026-10-19' }, now);
  assert.deepEqual([m.due, m.strictReading], ['2026-10-22', '2026-10-22']);
  assert.doesNotMatch(m.note, /Read most strictly/);
  assert.match(m.band, /^Store no later than/);
});

test('disposal: refusals', () => {
  assert.match(csDisposalClock({ trigger: '2026-10-01' }, now).message, /^Choose who is disposing/);
  assert.match(csDisposalClock({ who: 'ltc-resident-stopped' }, now).message, /^Enter the date the resident stopped/);
  assert.equal(csDisposalClock({ who: 'ltc-resident-stopped', trigger: '2026-02-30' }, now).valid, false);
});
