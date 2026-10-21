// Regression tests for the defects independent reviews found in the spec-v800 to v907 tools on 2026-10-20, each
// with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acromegalyBiochem } from '../../lib/acromegaly-biochem-v835.js';
import { ghentMarfan } from '../../lib/ghent-marfan-v821.js';
import { diabetesDiagnosis } from '../../lib/diabetes-diagnosis-v841.js';
import { phHemodynamics2022 } from '../../lib/ph-hemodynamics-2022-v826.js';
import { hfEfClassification } from '../../lib/hf-ef-classification-v840.js';
import { tensionHeadacheIchd3 } from '../../lib/tension-headache-ichd3-v818.js';
import { fourTsHit } from '../../lib/four-ts-hit-v836.js';
import { vodSos } from '../../lib/vod-sos-v907.js';

test('4Ts: a blank domain is asked for, not scored 0 (an empty form no longer reads "low probability")', () => {
  assert.equal(fourTsHit({}).valid, false);
  assert.match(fourTsHit({ thrombocytopenia: 2 }).message, /timing is blank|is blank/);
});

test('acromegaly: a normal IGF-1 and a low random GH do not exclude it when the OGTT nadir is unsuppressed', () => {
  assert.match(acromegalyBiochem({ igf1TimesUln: 0.9, randomGh: 0.5, ogttGhNadir: 2 }).verdict, /^Discordant/);
});

test('Ghent: with a family history and a Z score between 2 and 3, the age decides, so it is asked for', () => {
  assert.equal(ghentMarfan({ aorticZScore: 2.5, familyHistory: true }).valid, false);
});

test('diabetes: a set-aside A1C is never called "below the thresholds"', () => {
  assert.equal(diabetesDiagnosis({ a1c: 7, a1cConfounder: true }).verdict, 'Not assessable from the tests entered');
  assert.match(diabetesDiagnosis({ a1c: 7, a1cConfounder: true, fastingGlucose: 90 }).basis, /that could be judged; the A1C of 7% \(set aside/);
});

test('PH: a wedge above the mean PA pressure is refused, and a PVR just over 2 is printed over 2', () => {
  assert.equal(phHemodynamics2022({ mpap: 20, pawp: 25, cardiacOutput: 5 }).valid, false);
  assert.equal(phHemodynamics2022({ mpap: 25, pawp: 15, cardiacOutput: 4.999 }).pvr, 2.0004);
});

test('values between printed whole-number bands have a home', () => {
  assert.equal(hfEfClassification({ currentLvef: 40.5, symptomaticHeartFailure: true }).category, 'HFmrEF');
  assert.equal(hfEfClassification({ currentLvef: 49.5, symptomaticHeartFailure: true }).category, 'HFmrEF');
  assert.equal(tensionHeadacheIchd3({ headacheDaysPerMonth: 14.5, episodeCount: 20, monthsOfPattern: 4, duration: '30-min-to-2-hours' }).frequency.frequent, true);
});

test('VOD/SOS: EBMT late onset counts the bilirubin among the classical items on the imaging route', () => {
  const r = vodSos({ daysSinceTransplant: 30, bilirubinAtLeastTwo: true, ascites: true, hemodynamicOrUltrasoundEvidence: true, weightGain: 'none' });
  assert.match(r.band, /^Met: EBMT 2016/);
});
