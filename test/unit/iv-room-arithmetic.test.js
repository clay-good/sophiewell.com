// spec-v1630 tools 1 and 2: reconstitution and what is actually in the bag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconstitutionConcentration as rc } from '../../lib/reconstitution-concentration-v1630.js';
import { admixtureConcentration as ac } from '../../lib/admixture-concentration-v1630.js';

test('reconstitution: the ceftriaxone label row (1 g + 9.6 mL, about 100 mg/mL) gives 10 mL and 0.4 mL of powder', () => {
  const r = rc({ unit: 'mg', amount: 1000, labelDiluent: 9.6, labelConcentration: 100 });
  assert.deepEqual([r.finalVolume, r.powderVolume, r.concentration, r.offLabelVolume], [10, 0.4, 100, false]);
  // The same powder volume with 3.6 mL of diluent gives 250 mg/mL, and the result says powder volume drifts.
  const other = rc({ unit: 'mg', amount: 1000, labelDiluent: 9.6, labelFinalVolume: 10, newDiluent: 3.6 });
  assert.deepEqual([other.finalVolume, other.concentration, other.offLabelVolume], [4, 250, true]);
  assert.match(other.notes.join(' '), /powder volume is taken from the label's own figures and is not constant/);
});

test('reconstitution: the vancomycin bulk package (10 g + 95 mL makes 100 mL) and a dose volume', () => {
  const r = rc({ unit: 'g', amount: 10, labelDiluent: 95, labelFinalVolume: 100, dose: 1.5 });
  assert.deepEqual([r.powderVolume, r.concentration, r.doseVolume], [5, 0.1, 15]);
  assert.match(rc({ unit: 'g', amount: 10, labelDiluent: 95, labelFinalVolume: 100, dose: 12 }).notes.join(' '), /more than one container holds/);
});

test('reconstitution: the amoxicillin suspension table (60 mL of water for a 100 mL bottle) puts the powder at 40 mL', () => {
  const r = rc({ unit: 'mg', amount: 5000, labelDiluent: 60, labelFinalVolume: 100 });
  assert.deepEqual([r.powderVolume, r.concentration], [40, 50]);
});

test('reconstitution: the diluent for a wanted strength, and a strength the powder itself rules out', () => {
  const r = rc({ unit: 'mg', amount: 1000, labelDiluent: 9.6, displacement: 0.4, wantedConcentration: 250 });
  assert.deepEqual([r.diluent, r.finalVolume], [3.6, 4]);
  assert.match(rc({ unit: 'mg', amount: 1000, labelDiluent: 9.6, displacement: 0.4, wantedConcentration: 5000 }).message, /cannot be reached/);
  assert.match(rc({ unit: 'mg', amount: 1000, labelDiluent: 9.6, displacement: 0.4, wantedConcentration: 250, newDiluent: 5 }).message, /not both/);
});

test('reconstitution: the powder is never assumed to take no space, and no unit is defaulted', () => {
  assert.match(rc({ unit: 'mg', amount: 1000, labelDiluent: 9.6 }).message, /never assumed to take no space/);
  assert.match(rc({ unit: 'mg', amount: 1000, labelDiluent: 9.6, displacement: 0.4, labelFinalVolume: 10 }).message, /exactly one figure/);
  assert.match(rc({ amount: 1000, labelDiluent: 9.6, displacement: 0.4 }).message, /Choose the unit/);
  // Grams entered against a mg/mL strength: the final volume comes out below the diluent.
  assert.match(rc({ unit: 'mg', amount: 1, labelDiluent: 9.6, labelConcentration: 100 }).message, /less than the 9\.6 mL of diluent/);
  // A displacement of 0 is an answer the reader gave, not an assumption.
  assert.equal(rc({ unit: 'mg', amount: 500, labelDiluent: 10, displacement: 0 }).concentration, 50);
});

test('admixture: overfill and additive volume both lower the strength below the nominal figure', () => {
  const r = ac({ unit: 'mg', per: 'mL', nominalVolume: 250, overfill: 25, additives: '500, 10' });
  assert.deepEqual([r.finalVolume, r.concentration, r.nominalConcentration, r.percentDifference, r.withdrawToNominal], [285, 1.75439, 2, -12.2807, 35]);
  const blank = ac({ unit: 'mg', per: 'mL', nominalVolume: 250, additives: '500, 10' });
  assert.deepEqual([blank.finalVolume, blank.concentration, blank.overfillEntered], [260, 1.92308, false]);
  assert.match(blank.band, /nominal volume only: no overfill entered/);
  // Withdrawing the overfill and the additive volume first lands on the nominal figure.
  const even = ac({ unit: 'mg', per: 'mL', nominalVolume: 250, overfill: 25, withdrawn: 35, additives: '500, 10' });
  assert.deepEqual([even.finalVolume, even.concentration, even.percentDifference], [250, 2, 0]);
});

test('admixture: a baseline already in the bag, per liter, and the volume for a target', () => {
  // A 5 L bag at 4 mEq/L holds 20 mEq; 20 mEq in 10 mL more gives 40 mEq in 5,010 mL.
  const r = ac({ unit: 'mEq', per: 'L', nominalVolume: 5000, baseline: 4, additives: '20, 10', target: 6 });
  assert.deepEqual([r.finalVolume, r.concentration, r.nominalConcentration], [5010, 7.98403, 8]);
  // (20 + 2x) / (5,000 + x) = 0.006 per mL gives x = 5.01505 mL.
  assert.equal(r.targetAdditiveVolume, 5.01505);
  assert.ok(Math.abs((20 + 2 * r.targetAdditiveVolume) / (5000 + r.targetAdditiveVolume) * 1000 - 6) < 1e-5);
  assert.match(ac({ unit: 'mEq', per: 'L', nominalVolume: 5000, baseline: 4, additives: '20, 10', target: 3 }).message, /not above what the bag already holds/);
  assert.match(ac({ unit: 'mg', per: 'mL', nominalVolume: 250, additives: '500, 10', target: 60 }).message, /not below the additive's own strength/);
});

test('admixture: several additions add up; bad lines and impossible volumes are refused', () => {
  assert.equal(ac({ unit: 'mg', per: 'mL', nominalVolume: 100, additives: '100, 2\n100, 2' }).concentration, 1.92308);
  assert.match(ac({ unit: 'mg', per: 'mL', nominalVolume: 250, additives: '500' }).message, /Additive line 1/);
  assert.match(ac({ unit: 'mg', per: 'mL', nominalVolume: 250, withdrawn: 300, additives: '500, 10' }).message, /leaves nothing/);
  assert.match(ac({ unit: 'mg', nominalVolume: 250, additives: '500, 10' }).message, /per mL or per liter/);
  assert.match(ac({ per: 'mL', nominalVolume: 250, additives: '500, 10' }).message, /Choose the unit/);
  assert.equal(ac({}).valid, false);
});
