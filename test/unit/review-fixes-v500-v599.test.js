// Regression tests for the defects an independent review found in the spec-v500 to v599 tools on 2026-10-20
// (spec-v1678), each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hlh2004 } from '../../lib/hlh-2004-v582.js';
import { bolognaPor } from '../../lib/bologna-por-v588.js';
import { mayoAdpkd } from '../../lib/mayo-adpkd-v563.js';
import { ppmEoai } from '../../lib/ppm-eoai-v548.js';
import { nsofa } from '../../lib/nsofa-v526.js';
import { ffs1996 } from '../../lib/ffs-1996-v590.js';
import { rucam } from '../../lib/rucam-v585.js';
import { arcHbr } from '../../lib/arc-hbr-v594.js';
import { capthus } from '../../lib/capthus-v535.js';
import { acef } from '../../lib/acef-v595.js';

test('HLH-2004: a hemoglobin of 9.5 with the infant question blank is undecided, not "does not meet"', () => {
  const b = { molecularDiagnosis: 'no', fever: 'yes', splenomegaly: 'yes', hemophagocytosis: 'no', hemoglobin: '9.5', platelets: '50', neutrophils: '2', triglycerides: '300', fibrinogen: '200', nkCellActivity: 'no', ferritin: '900', scd25Status: 'resulted', scd25: '1000', noEvidenceOfMalignancy: 'yes' };
  assert.doesNotMatch(hlh2004({ ...b, infantUnder4Weeks: '' }).bandLabel, /^Does not meet/);
  assert.match(hlh2004({ ...b, infantUnder4Weeks: 'yes' }).bandLabel, /^Meets/);
  assert.match(hlh2004({ ...b, infantUnder4Weeks: 'no' }).bandLabel, /^Does not meet/);
});

test('Bologna: another risk factor does not block the maximal-stimulation override', () => {
  const r = bolognaPor({ age: '35', otherRiskFactor: 'yes', previousPorConventional: 'no', maximalStimulationPorEpisodes: '2', afc: '10', afcCutoff: '7', amh: '2', amhCutoff: '1.1' });
  assert.equal(r.poorResponder, true);
  assert.equal(r.overrideBlocked, false);
});

test('rates and indices are graded unrounded and printed on their side', () => {
  const m = (tkv) => mayoAdpkd({ morphology: '1', tkv: String(tkv), height: '1.75', age: '40' });
  assert.equal(m(476).subclass, '1A');
  assert.equal(m(2704).subclass, '1E');
  assert.match(ppmEoai({ position: 'aortic', eoa: '1.3', bsa: '2.01' }).bandLabel, /^EOAi 0\.647 .*severe/);
  assert.match(ppmEoai({ position: 'mitral', eoa: '1.809', bsa: '2' }).bandLabel, /moderate/);
  const ruc = rucam({ alt: '1249', altUln: '40', alp: '156.25', alpUln: '25', onset: 'first-5-90', course: 'fall-50-by-180-days', concomitant: 'none-or-incompatible', exclusion: 'all-excluded', priorInfo: 'labeled', rechallenge: 'not-done', ageAtLeast55: 'no', alcoholOrPregnancy: 'no' });
  assert.equal(ruc.rRatio, 4.996);
});

test('impossible or contradictory entries are refused', () => {
  assert.equal(nsofa({ intubated: 'yes', spo2: '92', fio2: '40', inotropes: '0', steroids: 'no', platelets: '200' }).valid, false);
  assert.equal(ffs1996({ proteinuria: 'no', renalInsufficiency: 'no', gastrointestinal: 'no', cardiomyopathy: 'no', cns: 'no', creatinineUmol: '300' }).valid, false);
  assert.equal(capthus({ calcium: 'no', pth: 'no', ultrasound: 'no', sestamibi: 'no', concordant: 'yes' }).valid, false);
  assert.equal(ppmEoai({ position: 'aortic', eoa: '1.3', bsa: '250' }).valid, false);
  assert.equal(acef({ age: '500', ejectionFraction: '50', creatinine: '1', hematocrit: '40', emergency: 'no' }).valid, false);
  assert.equal(acef({ age: '70', ejectionFraction: '50', creatinine: '1', hematocrit: '40', emergency: 'no' }).valid, true);
});

test('ARC-HBR: a hemoglobin of 12.95 in a man is minor anemia (below 13)', () => {
  const base = { sex: 'male', age: '60', hemoglobin: '12.95', egfr: '70', platelets: '200', priorBleeding: 'none', priorStroke: 'none', longTermOac: 'no', bleedingDiathesis: 'no', cirrhosisPortalHypertension: 'no', activeMalignancy12Months: 'no', spontaneousIchEver: 'no', traumaticIch12Months: 'no', brainAvm: 'no', nondeferrableSurgeryOnDapt: 'no', majorSurgeryOrTrauma30Days: 'no', longTermNsaidsOrSteroids: 'yes' };
  assert.match(arcHbr(base).bandLabel, /^High bleeding risk/);
});
