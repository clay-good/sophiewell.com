// spec-v136 2.4: Metabolic syndrome (Alberti KGMM, et al, Harmonized, Circulation
// 2009;120:1640; IDF 2006). Five criteria -- waist (sex/population cut-point),
// TG >= 150, HDL < 40 (M)/< 50 (F), BP >= 130/85, glucose >= 100, each with an
// "or on treatment" override. Harmonized = any 3 of 5; IDF = central obesity +
// any 2 of the other 4. Tests pin the exactly-3-of-5 present-vs-absent flip, the
// IDF waist-required gate, the sex-specific HDL cut-point, and the treatment
// overrides.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metabolicSyndrome } from '../../lib/endo-v136.js';

const base = {
  definition: 'harmonized', sex: 'male', waistStandard: 'us',
  waist: 104, tg: 160, hdl: 45, sbp: 128, dbp: 82, glucose: 105,
};

test('worked example: exactly 3 of 5 (waist, TG, glucose) -> present', () => {
  const r = metabolicSyndrome(base);
  assert.equal(r.valid, true);
  assert.equal(r.total, 3);
  assert.equal(r.present, true);
});

test('drop the waist criterion -> 2 of 5 -> not met (harmonized)', () => {
  const r = metabolicSyndrome({ ...base, waist: 100 }); // < 102 cm
  assert.equal(r.total, 2);
  assert.equal(r.present, false);
});

test('IDF requires central obesity even at 2 other criteria', () => {
  // waist 100 (< 102, not met) + TG + glucose met = 2 of the other 4.
  const noWaist = metabolicSyndrome({ ...base, definition: 'idf', waist: 100 });
  assert.equal(noWaist.present, false);
  // restore waist -> central obesity + 2 others -> present.
  const withWaist = metabolicSyndrome({ ...base, definition: 'idf' });
  assert.equal(withWaist.present, true);
});

test('sex-specific HDL cut-point: 45 mg/dL is reduced for women, not for men', () => {
  const man = metabolicSyndrome({ ...base, hdl: 45 });   // not < 40
  const woman = metabolicSyndrome({ ...base, sex: 'female', waistStandard: 'us', waist: 90, hdl: 45 }); // < 50
  // man: waist+TG+glucose = 3; woman waist 90 (< 88? no, 90>=88 met) + TG + HDL + glucose = 4
  assert.ok(woman.total > man.total);
});

test('treatment overrides count a criterion even below threshold', () => {
  // waist not met, TG 100 (< 150) but on treatment, HDL 60, BP normal, glucose 90 on treatment
  const r = metabolicSyndrome({
    definition: 'harmonized', sex: 'male', waistStandard: 'us',
    waist: 95, tg: 100, tgTreated: 'yes', hdl: 60, sbp: 118, dbp: 76,
    glucose: 90, glucoseTreated: 'yes', bpTreated: 'yes',
  });
  // TG(tx) + glucose(tx) + BP(tx) = 3 -> present
  assert.equal(r.total, 3);
  assert.equal(r.present, true);
});

test('IDF Europid waist cut-points are lower than US', () => {
  // waist 96 cm: not met under US (>=102) but met under Europid (>=94) for men.
  const us = metabolicSyndrome({ ...base, waist: 96 });
  const eu = metabolicSyndrome({ ...base, waistStandard: 'europid', waist: 96 });
  assert.ok(eu.total > us.total);
});

test('missing definition / sex / waist standard / any value surfaces the fallback', () => {
  assert.equal(metabolicSyndrome({}).valid, false);
  assert.equal(metabolicSyndrome({ ...base, definition: '' }).valid, false);
  assert.equal(metabolicSyndrome({ ...base, sex: '' }).valid, false);
  assert.equal(metabolicSyndrome({ ...base, waistStandard: '' }).valid, false);
  assert.equal(metabolicSyndrome({ ...base, glucose: null }).valid, false);
});
