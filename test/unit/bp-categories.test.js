import test from 'node:test';
import assert from 'node:assert/strict';
import { bpCategories as bp } from '../../lib/bp-categories-v843.js';

test('bp categories: the four categories on agreeing numbers', () => {
  assert.equal(bp({ systolic: 118, diastolic: 76 }).category, 'Normal');
  assert.equal(bp({ systolic: 125, diastolic: 76 }).category, 'Elevated');
  assert.equal(bp({ systolic: 135, diastolic: 85 }).category, 'Stage 1 hypertension');
  assert.equal(bp({ systolic: 150, diastolic: 95 }).category, 'Stage 2 hypertension');
});

test('bp categories: when the two numbers disagree the HIGHER category applies', () => {
  // The point of the tile. Reading the systolic column alone calls this stage 1.
  const r = bp({ systolic: 135, diastolic: 95 });
  assert.equal(r.category, 'Stage 2 hypertension');
  assert.equal(r.setBy, 'diastolic');
  assert.ok(r.higherCategoryNote.includes('the higher one applies'));
  // And the other way round.
  const s = bp({ systolic: 145, diastolic: 75 });
  assert.equal(s.category, 'Stage 2 hypertension');
  assert.equal(s.setBy, 'systolic');
  // Agreeing numbers raise no note.
  assert.equal(bp({ systolic: 118, diastolic: 76 }).higherCategoryNote, null);
});

test('bp categories: there is no diastolic route to elevated', () => {
  // Elevated is the only category defined by AND, so a raised diastolic lands at stage 1.
  const r = bp({ systolic: 125, diastolic: 85 });
  assert.equal(r.category, 'Stage 1 hypertension');
  assert.ok(r.noElevatedByDiastoleNote.includes('cannot reach it'));
  assert.equal(bp({ systolic: 125, diastolic: 76 }).noElevatedByDiastoleNote, null);
});

test('bp categories: the boundaries', () => {
  assert.equal(bp({ systolic: 119, diastolic: 79 }).category, 'Normal');
  assert.equal(bp({ systolic: 120, diastolic: 79 }).category, 'Elevated');
  assert.equal(bp({ systolic: 129, diastolic: 79 }).category, 'Elevated');
  assert.equal(bp({ systolic: 130, diastolic: 79 }).category, 'Stage 1 hypertension');
  assert.equal(bp({ systolic: 119, diastolic: 80 }).category, 'Stage 1 hypertension');
  assert.equal(bp({ systolic: 139, diastolic: 89 }).category, 'Stage 1 hypertension');
  assert.equal(bp({ systolic: 140, diastolic: 89 }).category, 'Stage 2 hypertension');
  assert.equal(bp({ systolic: 139, diastolic: 90 }).category, 'Stage 2 hypertension');
});

test('bp categories: severe hypertension is reported alongside, not as a category', () => {
  const r = bp({ systolic: 190, diastolic: 110 });
  assert.equal(r.severe, true);
  assert.equal(r.category, 'Stage 2 hypertension');
  assert.ok(r.severeNote.includes('severe hypertension'));
  assert.equal(bp({ systolic: 180, diastolic: 120 }).severe, false);
  assert.equal(bp({ systolic: 150, diastolic: 95 }).severeNote, null);
});

test('bp categories: rejects missing, implausible and swapped entries', () => {
  assert.equal(bp({ systolic: 120 }).valid, false);
  assert.equal(bp({}).valid, false);
  assert.equal(bp().valid, false);
  assert.equal(bp({ systolic: 400, diastolic: 80 }).valid, false);
  assert.equal(bp({ systolic: 120, diastolic: 5 }).valid, false);
  const swapped = bp({ systolic: 80, diastolic: 120 });
  assert.equal(swapped.valid, false);
  assert.ok(swapped.message.includes('swapped'));
  assert.doesNotMatch(JSON.stringify(bp({ systolic: 135, diastolic: 95 })), /NaN|Infinity/);
});
