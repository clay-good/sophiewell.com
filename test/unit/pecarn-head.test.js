// spec-v12 §3.5.3 wave 12-5: PECARN Pediatric Head Injury Rule
// boundary examples per Kuppermann N, et al. Lancet. 2009;374(9696):
// 1160-1170, Figures 2 (age <2) and 3 (age >=2).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pecarnHead } from '../../lib/scoring-v4.js';

test('pecarn age >=2 very-low: GCS 15, none -> very-low risk', () => {
  const r = pecarnHead({ ageYears: 5, gcs15: true, palpableSkullFx: false,
    basalSkullFxSigns: false, ams: false, locSec: 0, vomiting: false,
    severeMechanism: false, occipitalParietalTemporalHematoma: false,
    notActingNormally: false, severeHeadache: false });
  assert.equal(r.tier, 'very-low');
  assert.ok(r.ciTbiRiskPct <= 0.05);
});

test('pecarn age <2 intermediate: occipital hematoma -> intermediate', () => {
  const r = pecarnHead({ ageYears: 1, gcs15: true, palpableSkullFx: false,
    basalSkullFxSigns: false, ams: false, locSec: 0, vomiting: false,
    severeMechanism: false, occipitalParietalTemporalHematoma: true,
    notActingNormally: false, severeHeadache: false });
  assert.equal(r.tier, 'intermediate');
});

test('pecarn age <2 high: palpable skull fracture -> high', () => {
  const r = pecarnHead({ ageYears: 1, gcs15: true, palpableSkullFx: true,
    basalSkullFxSigns: false, ams: false, locSec: 0, vomiting: false,
    severeMechanism: false, occipitalParietalTemporalHematoma: false,
    notActingNormally: false, severeHeadache: false });
  assert.equal(r.tier, 'high');
});

test('pecarn age >=2 high: basal skull fx signs -> high', () => {
  const r = pecarnHead({ ageYears: 8, gcs15: true, palpableSkullFx: false,
    basalSkullFxSigns: true, ams: false, locSec: 0, vomiting: false,
    severeMechanism: false, occipitalParietalTemporalHematoma: false,
    notActingNormally: false, severeHeadache: false });
  assert.equal(r.tier, 'high');
});

test('pecarn age >=2 intermediate: any LOC -> intermediate', () => {
  const r = pecarnHead({ ageYears: 8, gcs15: true, palpableSkullFx: false,
    basalSkullFxSigns: false, ams: false, locSec: 2, vomiting: false,
    severeMechanism: false, occipitalParietalTemporalHematoma: false,
    notActingNormally: false, severeHeadache: false });
  assert.equal(r.tier, 'intermediate');
});

test('pecarn age <2 LOC boundary: 3 sec is not intermediate; 5 sec is', () => {
  const a = pecarnHead({ ageYears: 1, gcs15: true, palpableSkullFx: false,
    basalSkullFxSigns: false, ams: false, locSec: 3, vomiting: false,
    severeMechanism: false, occipitalParietalTemporalHematoma: false,
    notActingNormally: false, severeHeadache: false });
  assert.equal(a.tier, 'very-low');
  const b = pecarnHead({ ageYears: 1, gcs15: true, palpableSkullFx: false,
    basalSkullFxSigns: false, ams: false, locSec: 5, vomiting: false,
    severeMechanism: false, occipitalParietalTemporalHematoma: false,
    notActingNormally: false, severeHeadache: false });
  assert.equal(b.tier, 'intermediate');
});
