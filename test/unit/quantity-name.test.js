// spec-v1799: the shared answer to "which lib/bounds.js quantity is this field?".
//
// Two finders read it, and every rule in it was learned from a wrong answer -- a substring that is not a
// word, an alias that is also a unit, an analyte in another compartment, a reference limit rather than a
// measurement, a unit stated in the label instead of the `unit` key. A rule that quietly stops applying
// does not fail anything: it just lets a finder match the wrong envelope again, or stop matching the right
// one. So each case below is the field that taught the rule, named.
import test from 'node:test';
import assert from 'node:assert/strict';
import { envelopeFor, names, unitOf } from '../../scripts/lib/quantity-name.mjs';

// A field, as the adapters write one.
const f = (arg, label, unit) => ({ kind: 'number', arg, label, ...(unit ? { unit } : {}) });

test('a field is matched to the envelope it is', () => {
  for (const [field, want] of [
    [f('weightKg', 'Weight', 'kg'), 'weightKg'],
    [f('currentCr', 'Current serum creatinine', 'mg/dL'), 'scr'],
    [f('currentHb', 'Current Hb', 'g/dL'), 'hemoglobin'],
    [f('sbp', 'Systolic BP', 'mmHg'), 'sbp'],
    [f('age', 'Age', 'years'), 'ageYears'],
    [f('platelets', 'Platelet count', 'x10^3/uL'), 'platelets'],
    [f('egfr', 'MDRD-eGFR', 'mL/min/1.73 m²'), 'eGFR'],
  ]) assert.equal(envelopeFor(field), want, `${field.arg} should be ${want}`);
});

test('a substring is not a word', () => {
  // `rr` inside "currentCr", `alt` inside "total time", `ast` inside "waste", `ph` inside "pharmacists".
  assert.notEqual(envelopeFor(f('currentCr', 'Current creatinine', 'mg/dL')), 'rr');
  assert.equal(envelopeFor(f('totalMinutes', 'Total time in minutes', 'minutes')), null);
  assert.equal(envelopeFor(f('nonAcuteKg', 'Non-acute hazardous waste this calendar month', 'kg')), null);
  assert.equal(envelopeFor(f('fullTimeStaff', 'Full-time pharmacists and pharmacy technicians')), null);
});

test('an alias that is also a unit is not an alias', () => {
  // `mg` for magnesium matched every label that states a mass; `be` for base excess matched the English
  // word; and `hr` as a KEY word matched the denominator of every rate.
  assert.equal(envelopeFor(f('serumIgg4', 'Serum IgG4', 'mg/dL')), null);
  assert.equal(envelopeFor(f('beneficiaries', 'Medicare beneficiaries for the cap year (may be estimated)')), null);
  assert.equal(envelopeFor(f('urineOutput', 'Urine output', 'mL/kg/hr')), null);
  assert.equal(envelopeFor(f('rateMlHr', 'Rate', 'mL/hr')), null);
});

test('the same analyte in another compartment is a different quantity', () => {
  // BOUNDS.sodium is a SERUM sodium, 90 to 208 mEq/L; a urine sodium of 20 is ordinary.
  assert.equal(envelopeFor(f('urineNa', 'Urine sodium', 'mEq/L')), null);
  assert.equal(envelopeFor(f('pleuralLdh', 'Pleural fluid LDH', 'IU/L')), null);
  // And a ratio of two analytes is a third quantity.
  assert.equal(envelopeFor(f('altAstRatio', 'ALT / AST ratio')), null);
});

test('a body quantity is not the same quantity measured off the body', () => {
  // BOUNDS.temperature is 13 to 47 C because it is a BODY temperature.
  assert.equal(envelopeFor(f('globe', 'The globe temperature', '°C')), null);
  assert.equal(envelopeFor(f('temp', 'The air temperature', '°C')), null);
  assert.equal(envelopeFor(f('emptyWeight', 'Empty cylinder weight', 'kg')), null);
  assert.equal(envelopeFor(f('loadWeightLb', 'Load weight', 'lb')), null);
  assert.equal(envelopeFor(f('ironConc', 'Hepatic iron concentration, dry weight')), null);
});

test('a reference limit, a score or a constant is not a measurement', () => {
  assert.equal(envelopeFor(f('astUln', 'AST upper limit of normal', 'IU/L')), null);
  assert.equal(envelopeFor(f('score', 'Coronary artery calcium score (Agatston)')), null);
  assert.equal(envelopeFor(f('ki2', 'Inhibition constant Ki')), null);
  // And an end-tidal CO2 is not an arterial one.
  assert.equal(envelopeFor(f('etco2', 'End-tidal CO2', 'mmHg')), null);
});

test('a unit settles what is left, and a short unit must match exactly', () => {
  // "kg".includes("g") let a birth weight in GRAMS match the kilogram envelope.
  assert.equal(envelopeFor(f('birthWeight', 'Birth weight (g)')), null);
  assert.equal(envelopeFor(f('weightLoss', 'Unplanned weight loss in past 3-6 months (%)')), null);
  assert.equal(envelopeFor(f('poundsWeight', 'Weight in pounds')), null);
  assert.equal(envelopeFor(f('weightKg', 'OR weight in kilograms')), 'weightKg');
});

test('the unit is read from the label when the field states none', () => {
  assert.equal(unitOf(f('bw', 'Birth weight (g)')), 'g');
  assert.equal(unitOf(f('t', 'Lowest temperature (°C)')), '°C');
  assert.equal(unitOf(f('lb', 'Weight in pounds')), 'lb');
  assert.equal(unitOf(f('w', 'Weight', 'kg')), 'kg', 'a stated unit wins');
  // A parenthetical that is prose is not a unit.
  assert.equal(unitOf(f('n', 'The number of surfaces scored 0 (0 if none)')), '');
  assert.equal(unitOf(f('x', 'Target duration (optional)')), '');
});

test('names() asks about one envelope at a time', () => {
  assert.equal(names('weightKg', f('weightKg', 'Weight', 'kg')), true);
  assert.equal(names('hemoglobin', f('hb', 'Current Hb', 'g/dL')), true);
  assert.equal(names('hemoglobin', f('weightKg', 'Weight', 'kg')), false);
});
