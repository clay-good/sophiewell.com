// spec-v529: the Thwaites diagnostic index (TB vs bacterial meningitis).
// Worked-example tests: the five signed weights including the single -5, the derived range, the cut point at
// exactly 4 AND its inverted direction (low favors TB), the fact that duration alone flips the reading, and
// the guards. Features, weights, and the cut transcribed from Thwaites and colleagues 2002 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { thwaites, THWAITES_FEATURES, THWAITES_RANGE } from '../../lib/thwaites-v529.js';

function score(over = {}) {
  return thwaites({
    age: 'no', bloodWbc: 'no', duration: 'no', csfWbc: 'no', csfNeutrophils: 'no', ...over,
  });
}

test('five features with the published signed weights', () => {
  assert.equal(THWAITES_FEATURES.length, 5);
  const byKey = Object.fromEntries(THWAITES_FEATURES.map((f) => [f.key, f.points]));
  assert.deepEqual(byKey, { age: 2, bloodWbc: 4, duration: -5, csfWbc: 3, csfNeutrophils: 4 });
});

test('duration is the only negative weight, and the largest in magnitude', () => {
  const negatives = THWAITES_FEATURES.filter((f) => f.points < 0);
  assert.equal(negatives.length, 1);
  assert.equal(negatives[0].key, 'duration');
  const biggest = Math.max(...THWAITES_FEATURES.map((f) => Math.abs(f.points)));
  assert.equal(Math.abs(negatives[0].points), biggest);
});

test('the range is derived from the weights, not asserted', () => {
  assert.deepEqual(THWAITES_RANGE, { min: -5, max: 13 });
  const all = score({ age: 'yes', bloodWbc: 'yes', duration: 'yes', csfWbc: 'yes', csfNeutrophils: 'yes' });
  assert.equal(all.total, 8); // 2 + 4 - 5 + 3 + 4
  const maxOnly = score({ age: 'yes', bloodWbc: 'yes', csfWbc: 'yes', csfNeutrophils: 'yes' });
  assert.equal(maxOnly.total, THWAITES_RANGE.max);
  const minOnly = score({ duration: 'yes' });
  assert.equal(minOnly.total, THWAITES_RANGE.min);
});

test('the score reads in the opposite direction to most: low favors tuberculous', () => {
  const noFeatures = score();
  assert.equal(noFeatures.total, 0);
  assert.equal(noFeatures.favorsTb, true);
  assert.equal(noFeatures.favors, 'tuberculous');
  assert.match(noFeatures.band, /low is the tuberculous end/);

  const allBacterial = score({ age: 'yes', bloodWbc: 'yes', csfWbc: 'yes', csfNeutrophils: 'yes' });
  assert.equal(allBacterial.total, 13);
  assert.equal(allBacterial.favors, 'bacterial');
});

test('the cut sits at exactly 4: 4 is tuberculous, 5 is bacterial', () => {
  // 4 = age (2) + ... build exactly 4 and exactly 5.
  const four = score({ age: 'yes', bloodWbc: 'yes', duration: 'yes', csfWbc: 'yes' }); // 2+4-5+3 = 4
  assert.equal(four.total, 4);
  assert.equal(four.favorsTb, true);

  const five = score({ bloodWbc: 'yes', duration: 'yes', csfWbc: 'yes', csfNeutrophils: 'yes' }); // 4-5+3+4 = 6
  assert.equal(five.total, 6);
  assert.equal(five.favorsTb, false);

  // The tightest pair around the boundary.
  const alsoFour = score({ csfWbc: 'yes' }); // 3
  assert.equal(alsoFour.total, 3);
  assert.equal(alsoFour.favorsTb, true);
  const sevenish = score({ csfWbc: 'yes', age: 'yes' }); // 5
  assert.equal(sevenish.total, 5);
  assert.equal(sevenish.favorsTb, false);
});

test('a long history alone flips a bacterial-looking picture to tuberculous', () => {
  const shortHistory = score({ age: 'yes', csfWbc: 'yes' });          // 2 + 3 = 5 -> bacterial
  assert.equal(shortHistory.favors, 'bacterial');
  const longHistory = score({ age: 'yes', csfWbc: 'yes', duration: 'yes' }); // 5 - 5 = 0 -> tuberculous
  assert.equal(longHistory.total, 0);
  assert.equal(longHistory.favors, 'tuberculous');
});

test('the per-feature contributions are reported, with unmet features scoring 0', () => {
  const r = score({ duration: 'yes' });
  const byKey = Object.fromEntries(r.contributions.map((c) => [c.key, c]));
  assert.equal(byKey.duration.points, -5);
  assert.equal(byKey.duration.met, true);
  assert.equal(byKey.age.points, 0);
  assert.equal(byKey.age.met, false);
});

test('the copy names the two known failure modes and the differential it cannot see', () => {
  const r = score();
  assert.match(r.note, /partially treated bacterial meningitis/);
  assert.match(r.note, /HIV-positive adults/);
  assert.match(r.note, /cryptococcal/);
  assert.match(r.note, /does not diagnose either disease/);
});

test('yes/no is accepted as words, booleans, and 0/1', () => {
  assert.equal(thwaites({ age: true, bloodWbc: 1, duration: 'Y', csfWbc: false, csfNeutrophils: 0 }).total, 1);
});

test('a missing or unparseable feature is invalid and names it', () => {
  assert.equal(thwaites({}).valid, false);
  const r = thwaites({ age: 'yes', bloodWbc: 'no', duration: 'no' });
  assert.equal(r.valid, false);
  assert.match(r.message, /CSF total white cell count/);

  const bogus = score({ csfNeutrophils: 'some' });
  assert.equal(bogus.valid, false);
  assert.match(bogus.message, /CSF neutrophils/);
});
