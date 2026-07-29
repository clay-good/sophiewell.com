// spec-v595: the ACEF and ACEF II scores.
//
// The load-bearing tests are that the score is a ratio (so halving the ejection fraction doubles it), that
// the creatinine weight differs between versions, and that the hematocrit term is continuous and one-sided.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acef, CREATININE_THRESHOLD, ACEF_CREATININE_POINTS, ACEF2_CREATININE_POINTS,
  ACEF2_EMERGENCY_POINTS, HCT_REFERENCE, HCT_POINTS_PER_POINT_BELOW,
} from '../../lib/acef-v595.js';

const BASE = { age: '70', ejectionFraction: '35', creatinine: '1.0', emergency: 'no', hematocrit: '40' };
const at = (over = {}) => acef({ ...BASE, ...over });

test('the backbone is age divided by ejection fraction', () => {
  const r = at();
  assert.equal(r.ratio, 2);          // 70 / 35
  assert.equal(r.acef, 2);
  assert.equal(r.acefII, 2);
});

// THE ratio behaviour.
test('halving the ejection fraction doubles the score', () => {
  const high = at({ ejectionFraction: '60' });
  const low = at({ ejectionFraction: '30' });
  assert.equal(high.ratio, 1.17);   // 70 / 60, rounded
  assert.equal(low.ratio, 2.33);    // 70 / 30, rounded
  // The doubling is exact before rounding: 70/30 is exactly twice 70/60.
  assert.equal(70 / 30, (70 / 60) * 2);
  assert.match(at().bandText, /RATIO, not a sum of points/);
});

test('there is no maximum score', () => {
  const extreme = at({ age: '90', ejectionFraction: '10', creatinine: '5', emergency: 'yes', hematocrit: '20' });
  assert.equal(extreme.acefII, 17.2);   // 9 + 2 + 3 + 3.2
  // Nothing bounds it: a lower ejection fraction keeps raising the score without limit.
  assert.ok(at({ ejectionFraction: '5' }).acef > at({ ejectionFraction: '10' }).acef);
  assert.equal('max' in extreme, false, 'no maximum is reported');
});

// THE differing weights.
test('the creatinine weight differs between the versions', () => {
  const high = at({ creatinine: '2.5' });
  assert.equal(high.creatinineAboveThreshold, true);
  assert.equal(high.acef, Number((2 + ACEF_CREATININE_POINTS).toFixed(2)));
  assert.equal(high.acefII, Number((2 + ACEF2_CREATININE_POINTS).toFixed(2)));
  assert.equal(ACEF2_CREATININE_POINTS, ACEF_CREATININE_POINTS * 2);
  assert.match(high.bandText, /cannot be carried between them/);
});

test('the creatinine threshold is strictly above and the divergence is flagged at exactly 2.0', () => {
  assert.equal(at({ creatinine: String(CREATININE_THRESHOLD + 0.1) }).creatinineAboveThreshold, true);
  const boundary = at({ creatinine: String(CREATININE_THRESHOLD) });
  assert.equal(boundary.creatinineAboveThreshold, false);
  assert.equal(boundary.atCreatinineOperatorBoundary, true);
  assert.match(boundary.bandText, /THE ONE VALUE AT WHICH PUBLISHED RENDERINGS DISAGREE/);
  assert.equal(at({ creatinine: '1.9' }).atCreatinineOperatorBoundary, false);
});

// THE emergency asymmetry.
test('emergency surgery moves only ACEF II, and flags the original as out of its derivation', () => {
  const e = at({ emergency: 'yes' });
  assert.equal(e.acef, at().acef, 'the original has no emergency term');
  assert.equal(e.acefII, Number((at().acefII + ACEF2_EMERGENCY_POINTS).toFixed(2)));
  assert.equal(e.acefOutsideDerivation, true);
  assert.match(e.bandText, /THE ORIGINAL ACEF HAS NO EMERGENCY TERM/);
  assert.equal(at().acefOutsideDerivation, false);
});

test('emergency is the largest single add-on in either version', () => {
  assert.ok(ACEF2_EMERGENCY_POINTS > ACEF2_CREATININE_POINTS);
  assert.ok(ACEF2_EMERGENCY_POINTS > ACEF_CREATININE_POINTS);
});

// THE one-sided continuous term.
test('the hematocrit term is continuous below the reference and zero above it', () => {
  assert.equal(at({ hematocrit: String(HCT_REFERENCE) }).hematocritPoints, 0);
  assert.equal(at({ hematocrit: '40' }).hematocritPoints, 0, 'no credit above the reference');
  assert.equal(at({ hematocrit: '35' }).hematocritPoints, HCT_POINTS_PER_POINT_BELOW);
  assert.equal(at({ hematocrit: '31' }).hematocritPoints, 1);
  assert.equal(at({ hematocrit: '26' }).hematocritPoints, 2);
});

test('a hematocrit of 26 is worth as much as the creatinine term', () => {
  assert.equal(at({ hematocrit: '26' }).hematocritPoints, ACEF2_CREATININE_POINTS);
  assert.match(at().bandText, /as much as the creatinine term/);
});

test('the hematocrit term does not touch the original score', () => {
  assert.equal(at({ hematocrit: '26' }).acef, at({ hematocrit: '45' }).acef);
});

// Input handling and scope.
test('the inputs are validated and the ejection fraction is named as a denominator', () => {
  assert.equal(acef({}).valid, false);
  assert.match(acef({}).message, /DENOMINATOR here, not a point-scoring item/);
  assert.match(acef({ ...BASE, ejectionFraction: '0' }).message, /above 0/);
  assert.match(acef({ ...BASE, ejectionFraction: '120' }).message, /at most 100/);
});

test('the scope note refuses the operative decision', () => {
  const r = at();
  assert.match(r.note, /do not decide whether to operate/);
  assert.match(r.note, /not a reason to decline surgery/);
  assert.match(r.note, /do not estimate stroke, renal failure, length of stay/);
});
