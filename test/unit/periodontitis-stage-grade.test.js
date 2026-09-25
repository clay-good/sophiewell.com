// spec-v1480: periodontitis staging and grading (2017 World Workshop).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { periodontitisStageGrade as pd } from '../../lib/periodontitis-stage-grade-v1480.js';

const base = { toothLoss: 0, smoking: 'non', diabetes: 'none' };

test('the worked example: 6 mm of attachment loss, bone loss / age 0.89, is stage III grade B', () => {
  const r = pd({ ...base, cal: '6', boneLossPct: '40', age: '45' });
  assert.equal(r.band, 'Periodontitis stage III, grade B: stage from interdental attachment loss 6 mm; grade from bone loss / age 0.89, as no direct evidence of progression was entered.');
});

test('the severity bands, by attachment loss and by bone loss', () => {
  const s = (x) => pd({ ...base, ...x, direct: 'none' }).stage;
  assert.equal(s({ cal: 1 }), 'I');
  assert.equal(s({ cal: 2 }), 'I');
  assert.equal(s({ cal: 3 }), 'II');
  assert.equal(s({ cal: 4 }), 'II');
  assert.equal(s({ cal: 5 }), 'III');
  assert.equal(s({ rbl: 'coronal-lt15' }), 'I');
  assert.equal(s({ rbl: 'coronal-15-33' }), 'II');
  assert.equal(s({ rbl: 'middle-apical' }), 'III');
});

test('tooth loss and complexity can only raise the stage', () => {
  const s = (x) => pd({ ...base, cal: 2, direct: 'none', ...x }).stage;
  assert.equal(s({ toothLoss: 1 }), 'III');
  assert.equal(s({ toothLoss: 4 }), 'III');
  assert.equal(s({ toothLoss: 5 }), 'IV');
  assert.equal(s({ maxPd: 5 }), 'II');
  assert.equal(s({ maxPd: 6 }), 'III');
  assert.equal(s({ furcation: true }), 'III');
  assert.equal(s({ verticalBoneLoss: true }), 'III');
  assert.equal(s({ complexRehab: true }), 'IV');
  assert.equal(pd({ ...base, cal: 6, direct: 'none', maxPd: 4 }).stage, 'III');
});

test('grade: direct evidence first, then bone loss / age, raised by smoking and HbA1c', () => {
  const g = (x) => pd({ ...base, cal: 3, ...x }).grade;
  assert.equal(g({ direct: 'none' }), 'A');
  assert.equal(g({ direct: 'lt2' }), 'B');
  assert.equal(g({ direct: 'ge2' }), 'C');
  assert.equal(g({ boneLossPct: 10, age: 50 }), 'A');
  assert.equal(g({ boneLossPct: 50, age: 50 }), 'B');
  assert.equal(g({ boneLossPct: 51, age: 50 }), 'C');
  assert.equal(g({ direct: 'none', smoking: 'lt10' }), 'B');
  assert.equal(g({ direct: 'none', smoking: 'ge10' }), 'C');
  assert.equal(g({ direct: 'none', diabetes: 'ge7' }), 'C');
  assert.match(pd({ ...base, cal: 3, boneLossPct: 50, age: 50 }).notes.join(' '), /exactly 1\.0 is grade B/);
});

test('missing risk factors are named while they could still raise the grade', () => {
  assert.match(pd({ cal: 3, toothLoss: 0, direct: 'none' }).notes.join(' '), /No smoking or diabetes status was entered/);
  assert.doesNotMatch(pd({ cal: 3, toothLoss: 0, direct: 'ge2' }).notes.join(' '), /was entered/);
});

test('the stage, the tooth count and the grade evidence are asked for, never assumed', () => {
  for (const r of [pd({}), pd({ toothLoss: 0, direct: 'none' }), pd({ cal: 3, direct: 'none' }), pd({ cal: 3, toothLoss: 0 }), pd({ cal: 0.5, toothLoss: 0, direct: 'none' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
