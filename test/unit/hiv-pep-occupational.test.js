import test from 'node:test';
import assert from 'node:assert/strict';
import { hivPepOccupational as p, EXPOSURE_TYPES, SOURCE_STATUSES } from '../../lib/hiv-pep-occupational-v887.js';

test('hiv-pep-occupational: the published vocabularies', () => {
  assert.deepEqual(EXPOSURE_TYPES.map((e) => e.value), ['none', 'percutaneous', 'mucous-membrane', 'non-intact-skin', 'bite-with-blood', 'intact-skin']);
  assert.deepEqual(SOURCE_STATUSES.map((s) => s.value), ['positive', 'unknown', 'negative']);
});

test('hiv-pep-occupational: intact skin is not an exposure, whatever the source', () => {
  const r = p({ exposureType: 'intact-skin', sourceStatus: 'positive' });
  assert.equal(r.decision, 'not-an-exposure');
  assert.equal(r.qualifying, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /not an exposure under these guidelines/);
  // And the reminder prints everywhere.
  for (const input of [{}, { exposureType: 'percutaneous', sourceStatus: 'positive' }]) {
    assert.match(p(input).intactSkinNote, /Intact skin is not an exposure/);
    assert.match(p(input).intactSkinNote, /not a source that is positive/);
  }
});

test('hiv-pep-occupational: all four qualifying exposure types behave the same', () => {
  for (const type of ['percutaneous', 'mucous-membrane', 'non-intact-skin', 'bite-with-blood']) {
    assert.equal(p({ exposureType: type, sourceStatus: 'positive' }).decision, 'recommended', type);
    assert.equal(p({ exposureType: type, sourceStatus: 'negative' }).decision, 'not-recommended', type);
  }
});

test('hiv-pep-occupational: the three source branches', () => {
  const e = { exposureType: 'percutaneous' };
  assert.equal(p({ ...e, sourceStatus: 'positive' }).decision, 'recommended');
  assert.equal(p({ ...e, sourceStatus: 'negative' }).decision, 'not-recommended');
  assert.equal(p({ ...e, sourceStatus: 'unknown' }).decision, 'case-by-case');
  const withRisk = p({ ...e, sourceStatus: 'unknown', sourceRiskFactors: true });
  assert.equal(withRisk.decision, 'case-by-case-higher');
  assert.match(withRisk.band, /risk factors for HIV are recorded/);
  assert.match(withRisk.band, /belongs to the occupational health service/);
});

test('hiv-pep-occupational: the two-drug basic regimen is gone', () => {
  // The reason the tile exists, printed on every result that is an exposure.
  for (const status of ['positive', 'unknown', 'negative']) {
    assert.match(p({ exposureType: 'percutaneous', sourceStatus: status }).noTieringNote, /removed the two-drug/);
    assert.match(p({ exposureType: 'percutaneous', sourceStatus: status }).noTieringNote, /three drugs or more/);
  }
  // Not raised when there was no exposure at all.
  assert.equal(p({ exposureType: 'intact-skin' }).noTieringNote, null);
});

test('hiv-pep-occupational: timing, and the 72-hour read-back', () => {
  const e = { exposureType: 'percutaneous', sourceStatus: 'positive' };
  assert.match(p(e).timingNote, /Do not wait for source testing/);
  assert.match(p({ ...e, hoursSinceExposure: 2 }).timingNote, /^2 hours have passed/);
  assert.match(p({ ...e, hoursSinceExposure: 96 }).timingNote, /beyond the 72 hours/);
  assert.match(p({ ...e, hoursSinceExposure: 96 }).timingNote, /not for assuming nothing can be done/);
  assert.equal(p({ exposureType: 'intact-skin' }).timingNote, null);
});

test('hiv-pep-occupational: it names no drug, and it says so', () => {
  for (const input of [{}, { exposureType: 'percutaneous', sourceStatus: 'positive' }]) {
    assert.match(p(input).noDrugNote, /names no drug, no dose and no regimen/);
    assert.match(p(input).scopeNote, /does not prescribe/);
  }
  // The other bloodborne pathogens are named where the pathway is live.
  assert.match(p({ exposureType: 'percutaneous', sourceStatus: 'unknown' }).followUpNote, /hepatitis B and hepatitis C/);
  assert.equal(p({ exposureType: 'percutaneous', sourceStatus: 'negative' }).followUpNote, null);
});

