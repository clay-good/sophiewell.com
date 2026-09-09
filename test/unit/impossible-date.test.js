// spec-v1170: a date that passes the shape test and is not a real calendar date.
//
// `new Date(2026, 12, 45)` and `Date.UTC(2026, 12, 45)` do not fail -- they roll
// over silently to 2027-02-14. Four parsers in this repo tested the SHAPE of a
// date string and then handed the components to one of those constructors, and
// only one of the four (lib/deadline.js's parseIsoStrict) round-tripped the
// result back out to see whether it was the day it had been given.
//
// This file pins the rule itself and then each entry point that reaches it, so a
// fifth parser cannot quietly go back to accepting 30 February.
import test from 'node:test';
import assert from 'node:assert/strict';

import { isRealYmd, ymd, localTimestamp } from '../../lib/num.js';
import { parseIsoStrict } from '../../lib/deadline.js';
import { parseDate } from '../../lib/pa/date.js';
import { rosendaalTtr } from '../../lib/gaps-v185.js';
import { eddFromLmp } from '../../lib/clinical-v4.js';
import { restraintTimer, bristolGirth } from '../../lib/scoring-v4.js';

test('isRealYmd knows the length of every month, leap years included', () => {
  assert.equal(isRealYmd(2026, 1, 31), true);
  assert.equal(isRealYmd(2026, 2, 28), true);
  assert.equal(isRealYmd(2026, 2, 29), false);
  assert.equal(isRealYmd(2024, 2, 29), true, '2024 is a leap year');
  assert.equal(isRealYmd(1900, 2, 29), false, '1900 is not: divisible by 100');
  assert.equal(isRealYmd(2000, 2, 29), true, '2000 is: divisible by 400');
  assert.equal(isRealYmd(2026, 4, 31), false, 'April has 30 days');
  assert.equal(isRealYmd(2026, 13, 1), false);
  assert.equal(isRealYmd(2026, 0, 1), false);
  assert.equal(isRealYmd(2026, 1, 0), false);
  assert.equal(isRealYmd(2026, 1, 1.5), false);
});

test('ymd takes the strict shape and the calendar, not one or the other', () => {
  assert.deepEqual(ymd('2026-03-14'), { y: 2026, mo: 3, d: 14 });
  assert.equal(ymd('2026-02-30'), null, 'the shape is right and the day is not');
  assert.equal(ymd('2026-13-45'), null);
  assert.equal(ymd('2026-3-4'), null, 'ymd is the two-digit form on purpose');
  assert.equal(ymd('3/14/2026'), null);
  assert.equal(ymd(''), null);
});

test('parseIsoStrict keeps the behaviour it had, through the shared rule', () => {
  assert.equal(parseIsoStrict('2026-03-14').toISOString(), '2026-03-14T00:00:00.000Z');
  assert.throws(() => parseIsoStrict('2026-02-30', 'surgery date'), /do not form a real date/);
  assert.throws(() => parseIsoStrict('2026-3-4', 'surgery date'), /must match YYYY-MM-DD/);
});

test('the PA engine returns null for an impossible day rather than the day after it', () => {
  assert.equal(parseDate('2026-03-14').toISOString(), '2026-03-14T00:00:00.000Z');
  assert.equal(parseDate('2026-2-30'), null);
  assert.equal(parseDate('13/45/2026'), null);
  assert.equal(parseDate('2/29/2024').toISOString(), '2024-02-29T00:00:00.000Z');
});

