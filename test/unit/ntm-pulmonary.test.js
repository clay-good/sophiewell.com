import test from 'node:test';
import assert from 'node:assert/strict';
import { ntmPulmonary as ntm, SPUTUM_REQUIRED } from '../../lib/ntm-pulmonary-v827.js';

const base = { pulmonarySymptoms: true, nodularOrCavitary: true, alternativesExcluded: true };

test('ntm: all four domains are required', () => {
  const full = { ...base, positiveSputumCultures: 2, sameSpecies: true };
  assert.equal(ntm(full).criteriaMet, true);
  assert.equal(ntm({ ...full, pulmonarySymptoms: false }).criteriaMet, false);
  assert.equal(ntm({ ...full, nodularOrCavitary: false }).criteriaMet, false);
  assert.equal(ntm({ ...full, alternativesExcluded: false }).criteriaMet, false);
});

test('ntm: ONE positive sputum is not enough', () => {
  // The error that starts a year of multidrug therapy wrongly.
  const one = ntm({ ...base, positiveSputumCultures: 1, sameSpecies: true });
  assert.equal(one.domains.microbiologic, false);
  assert.equal(one.criteriaMet, false);
  assert.ok(one.singleSputumNote.includes('does not satisfy'));
  assert.equal(SPUTUM_REQUIRED, 2);
  assert.equal(ntm({ ...base, positiveSputumCultures: 2, sameSpecies: true }).domains.microbiologic, true);
});

test('ntm: two sputum cultures must be the SAME species', () => {
  const notSame = ntm({ ...base, positiveSputumCultures: 3 });
  assert.equal(notSame.domains.microbiologic, false);
  assert.ok(notSame.speciesNote.includes('same species'));
  assert.equal(ntm({ ...base, positiveSputumCultures: 3, sameSpecies: true }).domains.microbiologic, true);
});

test('ntm: ONE bronchial wash IS enough, and the two-sample rule does not carry across', () => {
  const wash = ntm({ ...base, bronchialWashPositive: true });
  assert.equal(wash.domains.microbiologic, true);
  assert.equal(wash.criteriaMet, true);
  assert.ok(wash.washNote.includes('does not carry across'));
  // It also stands with zero sputum samples.
  assert.equal(ntm({ ...base, bronchialWashPositive: true, positiveSputumCultures: 0 }).criteriaMet, true);
});

test('ntm: the biopsy route needs histology PLUS a positive culture', () => {
  assert.equal(ntm({ ...base, biopsyHistology: true }).domains.microbiologic, false);
  assert.equal(ntm({ ...base, biopsyHistology: true, biopsyCulturePositive: true }).domains.microbiologic, true);
  // Or histology plus a positive sputum or washing.
  assert.equal(ntm({ ...base, biopsyHistology: true, anyCulturePositive: true }).domains.microbiologic, true);
  // Culture without the histology is not the biopsy route.
  assert.equal(ntm({ ...base, biopsyCulturePositive: true }).domains.microbiologic, false);
});

test('ntm: either radiologic finding satisfies the radiologic domain', () => {
  assert.equal(ntm({ pulmonarySymptoms: true, hrctBronchiectasis: true, alternativesExcluded: true, bronchialWashPositive: true }).criteriaMet, true);
});

test('ntm: a met diagnosis carries the guideline point that it does not mandate treatment', () => {
  const r = ntm({ ...base, bronchialWashPositive: true });
  assert.ok(r.treatmentNote.includes('does not, in itself, require starting treatment'));
  // Not raised when the criteria are unmet.
  assert.equal(ntm(base).treatmentNote, null);
});

test('ntm: empty and out-of-range input', () => {
  const empty = ntm({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.singleSputumNote, null);
  assert.equal(ntm({ positiveSputumCultures: -1 }).valid, false);
  assert.equal(ntm({ positiveSputumCultures: 1e308 }).valid, false);
  assert.equal(ntm().valid, true);
  assert.doesNotMatch(JSON.stringify(ntm({ ...base, bronchialWashPositive: true })), /NaN|Infinity/);
});
