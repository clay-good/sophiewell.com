// spec-v103 2.6: non-HDL & remnant cholesterol (Varbo 2013), arithmetic identity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonHdlRemnant } from '../../lib/cvrisk-v103.js';

test('missing inputs -> invalid', () => {
  assert.equal(nonHdlRemnant({ totalChol: 200 }).valid, false);
});

test('non-HDL = TC - HDL; remnant = TC - HDL - LDL', () => {
  const r = nonHdlRemnant({ totalChol: 200, hdl: 50, ldl: 120 });
  assert.equal(r.nonHdl, 150);
  assert.equal(r.remnant, 30);
  assert.equal(r.unit, 'mg/dL');
});

test('non-HDL crossing the 130 mg/dL target', () => {
  assert.ok(nonHdlRemnant({ totalChol: 200, hdl: 50 }).nonHdl >= 130);
  assert.ok(nonHdlRemnant({ totalChol: 160, hdl: 50 }).nonHdl < 130);
});

test('without LDL, remnant is not computed', () => {
  const r = nonHdlRemnant({ totalChol: 200, hdl: 50 });
  assert.equal(r.remnant, null);
  assert.match(r.band, /Enter LDL/);
});

test('implausible negative remnant (LDL + HDL > TC) is flagged, not printed negative', () => {
  const r = nonHdlRemnant({ totalChol: 150, hdl: 50, ldl: 120 });
  assert.equal(r.implausible, true);
  assert.match(r.band, /recheck/);
});

test('mmol/L unit preserved with a mmol/L target', () => {
  const r = nonHdlRemnant({ totalChol: 5.2, hdl: 1.3, ldl: 3.1, unit: 'mmol' });
  assert.equal(r.unit, 'mmol/L');
  assert.equal(r.target, 3.4);
  assert.equal(r.nonHdl, 3.9);
});
