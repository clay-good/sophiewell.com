// spec-v147 2.5: 2015 ACR/EULAR gout classification (Neogi 2015). Entry gate;
// MSU-crystal sufficient bypass; weighted domains 0-23, >=8 = gout. Serum urate
// <4 mg/dL = -4, MSU-negative synovial = -2 (signs confirmed against source).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goutAcrEular2015 } from '../../lib/rheum-v147.js';

test('entry criterion not met -> criteria not applicable', () => {
  const r = goutAcrEular2015({ pattern: 'mtp1' });
  assert.equal(r.valid, true);
  assert.equal(r.applicable, false);
  assert.equal(r.abnormal, false);
});

test('MSU crystals -> sufficient-criterion bypass, no scoring', () => {
  const r = goutAcrEular2015({ entry: true, msuCrystals: true });
  assert.equal(r.applicable, true);
  assert.equal(r.sufficient, true);
  assert.equal(r.score, null);
  assert.equal(r.bandLabel, 'Gout (sufficient criterion)');
  assert.equal(r.abnormal, true);
});

test('tile example: weighted 2+2+2+3 = 9 -> classified gout (>=8)', () => {
  const r = goutAcrEular2015({ entry: true, pattern: 'mtp1', characteristics: 'c2', timeCourse: 'recurrent', serumUrate: 'u8to10', synovial: 'notdone' });
  assert.equal(r.sufficient, false);
  assert.equal(r.score, 9);
  assert.equal(r.bandLabel, 'Gout');
  assert.equal(r.abnormal, true);
});

test('threshold: 7 not classified, 8 classified', () => {
  // pattern mtp1 (2) + char c1 (1) + recurrent (2) + 6-<8 urate (2) = 7
  const seven = goutAcrEular2015({ entry: true, pattern: 'mtp1', characteristics: 'c1', timeCourse: 'recurrent', serumUrate: 'u6to8', synovial: 'notdone' });
  assert.equal(seven.score, 7);
  assert.equal(seven.bandLabel, 'Not classified');
  // add a clinical tophus (+4) -> 11 classified; or bump urate. Use 8 exactly: char c2 -> 8
  const eight = goutAcrEular2015({ entry: true, pattern: 'mtp1', characteristics: 'c2', timeCourse: 'recurrent', serumUrate: 'u6to8', synovial: 'notdone' });
  assert.equal(eight.score, 8);
  assert.equal(eight.bandLabel, 'Gout');
});

test('negative items: serum urate <4 = -4 and MSU-negative synovial = -2', () => {
  const r = goutAcrEular2015({ entry: true, pattern: 'other', characteristics: 'c0', timeCourse: 'none', serumUrate: 'lt4', synovial: 'negative' });
  assert.equal(r.score, -6);
  assert.equal(r.bandLabel, 'Not classified');
});

test('imaging + tophus checkboxes add 4 each', () => {
  const r = goutAcrEular2015({ entry: true, pattern: 'other', characteristics: 'c0', timeCourse: 'none', serumUrate: 'u4to6', synovial: 'notdone', tophus: true, imagingUrate: true });
  assert.equal(r.score, 8); // 0+0+0+0+0 + 4 + 4
  assert.equal(r.bandLabel, 'Gout');
});

test('entry met but a weighted domain blank -> complete-the-fields', () => {
  const r = goutAcrEular2015({ entry: true, pattern: 'mtp1', characteristics: 'c2', timeCourse: 'recurrent' });
  assert.equal(r.valid, false);
  assert.match(r.message, /serum urate/);
});
