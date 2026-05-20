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
