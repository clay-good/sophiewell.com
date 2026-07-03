// spec-v212 2.1: Baveno VII worked examples. Threshold classifier over LSM
// (kPa, transient elastography) and platelet count. Thresholds spec-v97
// cross-verified (de Franchis 2022 Baveno VII consensus; Augustin 2017 Baveno
// VI/Expanded Baveno VI): CSPH rule-out LSM <= 15 AND plt >= 150; rule-in LSM
// >= 25; favorable Baveno VI (defer endoscopy) LSM < 20 AND plt > 150.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bavenoVii } from '../../lib/hep-fibrosis-portal-v212.js';

test('CSPH ruled out and endoscopy deferrable (worked example)', () => {
  const r = bavenoVii({ lsm: 12, platelets: 180 });
  assert.equal(r.valid, true);
  assert.equal(r.abnormal, false);
  assert.equal(r.favorable, true);
  assert.match(r.csph, /ruled OUT/);
  assert.match(r.varices, /may be deferred/);
});

test('CSPH ruled in at LSM >= 25 (abnormal)', () => {
  const r = bavenoVii({ lsm: 28, platelets: 90 });
  assert.equal(r.abnormal, true);
  assert.match(r.csph, /ruled IN/);
  assert.match(r.csph, /MASLD/);
});

test('gray zone between 15 and 25 kPa', () => {
  const r = bavenoVii({ lsm: 18, platelets: 120 });
  assert.equal(r.abnormal, false);
  assert.match(r.csph, /gray zone/);
});

test('LSM <= 15 but platelets < 150 is not a rule-out (gray zone)', () => {
  const r = bavenoVii({ lsm: 12, platelets: 120 });
  assert.match(r.csph, /gray zone/);
  assert.equal(r.favorable, false);
});

test('favorable Baveno VI boundary: LSM < 20 and plt > 150', () => {
  assert.equal(bavenoVii({ lsm: 19, platelets: 200 }).favorable, true);
  assert.equal(bavenoVii({ lsm: 20, platelets: 200 }).favorable, false); // 20 not < 20
  assert.equal(bavenoVii({ lsm: 19, platelets: 150 }).favorable, false); // 150 not > 150
});

test('invalid when a field is missing or non-positive', () => {
  assert.equal(bavenoVii({ lsm: 12 }).valid, false);
  assert.equal(bavenoVii({ lsm: 0, platelets: 180 }).valid, false);
  assert.equal(bavenoVii({}).valid, false);
});
