// spec-v4 §7 step v4.4: COBRA timeline date math, >=5 scenarios.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cobraTimeline, addDays, addMonths, COBRA_MAX_MONTHS } from '../../lib/cobra.js';

test('addDays: handles month rollover', () => {
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(addDays('2026-12-31', 60), '2027-03-01');
});

test('addMonths: clamps to last day when target month is shorter', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29'); // leap year
});

test('cobraTimeline: job-loss-involuntary -> 18-month max', () => {
  const r = cobraTimeline({ qualifyingEventDate: '2026-05-01', qualifyingEventType: 'job-loss-involuntary' });
  assert.equal(r.maxMonths, 18);
  assert.equal(r.electionDeadline, '2026-06-30');           // +60 days
  assert.equal(r.firstPaymentDeadline, '2026-08-14');       // +45 days from election
  assert.equal(r.coverageEndIfElected, '2027-11-01');       // +18 months
});

test('cobraTimeline: divorce -> 36-month max', () => {
  const r = cobraTimeline({ qualifyingEventDate: '2026-03-15', qualifyingEventType: 'divorce' });
  assert.equal(r.maxMonths, 36);
  assert.equal(r.coverageEndIfElected, '2029-03-15');
});

test('cobraTimeline: disability extension -> 29-month max', () => {
  const r = cobraTimeline({ qualifyingEventDate: '2026-01-01', qualifyingEventType: 'disability-extension' });
  assert.equal(r.maxMonths, 29);
  assert.equal(r.coverageEndIfElected, '2028-06-01');
});

test('cobraTimeline: death-of-employee -> 36-month max', () => {
  const r = cobraTimeline({ qualifyingEventDate: '2026-07-04', qualifyingEventType: 'death-of-employee' });
  assert.equal(r.maxMonths, 36);
  assert.equal(r.coverageEndIfElected, '2029-07-04');
});

test('cobraTimeline: reduction-in-hours -> 18-month max with 105-day total election+payment window', () => {
  const r = cobraTimeline({ qualifyingEventDate: '2026-02-01', qualifyingEventType: 'reduction-in-hours' });
  assert.equal(r.electionDeadline, '2026-04-02');           // +60
  assert.equal(r.firstPaymentDeadline, '2026-05-17');       // +45 more (total 105)
});

test('cobraTimeline: throws on unknown qualifying event type', () => {
  assert.throws(() => cobraTimeline({ qualifyingEventDate: '2026-01-01', qualifyingEventType: 'made-up' }));
});

test('cobraTimeline: throws on malformed date', () => {
  assert.throws(() => cobraTimeline({ qualifyingEventDate: '2026/01/01', qualifyingEventType: 'divorce' }));
});

test('COBRA_MAX_MONTHS catalog covers the seven canonical events', () => {
  const required = ['job-loss-voluntary', 'job-loss-involuntary', 'reduction-in-hours',
    'disability-extension', 'divorce', 'death-of-employee', 'medicare-entitlement'];
  for (const k of required) assert.ok(COBRA_MAX_MONTHS[k]);
});
