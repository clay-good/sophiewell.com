// spec-v540: the ISHLT cardiac acute cellular rejection grade.
// Worked-example tests: the four revised grades, the MANY-TO-ONE 1990 mapping and specifically that 3A and
// 3B land in DIFFERENT revised grades, the refusal of ambiguous bare numbers, and the blind spots.
// Grades and mapping transcribed from Stewart and colleagues 2005 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ishltRejection, ISHLT_GRADES } from '../../lib/ishlt-rejection-v540.js';

test('four revised grades', () => {
  assert.deepEqual(ISHLT_GRADES.map((g) => g.value), ['0R', '1R', '2R', '3R']);
});

test('myocyte damage is what separates the grades', () => {
  assert.match(ishltRejection({ grade: '1R' }).band, /up to one focus of myocyte damage/);
  assert.match(ishltRejection({ grade: '2R' }).band, /[Tt]wo or more foci/);
  assert.match(ishltRejection({ grade: '3R' }).band, /[Dd]iffuse infiltrate with multifocal myocyte damage/);
});

test('THE TRAP: 3A and 3B land in DIFFERENT revised grades', () => {
  const twoR = ISHLT_GRADES.find((g) => g.value === '2R');
  const threeR = ISHLT_GRADES.find((g) => g.value === '3R');
  assert.deepEqual(twoR.legacy, ['3A']);
  assert.ok(threeR.legacy.includes('3B'));
  assert.ok(!twoR.legacy.includes('3B'));
});

test('three old grades collapse into 1R, and the result says so', () => {
  const oneR = ishltRejection({ grade: '1R' });
  assert.deepEqual(oneR.legacyGrades, ['1A', '1B', '2']);
  assert.match(oneR.band, /Maps from 1990 grades 1A, 1B, 2, which all collapse into this one grade/);
});

test('the full mapping is complete and disjoint', () => {
  const all = ISHLT_GRADES.flatMap((g) => g.legacy);
  assert.deepEqual(all.sort(), ['0', '1A', '1B', '2', '3A', '3B', '4'].sort());
  assert.equal(new Set(all).size, all.length); // no old grade maps twice
});

test('0R and 1R are low grade; 2R and 3R are high grade (the META example is 2R)', () => {
  assert.equal(ishltRejection({ grade: '0R' }).highGrade, false);
  assert.equal(ishltRejection({ grade: '1R' }).highGrade, false);
  assert.equal(ishltRejection({ grade: '2R' }).highGrade, true);
  assert.equal(ishltRejection({ grade: '3R' }).highGrade, true);
  const r = ishltRejection({ grade: '2R' });
  assert.match(r.band, /high grade, where treatment is usually considered/);
  assert.match(r.band, /a convention, not an order/);
});

test('a 1990-scheme grade is REFUSED with its mapping, not silently accepted', () => {
  for (const [legacy, revised] of [['1A', '1R'], ['1B', '1R'], ['3A', '2R'], ['3B', '3R'], ['4', '3R']]) {
    const r = ishltRejection({ grade: legacy });
    assert.equal(r.valid, false, legacy);
    assert.match(r.message, new RegExp(`maps to ${revised}`), legacy);
  }
});

test('a bare number is refused as ambiguous between the two schemes', () => {
  for (const n of ['0', '1', '3']) {
    const r = ishltRejection({ grade: n });
    assert.equal(r.valid, false, n);
    assert.match(r.message, /ambiguous|1990-scheme/, n);
  }
});

test('every grade names the two blind spots', () => {
  for (const g of ISHLT_GRADES) {
    const r = ishltRejection({ grade: g.value });
    assert.match(r.band, /blind to antibody-mediated rejection and to allograft vasculopathy/);
  }
});

test('the copy separates this from Banff and names the sampling limit', () => {
  const n = ishltRejection({ grade: '0R' }).note;
  assert.match(n, /kidney allograft/);
  assert.match(n, /tubulitis/);
  assert.match(n, /patchy/);
  assert.match(n, /pAMR/);
});

test('lowercase and whitespace resolve; unknown grades are refused', () => {
  assert.equal(ishltRejection({ grade: '2r' }).grade, '2R');
  assert.equal(ishltRejection({ grade: ' 3R ' }).grade, '3R');
  assert.equal(ishltRejection({}).valid, false);
  assert.equal(ishltRejection({ grade: '4R' }).valid, false);
});
