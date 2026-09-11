// spec-v1243: Sarin, Hill, the hepatopulmonary criteria, and portopulmonary hypertension.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sarinGastricVarices, SARIN_TYPES } from '../../lib/sarin-gastric-varices-v1243.js';
import { hillGrade, HILL_GRADES } from '../../lib/hill-grade-v1243.js';
import { hepatopulmonarySyndrome, HPS_AGE_CUT } from '../../lib/hepatopulmonary-syndrome-v1243.js';
import { portopulmonaryHypertension, POPH_2004, POPH_2022 } from '../../lib/portopulmonary-hypertension-v1243.js';

// --- Sarin ------------------------------------------------------------------

test('sarin: four types, and the two isolated ones are not continuous', () => {
  assert.deepEqual(SARIN_TYPES.map((t) => t.value), ['GOV1', 'GOV2', 'IGV1', 'IGV2']);
  assert.equal(sarinGastricVarices({ type: 'GOV1' }).continuous, true);
  assert.equal(sarinGastricVarices({ type: 'IGV1' }).continuous, false);
});

test('sarin: the commonest type is not the dangerous one, and the tile says so', () => {
  const gov1 = sarinGastricVarices({ type: 'GOV1' });
  assert.match(gov1.commonestNote, /commonest type is not the dangerous one/);
  assert.equal(gov1.abnormal, false);
  assert.equal(sarinGastricVarices({ type: 'IGV1' }).abnormal, true);
  assert.equal(sarinGastricVarices({ type: 'GOV2' }).abnormal, true);
});

test('sarin: the sentence that sits above all four types', () => {
  const r = sarinGastricVarices({ type: 'GOV2' });
  assert.match(r.seriesNote, /bleed less often and are more serious/);
  assert.match(r.seriesNote, /45% mortality/);
});

test('sarin: IGV1 raises splenic vein thrombosis; the others do not', () => {
  assert.match(sarinGastricVarices({ type: 'IGV1' }).isolatedNote, /splenic vein thrombosis/);
  assert.equal(sarinGastricVarices({ type: 'GOV2' }).isolatedNote, null);
});

test('sarin: no default type', () => {
  const r = sarinGastricVarices({});
  assert.equal(r.valid, false);
  assert.match(r.message, /a blank is not the safe answer/);
});

// --- Hill -------------------------------------------------------------------

test('hill: I and II are the competent appearances, III and IV are not', () => {
  assert.deepEqual(HILL_GRADES.map((g) => g.value), ['I', 'II', 'III', 'IV']);
  assert.equal(hillGrade({ grade: 'I' }).competent, true);
  assert.equal(hillGrade({ grade: 'II' }).competent, true);
  assert.equal(hillGrade({ grade: 'III' }).competent, false);
  assert.equal(hillGrade({ grade: 'IV' }).competent, false);
});

test('hill: a grade IV always has a hernia, and only IV says so', () => {
  assert.match(hillGrade({ grade: 'IV' }).herniaNote, /worth a second look at the view/);
  assert.equal(hillGrade({ grade: 'III' }).herniaNote, null);
});

test('hill: every grade names the esophagitis scales it is not', () => {
  for (const g of HILL_GRADES) {
    assert.match(hillGrade({ grade: g.value }).notEsophagitisNote, /LA grade/);
  }
});

// --- Hepatopulmonary syndrome ----------------------------------------------

const HPS = { liverDisease: true, ipvd: true, age: 50, pao2: 85, aaGradient: 18 };

test('hps: the gradient threshold moves past 64, in one direction only', () => {
  assert.equal(hepatopulmonarySyndrome(HPS).meets, true);
  const old = hepatopulmonarySyndrome({ ...HPS, age: HPS_AGE_CUT + 1 });
  assert.equal(old.meets, false);
  assert.equal(old.gradientThreshold, 20);
  assert.match(old.ageNote, /widens with age/);
  assert.equal(hepatopulmonarySyndrome({ ...HPS, age: HPS_AGE_CUT }).gradientThreshold, 15);
});

test('hps: a normal-looking oxygen is the mild grade, not a normal result', () => {
  const r = hepatopulmonarySyndrome(HPS);
  assert.equal(r.severity, 'mild');
  assert.match(r.mildNote, /not a normal result/);
  assert.equal(hepatopulmonarySyndrome({ ...HPS, pao2: 70 }).severity, 'moderate');
  assert.equal(hepatopulmonarySyndrome({ ...HPS, pao2: 55 }).severity, 'severe');
  assert.equal(hepatopulmonarySyndrome({ ...HPS, pao2: 45 }).severity, 'very severe');
});

test('hps: a blank criterion is not a negative one', () => {
  const r = hepatopulmonarySyndrome({ ...HPS, ipvd: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /A blank is not a negative finding/);
});

test('hps: an impossible value is refused', () => {
  assert.equal(hepatopulmonarySyndrome({ ...HPS, age: 200 }).valid, false);
  assert.equal(hepatopulmonarySyndrome({ ...HPS, pao2: '  ' }).valid, false);
});

// --- Portopulmonary hypertension -------------------------------------------

const POPH = { portalHypertension: true, mpap: 38, pvrWood: 4, wedge: 10 };

test('poph: a patient can meet one definition and not the other', () => {
  const both = portopulmonaryHypertension(POPH);
  assert.equal(both.meets2004, true);
  assert.equal(both.meets2022, true);
  const only2022 = portopulmonaryHypertension({ ...POPH, mpap: 23, pvrWood: 2.5 });
  assert.equal(only2022.meets2022, true);
  assert.equal(only2022.meets2004, false);
  assert.match(only2022.band, /NOT the 2004 task force one/);
});

test('poph: the two threshold sets are the published ones', () => {
  assert.deepEqual(POPH_2004, { mpap: 25, pvrWood: 3, wedge: 15 });
  assert.deepEqual(POPH_2022, { mpap: 20, pvrWood: 2, wedge: 15 });
});

test('poph: a raised wedge pressure sends the diagnosis the other way', () => {
  const r = portopulmonaryHypertension({ ...POPH, wedge: 20 });
  assert.equal(r.meets2004, false);
  assert.equal(r.meets2022, false);
  assert.match(r.wedgeNote, /post-capillary/);
  assert.equal(portopulmonaryHypertension(POPH).wedgeNote, null);
});

test('poph: severity runs off the mean pressure, and reports its Wood-unit conversion', () => {
  assert.equal(portopulmonaryHypertension(POPH).severity, 'moderate');
  assert.equal(portopulmonaryHypertension({ ...POPH, mpap: 50 }).severity, 'severe');
  assert.equal(portopulmonaryHypertension({ ...POPH, mpap: 30 }).severity, 'mild');
  assert.equal(portopulmonaryHypertension(POPH).pvrDynes, 320);
});

test('poph: portal hypertension is asked, not assumed', () => {
  const r = portopulmonaryHypertension({ mpap: 38, pvrWood: 4, wedge: 10 });
  assert.equal(r.valid, false);
  assert.match(r.message, /a blank is not a no/);
});
