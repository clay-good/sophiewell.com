// spec-v605: the Harrington classification of periacetabular metastatic disease.
//
// The load-bearing test is that class IV is assigned by resectability rather than destruction -- a solitary
// resectable lesion in an INTACT acetabulum is class IV.

import test from 'node:test';
import assert from 'node:assert/strict';
import { harringtonAcetabular, CLASSES, HARDEST_CLASS } from '../../lib/harrington-acetabular-v605.js';

const at = (solitaryResectableForCure, medialWallDeficient, lateralWallOrRoofDeficient) =>
  harringtonAcetabular({ solitaryResectableForCure, medialWallDeficient, lateralWallOrRoofDeficient });

test('there are four classes labelled with Roman numerals', () => {
  assert.deepEqual(CLASSES.map((c) => c.klass), ['I', 'II', 'III', 'IV']);
  assert.equal(typeof at('no', 'no', 'no').class, 'string');
});

test('the destruction ladder gives classes I to III', () => {
  assert.equal(at('no', 'no', 'no').class, 'I');
  assert.equal(at('no', 'yes', 'no').class, 'II');
  assert.equal(at('no', 'yes', 'yes').class, 'III');
});

// THE intent override.
test('a solitary resectable lesion in an INTACT acetabulum is class IV', () => {
  const r = at('yes', 'no', 'no');
  assert.equal(r.class, 'IV');
  assert.equal(r.assignedByIntent, true);
  assert.equal(r.destructionOnlyClass, 'I', 'the acetabulum is intact');
  assert.match(r.bandText, /ASSIGNED BY RESECTABILITY AND INTENT, NOT BY DESTRUCTION/);
});

test('the intent override applies at every level of destruction', () => {
  for (const [med, lat, expected] of [['no', 'no', 'I'], ['yes', 'no', 'II'], ['yes', 'yes', 'III']]) {
    const r = at('yes', med, lat);
    assert.equal(r.class, 'IV', `${med}/${lat}`);
    assert.equal(r.destructionOnlyClass, expected);
    assert.equal(r.assignedByIntent, true);
  }
});

test('class IV is the only class that does not grade destruction', () => {
  const notGrading = CLASSES.filter((c) => !c.gradesDestruction).map((c) => c.klass);
  assert.deepEqual(notGrading, ['IV']);
  assert.match(CLASSES.find((c) => c.klass === 'IV').text, /NOT by the extent of acetabular destruction/);
});

test('classes I to III are flagged as grading destruction and are not assigned by intent', () => {
  for (const [s, m, l] of [['no', 'no', 'no'], ['no', 'yes', 'no'], ['no', 'yes', 'yes']]) {
    const r = at(s, m, l);
    assert.equal(r.assignedByIntent, false);
    assert.equal(r.gradesDestruction, true);
    assert.equal(r.class, r.destructionOnlyClass, 'no override applied');
  }
});

// THE corrupted rendering.
test('the inverted rendering of class IV is called out on every class IV', () => {
  const r = at('yes', 'no', 'no');
  assert.match(r.bandText, /wing of the ilium/);
  assert.match(r.bandText, /INVERTS its meaning/);
  assert.match(r.bandText, /the one patient who might be cured/);
});

test('class III, not class IV, is named as the hardest to reconstruct', () => {
  assert.equal(HARDEST_CLASS, 'III');
  assert.match(at('no', 'yes', 'yes').bandText, /CLASS III is the one described as the most challenging/);
  assert.match(CLASSES.find((c) => c.klass === 'III').text, /roof all deficient/);
});

// The reconstructions.
test('each class carries its own named reconstruction', () => {
  const recons = CLASSES.map((c) => c.reconstruction);
  assert.equal(new Set(recons).size, CLASSES.length, 'all four are distinct');
  assert.match(at('no', 'no', 'no').reconstruction, /cemented total hip/);
  assert.match(at('no', 'yes', 'no').reconstruction, /flanged cup/);
  assert.match(at('no', 'yes', 'yes').reconstruction, /Steinmann pins/);
  assert.match(at('yes', 'no', 'no').reconstruction, /saddle prosthesis/);
});

// Input handling and scope.
test('all three answers are required and the override is named in the message', () => {
  assert.equal(harringtonAcetabular({}).valid, false);
  assert.match(harringtonAcetabular({}).message, /decides class IV on its own/);
  assert.match(harringtonAcetabular({ solitaryResectableForCure: 'maybe' }).message, /must be yes or no/);
});

test('the scope note refuses the operative decision and separates the survival axis', () => {
  const r = at('no', 'no', 'no');
  assert.match(r.note, /does not decide whether to operate at all/);
  assert.match(r.note, /does not estimate survival/);
  assert.match(r.note, /provenance rather than as a recommendation/);
});
