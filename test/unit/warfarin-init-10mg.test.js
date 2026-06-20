// spec-v133 2.3: Kovacs 10 mg warfarin initiation nomogram (Kovacs MJ, et al,
// Ann Intern Med 2003;138:714-719, Figure 1; reproduced identically by AAFP 2005
// and the RxFiles table). Day 1-2 = 10 mg; the day-3 INR sets days 3 and 4 (which
// can differ); the day-5 INR sets days 5/6/7 with the sub-table chosen by the
// day-3 band. INR checked on days 3 and 5 only. The 1.5-1.9 day-3 range is SPLIT.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { warfarinInit10mg } from '../../lib/warfarin-v133.js';

test('days 1 and 2 are a fixed 10 mg with no INR branch', () => {
  assert.equal(warfarinInit10mg({ day: 1 }).dose, 10);
  assert.equal(warfarinInit10mg({ day: 2 }).dose, 10);
  assert.equal(warfarinInit10mg({ day: 2 }).inrDriven, false);
});

test('AAFP worked example: day-3 INR 1.2 -> 15 mg on days 3 and 4', () => {
  assert.equal(warfarinInit10mg({ day: 3, inr3: 1.2 }).dose, 15);
  assert.equal(warfarinInit10mg({ day: 4, inr3: 1.2 }).dose, 15);
});

test('the day-3 1.5-1.9 range is split (1.5-1.6 vs 1.7-1.9)', () => {
  // 1.5-1.6 -> day3 10, day4 5
  assert.equal(warfarinInit10mg({ day: 3, inr3: 1.55 }).dose, 10);
  assert.equal(warfarinInit10mg({ day: 4, inr3: 1.55 }).dose, 5);
  // 1.7-1.9 -> day3 5, day4 5
  assert.equal(warfarinInit10mg({ day: 3, inr3: 1.8 }).dose, 5);
  assert.equal(warfarinInit10mg({ day: 4, inr3: 1.8 }).dose, 5);
});

test('day-3 high bands hold the dose', () => {
  assert.equal(warfarinInit10mg({ day: 3, inr3: 2.5 }).dose, 0); // 2.3-3.0 -> day3 0
  assert.equal(warfarinInit10mg({ day: 4, inr3: 2.5 }).dose, 2.5); // ...but day4 2.5
  assert.equal(warfarinInit10mg({ day: 3, inr3: 3.5 }).dose, 0); // >3.0 -> 0/0
  assert.equal(warfarinInit10mg({ day: 4, inr3: 3.5 }).dose, 0);
});

test('day-5 sub-table is selected by the day-3 band', () => {
  // day-3 1.2 -> group A; day-5 2.5 (2.0-3.0) -> D5 7.5, D6 5, D7 7.5
  assert.equal(warfarinInit10mg({ day: 5, inr3: 1.2, inr5: 2.5 }).dose, 7.5);
  assert.equal(warfarinInit10mg({ day: 6, inr3: 1.2, inr5: 2.5 }).dose, 5);
  assert.equal(warfarinInit10mg({ day: 7, inr3: 1.2, inr5: 2.5 }).dose, 7.5);
  // same day-5 INR but day-3 1.8 -> group B; day-5 2.0-3.0 -> all 5 mg
  assert.equal(warfarinInit10mg({ day: 5, inr3: 1.8, inr5: 2.5 }).dose, 5);
  // day-3 >3.0 -> group D; its upper edges shift (3.1-4.0): day-5 3.5 -> D5 0
  assert.equal(warfarinInit10mg({ day: 5, inr3: 3.5, inr5: 3.5 }).dose, 0);
  assert.equal(warfarinInit10mg({ day: 5, inr3: 3.5, inr5: 3.5 }).day5Band, 'INR 3.1-4.0');
});

test('missing INRs and out-of-range days surface the fallback', () => {
  assert.equal(warfarinInit10mg({ day: 3 }).valid, false); // no day-3 INR
  assert.equal(warfarinInit10mg({ day: 5, inr3: 1.5 }).valid, false); // no day-5 INR
  assert.equal(warfarinInit10mg({ day: 0 }).valid, false);
  assert.equal(warfarinInit10mg({ day: 8 }).valid, false);
  assert.equal(warfarinInit10mg({}).valid, false);
});
