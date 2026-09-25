// spec-v1414: a blood component should finish within 4 hours after the container is entered
// (Circular of Information, 2024). Arithmetic on the 240-minute window.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blood4hWindow } from '../../lib/blood-4h-window-v1414.js';

test('an unspiked 300 mL unit needs at least 75 mL/h', () => {
  const r = blood4hWindow({ volumeMl: 300 });
  assert.equal(r.valid, true);
  assert.equal(r.minRateMlHr, 75);
  assert.equal(r.minutesLeft, 240);
  assert.match(r.band, /At least 75 mL\/h/);
  assert.ok(r.steps.some((s) => /slow initial rate/.test(s)));
});

test('elapsed time shrinks the window and the minimum rate rounds up', () => {
  const r = blood4hWindow({ volumeMl: 250, elapsedMin: 60 });
  assert.equal(r.minutesLeft, 180);
  assert.equal(r.minRateMlHr, 84); // 83.3 rounds up
});

test('a rate that finishes in time says so, with the margin', () => {
  const r = blood4hWindow({ volumeMl: 300, rateMlHr: 100 });
  assert.equal(r.finishesInTime, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /takes 3 h, ending 1 h before/);
});

test('a rate too slow is flagged, with the aliquot advice', () => {
  const r = blood4hWindow({ volumeMl: 300, rateMlHr: 60, elapsedMin: 30 });
  assert.equal(r.finishesInTime, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Will not finish in time: 300 mL at 60 mL\/h takes 5 h, 1 h 30 min past/);
  assert.match(r.band, /at least 86 mL\/h/);
  assert.ok(r.steps.some((s) => /smaller aliquots/.test(s)));
});

test('exactly at the limit still finishes', () => {
  assert.equal(blood4hWindow({ volumeMl: 300, rateMlHr: 75 }).finishesInTime, true);
});

test('past 4 hours there is no rate to give', () => {
  const r = blood4hWindow({ volumeMl: 100, elapsedMin: 240, rateMlHr: 200 });
  assert.equal(r.pastWindow, true);
  assert.equal(r.abnormal, true);
  assert.equal(r.minRateMlHr, null);
  assert.match(r.band, /Past the 4-hour window/);
});

test('missing or impossible inputs are refused', () => {
  assert.equal(blood4hWindow({}).valid, false);
  assert.equal(blood4hWindow({ volumeMl: '' }).valid, false);
  assert.equal(blood4hWindow({ volumeMl: 0 }).valid, false);
  assert.equal(blood4hWindow({ volumeMl: 300, rateMlHr: 0 }).valid, false);
  assert.equal(blood4hWindow({ volumeMl: 300, rateMlHr: 'fast' }).valid, false);
  assert.equal(blood4hWindow({ volumeMl: 300, elapsedMin: -5 }).valid, false);
});

test('a rate or volume that overflows is refused, never printed as Infinity', () => {
  assert.equal(blood4hWindow({ volumeMl: 300, rateMlHr: 1e-308 }).valid, false);
  assert.equal(blood4hWindow({ volumeMl: 1e308, elapsedMin: 239.99 }).valid, false);
});

test('a blank spiking time is named as an assumption, not applied silently (spec-v1432)', () => {
  assert.ok(blood4hWindow({ volumeMl: 300, rateMlHr: 60 }).steps.some((s) => /No spiking time was entered/.test(s)));
  assert.ok(!blood4hWindow({ volumeMl: 300, rateMlHr: 60, elapsedMin: 0 }).steps.some((s) => /No spiking time/.test(s)));
});
