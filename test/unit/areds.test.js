// spec-v615: the AREDS simplified severity scale.
//
// The load-bearing tests are the two conditional rules - an advanced eye is assigned 2 factors and stops
// contributing its own features, and bilateral intermediate drusen count only when no eye has large drusen -
// plus the fact that both eyes being advanced leaves nothing to predict.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aredsSimplified, riskForFactors, RISKS, EYES, EYE_FEATURES, MAX_FACTORS, ADVANCED_EYE_FACTORS,
} from '../../lib/areds-v615.js';

const BASE = {
  rightAdvanced: 'no', rightLargeDrusen: 'no', rightPigment: 'no',
  leftAdvanced: 'no', leftLargeDrusen: 'no', leftPigment: 'no',
  bilateralIntermediateDrusen: 'no',
};
const at = (over = {}) => aredsSimplified({ ...BASE, ...over });

test('the scale is two eyes by three features plus one bilateral question', () => {
  assert.equal(EYES.length, 2);
  assert.equal(EYE_FEATURES.length, 3);
  assert.equal(MAX_FACTORS, 4);
});

test('the published risks are carried exactly', () => {
  assert.deepEqual(RISKS.map((r) => [r.factors, r.risk]), [[0, 0.5], [1, 3], [2, 12], [3, 25], [4, 50]]);
  assert.equal(riskForFactors(0), 0.5);
  assert.equal(riskForFactors(4), 50);
  assert.equal(riskForFactors(5), null);
});

// THE person-not-eye framing.
test('both eyes contribute, so one feature in each eye is two factors', () => {
  assert.equal(at({ rightLargeDrusen: 'yes' }).factors, 1);
  assert.equal(at({ rightLargeDrusen: 'yes', leftLargeDrusen: 'yes' }).factors, 2);
  assert.equal(at({ rightLargeDrusen: 'yes', rightPigment: 'yes' }).factors, 2);
  const worst = at({ rightLargeDrusen: 'yes', rightPigment: 'yes', leftLargeDrusen: 'yes', leftPigment: 'yes' });
  assert.equal(worst.factors, MAX_FACTORS);
  assert.equal(worst.fiveYearRiskPercent, 50);
});

test('a clean examination is zero factors and the lowest risk', () => {
  const r = at();
  assert.equal(r.factors, 0);
  assert.equal(r.fiveYearRiskPercent, 0.5);
});

// THE advanced-eye rule.
test('an advanced eye is assigned two factors and stops contributing its own features', () => {
  const bare = at({ rightAdvanced: 'yes' });
  const loaded = at({ rightAdvanced: 'yes', rightLargeDrusen: 'yes', rightPigment: 'yes' });
  assert.equal(bare.factors, ADVANCED_EYE_FACTORS);
  assert.equal(loaded.factors, ADVANCED_EYE_FACTORS, 'its own drusen and pigment add nothing');
  assert.equal(loaded.perEye.find((e) => e.eye === 'right').factors, 2);
});

test('the fellow eye still contributes, and the total still caps at four', () => {
  const r = at({
    rightAdvanced: 'yes', rightLargeDrusen: 'yes', rightPigment: 'yes',
    leftLargeDrusen: 'yes', leftPigment: 'yes',
  });
  assert.equal(r.factors, MAX_FACTORS);
  assert.equal(r.fiveYearRiskPercent, 50);
});

// THE both-advanced edge.
test('both eyes advanced leaves no at-risk eye and no risk is reported', () => {
  const r = at({ rightAdvanced: 'yes', leftAdvanced: 'yes' });
  assert.equal(r.bothAdvanced, true);
  assert.equal(r.atRiskEye, false);
  assert.equal(r.fiveYearRiskPercent, null);
  assert.equal(r.factors, 4);
  assert.match(r.bandText, /NO RISK IS REPORTED/);
  assert.match(r.bandText, /no at-risk eye/);
});

