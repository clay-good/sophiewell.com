import test from 'node:test';
import assert from 'node:assert/strict';
import { membranousRisk as m, PROTEINURIA_NEPHROTIC, PROTEINURIA_HIGH, ALBUMIN_LOW, ALBUMIN_VERY_LOW, PLA2R_HIGH, EGFR_LOW } from '../../lib/membranous-risk-v878.js';

test('membranous-risk: the published thresholds', () => {
  assert.equal(PROTEINURIA_NEPHROTIC, 3.5);
  assert.equal(PROTEINURIA_HIGH, 8);
  assert.equal(ALBUMIN_LOW, 3.0);
  assert.equal(ALBUMIN_VERY_LOW, 2.5);
  assert.equal(PLA2R_HIGH, 50);
  assert.equal(EGFR_LOW, 60);
});

test('membranous-risk: low risk by either route', () => {
  assert.equal(m({ egfr: 90, proteinuria: 2, albumin: 3.5 }).category, 'low');
  // The response route does not care what the current proteinuria is.
  assert.equal(m({ egfr: 90, proteinuria: 5, sixMonthsSupportive: true, proteinuriaHalved: true }).category, 'low');
  // Halving without the six-month period is not the route.
  assert.equal(m({ egfr: 90, proteinuria: 5, proteinuriaHalved: true }).category, 'moderate');
});

test('membranous-risk: moderate is nephrotic-range with no high-risk feature', () => {
  const r = m({ egfr: 90, proteinuria: 5, albumin: 3.2 });
  assert.equal(r.category, 'moderate');
  assert.equal(r.abnormal, false);
  assert.match(r.supportiveNote, /part of the definition/);
  // Once the period has been given the note has nothing to add.
  assert.equal(m({ egfr: 90, proteinuria: 5, albumin: 3.2, sixMonthsSupportive: true }).supportiveNote, null);
});

test('membranous-risk: the three routes into high risk', () => {
  assert.equal(m({ egfr: 45, proteinuria: 2 }).category, 'high');
  assert.equal(m({ egfr: 90, proteinuria: 9, proteinuriaOverEightSixMonths: true }).category, 'high');
  for (const addOn of [{ albumin: 2.2 }, { pla2r: 200 }, { urinaryMarkersRaised: true }]) {
    assert.equal(m({ egfr: 90, proteinuria: 5, ...addOn }).category, 'high', JSON.stringify(addOn));
  }
  // eGFR exactly at the threshold is not below it.
  assert.equal(m({ egfr: 60, proteinuria: 2, albumin: 3.5 }).category, 'low');
  assert.equal(m({ egfr: 59, proteinuria: 2, albumin: 3.5 }).category, 'high');
});

test('membranous-risk: a high anti-PLA2R alone does not raise the category', () => {
  // The misread the tile exists partly to catch.
  const r = m({ egfr: 90, proteinuria: 2, albumin: 3.5, pla2r: 200 });
  assert.equal(r.category, 'low');
  assert.match(r.pla2rNote, /does not raise the category on its own/);
  // With nephrotic-range proteinuria it does count, and then there is nothing to warn about.
  const withProt = m({ egfr: 90, proteinuria: 5, pla2r: 200 });
  assert.equal(withProt.category, 'high');
  assert.equal(withProt.pla2rNote, null);
});

test('membranous-risk: very high risk overrides everything and comes from no number', () => {
  for (const key of ['lifeThreateningNephrotic', 'rapidUnexplainedDecline']) {
    const r = m({ egfr: 90, proteinuria: 2, albumin: 3.5, [key]: true });
    assert.equal(r.category, 'very-high', key);
    assert.equal(r.abnormal, true);
  }
  for (const input of [{}, { egfr: 90, proteinuria: 5 }]) {
    assert.match(m(input).veryHighNote, /a clinical picture, not a number/);
  }
});

test('membranous-risk: the category, not the proteinuria, is what acts', () => {
  // The reason the tile exists, so it prints on every result.
  for (const input of [{}, { egfr: 90, proteinuria: 5 }, { egfr: 45 }]) {
    assert.match(m(input).categoryDrivesNote, /not the proteinuria alone/);
    assert.match(m(input).scopeNote, /does not decide whether to start immunosuppression/);
  }
});

test('membranous-risk: out-of-range values are rejected', () => {
  assert.equal(m({ egfr: 201 }).valid, false);
  assert.equal(m({ proteinuria: 51 }).valid, false);
  assert.equal(m({ albumin: 9 }).valid, false);
  assert.equal(m({ pla2r: -1 }).valid, false);
  assert.equal(m({ egfr: 'abc' }).egfr, null);
});

test('membranous-risk: the documented example', () => {
  const r = m({ egfr: '90', proteinuria: '5', albumin: '2.2' });
  assert.equal(r.category, 'high');
  assert.match(r.band, /serum albumin of 2.2 g\/dL/);
});

test('membranous-risk: "none of the high-risk features" needs them all looked at (spec-v1063)', () => {
  // The three high-risk add-ons are a disjunction. The urinary-marker checkbox is
  // an answer either way, but a blank albumin or anti-PLA2R is a test nobody ran
  // -- and this said "Moderate risk ... and none of the high-risk features" for a
  // patient whose albumin might have been below 2.5 and high risk.
  const missing = m({ egfr: 80, proteinuria: 4.2, albumin: '', pla2r: '' });
  assert.equal(missing.category, 'moderate');
  assert.match(missing.band, /has not been entered|have not been entered/);
  assert.doesNotMatch(missing.band, /none of the high-risk features/);

  // Both measured and neither abnormal: the plain sentence is true again.
  const measured = m({ egfr: 80, proteinuria: 4.2, albumin: 3.4, pla2r: 20 });
  assert.equal(measured.category, 'moderate');
  assert.match(measured.band, /none of the high-risk features/);
});
