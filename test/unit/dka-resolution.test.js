import test from 'node:test';
import assert from 'node:assert/strict';
import { dkaResolution as d, GLUCOSE_MAX, BICARB_MIN, PH_MIN, ANION_GAP_MAX, SECONDARY_NEEDED } from '../../lib/dka-resolution-v905.js';

const full = { glucoseMgDl: 180, bicarbonate: 16, venousPh: 7.34, anionGap: 10 };

test('dka-resolution: the published thresholds', () => {
  assert.equal(GLUCOSE_MAX, 200);
  assert.equal(BICARB_MIN, 15);
  assert.equal(PH_MIN, 7.30);
  assert.equal(ANION_GAP_MAX, 12);
  assert.equal(SECONDARY_NEEDED, 2);
});

test('dka-resolution: the glucose is necessary and not sufficient', () => {
  // The reason the tile exists.
  assert.equal(d({ glucoseMgDl: 150 }).resolved, false);
  assert.equal(d({ ...full, glucoseMgDl: 320 }).resolved, false);
  assert.match(d({ ...full, glucoseMgDl: 320 }).band, /is not below 200/);
  for (const input of [{ glucoseMgDl: 150 }, full]) {
    assert.match(d(input).notGlucoseNote, /Resolution is not the glucose/);
    assert.match(d(input).notGlucoseNote, /the glucose falls first/);
  }
});

test('dka-resolution: two of three, and one is not enough', () => {
  // Gap and bicarbonate back, pH still lagging: resolved.
  assert.equal(d({ glucoseMgDl: 180, bicarbonate: 16, venousPh: 7.2, anionGap: 10 }).resolved, true);
  // Gap alone: one of three, not resolved.
  const gapOnly = d({ glucoseMgDl: 180, bicarbonate: 13, venousPh: 7.28, anionGap: 9 });
  assert.equal(gapOnly.metCount, 1);
  assert.equal(gapOnly.resolved, false);
  assert.match(gapOnly.band, /only 1 of the three is met and 2 are needed/);
  assert.match(gapOnly.twoOfThreeNote, /a closed gap on its own is one of three/);
});

test('dka-resolution: each secondary threshold is read strictly', () => {
  const base = { glucoseMgDl: 180, bicarbonate: 0, venousPh: 7.0, anionGap: 30 };
  assert.equal(d({ ...base, bicarbonate: 15 }).metCount, 1);
  assert.equal(d({ ...base, bicarbonate: 14.9 }).metCount, 0);
  assert.equal(d({ ...base, venousPh: 7.31 }).metCount, 1);
  assert.equal(d({ ...base, venousPh: 7.30 }).metCount, 0);
  assert.equal(d({ ...base, anionGap: 12 }).metCount, 1);
  assert.equal(d({ ...base, anionGap: 12.1 }).metCount, 0);
});

test('dka-resolution: a missing value is not a met value, and it says so', () => {
  const partial = d({ glucoseMgDl: 180, anionGap: 10 });
  assert.equal(partial.enteredCount, 1);
  assert.equal(partial.metCount, 1);
  assert.equal(partial.resolved, false);
  assert.match(partial.missingNote, /2 of the three secondary values are not entered/);
  assert.match(partial.missingNote, /the anion gap in particular is the one to have/);
  assert.equal(d(full).missingNote, null);
});

test('dka-resolution: the overlap warning belongs to the resolved result', () => {
  assert.match(d(full).overlapNote, /not the moment the infusion stops/);
  assert.match(d(full).overlapNote, /1 to 2 hours/);
  assert.equal(d({ glucoseMgDl: 320 }).overlapNote, null);
});

test('dka-resolution: the ketone point is on every result', () => {
  for (const input of [{}, full, { glucoseMgDl: 320 }]) {
    assert.match(d(input).ketoneNote, /not measured ketones/);
    assert.match(d(input).ketoneNote, /beta-hydroxybutyrate/);
    assert.match(d(input).scopeNote, /does not decide when to transition/);
  }
});

test('dka-resolution: with no glucose it asks for one rather than guessing', () => {
  const r = d({ bicarbonate: 16, venousPh: 7.34, anionGap: 10 });
  assert.equal(r.resolved, false);
  assert.match(r.band, /Enter the glucose/);
  assert.equal(r.bandLabel, 'Glucose not entered');
});

test('dka-resolution: out-of-range values are refused', () => {
  assert.equal(d({ glucoseMgDl: 2001 }).valid, false);
  assert.equal(d({ venousPh: 9 }).valid, false);
  assert.equal(d({ bicarbonate: 61 }).valid, false);
  assert.equal(d({ anionGap: -1 }).valid, false);
});

test('dka-resolution: the documented example', () => {
  const r = d({ glucoseMgDl: '180', bicarbonate: '16', venousPh: '7.34', anionGap: '10' });
  assert.equal(r.resolved, true);
  assert.equal(r.metCount, 3);
});
