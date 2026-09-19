// spec-v103 2.4: Framingham general CVD risk + vascular age (D'Agostino 2008).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { framinghamCvd } from '../../lib/cvrisk-v103.js';

test('missing / non-positive inputs -> invalid (ln domain guard)', () => {
  assert.equal(framinghamCvd({ age: 55, male: true }).valid, false);
  assert.equal(framinghamCvd({ age: 0, male: true, totalChol: 200, hdl: 50, sbp: 120 }).valid, false);
});

test("paper worked example (61yo woman, TC 230, HDL 47, SBP 124 untreated) -> 8.4% / vascular age 67.7", () => {
  const r = framinghamCvd({ age: 61, male: false, totalChol: 230, hdl: 47, sbp: 124, smoker: false, diabetes: false });
  assert.equal(r.risk, 8.4);
  assert.equal(r.vascularAge, 67.7);
});

test('man worked 10-year risk + vascular age', () => {
  const r = framinghamCvd({ age: 55, male: true, totalChol: 213, hdl: 50, sbp: 120 });
  assert.equal(r.risk, 10.2);
  assert.equal(r.vascularAge, 55.2);
});

test('treated BP uses the higher coefficient (treated risk > untreated)', () => {
  const untreated = framinghamCvd({ age: 50, male: true, totalChol: 240, hdl: 40, sbp: 140, bpTreated: false, smoker: true }).risk;
  const treated = framinghamCvd({ age: 50, male: true, totalChol: 240, hdl: 40, sbp: 140, bpTreated: true, smoker: true }).risk;
  assert.ok(treated > untreated);
  assert.equal(treated, 33.5);
});

test('extreme fuzzed inputs clamp risk to [0,100] and vascular age finite', () => {
  // spec-v1224/v1406/v1408: SBP at the top of its envelope and age at the top of the range the model
  // was FITTED on (30-74; above it the model is not extrapolated), the rest fuzzed.
  const r = framinghamCvd({ age: 74, male: true, totalChol: 1e9, hdl: 1, sbp: 300, smoker: true, diabetes: true });
  assert.ok(r.risk >= 0 && r.risk <= 100 && Number.isFinite(r.risk));
  assert.ok(r.vascularAge == null || Number.isFinite(r.vascularAge));
});

// spec-v1408: outside the fitted range the model used to clamp the age and answer anyway -- a
// 95-year-old was scored on a 74-year-old's coefficients.
test('an age outside the fitted 30-74 is refused, not clamped', () => {
  const r = framinghamCvd({ age: 95, male: true, totalChol: 213, hdl: 50, sbp: 120, smoker: false, diabetes: false });
  assert.equal(r.valid, false);
  assert.match(r.band, /fitted on ages 30 to 74/);
  assert.equal(framinghamCvd({ age: 74, male: true, totalChol: 213, hdl: 50, sbp: 120, smoker: false, diabetes: false }).valid, true);
});
