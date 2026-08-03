// spec-v641: 2022 ACR/EULAR Classification Criteria for Eosinophilic Granulomatosis with Polyangiitis.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { egpaAcrEular2022 } from '../../lib/egpa-v641.js';

test('META example: eosinophilia + obstructive airway = 8/14 classifies', () => {
  const r = egpaAcrEular2022({ eosinophilia: '1', airwayObstruction: '1' });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /2022 ACR\/EULAR 8\/14/);
  assert.match(r.band, /classify as eosinophilic granulomatosis with polyangiitis/);
});

test('eosinophilia is POSITIVE here (+5), the reverse of GPA/MPA', () => {
  assert.equal(egpaAcrEular2022({ eosinophilia: '1' }).score, 5);
});

test('threshold is >= 6, one higher than GPA/MPA: eosinophilia alone (5) does NOT classify', () => {
  const r = egpaAcrEular2022({ eosinophilia: '1' });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, false);
  // 6 classifies: nasal polyps (3) + obstructive airway (3) = 6.
  const r2 = egpaAcrEular2022({ nasalPolyps: '1', airwayObstruction: '1' });
  assert.equal(r2.score, 6);
  assert.equal(r2.abnormal, true);
});

test('positive items carry their verified weights', () => {
  assert.equal(egpaAcrEular2022({ eosinophilia: '1' }).score, 5);
  assert.equal(egpaAcrEular2022({ airwayObstruction: '1' }).score, 3);
  assert.equal(egpaAcrEular2022({ nasalPolyps: '1' }).score, 3);
  assert.equal(egpaAcrEular2022({ extravascularEos: '1' }).score, 2);
  assert.equal(egpaAcrEular2022({ mononeuritis: '1' }).score, 1);
});

test('the two negative items subtract (cANCA/PR3 and hematuria)', () => {
  assert.equal(egpaAcrEular2022({ cAncaPr3: '1' }).score, -3);
  assert.equal(egpaAcrEular2022({ hematuria: '1' }).score, -1);
  // Eosinophilia (+5) pulled below threshold by cANCA/PR3 (-3): net 2, not classified.
  const r = egpaAcrEular2022({ eosinophilia: '1', cAncaPr3: '1' });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});

test('score range: max +14 (five positives), min -4 (two negatives)', () => {
  const max = egpaAcrEular2022({ eosinophilia: 1, airwayObstruction: 1, nasalPolyps: 1, extravascularEos: 1, mononeuritis: 1 });
  assert.equal(max.score, 14);
  const min = egpaAcrEular2022({ cAncaPr3: 1, hematuria: 1 });
  assert.equal(min.score, -4);
  assert.equal(min.abnormal, false);
});

test('empty inputs score 0 and do not classify', () => {
  const r = egpaAcrEular2022({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.equal(r.valid, true);
});
