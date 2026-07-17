// spec-v405: modified Savary-Miller classification of reflux esophagitis (grades I/II/III/IV/V).
// Worked-example tests: each grade and its endoscopic description, roman + numeric input, and the
// invalid-grade guard. Grades transcribed from Savary-Miller 1978 (modified) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { savaryMiller } from '../../lib/savary-miller-v405.js';

test('grade III: circumferential confluent erosions (the META example)', () => {
  const r = savaryMiller({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /circumferential \(confluent\) erosions/);
});

test('grade I vs II: single fold vs multiple non-confluent folds', () => {
  const one = savaryMiller({ grade: 'I' });
  assert.equal(one.grade, 'I');
  assert.match(one.band, /single mucosal fold/);
  const two = savaryMiller({ grade: 'II' });
  assert.match(two.band, /more than one mucosal fold/);
});

test('grade IV: chronic complications (ulcer / stricture)', () => {
  const r = savaryMiller({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /ulcer, stricture, or esophageal shortening/);
});

test('grade V: Barrett esophagus', () => {
  const r = savaryMiller({ grade: 'V' });
  assert.equal(r.grade, 'V');
  assert.match(r.band, /Barrett/);
  assert.match(r.band, /columnar-lined/);
});

test('numeric input maps to the grades', () => {
  assert.equal(savaryMiller({ grade: 1 }).grade, 'I');
  assert.equal(savaryMiller({ grade: 5 }).grade, 'V');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(savaryMiller({}).valid, false);
  assert.equal(savaryMiller({ grade: 'VI' }).valid, false);
  assert.equal(savaryMiller({ grade: '0' }).valid, false);
});
