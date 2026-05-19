// spec-v12 §3.7.1 wave 12-7: Charlson Comorbidity Index boundary
// examples per Charlson ME, et al. J Chronic Dis. 1987;40(5):373-383
// (weights and Table 4 mortality) and Charlson 1994 J Clin Epidemiol
// (age adjustment, 1 point per decade >=50, capped at 4).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charlson } from '../../lib/scoring-v4.js';

test('charlson low: age 40, no comorbidities -> 0 (~12% per Table 4)', () => {
  const r = charlson({ items: {}, ageYears: 40 });
  assert.equal(r.score, 0);
  assert.match(r.band, /12%/);
});

test('charlson age adjustment: 55 -> 1; 65 -> 2; 75 -> 3; 85 -> 4 (capped)', () => {
  assert.equal(charlson({ items: {}, ageYears: 55 }).ageAdj, 1);
  assert.equal(charlson({ items: {}, ageYears: 65 }).ageAdj, 2);
  assert.equal(charlson({ items: {}, ageYears: 75 }).ageAdj, 3);
  assert.equal(charlson({ items: {}, ageYears: 85 }).ageAdj, 4);
  assert.equal(charlson({ items: {}, ageYears: 95 }).ageAdj, 4);
});

test('charlson 1-pt comorbidity weights sum correctly', () => {
  const r = charlson({ items: { mi: true, chf: true, copd: true }, ageYears: 40 });
  assert.equal(r.comorbidity, 3);
  assert.equal(r.score, 3);
});

test('charlson severity dominance: diabetesEndOrgan suppresses uncomplicated', () => {
  const r = charlson({ items: { diabetesUncomplicated: true, diabetesEndOrgan: true }, ageYears: 40 });
  assert.equal(r.comorbidity, 2);
});

test('charlson severity dominance: modSevereLiver suppresses mildLiver', () => {
  const r = charlson({ items: { mildLiver: true, modSevereLiver: true }, ageYears: 40 });
  assert.equal(r.comorbidity, 3);
});

test('charlson severity dominance: metastaticSolidTumor suppresses anyTumor', () => {
  const r = charlson({ items: { anyTumor: true, metastaticSolidTumor: true }, ageYears: 40 });
  assert.equal(r.comorbidity, 6);
});

test('charlson high (band >=5): age 75 + CHF + COPD + mets -> 11', () => {
  const r = charlson({ items: { chf: true, copd: true, metastaticSolidTumor: true }, ageYears: 75 });
  // age adj 3 + 1 + 1 + 6 = 11
  assert.equal(r.score, 11);
  assert.match(r.band, /85%/);
});

test('charlson 1-2 band: age 55 -> 1 maps to ~26% band', () => {
  const r = charlson({ items: {}, ageYears: 55 });
  assert.equal(r.score, 1);
  assert.match(r.band, /26%/);
});

test('charlson 3-4 band: age 65 + MI + CHF -> 4 maps to ~52%', () => {
  const r = charlson({ items: { mi: true, chf: true }, ageYears: 65 });
  assert.equal(r.score, 4);
  assert.match(r.band, /52%/);
});
