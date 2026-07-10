// spec-v281: worked examples for the GALAD score (Johnson 2014). Coefficients
// spec-v97 cross-verified: Z = -10.08 + 0.09*age + 1.67*(male=1) + 2.34*log10(AFP)
// + 0.04*AFP-L3 + 1.33*log10(DCP); probability = e^Z/(1+e^Z); cutoff Z = -0.63.
// Assay units: AFP ng/mL, DCP mAU/mL, AFP-L3 %.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { galadHcc } from '../../lib/hcc-surveillance-v281.js';

const log10 = (x) => Math.log(x) / Math.LN10;

test('galad-hcc: Z matches the published linear predictor', () => {
  const r = galadHcc({ sex: 'male', age: 60, afpL3: 10, afp: 100, dcp: 100 });
  const expected = -10.08 + 0.09 * 60 + 1.67 * 1 + 2.34 * log10(100) + 0.04 * 10 + 1.33 * log10(100);
  assert.equal(r.valid, true);
  assert.ok(Math.abs(r.z - Number(expected.toFixed(2))) < 0.011);
});

test('galad-hcc: a below-cutoff biomarker set (young female, low markers)', () => {
  const r = galadHcc({ sex: 'female', age: 40, afpL3: 2, afp: 3, dcp: 20 });
  assert.equal(r.aboveCutoff, false); // Z < -0.63
  assert.equal(r.abnormal, false);
  assert.ok(r.detail.includes('below the Z = -0.63 cutoff'));
});

test('galad-hcc: an above-cutoff biomarker set (tile example)', () => {
  const r = galadHcc({ sex: 'male', age: 65, afpL3: 10, afp: 100, dcp: 200 });
  assert.equal(r.z, 5.58);
  assert.equal(r.aboveCutoff, true);
  assert.ok(r.detail.includes('GALAD Z 5.58'));
  assert.ok(r.probability >= 0 && r.probability <= 100);
});

test('galad-hcc: probability is bounded to [0, 100]', () => {
  const hi = galadHcc({ sex: 'male', age: 90, afpL3: 100, afp: 100000, dcp: 100000 });
  assert.ok(hi.probability <= 100);
  const lo = galadHcc({ sex: 'female', age: 20, afpL3: 0, afp: 1, dcp: 1 });
  assert.ok(lo.probability >= 0);
});

test('galad-hcc: missing / non-positive AFP or DCP is invalid (log-domain guard)', () => {
  assert.equal(galadHcc({ sex: 'male', age: 60, afpL3: 10, afp: 0, dcp: 100 }).valid, false);
  assert.equal(galadHcc({ sex: 'male', age: 60, afpL3: 10, afp: 100 }).valid, false);
  assert.equal(galadHcc({}).valid, false);
  assert.equal(galadHcc().valid, false);
});
