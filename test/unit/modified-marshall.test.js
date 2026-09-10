// spec-v126 2.6: Modified Marshall (Banks 2013, Revised Atlanta). 3 organs 0-4;
// organ failure if any assessed system >= 2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modifiedMarshall } from '../../lib/gi-v126.js';

test('respiratory + renal failure example', () => {
  const r = modifiedMarshall({ pao2: 200, fio2: 100, creatinine: 2.0 });
  assert.equal(r.valid, true);
  assert.equal(r.organFailure, true);
  assert.equal(r.maxScore, 3);
  assert.match(r.band, /organ failure/);
});

test('no failure when all assessed systems < 2', () => {
  const r = modifiedMarshall({ creatinine: 1.0 });
  assert.equal(r.organFailure, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /no organ failure/);
});

test('PaO2/FiO2 banding: 200/1.0 (=200) -> respiratory 3', () => {
  // PaO2 200, FiO2 100% -> ratio 200 -> 201-300? 200 is not >200 so falls to 101-200 = 3
  const r = modifiedMarshall({ pao2: 200, fio2: 100 });
  assert.equal(r.maxScore, 3);
});

test('a blank system is not assessed (not scored 0)', () => {
  const r = modifiedMarshall({ cardiovascular: '4' });
  assert.match(r.band, /cardiovascular 4/);
  assert.equal(r.band.includes('respiratory'), false);
  assert.equal(r.band.includes('renal'), false);
});

test('FiO2 guard and no-system -> valid:false', () => {
  assert.equal(modifiedMarshall({ pao2: 200, fio2: 0 }).valid, false); // fio2 not positive -> resp not scored -> no systems
  assert.equal(modifiedMarshall({}).valid, false);
  assert.equal(modifiedMarshall(9).valid, false);
});

// spec-v1097: "all assessed systems below 2" was honest about WHICH systems it
// had and silent about the direction the others can move it. The score is the
// worst of three organ systems, so a system nobody assessed can only raise it --
// and "no organ failure" is the Revised Atlanta line between mild and moderately
// severe pancreatitis.
test('spec-v1097: no organ failure from one system says the others can only raise it', () => {
  const renalOnly = modifiedMarshall({ creatinine: 1.0 });
  assert.equal(renalOnly.organFailure, false);
  assert.match(renalOnly.band, /among the systems entered/);
  assert.match(renalOnly.band, /2 organ systems were not entered/);
  assert.match(renalOnly.band, /can only raise it/);

  // All three assessed: the negative stands unqualified.
  const all = modifiedMarshall({ creatinine: 1.0, pao2: 95, fio2: 21, cardiovascular: 0 });
  assert.equal(all.organFailure, false);
  assert.doesNotMatch(all.band, /not entered/);

  // Ruling IN needs no qualifier: the systems still missing cannot lower it.
  const failed = modifiedMarshall({ creatinine: 3.0 });
  assert.equal(failed.organFailure, true);
  assert.doesNotMatch(failed.band, /can only raise/);
});

// spec-v1209: the envelope guard probe-unguarded-sibling printed this module for.
test('an impossible PaO2 is refused rather than scored', () => {
  const r = modifiedMarshall({ pao2: 9999, fio2: 21 });
  assert.equal(r.valid, false);
  assert.match(r.message, /PaO2 in mmHg must be between 10 and 700/);
  assert.ok(!/no organ failure/.test(r.message));
});

test('FiO2 is a PERCENT here, so the envelope is stated in percent', () => {
  // spec-v1205's trap: BOUNDS.fio2 is 0.21-1 as a FRACTION. Applied directly it
  // would refuse every legitimate value this field takes.
  assert.equal(modifiedMarshall({ pao2: 80, fio2: 21 }).valid, true);
  assert.equal(modifiedMarshall({ pao2: 80, fio2: 100 }).valid, true);
  assert.match(modifiedMarshall({ pao2: 80, fio2: 9999 }).message, /FiO2 as a percent must be between 21 and 100/);
});

test('an impossible creatinine is refused rather than scored as failure', () => {
  assert.match(modifiedMarshall({ creatinine: 9999 }).message, /creatinine in mg\/dL must be between 0.1 and 25/);
  assert.equal(modifiedMarshall({ creatinine: 2.0 }).valid, true);
});

test('a cardiovascular score off the 0-4 band table is refused', () => {
  assert.match(modifiedMarshall({ cardiovascular: 9999 }).message, /cardiovascular score must be between 0 and 4/);
  assert.equal(modifiedMarshall({ cardiovascular: 4 }).valid, true);
});
