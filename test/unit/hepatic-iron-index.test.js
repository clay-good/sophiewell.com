// spec-v932: the hepatic iron index. The test that matters is the unit conversion, because a
// microgram figure taken as micromolar overstates the index about fifty-six-fold.

import test from 'node:test';
import assert from 'node:assert/strict';
import { hepaticIronIndex, HII_NOTE, CONCENTRATION_UNIT_OPTIONS } from '../../lib/hepatic-iron-index-v932.js';

test('hepatic-iron-index: the concentration and the age are both required', () => {
  assert.equal(hepaticIronIndex({}).valid, false);
  assert.match(hepaticIronIndex({}).message, /micromolar figure/);
  assert.match(hepaticIronIndex({ hepaticIronConcentration: 120 }).message, /divides by it/);
  assert.equal(hepaticIronIndex({ hepaticIronConcentration: 120, ageYears: 0 }).valid, false);
});

test('hepatic-iron-index: micromoles per gram divided by age', () => {
  const r = hepaticIronIndex({ hepaticIronConcentration: 120, ageYears: 45 });
  assert.equal(r.index, 2.67);
  assert.equal(r.atOrAboveThreshold, true);
});

test('hepatic-iron-index: a microgram figure converts to the same index', () => {
  const umol = hepaticIronIndex({ hepaticIronConcentration: 120, ageYears: 45, concentrationUnit: 'umol' });
  const ug = hepaticIronIndex({ hepaticIronConcentration: 120 * 55.845, ageYears: 45, concentrationUnit: 'ug' });
  assert.equal(ug.index, umol.index);
  assert.equal(ug.concentrationUmolPerG, 120);
  assert.match(ug.unitNote, /about fifty-six times too high/);
});

test('hepatic-iron-index: the unit line names which unit was used, either way', () => {
  assert.match(hepaticIronIndex({ hepaticIronConcentration: 120, ageYears: 45 }).unitNote, /taken as micromoles per gram/);
  assert.match(hepaticIronIndex({ hepaticIronConcentration: 6700, ageYears: 45, concentrationUnit: 'ug' }).unitNote, /entered in micrograms per gram and converted/);
});

test('hepatic-iron-index: an unrecognized unit falls back to micromolar, the defined one', () => {
  const r = hepaticIronIndex({ hepaticIronConcentration: 120, ageYears: 45, concentrationUnit: 'nonsense' });
  assert.equal(r.concentrationUnit, 'umol');
  assert.equal(r.index, 2.67);
});

test('hepatic-iron-index: 1.9 is the threshold and it is inclusive', () => {
  assert.equal(hepaticIronIndex({ hepaticIronConcentration: 95, ageYears: 50 }).atOrAboveThreshold, true);
  assert.equal(hepaticIronIndex({ hepaticIronConcentration: 94, ageYears: 50 }).atOrAboveThreshold, false);
});

test('hepatic-iron-index: a young patient at the same concentration scores higher', () => {
  const young = hepaticIronIndex({ hepaticIronConcentration: 90, ageYears: 30 });
  const older = hepaticIronIndex({ hepaticIronConcentration: 90, ageYears: 60 });
  assert.ok(young.index > older.index);
  assert.match(young.ageNote, /accumulates iron progressively/);
});

test('hepatic-iron-index: below the threshold is not an exclusion', () => {
  const r = hepaticIronIndex({ hepaticIronConcentration: 40, ageYears: 25 });
  assert.equal(r.atOrAboveThreshold, false);
  assert.match(r.band, /does not exclude iron overload from another cause/);
});

test('hepatic-iron-index: the superseded, biopsy and scope lines print on every result', () => {
  const r = hepaticIronIndex({ hepaticIronConcentration: 120, ageYears: 45 });
  assert.match(r.supersededNote, /HFE genotyping and MRI-based iron quantification/);
  assert.match(r.biopsyNote, /liver biopsy with dry-weight quantification/);
  assert.match(r.scopeNote, /does not replace genotyping/);
  assert.match(HII_NOTE, /fifty-six-fold/);
  assert.equal(CONCENTRATION_UNIT_OPTIONS.length, 2);
});
