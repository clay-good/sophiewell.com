// spec-v783: POSAS Patient Scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { posasPatientScar } from '../../lib/posas-patient-scar-v783.js';

const ALL = ['pain', 'itch', 'color', 'pliability', 'thickness', 'relief'];
function fill(v) {
  const o = {};
  for (const k of ALL) o[k] = v;
  return o;
}

test('all items at 1 -> 6 of 60, the floor that means like normal skin', () => {
  const r = posasPatientScar(fill(1));
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.match(r.band, /6 of 60/);
});

test('all items at 10 -> 60 of 60, the ceiling', () => {
  assert.equal(posasPatientScar(fill(10)).score, 60);
});

test('worked example: 2, 3, 5, 4, 4, 3 with overall 5 -> total 21', () => {
  const r = posasPatientScar({ pain: 2, itch: 3, color: 5, pliability: 4, thickness: 4, relief: 3, overallOpinion: 5 });
  assert.equal(r.score, 21);
  assert.equal(r.overall, 5);
  assert.match(r.band, /POSAS Patient total 21 of 60/);
});

test('the overall opinion is NOT added into the total', () => {
  const without = posasPatientScar(fill(5));
  const with10 = posasPatientScar({ ...fill(5), overallOpinion: 10 });
  assert.equal(without.score, 30);
  assert.equal(with10.score, 30);
  assert.equal(with10.overall, 10);
  assert.equal(without.overall, null);
});

test('pain and itch count toward the total like any other item', () => {
  const base = posasPatientScar(fill(1));
  assert.equal(posasPatientScar({ ...fill(1), pain: 10 }).score, base.score + 9);
  assert.equal(posasPatientScar({ ...fill(1), itch: 10 }).score, base.score + 9);
});

test('every one of the six items is required and the range is 1 to 10', () => {
  for (const k of ALL) {
    const o = fill(5);
    delete o[k];
    assert.equal(posasPatientScar(o).field, k);
  }
  assert.equal(posasPatientScar({ ...fill(5), color: 0 }).valid, false);
  assert.equal(posasPatientScar({ ...fill(5), color: 11 }).valid, false);
  assert.equal(posasPatientScar({ ...fill(5), overallOpinion: 11 }).field, 'overallOpinion');
});
