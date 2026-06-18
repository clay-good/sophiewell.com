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
  const r = reynoldsRisk({ age: 1e9, male: false, sbp: 1e9, totalChol: 1e9, hdl: 1, hsCrp: 1e9, smoker: true, familyHx: true, diabetic: true, hba1c: 1e9 });
  assert.ok(r.risk >= 0 && r.risk <= 100 && Number.isFinite(r.risk));
});
