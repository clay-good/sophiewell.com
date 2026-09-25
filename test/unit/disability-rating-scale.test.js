// spec-v1433: Disability Rating Scale (Rappaport 1982; COMBI syllabus and FAQ).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { disabilityRatingScale as drs } from '../../lib/disability-rating-scale-v1433.js';

const ALL0 = { eye: 0, communication: 0, motor: 0, feeding: 0, toileting: 0, grooming: 0, functioning: 0, employability: 0 };
const MAX = { eye: 3, communication: 4, motor: 5, feeding: 3, toileting: 3, grooming: 3, functioning: 5, employability: 3 };

test('the eight items sum to 0-29', () => {
  assert.equal(drs(ALL0).total, 0);
  assert.equal(drs(MAX).total, 29);
  assert.equal(drs({ ...ALL0, functioning: '2', employability: '1' }).total, 3);
});

test('every COMBI category edge', () => {
  const at = (n) => {
    const o = { ...ALL0 }; let left = n;
    for (const k of Object.keys(MAX)) { const take = Math.min(MAX[k], left); o[k] = take; left -= take; }
    return drs(o).category;
  };
  assert.deepEqual([0, 1, 2, 3, 4, 6, 7, 11, 12, 16, 17, 21, 22, 24, 25, 29].map(at), [
    'none', 'mild', 'partial', 'partial', 'moderate', 'moderate', 'moderately severe', 'moderately severe',
    'severe', 'severe', 'extremely severe', 'extremely severe', 'vegetative state', 'vegetative state',
    'extreme vegetative state', 'extreme vegetative state',
  ]);
});

test('the categories carry their caveat; low totals carry the mild-injury warning', () => {
  assert.ok(drs(MAX).notes.some((n) => /not derived statistically/.test(n)));
  assert.ok(drs(ALL0).notes.some((n) => /not recommended for mild brain injury/.test(n)));
  assert.ok(!drs(MAX).notes.some((n) => /mild brain injury/.test(n)));
});

test('a blank item is asked for, never scored as 0', () => {
  const r = drs({ ...ALL0, motor: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /best motor response is still needed/);
  assert.match(drs({}).message, /eye opening, best communication ability/);
});

test('half points and out-of-range ratings are refused', () => {
  assert.match(drs({ ...ALL0, employability: 1.5 }).message, /half-point option is no longer recommended/);
  assert.equal(drs({ ...ALL0, eye: 4 }).valid, false);
  assert.equal(drs({ ...ALL0, motor: -1 }).valid, false);
});
