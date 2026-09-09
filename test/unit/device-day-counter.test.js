import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deviceDayCounter } from '../../lib/scoring-v4.js';

const INS = '2026-05-15T08:00:00Z';
const NOW = '2026-05-19T08:00:00Z';

test('Foley with no criteria checked -> remove-today banner', () => {
  const r = deviceDayCounter({
    device: 'foley', insertionTimestamp: INS, criteriaMet: [], asOf: NOW,
  });
  assert.equal(r.deviceDays, 4);
  assert.ok(r.removeToday);
  assert.ok(r.banners.some((b) => b.includes('remove Foley today')));
});

test('Central line with no criteria -> remove-today banner uses CLABSI phrasing', () => {
  const r = deviceDayCounter({
    device: 'central-line', insertionTimestamp: INS, criteriaMet: [], asOf: NOW,
  });
  assert.ok(r.banners.some((b) => b.includes('central line')));
});

test('Criteria present -> no remove-today banner', () => {
  const r = deviceDayCounter({
    device: 'foley', insertionTimestamp: INS,
    criteriaMet: ['Acute urinary retention'], asOf: NOW,
  });
  assert.equal(r.removeToday, false);
  assert.ok(!r.banners.some((b) => b.includes('remove Foley today')));
});

test('Day count and hour remainder computed', () => {
  const r = deviceDayCounter({
    device: 'foley', insertionTimestamp: INS,
    criteriaMet: ['x'], asOf: '2026-05-19T14:00:00Z',
  });
  assert.equal(r.deviceDays, 4);
  assert.equal(r.deviceHours, 6);
});

test('Day 2+ adds re-verify daily-removal banner', () => {
  const r = deviceDayCounter({
    device: 'foley', insertionTimestamp: INS,
    criteriaMet: ['x'], asOf: NOW,
  });
  assert.ok(r.banners.some((b) => b.includes('re-verify')));
});

test('Unknown device throws', () => {
  assert.throws(() => deviceDayCounter({ device: 'peripheral-iv', insertionTimestamp: INS }));
});

test('Missing insertion throws', () => {
  assert.throws(() => deviceDayCounter({ device: 'foley' }));
});

// spec-v1173: the count is measured from NOW, so a pinned insertion time runs
// away. code-blue-clock got this note in spec-v1018 and its neighbour here did
// not: the worked example reads "Device-days: 117 d 0 h" beside "remove Foley
// today", which is not a scenario anyone wrote. The note claims no clinical
// implausibility -- a chronic indwelling catheter is real -- it says only where
// the number came from, which is the thing the reader cannot see.
test('a long dwell counted to now says where the number came from', () => {
  const r = deviceDayCounter({
    device: 'foley', insertionTimestamp: '2020-01-01T08:00', criteriaMet: ['x'],
  });
  assert.match(r.dwellNote, /Counted to now/);
  assert.match(r.dwellNote, /the count moves with the clock/);
});

test('and stays quiet when the reading is pinned, or the dwell is ordinary', () => {
  // A pinned `asOf` is not a reading from the clock, so there is nothing to say.
  assert.equal(deviceDayCounter({
    device: 'foley', insertionTimestamp: '2020-01-01T08:00', asOf: '2020-06-01T08:00', criteriaMet: ['x'],
  }).dwellNote, null);
  // And an ordinary dwell is the case the tile is for.
  const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
  assert.equal(deviceDayCounter({
    device: 'foley', insertionTimestamp: threeDaysAgo, criteriaMet: ['x'],
  }).dwellNote, null);
});
