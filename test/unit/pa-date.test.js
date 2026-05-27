// spec-v52 §4.10: PA date helpers -- UTC-midnight arithmetic, format
// coverage, and leap-day handling. The engine reads dates through
// this module so two machines in different timezones produce
// byte-identical findings.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, isValidDate, diffDays, todayUtc } from '../../lib/pa/date.js';

test('parseDate accepts ISO YYYY-MM-DD as UTC midnight', () => {
  const d = parseDate('2026-05-27');
  assert.ok(isValidDate(d));
  assert.equal(d.toISOString(), '2026-05-27T00:00:00.000Z');
});

test('parseDate accepts US M/D/YYYY and MM/DD/YYYY', () => {
  assert.equal(parseDate('5/27/2026').toISOString(), '2026-05-27T00:00:00.000Z');
  assert.equal(parseDate('05/27/2026').toISOString(), '2026-05-27T00:00:00.000Z');
});

test('parseDate accepts long-form month names', () => {
  assert.equal(parseDate('May 27, 2026').toISOString(), '2026-05-27T00:00:00.000Z');
  assert.equal(parseDate('December 1, 2025').toISOString(), '2025-12-01T00:00:00.000Z');
});

test('parseDate folds 2-digit years per the 1970 cutover', () => {
  assert.equal(parseDate('5/27/69').toISOString(), '2069-05-27T00:00:00.000Z');
  assert.equal(parseDate('5/27/70').toISOString(), '1970-05-27T00:00:00.000Z');
});

test('parseDate returns null for unparseable / nullish input', () => {
  assert.equal(parseDate(null), null);
  assert.equal(parseDate(''), null);
  assert.equal(parseDate('not a date'), null);
  assert.equal(parseDate('Foob 1, 2026'), null);
});

test('diffDays handles leap-day spans correctly', () => {
  const a = parseDate('2024-03-01');
  const b = parseDate('2024-02-28');
  assert.equal(diffDays(a, b), 2); // Feb 29 2024 was a leap day
  const c = parseDate('2026-03-01');
  const d = parseDate('2026-02-28');
  assert.equal(diffDays(c, d), 1); // 2026 is not a leap year
});

test('todayUtc returns the UTC-midnight of the moment passed in', () => {
  const t = todayUtc(new Date('2026-05-27T18:30:00Z'));
  assert.equal(t.toISOString(), '2026-05-27T00:00:00.000Z');
});
