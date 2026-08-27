import test from 'node:test';
import assert from 'node:assert/strict';
import { ghentMarfan as gm, MAX_SYSTEMIC } from '../../lib/ghent-marfan-v821.js';

test('ghent: the four no-family-history routes to Marfan syndrome', () => {
  assert.equal(gm({ aorticZScore: 3, ectopiaLentis: true }).diagnosis, 'Marfan syndrome');
  assert.equal(gm({ aorticZScore: 3, fbn1: 'known-with-ao' }).diagnosis, 'Marfan syndrome');
  assert.equal(gm({ aorticZScore: 3, wristThumb: 'both', pectus: 'carinatum', pneumothorax: true }).diagnosis, 'Marfan syndrome');
  assert.equal(gm({ ectopiaLentis: true, fbn1: 'known-with-ao' }).diagnosis, 'Marfan syndrome');
});

test('ghent: the aortic Z threshold is age-dependent, but ONLY with a family history', () => {
  // Under 20 with an affected relative, Z 2.5 is NOT enough - rule 7 wants 3.
  const child = gm({ familyHistory: true, age: 12, aorticZScore: 2.5 });
  assert.equal(child.diagnosis, null);
  assert.equal(child.zThresholdApplied, 3);
  assert.ok(child.ageNote.includes('does NOT satisfy rule 7'));

  // The same Z at 25 does meet it.
  assert.equal(gm({ familyHistory: true, age: 25, aorticZScore: 2.5 }).diagnosis, 'Marfan syndrome');
  // And 3 meets it at 12.
  assert.equal(gm({ familyHistory: true, age: 12, aorticZScore: 3 }).diagnosis, 'Marfan syndrome');
  // WITHOUT a family history the adult threshold applies at any age.
  assert.equal(gm({ age: 12, aorticZScore: 2.5, ectopiaLentis: true }).diagnosis, 'Marfan syndrome');
});

test('ghent: FBN1 has three states, and the middle one changes the diagnosis', () => {
  // Known with aortic disease: Marfan. Not known with it: ectopia lentis syndrome.
  assert.equal(gm({ ectopiaLentis: true, fbn1: 'known-with-ao' }).diagnosis, 'Marfan syndrome');
  const els = gm({ ectopiaLentis: true, fbn1: 'not-known-with-ao' });
  assert.equal(els.diagnosis, 'Ectopia lentis syndrome');
  assert.ok(els.fbn1Note.includes('does not satisfy rule 4'));
  assert.equal(gm({ ectopiaLentis: true }).diagnosis, 'Ectopia lentis syndrome');
});

test('ghent: MASS needs a systemic score of 5 with at least one SKELETAL feature', () => {
  // 5 points, all skeletal: MASS.
  const mass = gm({ aorticZScore: 1, wristThumb: 'both', pectus: 'carinatum' });
  assert.equal(mass.systemicScore, 5);
  assert.equal(mass.skeletalFeaturePresent, true);
  assert.equal(mass.diagnosis, 'MASS phenotype');

  // 5 points with NO skeletal feature: not MASS.
  const nonSkeletal = gm({ aorticZScore: 1, pneumothorax: true, duralEctasia: true, skinStriae: true });
  assert.equal(nonSkeletal.systemicScore, 5);
  assert.equal(nonSkeletal.skeletalFeaturePresent, false);
  assert.notEqual(nonSkeletal.diagnosis, 'MASS phenotype');

  // 4 points is below the MASS threshold.
  assert.notEqual(gm({ aorticZScore: 1, wristThumb: 'both', scoliosis: true }).diagnosis, 'MASS phenotype');
});

test('ghent: mitral valve prolapse syndrome is the low-score route', () => {
  const mvps = gm({ aorticZScore: 1, mvp: true });
  assert.equal(mvps.diagnosis, 'Mitral valve prolapse syndrome');
  // ...and it does not apply once the systemic score reaches 5.
  assert.notEqual(gm({ aorticZScore: 1, mvp: true, wristThumb: 'both', pectus: 'carinatum' }).diagnosis, 'Mitral valve prolapse syndrome');
});

test('ghent: Box 2 weights, including the graded items and the 20-point maximum', () => {
  assert.equal(gm({ wristThumb: 'both' }).systemicScore, 3);
  assert.equal(gm({ wristThumb: 'one' }).systemicScore, 1);
  assert.equal(gm({ pectus: 'carinatum' }).systemicScore, 2);
  assert.equal(gm({ pectus: 'excavatum' }).systemicScore, 1);
  assert.equal(gm({ hindfoot: 'deformity' }).systemicScore, 2);
  assert.equal(gm({ hindfoot: 'planus' }).systemicScore, 1);

  const everything = gm({
    wristThumb: 'both', pectus: 'carinatum', hindfoot: 'deformity',
    pneumothorax: true, duralEctasia: true, protrusioAcetabuli: true,
    segmentRatio: true, scoliosis: true, reducedElbowExtension: true,
    facialFeatures: true, skinStriae: true, myopia: true, mvp: true,
  });
  assert.equal(everything.systemicScore, MAX_SYSTEMIC);
});

test('ghent: the caveated routes carry the caveat until the differential is excluded', () => {
  const withCaveat = gm({ aorticZScore: 3, ectopiaLentis: true });
  assert.ok(withCaveat.caveat.includes('Loeys-Dietz'));
  assert.equal(gm({ aorticZScore: 3, ectopiaLentis: true, differentialExcluded: true }).caveat, null);
  // Rule 2 is not one of the caveated routes.
  assert.equal(gm({ aorticZScore: 3, fbn1: 'known-with-ao' }).caveat, null);
});

test('ghent: family-history routes 5 and 6 need no aortic measurement at all', () => {
  assert.equal(gm({ familyHistory: true, ectopiaLentis: true }).diagnosis, 'Marfan syndrome');
  assert.equal(gm({ familyHistory: true, wristThumb: 'both', pectus: 'carinatum', hindfoot: 'deformity' }).systemicScore, 7);
  assert.equal(gm({ familyHistory: true, wristThumb: 'both', pectus: 'carinatum', hindfoot: 'deformity' }).diagnosis, 'Marfan syndrome');
});

test('ghent: empty, invalid and out-of-range input', () => {
  const empty = gm({});
  assert.equal(empty.valid, true);
  assert.equal(empty.diagnosis, null);
  assert.equal(empty.systemicScore, 0);
  assert.equal(gm({ fbn1: 'maybe' }).valid, false);
  assert.equal(gm({ wristThumb: 'three' }).valid, false);
  assert.equal(gm({ age: 500 }).valid, false);
  assert.equal(gm({ aorticZScore: 1e308 }).valid, false);
  assert.equal(gm().valid, true);
  assert.doesNotMatch(JSON.stringify(gm({ aorticZScore: 3, ectopiaLentis: true })), /NaN|Infinity/);
});
