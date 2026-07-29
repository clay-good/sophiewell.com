// spec-v602: the Virginia Radiosurgery AVM Scale.
//
// The load-bearing tests are that the volume item saturates above 4 cm^3 while the companion's does not, and
// that two clinically different patients collide on the same score.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  vras, volumePoints, VOLUME_BANDS, OUTCOME_BANDS, VRAS_MAX,
  VOLUME_SMALL_MAX, VOLUME_LARGE_MIN, ELOQUENCE_POINTS, HEMORRHAGE_POINTS,
  COMPANION_VOLUME_COEFFICIENT,
} from '../../lib/vras-v602.js';
import { VOLUME_COEFFICIENT as PF_VOLUME_COEFFICIENT } from '../../lib/pollock-flickinger-v601.js';

const at = (volume, eloquentLocation, priorHemorrhage) =>
  vras({ volume, eloquentLocation, priorHemorrhage });

test('the scale runs 0 to 4', () => {
  assert.equal(VRAS_MAX, 4);
  assert.equal(at(1, 'no', 'no').total, 0);
  assert.equal(at(5, 'yes', 'yes').total, VRAS_MAX);
});

test('the volume bands are the published ones', () => {
  assert.deepEqual(VOLUME_BANDS.map((b) => b.points), [0, 1, 2]);
  assert.equal(volumePoints(VOLUME_SMALL_MAX - 0.1), 0);
  assert.equal(volumePoints(VOLUME_SMALL_MAX), 1);
  assert.equal(volumePoints(VOLUME_LARGE_MIN), 1);
  assert.equal(volumePoints(VOLUME_LARGE_MIN + 0.1), 2);
});

// THE saturation.
test('the volume item saturates above 4 cm3 while the companion keeps rising', () => {
  const small = at(5, 'no', 'no');
  const huge = at(40, 'no', 'no');
  assert.equal(small.total, huge.total, 'identical on this scale');
  assert.equal(small.volumePoints, huge.volumePoints);
  assert.equal(small.volumeSaturated, true);
  assert.equal(huge.volumeSaturated, true);
  // The companion separates them by exactly 3.5.
  assert.equal(COMPANION_VOLUME_COEFFICIENT, PF_VOLUME_COEFFICIENT);
  assert.equal(huge.companionVolumeContribution - small.companionVolumeContribution, 3.5);
  assert.match(huge.bandText, /VOLUME ITEM IS SATURATED HERE/);
});

test('a volume at or below the saturation point is not flagged', () => {
  assert.equal(at(VOLUME_LARGE_MIN, 'no', 'no').volumeSaturated, false);
  assert.equal(at(VOLUME_LARGE_MIN + 0.1, 'no', 'no').volumeSaturated, true);
});

// THE collision.
test('two clinically different patients collide on the same score', () => {
  const bigQuiet = at(5, 'no', 'no');          // volume 2, nothing else
  const tinyEloquentBled = at(1, 'yes', 'yes'); // volume 0, both other items
  assert.equal(bigQuiet.total, 2);
  assert.equal(tinyEloquentBled.total, 2);
  assert.equal(bigQuiet.favorablePercent, tinyEloquentBled.favorablePercent);
  assert.notDeepEqual(
    [bigQuiet.volumePoints, bigQuiet.eloquencePoints, bigQuiet.hemorrhagePoints],
    [tinyEloquentBled.volumePoints, tinyEloquentBled.eloquencePoints, tinyEloquentBled.hemorrhagePoints],
    'the components differ entirely',
  );
  assert.match(bigQuiet.bandText, /indistinguishable to this scale/);
});

test('volume carries as much weight as both other items together', () => {
  const maxVolume = Math.max(...VOLUME_BANDS.map((b) => b.points));
  assert.equal(maxVolume, ELOQUENCE_POINTS + HEMORRHAGE_POINTS);
});

// THE granularity gap.
test('five scores map to only three published outcome bands', () => {
  assert.equal(OUTCOME_BANDS.length, 3);
  assert.equal(VRAS_MAX + 1, 5);
  assert.equal(at(1, 'no', 'no').favorablePercent, at(3, 'no', 'no').favorablePercent, '0 and 1 share');
  assert.equal(at(1, 'no', 'no').total, 0);
  assert.equal(at(3, 'no', 'no').total, 1);
  assert.equal(at(5, 'yes', 'no').favorablePercent, at(5, 'yes', 'yes').favorablePercent, '3 and 4 share');
  assert.match(at(1, 'no', 'no').bandText, /FINER THAN THE EVIDENCE BEHIND IT/);
});

test('the published rates are the source figures', () => {
  assert.deepEqual(OUTCOME_BANDS.map((b) => b.favorablePercent), [80, 70, 45]);
  assert.equal(at(1, 'no', 'no').favorablePercent, 80);
  assert.equal(at(5, 'no', 'no').favorablePercent, 70);
  assert.equal(at(5, 'yes', 'yes').favorablePercent, 45);
});

// The composite endpoint and the companion contrast.
test('the composite definition of favorable outcome is stated', () => {
  const r = at(1, 'no', 'no');
  assert.match(r.bandText, /COMPOSITE of three conditions/);
  assert.match(r.bandText, /NOT the obliteration rate/);
});

test('the scales are described as non-convertible', () => {
  assert.match(at(1, 'no', 'no').bandText, /share ONLY volume/);
  assert.match(at(1, 'no', 'no').bandText, /neither score converts into the other/);
});

// Input handling and scope.
test('the inputs are validated', () => {
  assert.equal(vras({}).valid, false);
  assert.match(vras({}).message, /only graded item and carries half the scale/);
  assert.match(vras({ volume: '0', eloquentLocation: 'no', priorHemorrhage: 'no' }).message, /above 0/);
});

test('the scope note refuses the modality choice and names ARUBA', () => {
  const r = at(1, 'no', 'no');
  assert.match(r.note, /does not choose between radiosurgery, microsurgery, embolization and observation/);
  assert.match(r.note, /ARUBA trial/);
  assert.match(r.note, /not by itself an indication to treat/);
});
