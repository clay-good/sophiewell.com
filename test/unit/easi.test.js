// spec-v151 2.2: EASI (Hanifin 2001). EASI = Σ (E+Ed+Ex+L) × areaGrade × weight;
// AGE-BRANCHED weights - adult head 0.1/upper 0.2/trunk 0.3/lower 0.4; child
// (<8 yr) head 0.2/upper 0.2/trunk 0.3/lower 0.3. Range 0-72; Leshem 2015 bands.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easi } from '../../lib/derm-v151.js';

const FIELDS = { headE: 1, headEd: 1, headEx: 1, headL: 0, headArea: 25, lowerE: 2, lowerEd: 2, lowerEx: 2, lowerL: 2, lowerArea: 60 };

test('tile example: adult weights -> 13.4 moderate', () => {
  // head (1+1+1+0)=3 ×2 ×0.1 = 0.6; lower (2+2+2+2)=8 ×4 ×0.4 = 12.8; total 13.4.
  const r = easi({ ...FIELDS, age: 'adult' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 13.4);
  assert.equal(r.bandLabel, 'Moderate');
  assert.equal(r.ageWeighting, 'adult');
});

test('adult vs child weight divergence on IDENTICAL intensities', () => {
  // child: head 3 ×2 ×0.2 = 1.2; lower 8 ×4 ×0.3 = 9.6; total 10.8 (vs adult 13.4).
  const adult = easi({ ...FIELDS, age: 'adult' }).score;
  const child = easi({ ...FIELDS, age: 'child' }).score;
  assert.equal(adult, 13.4);
  assert.equal(child, 10.8);
  assert.notEqual(adult, child);
});

test('default (no age) uses adult weights', () => {
  assert.equal(easi(FIELDS).score, 13.4);
  assert.equal(easi(FIELDS).ageWeighting, 'adult');
});

test('Leshem six-band strata', () => {
  assert.equal(easi({}).bandLabel, 'Clear'); // 0
  // 0.1-1.0 almost clear: head sum 1 × area grade1 × 0.1 = 0.1
  assert.equal(easi({ headE: 1, headArea: 5 }).bandLabel, 'Almost clear');
  // mild 1.1-7.0
  assert.equal(easi({ lowerE: 1, lowerEd: 1, lowerArea: 25 }).bandLabel, 'Mild'); // 2×2×0.4=1.6
  // moderate 7.1-21.0 covered by example (13.4)
  assert.equal(easi({ ...FIELDS, age: 'adult' }).bandLabel, 'Moderate');
});

test('max all-severe full-area = 72 (very severe)', () => {
  const r = easi({
    age: 'adult', headE: 3, headEd: 3, headEx: 3, headL: 3, headArea: 100,
    upperE: 3, upperEd: 3, upperEx: 3, upperL: 3, upperArea: 100,
    trunkE: 3, trunkEd: 3, trunkEx: 3, trunkL: 3, trunkArea: 100,
    lowerE: 3, lowerEd: 3, lowerEx: 3, lowerL: 3, lowerArea: 100,
  });
  assert.equal(r.score, 72);
  assert.equal(r.bandLabel, 'Very severe');
});

// spec-v1092: the same defect as PASI, and the same fix. See test/unit/pasi.test.js.
test('spec-v1092: an EASI scored from some of the regions says which are missing', () => {
  const all = {
    headE: 2, headEd: 2, headEx: 2, headL: 2, headArea: 20,
    upperE: 2, upperEd: 2, upperEx: 2, upperL: 2, upperArea: 20,
    trunkE: 2, trunkEd: 2, trunkEx: 2, trunkL: 2, trunkArea: 20,
    lowerE: 2, lowerEd: 2, lowerEx: 2, lowerL: 2, lowerArea: 20,
  };
  assert.equal(easi(all).footing, null);

  const noLower = { ...all };
  delete noLower.lowerArea;
  // spec-v1125: four areas plus their sixteen intensity items.
  assert.match(easi(noLower).footing, /Scored from 19 of 20 regions and intensity items; lower limbs was not entered/);
  assert.match(easi(noLower).footing, /can only rise/);

  // Examined and clear is not the same as never examined.
  assert.equal(easi({ ...all, lowerArea: 0 }).footing, null);
  // Lower limbs carry the heaviest adult weight, so this is the region whose
  // absence moves the total most: 0.4 of every point scored there.
  assert.ok(easi(all).score > easi(noLower).score);
});


test('spec-v1125: an ungraded intensity item is disclosed too, not only a missing region', () => {
  const all = {};
  for (const k of ['head', 'upper', 'trunk', 'lower']) {
    all[`${k}Area`] = 20;
    for (const x of ['E', 'Ed', 'Ex', 'L']) all[`${k}${x}`] = 2;
  }
  assert.equal(easi(all).footing, null);

  const noOne = { ...all };
  delete noOne.headEd;
  assert.match(easi(noOne).footing, /Scored from 19 of 20/);
  assert.match(easi(noOne).footing, /head\/neck edema was not entered/);
  assert.ok(easi(noOne).score < easi(all).score, 'the ungraded item lowered the score');
});
