// spec-v581: the Shanghai Brugada score.
//
// The load-bearing test is the ECG gate: a patient scoring well above the diagnostic threshold on the other
// categories is still non-diagnostic without an ECG finding.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shanghaiBrugada, ECG_ITEMS, CLINICAL_ITEMS, FAMILY_ITEMS,
  GENETIC_POINTS, AF_AGE_LIMIT, SHANGHAI_MAX,
} from '../../lib/shanghai-brugada-v581.js';

const at = (over = {}) => shanghaiBrugada({
  ecg: 'none', clinical: 'none', family: 'none', geneticMutation: 'no', ...over,
});

test('the maximum is 9 from the four category maxima', () => {
  const ecgMax = Math.max(...ECG_ITEMS.map((i) => i.points));
  const clinMax = Math.max(...CLINICAL_ITEMS.map((i) => i.points));
  const famMax = Math.max(...FAMILY_ITEMS.map((i) => i.points));
  assert.equal(ecgMax + clinMax + famMax + GENETIC_POINTS, SHANGHAI_MAX);
  assert.equal(SHANGHAI_MAX, 9);
});

// THE gate.
test('a high total is still non-diagnostic without an ECG finding', () => {
  const r = at({ clinical: 'arrest-vf-vt', family: 'definite-brs-relative', geneticMutation: 'yes' });
  assert.equal(r.total, 5.5);
  assert.equal(r.ecgFindingPresent, false);
  assert.equal(r.band, 'Non-diagnostic');
  assert.equal(r.gateBlocked, true);
  assert.match(r.bandText, /NON-DIAGNOSTIC DESPITE A TOTAL OF 5\.5/);
});

test('the same patient with any ECG finding crosses the threshold', () => {
  const r = at({
    ecg: 'type2-3-converts', clinical: 'arrest-vf-vt',
    family: 'definite-brs-relative', geneticMutation: 'yes',
  });
  assert.equal(r.ecgFindingPresent, true);
  assert.equal(r.total, 7.5);
  assert.match(r.band, /Probable and\/or definite/);
});

test('the gate is stated in every result', () => {
  assert.match(at({ ecg: 'spontaneous-type1' }).bandText, /At least one ECG finding is REQUIRED/);
});

test('a spontaneous type 1 pattern alone reaches the top band', () => {
  const r = at({ ecg: 'spontaneous-type1' });
  assert.equal(r.total, 3.5);
  assert.match(r.band, /Probable and\/or definite/);
});

// Category maxima.
test('within a category only the highest item is selectable, so findings do not add', () => {
  // The API takes one item per category by construction.
  const arrest = at({ ecg: 'spontaneous-type1', clinical: 'arrest-vf-vt' });
  assert.equal(arrest.categoryPoints.clinical, 3);
  const syncope = at({ ecg: 'spontaneous-type1', clinical: 'arrhythmic-syncope' });
  assert.equal(syncope.categoryPoints.clinical, 2);
  assert.ok(arrest.total > syncope.total);
});

test('the result explains the highest-item-only rule', () => {
  assert.match(at({ ecg: 'spontaneous-type1' }).bandText, /only the single HIGHEST-scoring item counts/);
});

// THE age gate.
test('the atrial fibrillation item requires an age', () => {
  const r = at({ ecg: 'spontaneous-type1', clinical: 'af-under-30' });
  assert.equal(r.valid, false);
  assert.match(r.message, /age-conditional/);
});

test('the atrial fibrillation item scores under 30 and disappears at 30', () => {
  const under = at({ ecg: 'spontaneous-type1', clinical: 'af-under-30', age: '25' });
  assert.equal(under.categoryPoints.clinical, 0.5);
  assert.equal(under.ageGateApplied, false);

  const over = at({ ecg: 'spontaneous-type1', clinical: 'af-under-30', age: String(AF_AGE_LIMIT) });
  assert.equal(over.categoryPoints.clinical, 0, 'the item does not exist at 30 and above');
  assert.equal(over.ageGateApplied, true);
  assert.match(over.bandText, /was selected but scored 0/);
});

test('no other clinical item needs an age', () => {
  assert.equal(at({ ecg: 'spontaneous-type1', clinical: 'arrest-vf-vt' }).valid, true);
});

// Genotype de-weighting.
test('genetics scores the same as the weakest clinical item and cannot open the gate', () => {
  assert.equal(GENETIC_POINTS, 0.5);
  const geneticOnly = at({ geneticMutation: 'yes' });
  assert.equal(geneticOnly.total, 0.5);
  assert.equal(geneticOnly.ecgFindingPresent, false);
  assert.equal(geneticOnly.band, 'Non-diagnostic');
});

test('the result states that genotype is de-weighted', () => {
  assert.match(at({ ecg: 'spontaneous-type1' }).bandText, /deliberately de-weighted/);
});

// Family oddities and the top band.
test('the unusual family criteria are surfaced', () => {
  const r = at({ ecg: 'spontaneous-type1' });
  assert.match(r.bandText, /SECOND-degree relatives/);
  assert.match(r.bandText, /NEGATIVE AUTOPSY/);
});

test('the top band is not reported as definite', () => {
  const r = at({ ecg: 'spontaneous-type1' });
  assert.match(r.band, /probable and\/or definite/i);
  assert.match(r.bandText, /must not be reported as "definite"/);
});

// Bands.
test('the band boundaries sit where the source puts them', () => {
  assert.match(at({ ecg: 'type2-3-converts' }).band, /Possible/);           // 2
  assert.match(at({ ecg: 'fever-type1' }).band, /Possible/);                // 3
  assert.match(at({ ecg: 'spontaneous-type1' }).band, /Probable/);          // 3.5
});

// Input handling.
test('every category is required', () => {
  assert.equal(shanghaiBrugada({}).valid, false);
  assert.equal(shanghaiBrugada({ ecg: 'none' }).valid, false);
});

test('the scope note separates diagnosis from risk and refuses the defibrillator decision', () => {
  const r = at({ ecg: 'spontaneous-type1' });
  assert.match(r.note, /not a risk stratification/);
  assert.match(r.note, /does not decide on an implantable defibrillator/);
  assert.match(r.note, /shares only the surname/);
});
