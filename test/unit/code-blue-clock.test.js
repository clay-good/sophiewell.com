import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codeBlueClock } from '../../lib/scoring-v4.js';

const START = '2026-05-19T12:00:00Z';

test('Next rhythm check = lastRhythmCheck + 2 min', () => {
  const r = codeBlueClock({
    codeStartTimestamp: START,
    lastRhythmCheck:    '2026-05-19T12:06:00Z',
    asOf:               '2026-05-19T12:08:00Z',
  });
  assert.equal(r.nextRhythmCheckIso, '2026-05-19T12:08:00.000Z');
});

test('Next epi = lastEpi + 4 min (midpoint of q3-5 min)', () => {
  const r = codeBlueClock({
    codeStartTimestamp: START,
    lastEpi:            '2026-05-19T12:04:00Z',
    asOf:               START,
  });
  assert.equal(r.nextEpiIso, '2026-05-19T12:08:00.000Z');
});

test('No last rhythm check -> 2 min after code start', () => {
  const r = codeBlueClock({ codeStartTimestamp: START, asOf: START });
  assert.equal(r.nextRhythmCheckIso, '2026-05-19T12:02:00.000Z');
});

test('Captures last shock energy and cycle count', () => {
  const r = codeBlueClock({
    codeStartTimestamp: START, asOf: START,
    lastShockJ: 200, cycleCount: 3,
  });
  assert.equal(r.lastShockJ, 200);
  assert.equal(r.cycleCount, 3);
});

test('minutesFromStart computed from asOf', () => {
  const r = codeBlueClock({
    codeStartTimestamp: START,
    asOf:               '2026-05-19T12:10:00Z',
  });
  assert.equal(r.minutesFromStart, 10);
});

test('Banner pins AHA 2020 cadence + ETCO2 ROSC target', () => {
  const r = codeBlueClock({ codeStartTimestamp: START, asOf: START });
  assert.ok(r.banner.includes('AHA 2020'));
  assert.ok(r.banner.includes('ETCO2'));
});

test('Missing code start throws', () => {
  assert.throws(() => codeBlueClock({}));
});
