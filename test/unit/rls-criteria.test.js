import test from 'node:test';
import assert from 'node:assert/strict';
import { rlsCriteria as rls } from '../../lib/rls-criteria-v856.js';

const FOUR = { urge: true, atRest: true, relievedByMovement: true, worseAtNight: true };
const FIVE = { ...FOUR, notOtherCondition: true };

test('rls: all five are essential, and it is not a score', () => {
  assert.equal(rls(FIVE).criteriaMet, true);
  assert.equal(rls(FIVE).metCount, 5);
  assert.equal(rls(FOUR).criteriaMet, false);
  assert.equal(rls({}).metCount, 0);
  assert.equal(rls({ urge: true, atRest: true }).criteriaMet, false);
  assert.deepEqual(rls({ urge: true, atRest: true }).missingCriteria, [3, 4, 5]);
});

test('rls: the first four without the fifth is not a partial diagnosis', () => {
  // The error the tile exists to prevent.
  const r = rls(FOUR);
  assert.equal(r.firstFourMet, true);
  assert.equal(r.criteriaMet, false);
  assert.ok(r.mimicNote.includes('NOT established'));
  assert.ok(r.mimicNote.includes('leg cramps'));
  assert.ok(r.mimicNote.includes('2014'));
  // Once the fifth is recorded the mimic warning stands down and the reminder takes over.
  assert.equal(rls(FIVE).mimicNote, null);
  assert.ok(rls(FIVE).fifthNote.includes('carries the specificity'));
});

test('rls: a partial set names what is missing rather than counting', () => {
  const r = rls({ urge: true, atRest: true, notOtherCondition: true });
  assert.equal(r.criteriaMet, false);
  assert.ok(r.notAScoreNote.includes('not a score'));
  assert.ok(r.notAScoreNote.includes('criterion 3'));
  assert.ok(r.notAScoreNote.includes('criterion 4'));
  // With nothing recorded there is nothing to enumerate.
  assert.equal(rls({}).notAScoreNote, null);
  // The first-four case gets the mimic note instead, not this one.
  assert.equal(rls(FOUR).notAScoreNote, null);
});

test('rls: the fourth criterion is flagged as a comparison', () => {
  const r = rls({ urge: true, atRest: true, relievedByMovement: true, notOtherCondition: true });
  assert.ok(r.comparisonNote.includes('THAN DURING THE DAY'));
  assert.equal(rls(FIVE).comparisonNote, null);
  assert.equal(rls({ urge: true }).comparisonNote, null, 'too little recorded to be worth raising');
});

test('rls: the two specifiers are reported and are not criteria', () => {
  const chronic = rls({ ...FIVE, twiceWeeklyPastYear: true });
  assert.ok(chronic.course.includes('chronic-persistent'));
  assert.ok(chronic.band.includes('chronic-persistent'));
  const intermittent = rls({ ...FIVE, fiveLifetimeEvents: true });
  assert.ok(intermittent.course.includes('intermittent'));
  // Twice weekly wins over the lifetime count.
  assert.ok(rls({ ...FIVE, twiceWeeklyPastYear: true, fiveLifetimeEvents: true }).course.includes('chronic-persistent'));
  // Neither changes whether the criteria are met.
  assert.equal(rls(FIVE).criteriaMet, true);
  assert.equal(rls(FIVE).course, null);
  assert.ok(rls(FIVE).courseNote.includes('Neither is a criterion'));
  assert.ok(rls(FIVE).significanceNote.includes('specifier rather than a criterion'));
  assert.ok(rls({ ...FIVE, clinicallySignificant: true }).significanceNote.includes('Clinically significant'));
  // Specifiers on an unmet set say nothing.
  assert.equal(rls({ ...FOUR, twiceWeeklyPastYear: true }).course, null);
  assert.equal(rls({ ...FOUR, twiceWeeklyPastYear: true }).courseNote, null);
});

test('rls: the scope is stated every time', () => {
  assert.ok(rls(FIVE).scopeNote.includes('iron status'));
  assert.ok(rls({}).scopeNote.includes('iron status'));
});

test('rls: string truthiness from the form, and a bad input meets nothing', () => {
  assert.equal(rls({ urge: 'true', atRest: 'on', relievedByMovement: '1', worseAtNight: 'yes', notOtherCondition: true }).criteriaMet, true);
  assert.equal(rls({ urge: 'false' }).metCount, 0);
  assert.equal(rls(null).valid, true);
  assert.equal(rls(null).criteriaMet, false);
});

test('rls: the documented example round-trips', () => {
  const r = rls({ urge: 'true', atRest: 'true', relievedByMovement: 'true', worseAtNight: 'true' });
  assert.equal(r.valid, true);
  assert.equal(r.criteriaMet, false);
  assert.ok(r.band.includes('not met'));
  assert.ok(r.mimicNote);
});
