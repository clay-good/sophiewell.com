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
