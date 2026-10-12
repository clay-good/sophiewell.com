// spec-v1639 tool 8: emergency contraception, the labels' hours and CDC's 5 days.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emergencyContraceptionWindow as ec, PLAN_B, ELLA } from '../../lib/emergency-contraception-window-v1639.js';

const row = (label, extra = {}) => ({ label, splVersion: 5, publishedOn: '2023-02-02', verifiedOn: '2026-10-12', validThrough: '2027-10-12', ...extra });
const T = { [PLAN_B]: row('Plan B One-Step'), [ELLA]: row('ella') };
const NOW = new Date('2026-10-12T12:00:00Z');

test('inside both labels: the closing times are intercourse plus 72 and 120 hours', () => {
  const r = ec({ intercourseAt: '2026-10-10T22:00', nowAt: '2026-10-12T12:00' }, NOW, T);
  assert.deepEqual([r.hoursSinceIntercourse, r.flag, r.abnormal, r.planBLabelCloses, r.ellaLabelCloses], [38, 'inside-72-hours', false, '2026-10-13 22:00', '2026-10-15 22:00']);
  assert.match(r.note, /with 34 hours left; it closes 2026-10-13 22:00/);
  assert.match(r.note, /no sooner than 5 days after it \(2026-10-17 12:00\)/);
  assert.match(r.note, /It is not advice for a particular patient\.$/);
});

test('72 hours is inside the Plan B label; a minute more is past it and inside ella and CDC', () => {
  assert.equal(ec({ intercourseAt: '2026-10-09T12:00', nowAt: '2026-10-12T12:00' }, NOW, T).flag, 'inside-72-hours');
  const r = ec({ intercourseAt: '2026-10-09T11:59', nowAt: '2026-10-12T12:00' }, NOW, T);
  assert.deepEqual([r.flag, r.abnormal], ['past-72-hours-inside-5-days', true]);
  assert.match(r.note, /CDC's 5 days for levonorgestrel is longer than the Plan B label's 72 hours\. Both are shown; neither is preferred/);
  assert.equal(ec({ intercourseAt: '2026-10-07T11:59', nowAt: '2026-10-12T12:00' }, NOW, T).flag, 'past-5-days');
});

test('a label row that no longer stands is withheld; the other label and CDC still answer', () => {
  const t = { ...T, [PLAN_B]: row('Plan B One-Step', { supersededOn: '2026-11-01' }) };
  const r = ec({ intercourseAt: '2026-10-10T22:00', nowAt: '2026-10-12T12:00' }, NOW, t);
  assert.equal(r.withheld, true);
  assert.match(r.note, /The Plan B One-Step label line is withheld/);
  assert.doesNotMatch(r.note, /within 72 hours \(3 days\)/);
  assert.doesNotMatch(r.note, /within 2 hours of Plan B/);
  assert.match(r.note, /ella label: "as soon as possible within 120 hours/);
});

test('refusals', () => {
  assert.match(ec({}, NOW, T).message, /^Enter the date and time of unprotected intercourse/);
  assert.match(ec({ intercourseAt: '2026-10-10T22:00' }, NOW, T).message, /^Enter the date and time now/);
  assert.match(ec({ intercourseAt: '2026-10-10T22:00', nowAt: '2026-10-09T22:00' }, NOW, T).message, /after the time of intercourse/);
});
