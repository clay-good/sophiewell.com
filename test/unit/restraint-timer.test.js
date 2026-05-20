import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restraintTimer } from '../../lib/scoring-v4.js';

const T = '2026-05-19T12:00:00Z';

test('Violent adult -> q4h order renewal, 15-min nursing, 1-h face-to-face', () => {
  const r = restraintTimer({ type: 'violent', ageYears: 40, orderTimestamp: T });
  assert.equal(r.nextRenewalIso, '2026-05-19T16:00:00.000Z');
  assert.equal(r.nextReassessIso, '2026-05-19T12:15:00.000Z');
  assert.equal(r.nextFaceToFaceIso, '2026-05-19T13:00:00.000Z');
});

test('Violent age 9-17 -> q2h renewal', () => {
  const r = restraintTimer({ type: 'violent', ageYears: 12, orderTimestamp: T });
  assert.equal(r.nextRenewalIso, '2026-05-19T14:00:00.000Z');
});

test('Violent age <9 -> q1h renewal', () => {
  const r = restraintTimer({ type: 'violent', ageYears: 6, orderTimestamp: T });
  assert.equal(r.nextRenewalIso, '2026-05-19T13:00:00.000Z');
});

test('Non-violent medical-surgical -> calendar-day renewal; no face-to-face', () => {
  const r = restraintTimer({ type: 'non-violent', ageYears: 70, orderTimestamp: T });
  assert.equal(r.nextRenewalIso, '2026-05-20T12:00:00.000Z');
  assert.equal(r.nextFaceToFaceIso, null);
});

test('Rejects unknown type or missing timestamp', () => {
  assert.throws(() => restraintTimer({ type: 'foo', ageYears: 40, orderTimestamp: T }));
  assert.throws(() => restraintTimer({ type: 'violent', ageYears: 40 }));
});
