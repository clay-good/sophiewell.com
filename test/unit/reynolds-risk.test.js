// spec-v103 2.5: Reynolds Risk Score (Ridker 2007 women / 2008 men).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reynoldsRisk } from '../../lib/cvrisk-v103.js';

test('missing / non-positive inputs -> invalid (ln(hsCRP) domain guard)', () => {
  assert.equal(reynoldsRisk({ age: 55, male: false }).valid, false);
  assert.equal(reynoldsRisk({ age: 55, male: false, sbp: 120, totalChol: 200, hdl: 50, hsCrp: 0 }).valid, false);
});

test('women worked risks (Ridker 2007)', () => {
  assert.equal(reynoldsRisk({ age: 52, male: false, sbp: 125, smoker: false, totalChol: 212, hdl: 52, hsCrp: 3.0, familyHx: false, diabetic: false }).risk, 1.3);
  assert.equal(reynoldsRisk({ age: 60, male: false, sbp: 140, smoker: true, totalChol: 260, hdl: 45, hsCrp: 4.5, familyHx: true, diabetic: false }).risk, 18.9);
});

test('men worked risks (Ridker 2008)', () => {
  assert.equal(reynoldsRisk({ age: 50, male: true, sbp: 125, smoker: false, totalChol: 200, hdl: 45, hsCrp: 1.0, familyHx: false }).risk, 3.2);
  assert.equal(reynoldsRisk({ age: 65, male: true, sbp: 145, smoker: true, totalChol: 240, hdl: 38, hsCrp: 5.0, familyHx: true }).risk, 46.2);
});

test('hsCRP drives the risk upward (all else equal)', () => {
  const lo = reynoldsRisk({ age: 55, male: false, sbp: 130, totalChol: 220, hdl: 50, hsCrp: 0.5 }).risk;
  const hi = reynoldsRisk({ age: 55, male: false, sbp: 130, totalChol: 220, hdl: 50, hsCrp: 8.0 }).risk;
  assert.ok(hi > lo);
});

test('a diabetic man is flagged as outside the derivation population', () => {
  const r = reynoldsRisk({ age: 60, male: true, sbp: 140, totalChol: 220, hdl: 45, hsCrp: 2.0, diabetic: true });
  assert.ok(r.diabeticManNote);
});

test('extreme fuzzed inputs clamp risk to [0,100]', () => {
  // spec-v1224/v1406: see score2.test.js -- SBP and age at the top of their envelopes, the rest fuzzed.
  const r = reynoldsRisk({ age: 130, male: false, sbp: 300, totalChol: 1e9, hdl: 1, hsCrp: 1e9, smoker: true, familyHx: true, diabetic: true, hba1c: 1e9 });
  assert.ok(r.risk >= 0 && r.risk <= 100 && Number.isFinite(r.risk));
});

// spec-v1409: two models on two cohorts -- women 45 and older (Women's Health Study, JAMA
// 2007;297:611-619), men 50 and older (Physicians' Health Study II, Circulation 2008;118:2243-2251).
// The field used to accept 30 for either sex, and the model clamped and answered.
test('each sex is refused below the age of its own cohort', () => {
  const women = reynoldsRisk({ age: 40, male: false, sbp: 120, totalChol: 260, hdl: 45, hsCrp: 2 });
  assert.equal(women.valid, false);
  assert.match(women.band, /for women was fitted on ages 45 and over/);
  const men = reynoldsRisk({ age: 47, male: true, sbp: 120, totalChol: 260, hdl: 45, hsCrp: 2 });
  assert.equal(men.valid, false);
  assert.match(men.band, /for men was fitted on ages 50 to under 80/);
  // 47 is inside the women's cohort and outside the men's: the floor is not shared.
  assert.equal(reynoldsRisk({ age: 47, male: false, sbp: 120, totalChol: 260, hdl: 45, hsCrp: 2 }).valid, true);
});

// spec-v1410: the men's paper states a ceiling too -- "men eligible for the current analysis were
// those younger than 80 at baseline" (Circulation 2008;118:2243-2251). The women's states a floor only.
test('the men\'s cohort ends below 80; the women\'s has no stated ceiling', () => {
  const at79 = reynoldsRisk({ age: 79, male: true, sbp: 120, totalChol: 260, hdl: 45, hsCrp: 2 });
  assert.equal(at79.valid, true);
  const at80 = reynoldsRisk({ age: 80, male: true, sbp: 120, totalChol: 260, hdl: 45, hsCrp: 2 });
  assert.equal(at80.valid, false);
  assert.match(at80.band, /ages 50 to under 80/);
  assert.equal(reynoldsRisk({ age: 85, male: false, sbp: 120, totalChol: 260, hdl: 45, hsCrp: 2 }).valid, true);
});
