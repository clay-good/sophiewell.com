import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pecarnCspine } from '../../lib/scoring-v4.js';

test('pecarn-cspine 0/8 factors (tile example) -> LOW risk; no imaging', () => {
  const r = pecarnCspine({});
  assert.equal(r.presentCount, 0);
  assert.equal(r.lowRisk, true);
  assert.match(r.band, /LOW risk per Leonard 2019.*not indicated/);
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
    alteredMentalStatus: true, abnormalAirwayBreathingCirculation: true,
    focalNeurologicDeficit: true, neckPain: true, torticollis: true,
    substantialTorsoInjury: true, predisposingCondition: true,
    highRiskMvc: true,
  });
  assert.equal(r.presentCount, 8);
  assert.equal(r.lowRisk, false);
});
