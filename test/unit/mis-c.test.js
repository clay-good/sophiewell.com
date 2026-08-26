// spec-v795: 2023 MIS-C surveillance case definition.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { misC } from '../../lib/mis-c-v795.js';

const MEETS = { ageYears: 8, crp: 12, fever: true, cardiac: true, gastrointestinal: true, sarsCov2Evidence: true };

test('a case meeting every criterion is met', () => {
  const r = misC(MEETS);
  assert.equal(r.valid, true);
  assert.equal(r.met, true);
  assert.equal(r.categoryCount, 2);
  assert.deepEqual(r.missing, []);
});

test('a final diagnosis of Kawasaki disease excludes an otherwise complete case', () => {
  const r = misC({ ...MEETS, kawasakiFinalDiagnosis: true });
  assert.equal(r.met, false);
  assert.equal(r.excluded, true);
  assert.match(r.band, /Kawasaki/);
});

test('one involved category is not enough; two is', () => {
  assert.equal(misC({ ...MEETS, gastrointestinal: false }).met, false);
  assert.equal(misC({ ...MEETS, gastrointestinal: false, shock: true }).met, true);
});

test('each remaining criterion is genuinely required', () => {
  assert.equal(misC({ ...MEETS, ageYears: 21 }).met, false, 'age 21 is not under 21');
  assert.equal(misC({ ...MEETS, ageYears: 20 }).met, true);
  assert.equal(misC({ ...MEETS, fever: false }).met, false);
  assert.equal(misC({ ...MEETS, crp: 2.9 }).met, false);
  assert.equal(misC({ ...MEETS, crp: 3 }).met, true, 'CRP of exactly 3.0 meets it');
  assert.equal(misC({ ...MEETS, sarsCov2Evidence: false }).met, false);
});

test('all five categories count, and any two of them suffice', () => {
  const cats = ['cardiac', 'mucocutaneous', 'shock', 'gastrointestinal', 'hematologic'];
  for (let i = 0; i < cats.length; i += 1) {
    for (let j = i + 1; j < cats.length; j += 1) {
      const o = { ageYears: 8, crp: 12, fever: true, sarsCov2Evidence: true, [cats[i]]: true, [cats[j]]: true };
      assert.equal(misC(o).met, true, `${cats[i]} + ${cats[j]}`);
    }
  }
});

test('the tile names what is still missing rather than just refusing', () => {
  const r = misC({ ageYears: 8, crp: 1, fever: false, sarsCov2Evidence: false });
  assert.equal(r.met, false);
  assert.equal(r.missing.length, 4);
});

test('age and CRP are required and range-checked', () => {
  assert.equal(misC({ crp: 12 }).field, 'ageYears');
  assert.equal(misC({ ageYears: 8 }).field, 'crp');
  assert.equal(misC({ ageYears: 200, crp: 12 }).valid, false);
});
