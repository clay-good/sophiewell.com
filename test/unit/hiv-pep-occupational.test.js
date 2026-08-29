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

test('hiv-pep-occupational: unknown values fall back, and the hours range is checked', () => {
  assert.equal(p({ exposureType: 'made-up' }).exposureType, 'none');
  assert.equal(p({ sourceStatus: 'made-up' }).sourceStatus, 'unknown');
  assert.equal(p({ hoursSinceExposure: -1 }).valid, false);
  assert.equal(p({ hoursSinceExposure: 2001 }).valid, false);
});

test('hiv-pep-occupational: the documented example', () => {
  const r = p({ exposureType: 'percutaneous', sourceStatus: 'positive', hoursSinceExposure: '2' });
  assert.equal(r.decision, 'recommended');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Start it now, without waiting for anything else/);
});
