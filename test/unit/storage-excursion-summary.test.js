// spec-v1630 tool 15: temperature log excursions (CDC Vaccine Storage and Handling Toolkit, July 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storageExcursionSummary as s, RANGES, TOOLKIT } from '../../lib/storage-excursion-summary-v1630.js';

const log = '2026-10-01 08:00, 5\n2026-10-01 08:30, 8.4\n2026-10-01 09:00, 9.1\n2026-10-01 09:30, 7\n2026-10-01 10:00, 1.5\n2026-10-01 10:30, -0.2\n2026-10-01 11:00, 3';

test('the three ranges are the toolkit\'s, in both units as printed', () => {
  assert.deepEqual([RANGES.refrigerator.C, RANGES.refrigerator.F], [[2, 8], [36, 46]]);
  assert.deepEqual([RANGES.freezer.C, RANGES.freezer.F], [[-50, -15], [-58, 5]]);
  assert.deepEqual([RANGES['ultra-cold'].C, RANGES['ultra-cold'].F], [[-90, -60], [-130, -76]]);
  assert.equal(TOOLKIT.route, 'B');
});

test('each excursion runs from the first reading outside the range to the next one back inside', () => {
  const r = s({ unit: 'C', range: 'refrigerator', readings: log });
  assert.deepEqual([r.excursions, r.minutesAbove, r.minutesBelow, r.min, r.max, r.readings, r.abnormal], [2, 60, 60, -0.2, 9.1, 7, true]);
  assert.match(r.notes[1], /Excursion 1, above range: 2026-10-01 08:30 to 2026-10-01 09:30, 1 h 0 min; highest reading 9\.1 °C/);
  assert.match(r.notes[2], /Excursion 2, below range: 2026-10-01 10:00 to 2026-10-01 11:00, 1 h 0 min; lowest reading -0\.2 °C/);
  assert.match(r.notes.at(-1), /do not discard them/);
});

test('a refrigerator reading at 0 °C or colder is flagged; a freezer log is not', () => {
  const r = s({ unit: 'C', range: 'refrigerator', readings: log });
  assert.equal(r.freezingReadings, 1);
  assert.match(r.notes.join(' '), /Freezing flag: 1 reading at 0 °C or colder, first at 2026-10-01 10:30/);
  assert.equal(s({ unit: 'C', range: 'refrigerator', readings: '2026-10-01 08:00, 0\n2026-10-01 08:30, 0.1' }).freezingReadings, 1);
  assert.equal(s({ unit: 'F', range: 'refrigerator', readings: '2026-10-01 08:00, 32\n2026-10-01 08:30, 40' }).freezingReadings, 1);
  assert.equal(s({ unit: 'C', range: 'freezer', readings: '2026-10-01 08:00, -20\n2026-10-01 08:30, -21' }).freezingReadings, 0);
});

test('the ends of the range are inside it, and Fahrenheit is read against the printed Fahrenheit figure', () => {
  const edge = s({ unit: 'C', range: 'refrigerator', readings: '2026-10-01 08:00, 2\n2026-10-01 08:30, 8' });
  assert.deepEqual([edge.excursions, edge.abnormal, edge.bandLabel], [0, false, 'No excursion in this log']);
  assert.doesNotMatch(`${edge.band} ${edge.notes.join(' ')} ${edge.note}`, /usable\b(?!; the manufacturer decides)|safe to use|viable/);
  // 35.8 °F is 2.1 °C, inside 2 to 8 by conversion, but below the 36 °F the toolkit prints.
  assert.equal(s({ unit: 'F', range: 'refrigerator', readings: '2026-10-01 08:00, 35.8\n2026-10-01 08:30, 40' }).excursions, 1);
});

test('a log that ends outside the range says so, and a package-insert range can be entered', () => {
  const r = s({ unit: 'C', range: 'custom', low: -40, high: -15, readings: '2026-10-01 08:00, -45\n2026-10-01 08:30, -44' });
  assert.deepEqual([r.excursions, r.minutesBelow, r.low, r.high], [1, 30, -40, -15]);
  assert.match(r.notes[1], /still out of range at the last reading/);
  // The same log is inside CDC's general freezer range.
  assert.equal(s({ unit: 'C', range: 'freezer', readings: '2026-10-01 08:00, -45\n2026-10-01 08:30, -44' }).excursions, 0);
  assert.match(s({ unit: 'C', range: 'custom', low: 8, high: 2, readings: log }).message, /must be above the lowest/);
  assert.match(s({ unit: 'C', range: 'freezer', low: 1, readings: log }).message, /only with a range from the package insert/);
});

test('an excursion that crosses midnight is timed across the dates', () => {
  const r = s({ unit: 'C', range: 'refrigerator', readings: '2026-10-01 23:00, 9\n2026-10-02 01:30, 9.5\n2026-10-02 02:00, 5' });
  assert.deepEqual([r.excursions, r.minutesAbove], [1, 180]);
});

test('units and range are required; lines must parse and be in time order', () => {
  assert.match(s({ range: 'refrigerator', readings: log }).message, /°C or °F/);
  assert.match(s({ unit: 'C', readings: log }).message, /storage range/);
  assert.match(s({ unit: 'C', range: 'refrigerator', readings: '2026-10-01 08:00, 5' }).message, /at least two readings/);
  assert.match(s({ unit: 'C', range: 'refrigerator', readings: '2026-10-01 08:00, 5\n2026-10-01 07:30, 5' }).message, /Line 2: its time is not after/);
  assert.match(s({ unit: 'C', range: 'refrigerator', readings: '2026-02-30 08:00, 5\n2026-10-01 07:30, 5' }).message, /Line 1/);
  assert.match(s({ unit: 'C', range: 'refrigerator', readings: '2026-10-01 08:00, 5\n2026-10-01 08:30, cold' }).message, /line 2/);
});
