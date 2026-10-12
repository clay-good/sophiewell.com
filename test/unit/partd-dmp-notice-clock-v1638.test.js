// spec-v1638 tool 9: drug management program notice and limitation dates (42 CFR 423.153(f)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdDmpNoticeClock } from '../../lib/partd-dmp-notice-clock-v1638.js';

const n = (o) => partdDmpNoticeClock({ initialNotice: '2026-03-01', ...o });

test('with no determination: day 30 to day 60', () => {
  const r = n({});
  assert.deepEqual([r.responsePeriodEnds, r.secondNoticeEarliest, r.secondNoticeLatest], ['2026-03-31', '2026-03-31', '2026-04-30']);
});

test('a determination sets the latest date at 3 days after it, or day 60 if that is earlier', () => {
  assert.equal(n({ determination: '2026-04-10', found: 'found-not-exempt' }).secondNoticeLatest, '2026-04-13');
  // Day 59 (April 29): 3 days later is past day 60, so day 60 governs.
  assert.equal(n({ determination: '2026-04-29', found: 'found-not-exempt' }).secondNoticeLatest, '2026-04-30');
  // Day 27 (March 28): 3 days later is day 30, the one date that meets both limits.
  const edge = n({ determination: '2026-03-28', found: 'found-not-exempt' });
  assert.deepEqual([edge.secondNoticeEarliest, edge.secondNoticeLatest, edge.flag], ['2026-03-31', '2026-03-31', 'dates']);
});

test('a non-exempt determination before day 27 leaves no date, and none is invented', () => {
  const r = n({ determination: '2026-03-27', found: 'found-not-exempt' });
  assert.deepEqual([r.flag, r.secondNoticeEarliest, r.secondNoticeLatest], ['no-date-meets-both-limits', null, null]);
});

test('an exempt member: the alternate notice within 3 days, even inside the first 30', () => {
  const r = n({ determination: '2026-03-10', found: 'found-exempt', secondNoticeSent: '2026-03-12' });
  assert.deepEqual([r.secondNoticeLatest, r.secondNoticeInWindow], ['2026-03-13', true]);
});

test('a notice already sent is checked against its window', () => {
  assert.equal(n({ secondNoticeSent: '2026-03-30' }).flag, 'notice-outside-its-window');
  assert.equal(n({ secondNoticeSent: '2026-03-31' }).secondNoticeInWindow, true);
  assert.equal(n({ secondNoticeSent: '2026-05-01' }).secondNoticeInWindow, false);
});

test('prescriber outreach in business days; the limitation ends after one or two years', () => {
  // First attempt Monday March 2; 10 business days later is Monday March 16.
  assert.equal(n({ outreachAttempts: '2026-03-02, 2026-03-09, 2026-03-16' }).outreachAttemptsInWindow, 3);
  assert.equal(n({ outreachAttempts: '2026-03-02, 2026-03-09, 2026-03-17' }).outreachAttemptsInWindow, 2);
  assert.equal(n({ limitationEffective: '2026-05-01', extended: 'limitation-not-extended' }).limitationEnds, '2027-05-01');
  assert.equal(n({ limitationEffective: '2026-05-01', extended: 'limitation-extended' }).limitationEnds, '2028-05-01');
});

test('refusals', () => {
  assert.match(partdDmpNoticeClock({}).message, /^Enter the date of the initial notice/);
  assert.match(n({ determination: '2026-04-10' }).message, /^Choose whether the member was found exempt/);
  assert.match(n({ limitationEffective: '2026-05-01' }).message, /^Choose whether the limitation was extended/);
  assert.match(n({ determination: '2026-02-01', found: 'found-exempt' }).message, /not before the initial notice/);
  assert.match(n({ outreachAttempts: 'last week' }).message, /^Enter each prescriber outreach attempt/);
});
