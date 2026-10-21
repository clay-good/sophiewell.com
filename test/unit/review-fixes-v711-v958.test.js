// Regression tests for the second part of the spec-v700 to v958 review (spec-v1675) on 2026-10-20, each with the
// input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cuffLeak } from '../../lib/cuff-leak-v903.js';
import { dkaResolution } from '../../lib/dka-resolution-v905.js';
import { vexusGrade } from '../../lib/vexus-v958.js';
import { kingsCollegeNonApap } from '../../lib/kings-college-nonapap-v910.js';
import { homeOxygen } from '../../lib/home-oxygen-v889.js';
import { ausdrisk } from '../../lib/ausdrisk-v711.js';
import { sbpAsciticFluid } from '../../lib/sbp-ascitic-fluid-v852.js';
import { pefZones } from '../../lib/pef-zones-v891.js';
import { vitaminDLevel } from '../../lib/vitamin-d-level-v881.js';

test('whitespace is blank, not 0, and impossible zeros are refused', () => {
  assert.equal(cuffLeak({ inspiredMl: ' ', expiredCuffDownMl: '400' }).valid, false);
  assert.equal(cuffLeak({ inspiredMl: '0', expiredCuffDownMl: '0' }).valid, false);
  assert.equal(dkaResolution({ glucoseMgDl: ' ', bicarbonate: 20, venousPh: 7.35 }).bandLabel, 'Glucose not entered');
  assert.equal(dkaResolution({ glucoseMgDl: 0, bicarbonate: 20, venousPh: 7.35 }).valid, false);
});

test('cuff leak: a 109.96 mL leak is under 110 and printed under it', () => {
  assert.match(cuffLeak({ inspiredMl: '500', expiredCuffDownMl: '390.04' }).band, /109\.96 mL.*this is a small leak/);
});

test('VExUS: a blank waveform with a dilated IVC makes the grade a floor; an IVC above 6 cm is refused', () => {
  const r = vexusGrade({ ivcDiameterCm: 2.4, hepaticVein: 'severe', portalVein: 'normal' });
  assert.equal(r.bandLabel, 'VExUS Grade 2 or higher');
  assert.match(r.band, /intrarenal vein waveform was not entered/);
  assert.equal(vexusGrade({ ivcDiameterCm: 25, hepaticVein: 'normal', portalVein: 'normal', intrarenalVein: 'normal' }).valid, false);
});

test("King's College: a bilirubin of exactly 300 micromol/L is not above 300; unentered factors are not a no", () => {
  const r = kingsCollegeNonApap({ inr: 4, bilirubin: 300, bilirubinUnit: 'umol/l', age: 45 });
  assert.equal(r.factors.find((f) => f.key === 'bilirubin').met, false);
  assert.equal(r.bandLabel, 'Not met from what is entered');
  assert.equal(kingsCollegeNonApap({ inr: 4, jaundiceToEncephalopathyDays: -2 }).valid, false);
});

test('home oxygen: 55.5 mmHg and 89.5 percent fall in the group II range, not "does not qualify"', () => {
  assert.match(homeOxygen({ pao2: 55.5 }).band, /qualifies only alongside a supporting finding/);
  assert.match(homeOxygen({ spo2: 89.5 }).band, /qualifies only alongside a supporting finding/);
});

test('AUSDRISK: 12 or more is high risk, as the form prints it', () => {
  const r = ausdrisk({ agePoints: '6', sex: 'male', lowActivity: true, lowVegFruit: true, waist: '70' });
  assert.equal(r.score, 12);
  assert.equal(r.tier, 'high');
  assert.equal(ausdrisk({ agePoints: '8', sex: 'male', waist: '70' }).tier, 'intermediate');
});

test('counts and percents at a line are decided unrounded and printed on that side', () => {
  const sbp = sbpAsciticFluid({ nucleatedCount: 499, pmnPercent: 50.1 });
  assert.equal(sbp.neutrocytic, false);
  assert.equal(sbp.correctedPmn, 249.999);
  const pef = pefZones({ currentPef: 399.8, personalBest: 500 });
  assert.equal(pef.zone, 'yellow');
  assert.equal(pef.percent, 79.96);
  assert.match(vitaminDLevel({ level: 49.9, unit: 'nmol-l' }).band, /^19\.98 ng\/mL .*deficient by the Endocrine Society/);
});
