// spec-v653: WHO/ISUP nucleolar grade for renal cell carcinoma.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { whoIsupRenalGrade } from '../../lib/who-isup-renal-grade-v653.js';

test('nucleoli mapping: inconspicuous = 1, conspicuous-400 = 2, conspicuous-100 = 3', () => {
  assert.equal(whoIsupRenalGrade({ nucleoli: 'inconspicuous' }).grade, 1);
  assert.equal(whoIsupRenalGrade({ nucleoli: 'conspicuous-400' }).grade, 2);
  assert.equal(whoIsupRenalGrade({ nucleoli: 'conspicuous-100' }).grade, 3);
});

test('a grade-4 feature overrides to grade 4 regardless of nucleoli', () => {
  assert.equal(whoIsupRenalGrade({ nucleoli: 'inconspicuous', grade4Features: true }).grade, 4);
  assert.equal(whoIsupRenalGrade({ nucleoli: 'conspicuous-100', grade4Features: true }).grade, 4);
  const r = whoIsupRenalGrade({ grade4Features: true });
  assert.equal(r.grade, 4);
  assert.equal(r.grade4Features, true);
});

test('abnormal flag set at grade 3 and 4, not 1 or 2', () => {
  assert.equal(whoIsupRenalGrade({ nucleoli: 'inconspicuous' }).abnormal, false);
  assert.equal(whoIsupRenalGrade({ nucleoli: 'conspicuous-400' }).abnormal, false);
  assert.equal(whoIsupRenalGrade({ nucleoli: 'conspicuous-100' }).abnormal, true);
  assert.equal(whoIsupRenalGrade({ grade4Features: true }).abnormal, true);
});

test('META example: conspicuous at 100x, no grade-4 feature = grade 3', () => {
  const r = whoIsupRenalGrade({ nucleoli: 'conspicuous-100', grade4Features: false });
  assert.equal(r.grade, 3);
  assert.equal(r.byNucleoli, 3);
  assert.match(r.bandLabel, /WHO\/ISUP grade 3/);
});

test('nucleoli required when no grade-4 feature; unknown value rejected', () => {
  assert.equal(whoIsupRenalGrade({}).valid, false);
  assert.equal(whoIsupRenalGrade({}).code, 'MISSING_INPUT');
  assert.equal(whoIsupRenalGrade({ nucleoli: 'conspicuous-200' }).valid, false);
  assert.equal(whoIsupRenalGrade({ nucleoli: 'conspicuous-200' }).code, 'OUT_OF_RANGE');
});
