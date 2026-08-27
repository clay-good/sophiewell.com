import test from 'node:test';
import assert from 'node:assert/strict';
import { goldCoastAls } from '../../lib/gold-coast-als-v811.js';

const base = { progressiveMotorImpairment: true, otherDiseasesExcluded: true };

test('gold coast: UMN and LMN in the SAME region meets the first limb', () => {
  const r = goldCoastAls({ ...base, cervicalUmn: true, cervicalLmn: true });
  assert.equal(r.criteriaMet, true);
  assert.equal(r.distributionMet, true);
  assert.deepEqual(r.sameRegionRegions, ['cervical']);
});

test('gold coast: LMN alone in two regions meets the second limb', () => {
  const r = goldCoastAls({ ...base, cervicalLmn: true, lumbosacralLmn: true });
  assert.equal(r.criteriaMet, true);
  assert.equal(r.lmnRegionCount, 2);
  assert.deepEqual(r.sameRegionRegions, []);
});

test('gold coast: UMN and LMN in DIFFERENT regions meets NEITHER limb', () => {
  // The trap. A tool that counted UMN regions and LMN regions separately would call this
  // met. Both limbs are region-bound: one needs them together, the other needs LMN twice.
  const r = goldCoastAls({ ...base, bulbarUmn: true, lumbosacralLmn: true });
  assert.equal(r.distributionMet, false);
  assert.equal(r.criteriaMet, false);
  assert.ok(r.splitNote);
  assert.ok(r.splitNote.includes('different regions'));
});

test('gold coast: UMN in two regions without any LMN does not meet the criteria', () => {
  const r = goldCoastAls({ ...base, bulbarUmn: true, cervicalUmn: true });
  assert.equal(r.distributionMet, false);
  assert.equal(r.criteriaMet, false);
});

test('gold coast: LMN in one region alone is not enough', () => {
  const r = goldCoastAls({ ...base, cervicalLmn: true });
  assert.equal(r.lmnRegionCount, 1);
  assert.equal(r.distributionMet, false);
  assert.equal(r.criteriaMet, false);
});

test('gold coast: the distribution alone does not diagnose - all three are required', () => {
  const dist = { cervicalUmn: true, cervicalLmn: true };
  assert.equal(goldCoastAls({ ...dist, progressiveMotorImpairment: true }).criteriaMet, false);
  assert.equal(goldCoastAls({ ...dist, otherDiseasesExcluded: true }).criteriaMet, false);
  const r = goldCoastAls(dist);
  assert.equal(r.distributionMet, true);
  assert.equal(r.criteriaMet, false);
  assert.equal(r.missing.length, 2);
});

test('gold coast: there are NO certainty categories', () => {
  // Gold Coast abolished definite/probable/possible. A result that offered one would be
  // reporting the framework Gold Coast replaced.
  const r = goldCoastAls({ ...base, cervicalUmn: true, cervicalLmn: true });
  const text = JSON.stringify(r).toLowerCase();
  assert.ok(!text.includes('"probable'));
  assert.ok(!text.includes('definite als'));
  assert.ok(r.detail.includes('no certainty categories'));
});

test('gold coast: empty input is answerable and reports all three as outstanding', () => {
  const r = goldCoastAls({});
  assert.equal(r.valid, true);
  assert.equal(r.criteriaMet, false);
  assert.equal(r.missing.length, 3);
  assert.equal(r.splitNote, null);
  assert.equal(goldCoastAls().criteriaMet, false);
});
