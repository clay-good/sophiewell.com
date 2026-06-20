// spec-v133 2.4: Crowther 5 mg warfarin initiation nomogram (Crowther MA, et al,
// Arch Intern Med 1999;159:46-48, Table 1). Day 1-2 = 5 mg fixed; days 3-6 are
// INR-banded. Day 5's low band is < 2.0 (not < 1.5 like days 3-4) -- the easy-to-
// mis-transcribe row guarded here. Out-of-range day or blank INR -> fallback.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { warfarinInit5mg } from '../../lib/warfarin-v133.js';

test('days 1 and 2 are a fixed 5 mg with no INR branch', () => {
  assert.equal(warfarinInit5mg({ day: 1 }).dose, 5);
  assert.equal(warfarinInit5mg({ day: 2 }).dose, 5);
  assert.equal(warfarinInit5mg({ day: 1 }).inrDriven, false);
});

test('day 3 bands: <1.5 -> 10, 1.5-1.9 -> 5, 2.0-3.0 -> 2.5, >3.0 -> 0', () => {
  assert.equal(warfarinInit5mg({ day: 3, inr: 1.4 }).dose, 10);
  assert.equal(warfarinInit5mg({ day: 3, inr: 1.6 }).dose, 5);
  assert.equal(warfarinInit5mg({ day: 3, inr: 2.5 }).dose, 2.5);
  assert.equal(warfarinInit5mg({ day: 3, inr: 3.0 }).dose, 2.5); // 3.0 is in-band (<=3.0)
  assert.equal(warfarinInit5mg({ day: 3, inr: 3.1 }).dose, 0);
});

test('day 4 bands differ from day 3 in the middle (1.5-1.9 -> 7.5)', () => {
  assert.equal(warfarinInit5mg({ day: 4, inr: 1.4 }).dose, 10);
  assert.equal(warfarinInit5mg({ day: 4, inr: 1.7 }).dose, 7.5);
  assert.equal(warfarinInit5mg({ day: 4, inr: 2.5 }).dose, 5);
  assert.equal(warfarinInit5mg({ day: 4, inr: 3.5 }).dose, 0);
});

test('day 5 uses a <2.0 low band (the transcription trap)', () => {
  // 1.9 sits in the day-5 low band (<2.0) -> 10 mg, where on day 3 the same INR
  // would fall in the 1.5-1.9 band -> 5 mg.
  assert.equal(warfarinInit5mg({ day: 5, inr: 1.9 }).dose, 10);
  assert.equal(warfarinInit5mg({ day: 5, inr: 2.5 }).dose, 5);
  assert.equal(warfarinInit5mg({ day: 5, inr: 3.2 }).dose, 0);
});

test('day 6 escalates the low band to 12.5 mg', () => {
  assert.equal(warfarinInit5mg({ day: 6, inr: 1.4 }).dose, 12.5);
  assert.equal(warfarinInit5mg({ day: 6, inr: 1.7 }).dose, 10);
  assert.equal(warfarinInit5mg({ day: 6, inr: 2.5 }).dose, 7.5);
  assert.equal(warfarinInit5mg({ day: 6, inr: 3.5 }).dose, 0);
});

test('out-of-range day or blank INR on an INR-driven day surfaces the fallback', () => {
  assert.equal(warfarinInit5mg({ day: 0 }).valid, false);
  assert.equal(warfarinInit5mg({ day: 7 }).valid, false);
  assert.equal(warfarinInit5mg({ day: 3 }).valid, false); // no INR
  assert.equal(warfarinInit5mg({ day: 3, inr: 0 }).valid, false);
  assert.equal(warfarinInit5mg({}).valid, false);
});
