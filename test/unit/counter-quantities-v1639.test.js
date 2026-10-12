// spec-v1639 tools 2 and 3: fingertip units and an oral suspension course.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topicalQuantityFtu, AREAS } from '../../lib/topical-quantity-ftu-v1639.js';
import { oralSuspensionCourse } from '../../lib/oral-suspension-course-v1639.js';

test('fingertip units: the seven areas of Long and Finlay 1991', () => {
  assert.deepEqual(AREAS.map((a) => [a.ftu, a.sd]), [[2.5, 0.8], [6.7, 1.7], [6.8, 1.2], [3.3, 1.0], [1.2, 0.4], [5.8, 1.7], [1.8, 0.6]]);
});

test('fingertip units: grams by sex, over applications and days, and tubes rounded up', () => {
  // Both arms and both hands: 2 x 3.3 + 2 x 1.2 = 9 units; 9 x 0.49 = 4.41 g; twice a day for 14 days = 123.48 g.
  const m = topicalQuantityFtu({ sex: 'male-ftu', arms: 2, hands: 2, applicationsPerDay: 2, days: 14, tubeGrams: 30 });
  assert.deepEqual([m.unitsPerApplication, m.gramsPerApplication, m.totalGrams, m.tubes], [9, 4.41, 123.5, 5]);
  const f = topicalQuantityFtu({ sex: 'female-ftu', arms: 2, hands: 2, applicationsPerDay: 2, days: 14 });
  assert.deepEqual([f.gramsPerApplication, f.totalGrams, f.tubes], [3.87, 108.4, undefined]);
});

test('fingertip units: refusals', () => {
  assert.match(topicalQuantityFtu({}).message, /^Choose the sex/);
  assert.match(topicalQuantityFtu({ sex: 'male-ftu' }).message, /^Enter at least one body area/);
  assert.match(topicalQuantityFtu({ sex: 'male-ftu', arms: 3 }).message, /arm and forearm/);
  assert.match(topicalQuantityFtu({ sex: 'male-ftu', faceNeck: 1 }).message, /^Enter the applications per day/);
});

test('suspension: volume, bottles of one size, leftover', () => {
  const r = oralSuspensionCourse({ doseMl: 7.5, dosesPerDay: 2, days: 10, bottleMl: 100 });
  assert.deepEqual([r.volumeNeededMl, r.bottles, r.leftoverMl], [150, 2, 50]);
  // 400 mg at 250 mg per 5 mL is 8 mL.
  assert.equal(oralSuspensionCourse({ doseMg: 400, mgPer5Ml: 250, dosesPerDay: 2, days: 10 }).doseMl, 8);
});

test('suspension: a course that outlasts the discard date needs a second bottle', () => {
  const r = oralSuspensionCourse({ doseMl: 5, dosesPerDay: 2, days: 14, bottleMl: 150, mixedOn: '2026-10-01', discardAfterDays: 10 });
  assert.deepEqual([r.discardDate, r.lastDoseDate, r.daysAfterDiscard, r.flag], ['2026-10-11', '2026-10-14', 3, 'course-outlasts-the-bottle']);
  assert.equal(oralSuspensionCourse({ doseMl: 5, dosesPerDay: 2, days: 10, mixedOn: '2026-10-01', discardAfterDays: 14 }).flag, 'course');
});

test('suspension: nothing is preset', () => {
  assert.match(oralSuspensionCourse({}).message, /^Enter the dose in mL/);
  assert.match(oralSuspensionCourse({ doseMg: 400, dosesPerDay: 2, days: 10 }).message, /label strength/);
  assert.match(oralSuspensionCourse({ doseMl: 5, dosesPerDay: 2, days: 10, mixedOn: '2026-10-01' }).message, /discard-after figure/);
  assert.match(oralSuspensionCourse({ doseMl: 5, dosesPerDay: 2, days: 10 }).note, /No mixing date or discard-after figure was entered/);
});