test('rosendaal-ttr will not score a record with a line it could not read', () => {
  const range = { low: 2, high: 3 };
  const clean = rosendaalTtr({ ...range, series: '2026-01-01 1.5\n2026-01-11 2.5\n2026-01-21 2.8' });
  assert.equal(clean.valid, true);
  assert.equal(clean.total, 20);
  assert.equal(clean.ttr, 80);

  // 30 February rolled over to 2 March: 20 days of record became 60, and the
  // time in range went from 80% to 88.3%.
  const rolled = rosendaalTtr({ ...range, series: '2026-01-01 1.5\n2026-02-30 2.5\n2026-01-21 2.8' });
  assert.equal(rolled.valid, false);
  assert.match(rolled.message, /line 2 \("2026-02-30 2\.5"\)/);

  // A line the old shape test rejected was dropped without a word, taking the
  // record from 16 of 20 days in range to 13 of 20 -- TTR 80% to exactly 65%,
  // the good-control threshold. A single-digit month is an ordinary way to write
  // an unambiguous date, so it is now read rather than skipped.
  const single = rosendaalTtr({ ...range, series: '2026-01-01 1.5\n2026-1-11 2.5\n2026-01-21 2.8' });
  assert.equal(single.valid, true);
  assert.equal(single.total, 20);
  assert.equal(single.ttr, 80);

  // Anything else it cannot read is named, by line and by text.
  const us = rosendaalTtr({ ...range, series: '2026-01-01 1.5\n01/11/2026 2.5\n2026-01-21 2.8' });
  assert.equal(us.valid, false);
  assert.match(us.message, /line 2/);
  assert.match(us.message, /YYYY-MM-DD INR/);
});

test('preg-dating refuses an impossible LMP instead of dating from a rollover', () => {
  const ok = eddFromLmp({ lmpIso: '2025-12-23', todayIso: '2026-03-12' });
  assert.equal(ok.edd, '2026-09-29');
  // LMP 2026-13-45 gave an EDD of 2027-11-21 and a 421-day discordance, which
  // reads as "redate by the ultrasound".
  assert.throws(() => eddFromLmp({ lmpIso: '2026-13-45', todayIso: '2026-03-12' }),
    /not a real calendar date/);
  assert.throws(() => eddFromLmp({ lmpIso: '12/23/2025', todayIso: '2026-03-12' }),
    /YYYY-MM-DD/);
});

test('a restraint clock needs a time of day, not just a date', () => {
  const ok = restraintTimer({ type: 'violent', ageYears: 40, orderTimestamp: '2026-05-19T12:00' });
  assert.equal(typeof ok.nextFaceToFaceIso, 'string');
  // `new Date('3/14/2026')` is local midnight, so the face-to-face deadline was
  // an hour after a time nobody entered.
  assert.throws(() => restraintTimer({ type: 'violent', ageYears: 40, orderTimestamp: '3/14/2026' }),
    /date and a time/);
  assert.throws(() => restraintTimer({ type: 'violent', ageYears: 40, orderTimestamp: '2026-02-30T12:00' }),
    /date and a time/);
});

test('bristol-girth drops the rate rather than timing it off a loose parse', () => {
  const base = { bristolType: 6, girthT0Cm: 90, girthT1Cm: 96 };
  const ok = bristolGirth({ ...base, t0Timestamp: '2026-05-19T08:00', t1Timestamp: '2026-05-19T10:00' });
  assert.equal(ok.intervalHours, 2);
  assert.equal(ok.deltaPerHourCm, 3);
  const loose = bristolGirth({ ...base, t0Timestamp: '5/19/2026', t1Timestamp: '2026-05-19T10:00' });
  assert.equal(loose.intervalHours, null);
  assert.equal(loose.deltaPerHourCm, null);
});

test('localTimestamp takes the control shape, the calendar and the clock', () => {
  assert.equal(localTimestamp('2026-05-19T12:00').getHours(), 12);
  assert.equal(localTimestamp('2026-5-9T12:00').getDate(), 9);
  assert.equal(localTimestamp('2026-05-19T12:00:30Z').toISOString(), '2026-05-19T12:00:30.000Z');
  assert.equal(localTimestamp('2026-05-19T25:00'), null);
  assert.equal(localTimestamp('2026-05-19T12:60'), null);
  assert.equal(localTimestamp('2026-02-30T12:00'), null);
  assert.equal(localTimestamp('March 14 2026'), null);
  assert.equal(localTimestamp('2026'), null);
});
