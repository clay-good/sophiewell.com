// spec-v147 2.7: 2016 revised ACR fibromyalgia criteria (Wolfe 2016). Met when
// (WPI>=7 and SSS>=5) OR (WPI 4-6 and SSS>=9), AND generalized pain (>=4 of 5),
// AND >=3 months. SSS somatic item is a 0-3 COUNT of 3 symptoms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fibromyalgiaAcr2016 } from '../../lib/rheum-v147.js';

const base = { wpi: 8, fatigue: 's2', waking: 's2', cognitive: 's1', somHeadache: true, genRegions: 4, duration: true };

test('tile example: WPI 8, SSS 6 (branch 1) -> criteria met', () => {
  const r = fibromyalgiaAcr2016(base);
  assert.equal(r.valid, true);
  assert.equal(r.score, 8);
  assert.equal(r.sss, 6);
  assert.equal(r.bandLabel, 'Criteria met');
  assert.equal(r.abnormal, true);
});

test('branch 1 edge: WPI 7 and SSS 5 met; WPI 7 and SSS 4 not met', () => {
  // SSS 5 = fatigue 2 + waking 2 + cognitive 1 + somatic 0
  const met = fibromyalgiaAcr2016({ wpi: 7, fatigue: 's2', waking: 's2', cognitive: 's1', genRegions: 5, duration: true });
  assert.equal(met.sss, 5);
  assert.equal(met.bandLabel, 'Criteria met');
  const notMet = fibromyalgiaAcr2016({ wpi: 7, fatigue: 's2', waking: 's1', cognitive: 's1', genRegions: 5, duration: true });
  assert.equal(notMet.sss, 4);
  assert.equal(notMet.bandLabel, 'Criteria not met');
});

test('branch 2: WPI 4-6 needs SSS >=9', () => {
  // WPI 5, SSS 9 (3+3+3+0) -> met
  const met = fibromyalgiaAcr2016({ wpi: 5, fatigue: 's3', waking: 's3', cognitive: 's3', genRegions: 5, duration: true });
  assert.equal(met.sss, 9);
  assert.equal(met.bandLabel, 'Criteria met');
  // WPI 5, SSS 8 -> not met (branch-1 needs WPI>=7; branch-2 needs SSS>=9)
  const notMet = fibromyalgiaAcr2016({ wpi: 5, fatigue: 's3', waking: 's3', cognitive: 's2', genRegions: 5, duration: true });
  assert.equal(notMet.sss, 8);
  assert.equal(notMet.bandLabel, 'Criteria not met');
});

test('somatic item is a count of 3 symptoms (each 0/1)', () => {
  const r = fibromyalgiaAcr2016({ wpi: 7, fatigue: 's0', waking: 's0', cognitive: 's0', somHeadache: true, somAbdominal: true, somDepression: true, genRegions: 4, duration: true });
  assert.equal(r.sss, 3); // 0+0+0 + 3 somatic
});

test('generalized-pain gate: <4 regions fails even with high WPI/SSS', () => {
  const r = fibromyalgiaAcr2016({ ...base, genRegions: 3 });
  assert.equal(r.bandLabel, 'Criteria not met');
  assert.match(r.band, /generalized pain/);
});

test('duration gate: <3 months fails', () => {
  const r = fibromyalgiaAcr2016({ ...base, duration: false });
  assert.equal(r.bandLabel, 'Criteria not met');
  assert.match(r.band, /3 months/);
});

test('blank WPI -> complete-the-fields', () => {
  const r = fibromyalgiaAcr2016({ fatigue: 's2', waking: 's2', cognitive: 's1', genRegions: 4, duration: true });
  assert.equal(r.valid, false);
  assert.match(r.message, /Widespread Pain Index/);
});
