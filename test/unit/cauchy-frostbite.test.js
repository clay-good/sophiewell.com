// spec-v111 2.4: Cauchy frostbite classification (Cauchy 2001). Day-0 lesion
// topography, day-2 bone-scan uptake, and day-2 blisters set a grade 1-4; the
// grade is the most severe of the three findings, with the published prognosis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cauchyFrostbite } from '../../lib/enviro-v111.js';

test('topography alone: distal phalanx -> grade 2', () => {
  const r = cauchyFrostbite({ topography: 'distal-phalanx' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 2);
  assert.match(r.prognosis, /soft-tissue/);
});

test('band flip: a bone-scan finding upgrades grade 2 -> grade 4', () => {
  const topoOnly = cauchyFrostbite({ topography: 'distal-phalanx', boneScan: 'not-done' });
  const upgraded = cauchyFrostbite({ topography: 'distal-phalanx', boneScan: 'absent-carpal-tarsal' });
  assert.equal(topoOnly.grade, 2);
  assert.equal(upgraded.grade, 4);
  assert.match(upgraded.band, /set by bone scan/);
  assert.match(upgraded.prognosis, /limb/);
});

test('no lesion -> grade 1, no amputation', () => {
  const r = cauchyFrostbite({ topography: 'none' });
  assert.equal(r.grade, 1);
  assert.match(r.prognosis, /no amputation, no sequela/);
});

test('hemorrhagic blisters upgrade the grade', () => {
  // distal phalanx topography (grade 2) + hemorrhagic blisters on the digit (grade 3).
  const r = cauchyFrostbite({ topography: 'distal-phalanx', blisters: 'hemorrhagic-digit' });
  assert.equal(r.grade, 3);
  assert.match(r.band, /set by .*blisters/);
});

test('carpal-tarsal topography -> grade 4 (limb amputation)', () => {
  const r = cauchyFrostbite({ topography: 'carpal-tarsal' });
  assert.equal(r.grade, 4);
  assert.match(r.prognosis, /bone amputation of the limb/);
});

test('missing topography returns a complete-the-fields fallback', () => {
  assert.equal(cauchyFrostbite({}).valid, false);
});
