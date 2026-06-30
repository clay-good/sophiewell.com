// spec-v181 §2.1: Revised McGeer surveillance definitions (Stone 2012).
// Categorical MEETS / DOES NOT MEET, site-branched. Each test flips the
// determination at a criterion boundary. Criteria cross-verified against Stone
// 2012 + the MO DHSS / MN DOH field tools (spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mcgeerCriteria as mcg, MCGEER_SITES } from '../../lib/ltcga-v181.js';

test('no site selected -> complete-the-fields fallback', () => {
  assert.equal(mcg({}).valid, false);
  assert.equal(mcg({ site: '' }).valid, false);
  assert.equal(mcg({ site: 'not-a-site', acuteDysuria: '1' }).valid, false);
});

test('site selected but no finding checked -> fallback, never a false meets', () => {
  const r = mcg({ site: 'uti-no-catheter' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Check the findings/);
});

test('UTI without catheter: dysuria + positive voided culture MEETS; culture alone DOES NOT', () => {
  const meets = mcg({ site: 'uti-no-catheter', acuteDysuria: '1', voidedCulture: '1' });
  assert.equal(meets.valid, true);
  assert.equal(meets.meets, true);
  assert.match(meets.determination, /^MEETS/);

  // clinical present but no culture -> does not meet (the microbiologic gap)
  const noCulture = mcg({ site: 'uti-no-catheter', acuteDysuria: '1' });
  assert.equal(noCulture.meets, false);
  assert.match(noCulture.blocker, /urine culture/);

  // culture present but no localizing clinical criterion -> does not meet
  const noClinical = mcg({ site: 'uti-no-catheter', voidedCulture: '1' });
  assert.equal(noClinical.meets, false);
});

test('UTI without catheter subB needs fever/leukocytosis PLUS >=1 localizing', () => {
  // fever + 1 localizing + culture -> meets
  assert.equal(mcg({ site: 'uti-no-catheter', fever: '1', urgency: '1', voidedCulture: '1' }).meets, true);
  // fever alone (no localizing) + culture -> does not meet
  assert.equal(mcg({ site: 'uti-no-catheter', fever: '1', voidedCulture: '1' }).meets, false);
  // subC: no fever/leukocytosis but 2 localizing + culture -> meets
  assert.equal(mcg({ site: 'uti-no-catheter', suprapubicPain: '1', frequency: '1', voidedCulture: '1' }).meets, true);
  // subC with only 1 localizing -> does not meet (the 2-of boundary)
  assert.equal(mcg({ site: 'uti-no-catheter', suprapubicPain: '1', voidedCulture: '1' }).meets, false);
});

test('UTI with catheter: 1 clinical + catheter culture MEETS; culture alone DOES NOT', () => {
  assert.equal(mcg({ site: 'uti-catheter', feverRigorsHypotension: '1', catheterCulture: '1' }).meets, true);
  assert.equal(mcg({ site: 'uti-catheter', catheterCulture: '1' }).meets, false);
  assert.equal(mcg({ site: 'uti-catheter', feverRigorsHypotension: '1' }).meets, false);
});

test('common cold/pharyngitis flips at the 2-of boundary', () => {
  assert.equal(mcg({ site: 'common-cold', runnyNose: '1' }).meets, false);
  assert.equal(mcg({ site: 'common-cold', runnyNose: '1', dryCough: '1' }).meets, true);
});

test('influenza-like illness needs fever AND >=3 subcriteria', () => {
  assert.equal(mcg({ site: 'influenza-like', fever: '1', chills: '1', myalgias: '1' }).meets, false); // only 2 sub
  assert.equal(mcg({ site: 'influenza-like', fever: '1', chills: '1', myalgias: '1', malaise: '1' }).meets, true); // 3 sub
  assert.equal(mcg({ site: 'influenza-like', chills: '1', myalgias: '1', malaise: '1' }).meets, false); // no fever
});

test('pneumonia: CXR + >=1 respiratory + >=1 constitutional (all 3 required)', () => {
  assert.equal(mcg({ site: 'pneumonia', cxrPneumonia: '1', newCough: '1', constFever: '1' }).meets, true);
  assert.equal(mcg({ site: 'pneumonia', newCough: '1', constFever: '1' }).meets, false); // no CXR
  assert.equal(mcg({ site: 'pneumonia', cxrPneumonia: '1', constFever: '1' }).meets, false); // no respiratory
  assert.equal(mcg({ site: 'pneumonia', cxrPneumonia: '1', newCough: '1' }).meets, false); // no constitutional
});

test('lower-RTI: negative/absent CXR + >=2 respiratory + constitutional', () => {
  assert.equal(mcg({ site: 'lower-rti', cxrNegative: '1', newCough: '1', rr25: '1', constLeukocytosis: '1' }).meets, true);
  // only 1 respiratory subcriterion -> does not meet (the >=2 boundary)
  assert.equal(mcg({ site: 'lower-rti', cxrNegative: '1', newCough: '1', constLeukocytosis: '1' }).meets, false);
});

test('skin/soft tissue: pus alone MEETS; otherwise >=4 of the local signs', () => {
  assert.equal(mcg({ site: 'skin', pus: '1' }).meets, true);
  assert.equal(mcg({ site: 'skin', heat: '1', redness: '1', swelling: '1' }).meets, false); // 3
  assert.equal(mcg({ site: 'skin', heat: '1', redness: '1', swelling: '1', tenderness: '1' }).meets, true); // 4
});

test('conjunctivitis: any single criterion MEETS', () => {
  assert.equal(mcg({ site: 'conjunctivitis', erythema: '1' }).meets, true);
});

test('gastroenteritis: diarrhea alone MEETS; stool pathogen needs a GI symptom', () => {
  assert.equal(mcg({ site: 'gastroenteritis', diarrhea: '1' }).meets, true);
  assert.equal(mcg({ site: 'gastroenteritis', stoolPathogen: '1' }).meets, false);
  assert.equal(mcg({ site: 'gastroenteritis', stoolPathogen: '1', nausea: '1' }).meets, true);
});

test('output is categorical with no numeric leak, and names satisfied criteria', () => {
  const r = mcg({ site: 'uti-no-catheter', acuteDysuria: '1', voidedCulture: '1' });
  assert.ok(Array.isArray(r.satisfied) && r.satisfied.length >= 1);
  assert.equal(typeof r.meets, 'boolean');
  assert.ok(!JSON.stringify(r).includes('NaN'));
});

test('every site has a stable value, label, and at least one criterion', () => {
  for (const s of MCGEER_SITES) {
    assert.ok(s.value && s.label && Array.isArray(s.criteria) && s.criteria.length >= 1);
  }
});