// spec-v1192. The test this replaces read:
//
//   assert.equal(p({ exposureType: 'made-up' }).exposureType, 'none');
//
// which is the harmful default written down and pinned. `none` is the FIRST row
// of the exposure table and it means "No exposure of a recognized type", so an
// exposure nobody had described read as one that had been described and ruled
// out, and the tile answered "Not an exposure" -- a rule-out from a blank, on
// the pathway where a wrong rule-out costs a course of prophylaxis.
test('hiv-pep-occupational: a blank exposure is not "no exposure"', () => {
  for (const input of [{}, { exposureType: '' }, { exposureType: null }, { sourceStatus: 'positive' }]) {
    const r = p(input);
    assert.equal(r.valid, false, JSON.stringify(input));
    assert.match(r.message, /Choose what happened/);
    assert.match(r.message, /blank is not the same as no exposure/);
    assert.equal(r.decision, undefined, 'no decision is reached without an exposure');
    assert.equal(r.bandLabel, undefined);
  }
});

test('hiv-pep-occupational: a value outside the published list is not read as one', () => {
  const r = p({ exposureType: 'made-up', sourceStatus: 'positive' });
  assert.equal(r.valid, false);
  assert.match(r.message, /not one of the exposure types/);
  const s = p({ exposureType: 'percutaneous', sourceStatus: 'made-up' });
  assert.equal(s.valid, false);
  assert.match(s.message, /not one of the three/);
});

test('hiv-pep-occupational: a blank source status is not "unknown status"', () => {
  // "Unknown status, or the source cannot be identified" is what gets recorded
  // once someone has tried. A blank is what gets recorded when nobody has.
  const r = p({ exposureType: 'percutaneous', hoursSinceExposure: 2 });
  assert.equal(r.valid, false);
  assert.match(r.message, /Choose the source HIV status/);
  assert.match(r.message, /blank is not an unknown status/);
  // And it does not become a reason to wait.
  assert.match(r.message, /should not wait for source testing/);
});

test('hiv-pep-occupational: the source is only asked for where it decides something', () => {
  // Rule 13: for intact skin, and for no exposure at all, the answer holds
  // whatever the source turns out to be, so the tile answers without it.
  for (const type of ['intact-skin', 'none']) {
    const r = p({ exposureType: type });
    assert.equal(r.valid, true, type);
    assert.equal(r.decision, 'not-an-exposure', type);
    assert.equal(r.sourceStatus, null, type);
    assert.match(r.recordedNote, /the source status was not entered, and it does not change this/, type);
  }
});

test('hiv-pep-occupational: the standing reminders survive a refusal', () => {
  // They are worth most BEFORE the exposure has been described, not only after.
  const r = p({});
  assert.equal(r.valid, false);
  assert.match(r.intactSkinNote, /Intact skin is not an exposure/);
  assert.match(r.noDrugNote, /names no drug, no dose and no regimen/);
  assert.match(r.scopeNote, /does not prescribe/);
  assert.match(r.note, /2013/);
});

test('hiv-pep-occupational: the hours range is checked', () => {
  const e = { exposureType: 'percutaneous', sourceStatus: 'positive' };
  assert.equal(p({ ...e, hoursSinceExposure: -1 }).valid, false);
  assert.equal(p({ ...e, hoursSinceExposure: 2001 }).valid, false);
  assert.match(p({ ...e, hoursSinceExposure: -1 }).message, /between 0 and 2000/);
  assert.equal(p({ ...e, hoursSinceExposure: 2000 }).valid, true);
});

test('hiv-pep-occupational: the documented example', () => {
  const r = p({ exposureType: 'percutaneous', sourceStatus: 'positive', hoursSinceExposure: '2' });
  assert.equal(r.decision, 'recommended');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Start it now, without waiting for anything else/);
});
