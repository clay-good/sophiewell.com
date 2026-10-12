// spec-v1639 tools 7 and 9: CDC's 2024 late-or-missed pill figures and back-up when starting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contraceptiveMissedPill as mp } from '../../lib/contraceptive-missed-pill-v1639.js';
import { contraceptionStartBackup as sb, METHODS } from '../../lib/contraception-start-backup-v1639.js';

const C = 'combined-estrogen-progestin'; const N = 'norethindrone-or-norgestrel'; const D = 'drospirenone-only';

test('combined pill: CDC\'s own example, Monday 9:00 taken Monday 11:00 is late', () => {
  const r = mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-05T11:00' });
  assert.deepEqual([r.flag, r.abnormal, r.hoursSinceDue], ['late', false, 2]);
  assert.match(r.note, /No additional contraceptive protection is needed/);
  // By Tuesday 11:00 Monday's pill has been missed.
  assert.equal(mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-06T11:00' }).flag, 'one-missed');
});

test('combined pill: 24 hours is missed, 48 hours is two or more', () => {
  assert.equal(mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-06T08:59' }).flag, 'late');
  assert.equal(mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-06T09:00' }).flag, 'one-missed');
  assert.match(mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-07T09:00' }).message, /^Choose which week/);
  assert.match(mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-07T09:00', week: 'first-week-of-pack' }).message, /^Choose whether unprotected intercourse/);
  const r = mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-07T09:00', week: 'first-week-of-pack', intercourse: 'intercourse-yes' });
  assert.equal(r.flag, 'two-or-more-missed');
  assert.match(r.note, /Any other missed pills should be discarded/);
  assert.match(r.note, /seventh consecutive pill is taken on 2026-10-13/);
  assert.match(r.note, /the first week, intercourse yes, so this line applies/);
  const l = mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-07T09:00', week: 'last-week-of-pack' });
  assert.match(l.note, /omit the hormone-free interval/);
});

test('drospirenone: under 48 hours no back-up; 48 hours or more 7 days; no last-week rule', () => {
  assert.match(mp({ pillType: D, dueAt: '2026-10-05T09:00', nowAt: '2026-10-06T20:00' }).note, /Continue taking one pill a day until the pack is finished\. No additional/);
  const r = mp({ pillType: D, dueAt: '2026-10-05T09:00', nowAt: '2026-10-08T09:00', week: 'last-week-of-pack' });
  assert.match(r.note, /one or more missed pills will remain in the pack/);
  assert.match(r.note, /CDC gives no last-week rule for drospirenone/);
});

test('norethindrone or norgestrel: missed is more than 3 hours', () => {
  assert.equal(mp({ pillType: N, dueAt: '2026-10-05T09:00', nowAt: '2026-10-05T12:00' }).flag, 'not-missed');
  assert.match(mp({ pillType: N, dueAt: '2026-10-05T09:00', nowAt: '2026-10-05T12:01' }).message, /^Choose whether unprotected intercourse/);
  const r = mp({ pillType: N, dueAt: '2026-10-05T09:00', nowAt: '2026-10-05T12:01', intercourse: 'intercourse-no' });
  assert.equal(r.flag, 'missed');
  assert.match(r.note, /for 2 consecutive days/);
  assert.match(r.note, /48 hours from 2026-10-05 12:01 is 2026-10-07 12:01/);
});

test('missed pill: every result names CDC and the label; a count that disagrees is said', () => {
  const r = mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-05T19:00', missedCount: 2 });
  assert.match(r.note, /not the product's label/);
  assert.match(r.note, /The count entered \(2\) and the hours do not match/);
  assert.match(r.note, /It is not advice for a particular patient\.$/);
  assert.match(mp({ pillType: C, dueAt: '2026-10-05T09:00', nowAt: '2026-10-04T09:00' }).message, /after the time the pill was due/);
  assert.match(mp({ pillType: C, dueAt: '2026-02-30T09:00', nowAt: '2026-10-04T09:00' }).message, /^Enter the date and time the first/);
  assert.equal(mp({}).message, 'Choose the kind of pill.');
});

test('starting: CDC\'s six rows', () => {
  assert.deepEqual(METHODS.map((m) => [m.within, m.backup]), [[5, 7], [5, 2], [1, 7], [7, 7], [5, 7], [7, 7]]);
});

test('starting: the day bleeding starts is day 1; the boundary day needs no back-up', () => {
  const r = sb({ method: 'combined-pill-patch-or-ring', bleedingStarted: '2026-10-01', startDate: '2026-10-05' });
  assert.deepEqual([r.dayOfCycle, r.backupNeeded], [5, false]);
  const s = sb({ method: 'combined-pill-patch-or-ring', bleedingStarted: '2026-10-01', startDate: '2026-10-06' });
  assert.deepEqual([s.dayOfCycle, s.backupNeeded, s.backupDays, s.backupThrough], [6, true, 7, '2026-10-13']);
  assert.equal(sb({ method: 'drospirenone-minipill', bleedingStarted: '2026-10-01', startDate: '2026-10-01' }).backupNeeded, false);
  assert.equal(sb({ method: 'drospirenone-minipill', bleedingStarted: '2026-10-01', startDate: '2026-10-02' }).backupDays, 7);
  assert.equal(sb({ method: 'norethindrone-norgestrel-minipill', bleedingStarted: '2026-10-01', startDate: '2026-10-09' }).backupDays, 2);
  assert.equal(sb({ method: 'dmpa-shot', bleedingStarted: '2026-10-01', startDate: '2026-10-07' }).backupNeeded, false);
  assert.equal(sb({ method: 'levonorgestrel-iud', bleedingStarted: '2026-10-01', startDate: '2026-10-08' }).backupNeeded, true);
});

test('starting: refusals and Box 3', () => {
  assert.equal(sb({}).message, 'Choose the method being started.');
  assert.match(sb({ method: 'etonogestrel-implant' }).message, /bleeding started/);
  assert.match(sb({ method: 'etonogestrel-implant', bleedingStarted: '2026-10-01' }).message, /the method is placed/);
  assert.match(sb({ method: 'etonogestrel-implant', bleedingStarted: '2026-10-05', startDate: '2026-10-01' }).message, /on or after/);
  assert.match(sb({ method: 'etonogestrel-implant', bleedingStarted: '2026-10-01', startDate: '2026-10-03' }).note, /within 4 weeks postpartum/);
});
