// spec-v786: 2010 ARVC Task Force Criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { arvcTfc, CATEGORIES } from '../../lib/arvc-tfc-v786.js';

// spec-v1111: all six categories assessed, with the ones under test overridden.
// The tier assertions below used to assess one or three categories and read the
// rest as assessed-and-negative, which is the defect that wave fixed.
const assessed = (o = {}) => {
  const all = {};
  for (const c of CATEGORIES) all[c.arg] = 'none';
  return { ...all, ...o };
};

test('nothing met -> 0 points, criteria not met', () => {
  const r = arvcTfc(assessed());
  assert.equal(r.valid, true);
  assert.equal(r.points, 0);
  assert.equal(r.tier, 'not-met');
  assert.equal(r.abnormal, false);
});

test('all three published definite combinations reach 4 points', () => {
  assert.equal(arvcTfc({ structural: 'major', repolarization: 'major' }).tier, 'definite');
  assert.equal(arvcTfc({ structural: 'major', repolarization: 'minor', arrhythmias: 'minor' }).tier, 'definite');
  assert.equal(arvcTfc({ structural: 'minor', tissue: 'minor', repolarization: 'minor', depolarization: 'minor' }).tier, 'definite');
});

test('both published borderline combinations reach exactly 3 points', () => {
  const a = arvcTfc(assessed({ structural: 'major', family: 'minor' }));
  const b = arvcTfc(assessed({ repolarization: 'minor', depolarization: 'minor', arrhythmias: 'minor' }));
  assert.equal(a.points, 3);
  assert.equal(a.tier, 'borderline');
  assert.equal(b.points, 3);
  assert.equal(b.tier, 'borderline');
});

test('both published possible combinations reach exactly 2 points', () => {
  assert.equal(arvcTfc(assessed({ structural: 'major' })).tier, 'possible');
  assert.equal(arvcTfc(assessed({ structural: 'minor', family: 'minor' })).tier, 'possible');
});

test('a single minor criterion is below possible', () => {
  const r = arvcTfc(assessed({ family: 'minor' }));
  assert.equal(r.points, 1);
  assert.equal(r.tier, 'not-met');
});

test('a category counts once: major replaces minor rather than adding to it', () => {
  // The select shape makes this structural, and the point of the rule is that a
  // category cannot contribute 3 points however many findings it holds.
  const r = arvcTfc({ structural: 'major' });
  assert.equal(r.points, 2);
  assert.equal(r.majors, 1);
  assert.equal(r.minors, 0);
});

test('all six categories at major is the 12-point ceiling', () => {
  const o = {};
  for (const c of CATEGORIES) o[c.arg] = 'major';
  const r = arvcTfc(o);
  assert.equal(r.points, 12);
  assert.equal(r.majors, 6);
  assert.equal(r.tier, 'definite');
});

test('an unrecognised level is rejected rather than treated as none', () => {
  const r = arvcTfc({ tissue: 'equivocal' });
  assert.equal(r.valid, false);
  assert.equal(r.field, 'tissue');
});


// --- spec-v1111: an unassessed category was read as assessed and negative ---

test('spec-v1111: an unassessed workup reaches no tier', () => {
  const r = arvcTfc({});
  assert.equal(r.valid, true);
  assert.equal(r.points, 0);
  assert.equal(r.unassessed.length, 6);
  assert.equal(r.floorOnly, true);
  assert.equal(r.tier, null, '"criteria not met" closes a cardiomyopathy workup');
  assert.match(r.band, /at least 0 points/);
  assert.match(r.band, /6 of the 6 categories are not assessed/);
  assert.match(r.band, /can only add points/);
  assert.doesNotMatch(r.band, /criteria not met/);
});

test('spec-v1111: definite rules in from a subset', () => {
  // Rule 13: two majors are four points whatever the other four categories hold.
  const r = arvcTfc({ structural: 'major', repolarization: 'major' });
  assert.equal(r.points, 4);
  assert.equal(r.tier, 'definite');
  assert.equal(r.floorOnly, false);
  assert.match(r.band, /definite ARVC/);
});

test('spec-v1111: one unassessed category holds back the gentler tiers', () => {
  const partial = assessed({ structural: 'major' });
  delete partial.family;
  const r = arvcTfc(partial);
  assert.equal(r.points, 2);
  assert.equal(r.tier, null, 'possible ARVC was given with a category unassessed');
  assert.deepEqual(r.unassessed, ['category VI']);
});
