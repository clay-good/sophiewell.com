// spec-v1412: adult oral ETT depth at the corner of the mouth -- Roberts 1995 (21 cm women,
// 23 cm men) and Cherng 2002 (height cm / 5 - 13).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adultEttDepth } from '../../lib/adult-ett-depth-v1412.js';

test('Roberts marks: 21 cm for a woman, 23 cm for a man', () => {
  assert.equal(adultEttDepth({ sex: 'female' }).bySexCm, 21);
  assert.equal(adultEttDepth({ sex: 'male' }).bySexCm, 23);
});

test('Cherng height rule, rounded to the half centimeter', () => {
  assert.equal(adultEttDepth({ heightCm: 170 }).byHeightCm, 21);
  assert.equal(adultEttDepth({ heightCm: 160 }).byHeightCm, 19);
  assert.equal(adultEttDepth({ heightCm: 182 }).byHeightCm, 23.5);
});

test('both entered: both marks, as a range, and neither is preferred', () => {
  const r = adultEttDepth({ sex: 'female', heightCm: 160 });
  assert.equal(r.valid, true);
  assert.equal(r.bandLabel, '19 to 21 cm at the lip corner');
  assert.match(r.band, /19 cm by height/);
  assert.match(r.band, /21 cm by sex/);
  assert.ok(r.notes.some((n) => /differ by 2 cm/.test(n)));
});

test('agreeing rules print one mark and no disagreement note', () => {
  const r = adultEttDepth({ sex: 'male', heightCm: 180 });
  assert.equal(r.bandLabel, '23 cm at the lip corner');
  assert.ok(!r.notes.some((n) => /differ/.test(n)));
});

test('one input gives its own mark and names the other', () => {
  assert.ok(adultEttDepth({ sex: 'male' }).notes.some((n) => /Add the height/.test(n)));
  assert.ok(adultEttDepth({ heightCm: 170 }).notes.some((n) => /Add the sex/.test(n)));
});

test('the depth never stands in for confirming placement', () => {
  const r = adultEttDepth({ sex: 'female', heightCm: 165 });
  assert.match(r.steps[0], /capnography/);
  assert.match(r.steps[1], /chest radiograph/);
});

test('nothing entered, or an impossible height, is refused', () => {
  assert.equal(adultEttDepth({}).valid, false);
  assert.equal(adultEttDepth({ sex: '', heightCm: '' }).valid, false);
  assert.equal(adultEttDepth({ heightCm: 900 }).valid, false);
  assert.equal(adultEttDepth({ heightCm: 'tall' }).valid, false);
  assert.equal(adultEttDepth({ sex: 'other' }).valid, false);
});

test('a height too short for the adult rule points to the pediatric tool', () => {
  const r = adultEttDepth({ heightCm: 60 });
  assert.equal(r.valid, false);
  assert.match(r.message, /pediatric/);
});
