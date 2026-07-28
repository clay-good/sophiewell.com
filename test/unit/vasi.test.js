// spec-v556: the Vitiligo Area Scoring Index.
//
// The load-bearing tests are the ordinal ladder (no free percentages), the six mutually exclusive regions,
// and the total-body range being distinct from the facial one.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  vasi, VASI_REGIONS, DEPIGMENTATION_GRADES, VASI_MAX, F_VASI_MAX, MAX_HAND_UNITS,
} from '../../lib/vasi-v556.js';

const one = (key, area, depig) => vasi({ [`${key}Area`]: String(area), [`${key}Depigmentation`]: String(depig) });

test('there are six mutually exclusive regions', () => {
  assert.equal(VASI_REGIONS.length, 6);
  assert.deepEqual(VASI_REGIONS.map((r) => r.key),
    ['headNeck', 'hands', 'upperExtremities', 'trunk', 'lowerExtremities', 'feet']);
});

test('the extremity regions state that hands and feet are excluded', () => {
  const upper = VASI_REGIONS.find((r) => r.key === 'upperExtremities');
  const lower = VASI_REGIONS.find((r) => r.key === 'lowerExtremities');
  assert.match(upper.text, /EXCLUDING the hands/);
  assert.match(lower.text, /EXCLUDING the feet/);
});

// THE ladder.
test('the depigmentation ladder is exactly the seven published values', () => {
  assert.deepEqual(DEPIGMENTATION_GRADES.map((g) => g.value), [0, 10, 25, 50, 75, 90, 100]);
});

test('a value off the ladder is refused, however plausible', () => {
  for (const bad of [5, 60, 63, 99, 30]) {
    const r = one('trunk', 10, bad);
    assert.equal(r.valid, false, `${bad} must be rejected`);
    assert.match(r.message, /ordinal ladder chosen by description, not a free percentage/);
  }
});

test('every value on the ladder is accepted', () => {
  for (const g of DEPIGMENTATION_GRADES) {
    assert.equal(one('trunk', 10, g.value).valid, true, `${g.value}`);
  }
});

// The formula.
test('the score is area times depigmentation, summed', () => {
  const r = vasi({
    trunkArea: '20', trunkDepigmentation: '50',
    handsArea: '2', handsDepigmentation: '100',
  });
  assert.equal(r.total, 12); // 20*0.5 + 2*1.0
  assert.equal(r.totalHandUnits, 22);
});

test('full-body full depigmentation is the maximum', () => {
  const input = {};
  for (const region of VASI_REGIONS) {
    input[`${region.key}Area`] = String(MAX_HAND_UNITS / VASI_REGIONS.length);
    input[`${region.key}Depigmentation`] = '100';
  }
  const r = vasi(input);
  assert.equal(r.total, VASI_MAX);
});

test('no involvement scores zero', () => {
  const r = vasi({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.totalHandUnits, 0);
});

test('a region with area but no depigmentation grade is refused', () => {
  const r = vasi({ trunkArea: '10' });
  assert.equal(r.valid, false);
  assert.match(r.message, /needs a depigmentation grade/);
});

test('a region with a grade but no area contributes nothing', () => {
  const r = vasi({ trunkDepigmentation: '100' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
});

// Hand units.
test('areas totalling more than 100 hand units are refused', () => {
  const input = {};
  for (const region of VASI_REGIONS) {
    input[`${region.key}Area`] = '20';
    input[`${region.key}Depigmentation`] = '50';
  }
  const r = vasi(input); // 120 hand units
  assert.equal(r.valid, false);
  assert.match(r.message, /exceeds 100/);
});

test('a negative area is refused', () => {
  assert.equal(one('trunk', -1, 50).valid, false);
});

test('the result explains that a hand unit is patient-relative', () => {
  const r = one('trunk', 10, 50);
  assert.match(r.bandText, /PATIENT’S OWN palm/);
  assert.match(r.bandText, /patient-relative/);
});

// The two scales must not be confused.
test('the total-body and facial ranges are different and both stated', () => {
  assert.equal(VASI_MAX, 100);
  assert.equal(F_VASI_MAX, 3);
  const r = one('trunk', 4, 50);
  assert.match(r.bandText, /Facial VASI runs 0 to 3/);
  assert.match(r.bandText, /must not be compared/);
});

test('the region set is named in the result', () => {
  const r = one('trunk', 10, 50);
  assert.equal(r.regionSet, 'six-region mutually exclusive');
  assert.match(r.bandText, /original description used five regions/);
});

test('the scope note separates extent from activity and refuses to diagnose', () => {
  const r = one('trunk', 10, 50);
  assert.match(r.note, /does not assess disease activity/);
  assert.match(r.note, /does not diagnose vitiligo/);
  assert.match(r.note, /does not select therapy or phototherapy dosing/);
});
