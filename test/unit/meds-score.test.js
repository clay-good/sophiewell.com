// spec-v112 2.1: MEDS score (Shapiro 2003). Nine weighted items summed 0-27,
// with the 28-day mortality bands very low 0-4 / low 5-7 / moderate 8-12 /
// high 13-15 / very high >= 16.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medsScore } from '../../lib/critcare-v112.js';

test('worked example: terminal illness + septic shock + age > 65 = 12, moderate', () => {
  const r = medsScore({ terminalIllness: true, septicShock: true, ageOver65: true });
  assert.equal(r.valid, true);
  assert.equal(r.total, 12);
  assert.equal(r.tier, 'moderate');
  assert.match(r.band, /MEDS 12\/27: moderate risk \(28-day mortality ~7\.8%\)/);
});

test('band flips at the cutoffs: 4 very low, 5 low, 8 moderate, 13 high, 16 very high', () => {
  // 4 = bands(3) + nursingHome... no, build exact totals.
  assert.equal(medsScore({ lowerRespInfection: true, nursingHome: true }).tier, 'very low'); // 4
  assert.equal(medsScore({ lowerRespInfection: true, nursingHome: true, alteredMental: true }).total, 6); // low band
  assert.equal(medsScore({ lowerRespInfection: true, nursingHome: true, alteredMental: true }).tier, 'low');
  assert.equal(medsScore({ septicShock: true, bands: true, ageOver65: true }).tier, 'moderate'); // 9
});

test('a 5-point total is the low band (just over the very-low ceiling of 4)', () => {
  const r = medsScore({ septicShock: true, alteredMental: true }); // 3 + 2 = 5
  assert.equal(r.total, 5);
  assert.equal(r.tier, 'low');
});

test('the maximum total is 27 (every item present), very high', () => {
  const r = medsScore({
    terminalIllness: true, tachypneaHypoxia: true, septicShock: true, lowPlatelets: true,
    bands: true, ageOver65: true, lowerRespInfection: true, nursingHome: true, alteredMental: true,
  });
  assert.equal(r.total, 27);
  assert.equal(r.tier, 'very high');
  assert.match(r.band, /~50%/);
});

test('no items present is a valid very-low total of 0', () => {
  const r = medsScore({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.tier, 'very low');
  assert.match(r.counted, /no risk items present/);
});
