// spec-v801: Hodapp-Parrish-Anderson visual field staging.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hpaGlaucoma } from '../../lib/hpa-glaucoma-v801.js';

test('a clean field on every criterion stages as none', () => {
  // spec-v1123: "every criterion" is four, and this passed three. The central
  // 5 degrees used to fall back to its mildest level, so the name was true only
  // because the fallback made it true.
  const r = hpaGlaucoma({ meanDeviation: -0.5, percentBelow5: 0, countBelow1: 0, central: 'all-above-15' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'none');
  assert.equal(r.abnormal, false);
  assert.deepEqual(r.unassessed, []);
});

test('spec-v1123: an unentered criterion cannot lower the grade, and says so', () => {
  // The overall grade is the MOST SEVERE of the four, so an unassessed one can
  // only raise it. On the tile's own example, leaving the central select alone
  // took the grade from severe to early -- two full grades.
  const partial = hpaGlaucoma({ meanDeviation: -4 });
  assert.equal(partial.stage, 'early');
  assert.equal(partial.floorOnly, true);
  assert.equal(partial.unassessed.length, 3);
  assert.match(partial.band, /at least early defect on the 1 of the 4 criteria read/);
  assert.match(partial.band, /can only raise it/);

  const complete = hpaGlaucoma({ meanDeviation: -4, percentBelow5: 10, countBelow1: 5, central: 'all-above-15' });
  assert.equal(complete.floorOnly, false);
  assert.match(complete.band, /early glaucomatous field defect/);
});

test('spec-v1123: severe rules in from one criterion', () => {
  // Rule 13: severe is the top level and nothing unassessed can bring it down.
  const r = hpaGlaucoma({ meanDeviation: -4, central: 'both-or-zero' });
  assert.equal(r.stage, 'severe');
  assert.equal(r.floorOnly, false);
  assert.match(r.band, /severe glaucomatous field defect/);
});

test('the mean deviation boundaries are -1, -6 and -12', () => {
  const md = (v) => hpaGlaucoma({ meanDeviation: v, percentBelow5: 0, countBelow1: 0 }).criteria[0].grade;
  assert.equal(md(-1), 'none');
  assert.equal(md(-1.1), 'early');
  assert.equal(md(-6), 'early');
  assert.equal(md(-6.1), 'moderate');
  assert.equal(md(-12), 'moderate');
  assert.equal(md(-12.1), 'severe');
});

test('the 5 percent point-share boundaries are 25 and 50', () => {
  const p = (v) => hpaGlaucoma({ meanDeviation: 0, percentBelow5: v, countBelow1: 0 }).criteria[1].grade;
  assert.equal(p(0), 'none');
  assert.equal(p(25), 'early');
  assert.equal(p(26), 'moderate');
  assert.equal(p(50), 'moderate');
  assert.equal(p(51), 'severe');
});

test('the 1 percent point-count boundaries are 10 and 20', () => {
  const c = (v) => hpaGlaucoma({ meanDeviation: 0, percentBelow5: 0, countBelow1: v }).criteria[2].grade;
  assert.equal(c(0), 'none');
  assert.equal(c(9), 'early');
  assert.equal(c(10), 'moderate');
  assert.equal(c(20), 'moderate');
  assert.equal(c(21), 'severe');
});

test('THE MOST SEVERE criterion wins: an early field with severe central points is severe', () => {
  const early = hpaGlaucoma({ meanDeviation: -4, percentBelow5: 10, countBelow1: 5 });
  assert.equal(early.stage, 'early');

  const withCentral = hpaGlaucoma({ meanDeviation: -4, percentBelow5: 10, countBelow1: 5, central: 'both-or-zero' });
  assert.equal(withCentral.stage, 'severe');
  assert.match(withCentral.band, /central 5 degrees/);
});

test('the central 5 degrees maps to none, moderate and severe', () => {
  const c = (v) => hpaGlaucoma({ meanDeviation: 0, percentBelow5: 0, countBelow1: 0, central: v }).stage;
  assert.equal(c('all-above-15'), 'none');
  assert.equal(c('one-hemifield'), 'moderate');
  assert.equal(c('both-or-zero'), 'severe');
});

test('the result names every criterion that set the grade', () => {
  const r = hpaGlaucoma({ meanDeviation: -15, percentBelow5: 60, countBelow1: 30 });
  assert.equal(r.stage, 'severe');
  assert.equal(r.drivers.length, 3);
});

test('out-of-range values and an unknown central option are rejected', () => {
  assert.equal(hpaGlaucoma({ meanDeviation: -99 }).field, 'meanDeviation');
  assert.equal(hpaGlaucoma({ percentBelow5: 101 }).field, 'percentBelow5');
  assert.equal(hpaGlaucoma({ countBelow1: 90 }).field, 'countBelow1');
  assert.equal(hpaGlaucoma({ central: 'patchy' }).field, 'central');
});
