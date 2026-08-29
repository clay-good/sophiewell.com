import test from 'node:test';
import assert from 'node:assert/strict';
import { aomCriteria as aom } from '../../lib/aom-criteria-v857.js';

const CHILD = { ageMonths: 14, effusion: true };

test('aom: the three diagnostic routes, all gated on an effusion', () => {
  assert.equal(aom({ ...CHILD, bulging: 'moderate-severe' }).diagnosed, true);
  assert.equal(aom({ ageMonths: 14, otorrhea: true }).diagnosed, true, 'drainage is its own evidence of fluid');
  assert.equal(aom({ ...CHILD, bulging: 'mild', recentPain: true }).diagnosed, true);
  assert.equal(aom({ ...CHILD, bulging: 'mild', intenseErythema: true }).diagnosed, true);
  // Mild bulging alone is not a route.
  assert.equal(aom({ ...CHILD, bulging: 'mild' }).diagnosed, false);
  // No effusion, no diagnosis, whatever the drum looks like.
  assert.equal(aom({ ageMonths: 14, bulging: 'moderate-severe' }).diagnosed, false);
});

test('aom: a red drum is not an ear infection', () => {
  // The error the tile exists to prevent.
  const r = aom({ ageMonths: 14, intenseErythema: true });
  assert.equal(r.diagnosed, false);
  assert.ok(r.notMetReason.includes('a crying child has a red drum'));
  assert.ok(r.erythemaNote.includes('never diagnostic on its own'));
  // With fluid but no bulging it still is not.
  const withFluid = aom({ ...CHILD, intenseErythema: true });
  assert.equal(withFluid.diagnosed, false);
  assert.ok(withFluid.notMetReason.includes('None of the three criteria'));
  // Once diagnosed the erythema warning stands down.
  assert.equal(aom({ ...CHILD, bulging: 'mild', intenseErythema: true }).erythemaNote, null);
});

test('aom: mild bulging is named as needing a partner', () => {
  const r = aom({ ...CHILD, bulging: 'mild' });
  assert.ok(r.notMetReason.includes('only when it comes with'));
});

test('aom: drainage supplies the effusion requirement and says so', () => {
  const r = aom({ ageMonths: 14, otorrhea: true });
  assert.equal(r.effusion, true);
  assert.ok(r.otorrheaEffusionNote.includes('itself objective evidence'));
  assert.equal(aom({ ...CHILD, otorrhea: true }).otorrheaEffusionNote, null);
});

test('aom: severity removes the observation option at every age', () => {
  for (const sev of [{ moderateOrSeverePain: true }, { painFortyEightHours: true }, { temperatureF: 102.2 }]) {
    const r = aom({ ...CHILD, bulging: 'moderate-severe', ...sev });
    assert.equal(r.severe, true, JSON.stringify(sev));
    assert.equal(r.route, 'antibiotics');
  }
  assert.equal(aom({ ...CHILD, bulging: 'moderate-severe', temperatureF: 102.1 }).severe, false);
  assert.equal(aom({ ageMonths: 60, effusion: true, bulging: 'moderate-severe', moderateOrSeverePain: true }).route, 'antibiotics');
});

test('aom: laterality decides at 6 to 23 months and nowhere else', () => {
  const infantBoth = aom({ ...CHILD, bulging: 'moderate-severe', bilateral: true });
  assert.equal(infantBoth.route, 'antibiotics');
  assert.ok(infantBoth.management.includes('however mild'));
  assert.equal(aom({ ...CHILD, bulging: 'moderate-severe' }).route, 'observation-option');

  const olderBoth = aom({ ageMonths: 36, effusion: true, bulging: 'moderate-severe', bilateral: true });
  assert.equal(olderBoth.route, 'observation-option');
  assert.ok(olderBoth.lateralityNote.includes('only between 6 and 23 months'));
  assert.equal(infantBoth.lateralityNote, null);

  // The boundaries themselves.
  assert.equal(aom({ ageMonths: 23, effusion: true, bulging: 'moderate-severe', bilateral: true }).route, 'antibiotics');
  assert.equal(aom({ ageMonths: 24, effusion: true, bulging: 'moderate-severe', bilateral: true }).route, 'observation-option');
});

test('aom: observation always carries its backup', () => {
  const r = aom({ ageMonths: 36, effusion: true, bulging: 'moderate-severe' });
  assert.ok(r.management.includes('48 to 72 hours'));
  assert.ok(r.management.includes('held in reserve'));
});

test('aom: under 6 months is outside the guideline, and it is not extrapolated', () => {
  const r = aom({ ageMonths: 3, otorrhea: true });
  assert.equal(r.diagnosed, true);
  assert.equal(r.outOfScope, true);
  assert.equal(r.route, null);
  assert.ok(r.management.includes('6 months through 12 years'));
  // No age at all: the tile asks rather than guessing.
  const noAge = aom({ effusion: true, bulging: 'moderate-severe' });
  assert.equal(noAge.diagnosed, true);
  assert.equal(noAge.route, null);
  assert.ok(noAge.management.includes('Enter the age'));
});

test('aom: validation', () => {
  assert.equal(aom({}).valid, true, 'nothing recorded is a valid not-met answer');
  assert.equal(aom({}).diagnosed, false);
  assert.equal(aom(null).valid, true);
  assert.equal(aom({ ageMonths: 999 }).valid, false);
  assert.equal(aom({ temperatureF: 150 }).valid, false);
  assert.equal(aom({ bulging: 'huge' }).valid, false);
});

test('aom: the documented example round-trips', () => {
  const r = aom({ ageMonths: '14', effusion: 'true', bulging: 'moderate-severe' });
  assert.equal(r.valid, true);
  assert.equal(r.diagnosed, true);
  assert.ok(r.band.includes('criteria are met'));
  assert.equal(r.route, 'observation-option');
});
