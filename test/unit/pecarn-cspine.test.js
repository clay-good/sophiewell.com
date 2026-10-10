import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pecarnCspine } from '../../lib/scoring-v4.js';

test('pecarn-cspine 0/8 factors -> lower risk, stated with the model\'s sensitivity', () => {
  const r = pecarnCspine({});
  assert.equal(r.presentCount, 0);
  assert.equal(r.lowRisk, true);
  assert.match(r.band, /lower risk per Leonard 2019/);
});

test('pecarn-cspine neck pain alone -> not low risk', () => {
  const r = pecarnCspine({ neckPain: true });
  assert.equal(r.presentCount, 1);
  assert.equal(r.lowRisk, false);
  assert.match(r.band, /NOT low risk.*imaging warranted/);
});

test('pecarn-cspine AMS + neck pain -> not low risk; factorsPresent list correct', () => {
  const r = pecarnCspine({ alteredMentalStatus: true, neckPain: true });
  assert.equal(r.presentCount, 2);
  assert.equal(r.lowRisk, false);
  assert.deepEqual(r.factorsPresent, ['alteredMentalStatus', 'neckPain']);
});

test('pecarn-cspine 8/8 (all factors) -> not low risk', () => {
  const r = pecarnCspine({
    alteredMentalStatus: true, diving: true,
    focalNeurologicDeficit: true, neckPain: true, decreasedNeckMobility: true,
    substantialTorsoInjury: true, predisposingCondition: true,
    highRiskMvc: true,
  });
  assert.equal(r.presentCount, 8);
  assert.equal(r.lowRisk, false);
});

test('a diving injury alone is a risk factor; none present is not called "imaging not indicated"', () => {
  assert.equal(pecarnCspine({ diving: true }).lowRisk, false);
  const none = pecarnCspine({});
  assert.equal(none.lowRisk, true);
  assert.doesNotMatch(none.band, /imaging not indicated/);
  assert.match(none.band, /90\.5% sensitive/);
});
