// spec-v654: Peritoneal Cancer Index (Jacquet-Sugarbaker).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { peritonealCancerIndex, PCI_REGIONS } from '../../lib/peritoneal-cancer-index-v654.js';

test('there are 13 regions', () => {
  assert.equal(PCI_REGIONS.length, 13);
});

test('range: empty = 0, all LS-3 = 39', () => {
  assert.equal(peritonealCancerIndex({}).total, 0);
  const all3 = {};
  for (const r of PCI_REGIONS) all3[r.key] = '3';
  assert.equal(peritonealCancerIndex(all3).total, 39);
});

test('absent regions default to LS-0 (no tumor)', () => {
  const r = peritonealCancerIndex({ r6: '3' });
  assert.equal(r.total, 3);
  assert.equal(r.regionsInvolved, 1);
});

test('sums across regions and counts only involved regions', () => {
  const r = peritonealCancerIndex({ r0: '2', r2: '1', r6: '3', r9: '0' });
  assert.equal(r.total, 6);
  assert.equal(r.regionsInvolved, 3); // r9 = 0 is not "involved"
});

test('abnormal flag at total >= 20', () => {
  const at19 = {}; // 6*3 + 1 = 19
  for (let i = 0; i < 6; i++) at19[`r${i}`] = '3';
  at19.r6 = '1';
  assert.equal(peritonealCancerIndex(at19).total, 19);
  assert.equal(peritonealCancerIndex(at19).abnormal, false);
  at19.r6 = '2';
  assert.equal(peritonealCancerIndex(at19).total, 20);
  assert.equal(peritonealCancerIndex(at19).abnormal, true);
});

// spec-v1111: all thirteen regions scored, with the ones under test overridden.
// The example below entered three and let ten default to LS-0 -- the surgeon
// having looked and found no tumour -- which is the defect that wave fixed.
const explored = (o = {}) => {
  const all = {};
  for (let i = 0; i < 13; i += 1) all[`r${i}`] = '0';
  return { ...all, ...o };
};

test('META example: pelvis 3 + central 2 + epigastrium 1 = 6', () => {
  const r = peritonealCancerIndex(explored({ r0: '2', r2: '1', r6: '3' }));
  assert.equal(r.total, 6);
  assert.match(r.bandLabel, /PCI 6 of 39/);
  assert.deepEqual(r.unscored, []);
});

// --- spec-v1111: an unscored region was a region explored and found clear ---

test('spec-v1111: an unexplored abdomen has no PCI', () => {
  const r = peritonealCancerIndex({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.unscored.length, 13);
  assert.equal(r.floorOnly, true);
  assert.match(r.bandLabel, /PCI at least 0 of 39/);
  assert.match(r.band, /13 regions are not scored/);
  assert.match(r.band, /can only raise the index/);
  assert.match(r.detail, /Not scored: /);
});

test('spec-v1111: a high-burden index rules in and needs no footing', () => {
  // Rule 13: an unscored region cannot bring 20 back down.
  const r = peritonealCancerIndex({ r0: '3', r1: '3', r2: '3', r3: '3', r4: '3', r5: '3', r6: '2' });
  assert.equal(r.total, 20);
  assert.equal(r.abnormal, true);
  assert.equal(r.floorOnly, false);
  assert.match(r.bandLabel, /^PCI 20 of 39/);
});

test('a region score outside 0-3 is rejected', () => {
  assert.equal(peritonealCancerIndex({ r0: '4' }).valid, false);
  assert.equal(peritonealCancerIndex({ r0: '4' }).code, 'OUT_OF_RANGE');
  assert.equal(peritonealCancerIndex({ r0: '-1' }).valid, false);
});
