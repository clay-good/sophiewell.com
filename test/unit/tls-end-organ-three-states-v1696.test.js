// spec-v1696: Cairo-Bishop's END-ORGAN half had the defect its metabolic half was fixed for in
// spec-v1163 -- it could not say "not measured". A creatinine nobody drew read as a renal criterion
// not met, and the band said "no end-organ criterion entered" whether they were entered or not.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tlsCairoBishop } from '../../lib/metabolic-onc-v88.js';

// Two metabolic criteria met, so laboratory TLS is established and the end-organ half decides.
const labTls = { uricAcid: 9, potassium: 6.5 };
const run = (extra) => tlsCairoBishop({ ...labTls, ...extra });

test('laboratory TLS is established by the metabolic half in every case here', () => {
  assert.equal(run({}).labTls, true);
});

test('a creatinine nobody drew is "not measured", not "not met"', () => {
  const r = run({});
  assert.equal(r.criteria.renalCriterion, null,
    'a bare false here is a fabricated observation on the agent surface');
  assert.equal(r.endOrganAssessed.renal, false);
});

test('a creatinine that was drawn and is normal is "not met"', () => {
  const r = run({ creatinine: 1.0, creatinineUln: 1.2, arrhythmia: 'none', seizure: 'none' });
  assert.equal(r.criteria.renalCriterion, false);
  assert.equal(r.endOrganAssessed.renal, true);
  assert.equal(r.crRatio, 0.8);
});

test('the three end-organ readings are three different sentences', () => {
  const none = run({}).band;
  const all = run({ creatinine: 1.0, creatinineUln: 1.2, arrhythmia: 'none', seizure: 'none' }).band;
  const partial = run({ arrhythmia: 'none', seizure: 'none' }).band;
  assert.notEqual(none, all, 'nothing assessed must not read the same as all assessed and negative');
  assert.notEqual(partial, all);
  assert.notEqual(none, partial);

  // Nothing looked at: say so, and say it does not rule clinical TLS out.
  assert.match(none, /No end-organ criterion has been entered/);
  assert.match(none, /not ruled out/);
  assert.match(none, /creatinine with its upper limit of normal/);

  // All looked at and negative: that, and only that, rules clinical TLS out.
  assert.match(all, /All three end-organ criteria were entered and none is met/);
  assert.match(all, /creatinine 0\.8x ULN, no arrhythmia, no seizure/);
  assert.match(all, /laboratory and not clinical TLS/);

  // Partly looked at: name what is negative AND what is outstanding.
  assert.match(partial, /negative \(no arrhythmia, no seizure\)/);
  assert.match(partial, /creatinine with its upper limit of normal was not entered/);
  assert.match(partial, /not ruled out/);
});

test('an omitted arrhythmia or seizure does not read as "none"', () => {
  // The browser's selects always carry a value, but neither is required on the agent surface.
  const omitted = run({ creatinine: 1.0, creatinineUln: 1.2 });
  assert.equal(omitted.endOrganAssessed.arrhythmia, false);
  assert.equal(omitted.endOrganAssessed.seizure, false);
  assert.match(omitted.band, /not ruled out/);

  const selected = run({ creatinine: 1.0, creatinineUln: 1.2, arrhythmia: 'none', seizure: 'none' });
  assert.equal(selected.endOrganAssessed.arrhythmia, true);
  assert.match(selected.band, /laboratory and not clinical TLS/);
});

test('a met end-organ criterion still grades clinical TLS, unchanged', () => {
  const renal = run({ creatinine: 2.4, creatinineUln: 1.2, arrhythmia: 'none', seizure: 'none' });
  assert.equal(renal.clinicalTls, true);
  assert.equal(renal.criteria.renalCriterion, true);
  assert.equal(renal.gradeRoman, 'II');

  const sz = run({ seizure: 'prolonged' });
  assert.equal(sz.clinicalTls, true);
  assert.equal(sz.gradeRoman, 'IV');
});

test('the arithmetic booleans stay booleans, separate from what the reader is shown', () => {
  // `criteriaMet` is documented as the booleans the arithmetic used; only the
  // reader-facing `criteria` carries the three states.
  const r = run({});
  assert.equal(r.criteriaMet.renalCriterion, false);
  assert.equal(r.criteria.renalCriterion, null);
});
