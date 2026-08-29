import test from 'node:test';
import assert from 'node:assert/strict';
import { seaGuideline as sea, RISK_FACTORS } from '../../lib/sea-guideline-v861.js';

test('sea: a neurologic deficit means image now, whatever else is entered', () => {
  const r = sea({ deficit: true });
  assert.equal(r.step, 'deficit');
  assert.equal(r.imaging, true);
  assert.match(r.deficitNote, /not a screening step/);
  // Nothing overrides it.
  assert.equal(sea({ deficit: true, esr: 2 }).imaging, true);
});

test('sea: a risk factor with no sedimentation rate asks for the rate', () => {
  const r = sea({ injectionDrugUse: true });
  assert.equal(r.step, 'need-esr');
  assert.equal(r.imaging, false);
  assert.match(r.band, /next step is a sedimentation rate/);
});

test('sea: the sedimentation rate threshold is 20 and is exclusive', () => {
  assert.equal(sea({ injectionDrugUse: true, esr: 21 }).step, 'image');
  assert.equal(sea({ injectionDrugUse: true, esr: 20 }).step, 'below-threshold');
  assert.equal(sea({ injectionDrugUse: true, esr: 21 }).imaging, true);
  assert.equal(sea({ injectionDrugUse: true, esr: 20 }).imaging, false);
});

test('sea: each of the five risk factors opens the pathway on its own', () => {
  assert.equal(RISK_FACTORS.length, 5);
  for (const r of RISK_FACTORS) {
    assert.equal(sea({ [r.key]: true }).step, 'need-esr', r.key);
    assert.equal(sea({ [r.key]: true, esr: 45 }).step, 'image', r.key);
  }
});

test('sea: no deficit and no risk factor is not an exclusion', () => {
  const r = sea({});
  assert.equal(r.step, 'no-risk-factor');
  assert.equal(r.imaging, false);
  assert.match(r.noRiskNote, /not the same as excluding/);
});

test('sea: a rate at or below the threshold stops the pathway, not the concern', () => {
  assert.match(sea({ injectionDrugUse: true, esr: 8 }).belowNote, /not to rule the diagnosis out/);
});

test('sea: the triad is named on every result', () => {
  for (const input of [{}, { deficit: true }, { injectionDrugUse: true }, { injectionDrugUse: true, esr: 45 }]) {
    assert.match(sea(input).triadNote, /small minority/);
  }
});

test('sea: a normal white count is refused as reassurance', () => {
  // The documented error.
  const r = sea({ injectionDrugUse: true, esr: 45, wbc: 8 });
  assert.match(r.wbcNote, /not reassuring/);
  assert.equal(sea({ injectionDrugUse: true, esr: 45, wbc: 18 }).wbcNote, null);
  assert.equal(sea({ injectionDrugUse: true, esr: 45 }).wbcNote, null);
});

test('sea: a missing fever is called out rather than counted against', () => {
  assert.match(sea({ injectionDrugUse: true }).feverNote, /absent in about half/);
  assert.equal(sea({ injectionDrugUse: true, fever: true }).feverNote, null);
  // Nothing to say when the pathway was never entered.
  assert.equal(sea({}).feverNote, null);
});

test('sea: implausible values are refused', () => {
  assert.equal(sea({ injectionDrugUse: true, esr: 300 }).valid, false);
  assert.equal(sea({ injectionDrugUse: true, esr: -1 }).valid, false);
  assert.equal(sea({ injectionDrugUse: true, wbc: 500 }).valid, false);
});

test('sea: string values from the DOM behave like numbers and checkboxes', () => {
  assert.equal(sea({ injectionDrugUse: 'true', esr: '45' }).step, 'image');
  assert.equal(sea({ injectionDrugUse: 'false', esr: '45' }).step, 'no-risk-factor');
  assert.equal(sea({ injectionDrugUse: true, esr: '' }).step, 'need-esr');
});
