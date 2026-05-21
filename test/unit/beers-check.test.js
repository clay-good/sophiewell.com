import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beersCheck, BEERS_PIM, BEERS_DISEASE } from '../../lib/medication-v4.js';

test('age 78, benzo + opioid, history of falls -> 3 flags (benzo PIM, benzo+falls, opioid+benzo)', () => {
  const r = beersCheck({ ageYears: 78, medications: ['benzodiazepine', 'opioid'], comorbidities: ['history-of-falls'] });
  assert.equal(r.pimFlags.length, 2);
  // disease flags: benzo+falls, opioid+falls = 2
  assert.equal(r.diseaseFlags.length, 2);
  // drug-drug: opioid+benzo = 1
  assert.equal(r.drugDrugFlags.length, 1);
  assert.equal(r.totalFlags, 5);
  assert.ok(r.drugDrugFlags[0].text.includes('respiratory-depression'));
});

test('age 72, glyburide + diphenhydramine -> 2 PIM flags, no disease, no drug-drug', () => {
  const r = beersCheck({ ageYears: 72, medications: ['sulfonylurea-long', 'first-gen-antihistamine'], comorbidities: [] });
  assert.equal(r.pimFlags.length, 2);
  assert.equal(r.diseaseFlags.length, 0);
  assert.equal(r.drugDrugFlags.length, 0);
  assert.match(r.pimFlags[0].recommendation, /Avoid/);
});

test('age 80, digoxin-high + heart failure -> PIM + Table 3 HF flag', () => {
  const r = beersCheck({ ageYears: 80, medications: ['digoxin-high'], comorbidities: ['heart-failure'] });
  assert.equal(r.pimFlags.length, 1);
  assert.equal(r.diseaseFlags.length, 1);
  assert.match(r.diseaseFlags[0].text, /0\.125/);
});

test('age 70, empty meds, empty comorbid -> no flags, no-meds summary', () => {
  const r = beersCheck({ ageYears: 70, medications: [], comorbidities: [] });
  assert.equal(r.totalFlags, 0);
  assert.match(r.summary, /No medications selected/);
});

test('age 60 (below Beers band) -> banner is set, flags still computed', () => {
  const r = beersCheck({ ageYears: 60, medications: ['benzodiazepine'], comorbidities: [] });
  assert.equal(r.pimFlags.length, 1);
  assert.ok(r.banners.some((b) => /Age < 65/.test(b)));
});

test('age 65 boundary -> in-band banner', () => {
  const r = beersCheck({ ageYears: 65, medications: [], comorbidities: [] });
  assert.ok(r.banners.some((b) => /aged 65\+/.test(b)));
});

test('NSAID + CKD + HF + GI-bleed -> three separate Table 3 flags', () => {
  const r = beersCheck({ ageYears: 75, medications: ['nsaid-systemic'], comorbidities: ['ckd', 'heart-failure', 'gi-bleed-history'] });
  assert.equal(r.diseaseFlags.length, 3);
});

test('opioid + gabapentinoid drug-drug flag', () => {
  const r = beersCheck({ ageYears: 80, medications: ['opioid', 'gabapentinoid'], comorbidities: [] });
  assert.equal(r.drugDrugFlags.length, 1);
  assert.match(r.drugDrugFlags[0].text, /respiratory-depression/);
});

test('opioid + z-drug drug-drug flag (Table 6 moderate)', () => {
  const r = beersCheck({ ageYears: 80, medications: ['opioid', 'z-drug'], comorbidities: [] });
  assert.equal(r.drugDrugFlags.length, 1);
  assert.match(r.drugDrugFlags[0].text, /CNS depression/);
});

test('duplicate medication entries collapse', () => {
  const r = beersCheck({ ageYears: 80, medications: ['benzodiazepine', 'benzodiazepine'], comorbidities: [] });
  assert.equal(r.pimFlags.length, 1);
});

test('rejects unknown medication category', () => {
  assert.throws(() => beersCheck({ ageYears: 70, medications: ['acetaminophen'], comorbidities: [] }));
});

test('rejects unknown comorbidity', () => {
  assert.throws(() => beersCheck({ ageYears: 70, medications: [], comorbidities: ['hyperlipidemia'] }));
});

test('rejects non-numeric age and out-of-range age', () => {
  assert.throws(() => beersCheck({ ageYears: 'eighty', medications: [], comorbidities: [] }));
  assert.throws(() => beersCheck({ ageYears: 5, medications: [], comorbidities: [] }));
  assert.throws(() => beersCheck({ ageYears: 200, medications: [], comorbidities: [] }));
});

test('rejects non-array medications/comorbidities', () => {
  assert.throws(() => beersCheck({ ageYears: 70, medications: 'benzo', comorbidities: [] }));
  assert.throws(() => beersCheck({ ageYears: 70, medications: [], comorbidities: 'falls' }));
});

test('BEERS_PIM vocabulary covers 14 categories; BEERS_DISEASE covers 8', () => {
  assert.equal(Object.keys(BEERS_PIM).length, 15);
  assert.equal(Object.keys(BEERS_DISEASE).length, 8);
});