test('one advanced eye still leaves an at-risk eye', () => {
  const r = at({ rightAdvanced: 'yes' });
  assert.equal(r.bothAdvanced, false);
  assert.equal(r.atRiskEye, true);
  assert.equal(r.fiveYearRiskPercent, 12);
});

// THE conditional intermediate-drusen rule.
test('bilateral intermediate drusen add one factor when no eye has large drusen', () => {
  const r = at({ bilateralIntermediateDrusen: 'yes' });
  assert.equal(r.factors, 1);
  assert.equal(r.intermediateApplies, true);
  assert.equal(r.intermediateSuppressed, false);
  assert.match(r.bandText, /added 1 factor, because neither eye has large drusen/);
});

test('they are suppressed the moment either eye has large drusen', () => {
  for (const over of [{ rightLargeDrusen: 'yes' }, { leftLargeDrusen: 'yes' }]) {
    const r = at({ ...over, bilateralIntermediateDrusen: 'yes' });
    assert.equal(r.intermediateApplies, false, JSON.stringify(over));
    assert.equal(r.intermediateSuppressed, true);
    assert.equal(r.factors, 1, 'the large druse counts, the intermediate drusen do not');
    assert.match(r.bandText, /NOT counted, because an eye has large drusen/);
  }
});

test('they are one factor for the person, never one per eye', () => {
  const withPigmentBoth = at({ rightPigment: 'yes', leftPigment: 'yes', bilateralIntermediateDrusen: 'yes' });
  assert.equal(withPigmentBoth.factors, 3, '2 pigment plus 1 intermediate, not 2 plus 2');
});

test('two advanced eyes plus intermediate drusen stays inside the published scale', () => {
  const r = at({ rightAdvanced: 'yes', leftAdvanced: 'yes', bilateralIntermediateDrusen: 'yes' });
  assert.equal(r.factors, MAX_FACTORS, 'applied literally the rules would give 5');
  assert.equal(r.intermediateApplies, false);
  assert.equal(r.intermediateSuppressedReason, 'neither eye is still gradable');
  assert.match(r.bandText, /neither eye is still gradable/);
  assert.equal(r.fiveYearRiskPercent, null);
});

test('the count never exceeds the published maximum', () => {
  const combos = [
    { rightLargeDrusen: 'yes', rightPigment: 'yes', leftLargeDrusen: 'yes', leftPigment: 'yes', bilateralIntermediateDrusen: 'yes' },
    { rightAdvanced: 'yes', leftAdvanced: 'yes', bilateralIntermediateDrusen: 'yes' },
    { rightAdvanced: 'yes', leftPigment: 'yes', bilateralIntermediateDrusen: 'yes' },
  ];
  for (const c of combos) assert.ok(at(c).factors <= MAX_FACTORS, JSON.stringify(c));
});

// THE non-linearity.
test('the risk steps are not evenly spaced', () => {
  const risks = RISKS.map((r) => r.risk);
  const steps = risks.slice(1).map((r, i) => r - risks[i]);
  assert.notEqual(new Set(steps).size, 1, 'the increments differ');
  assert.ok(risks[1] / risks[0] > 5, 'the first step multiplies risk more than fivefold');
  assert.ok(risks[4] / risks[3] === 2, 'the last step doubles it');
  assert.match(at().bandText, /NOWHERE NEAR LINEAR/);
});

// Input handling and scope.
test('the inputs are validated', () => {
  assert.equal(aredsSimplified({}).valid, false);
  assert.match(aredsSimplified({}).message, /Answer all 7 items/);
  assert.match(at({ rightPigment: 'maybe' }).message, /must be yes or no/);
});

test('the scope note keeps the scale off diagnosis and off supplementation', () => {
  const r = at();
  assert.match(r.note, /does not diagnose macular degeneration/);
  assert.match(r.note, /does not grade disease already present/);
  assert.match(r.note, /antioxidant or zinc supplementation or any injection/);
  assert.match(r.note, /does not predict what will happen to one person/);
});
