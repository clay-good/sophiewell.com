// spec-v786: 2010 ARVC Task Force Criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { arvcTfc, CATEGORIES } from '../../lib/arvc-tfc-v786.js';

test('nothing met -> 0 points, criteria not met', () => {
  const r = arvcTfc({});
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
  const a = arvcTfc({ structural: 'major', family: 'minor' });
  const b = arvcTfc({ repolarization: 'minor', depolarization: 'minor', arrhythmias: 'minor' });
  assert.equal(a.points, 3);
  assert.equal(a.tier, 'borderline');
  assert.equal(b.points, 3);
  assert.equal(b.tier, 'borderline');
});

test('both published possible combinations reach exactly 2 points', () => {
  assert.equal(arvcTfc({ structural: 'major' }).tier, 'possible');
  assert.equal(arvcTfc({ structural: 'minor', family: 'minor' }).tier, 'possible');
});

test('a single minor criterion is below possible', () => {
  const r = arvcTfc({ family: 'minor' });
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
