// spec-v1764: a tool's own plausibility cap sat inside the lib/bounds.js envelope
// that spec-v1763 widened to sit past survived values, so the tool refused a
// value a patient lived through. Each case below lies between the old own cap and
// the envelope, and now answers. The scoring rules (MELD's creatinine cap of 4,
// sodium bounded to 125-137, the ADHERE splits) are untouched.
import test from 'node:test';
import assert from 'node:assert/strict';

import { palbi, meldNa } from '../../lib/hepgi-v190.js';
import { meld3 } from '../../lib/meld3-v678.js';
import { adhereHf } from '../../lib/risk-v192.js';
import { aec, plr, sii } from '../../lib/hematology-v229.js';
import { binetCll, raiCll } from '../../lib/heme-staging-v188.js';
import { piv } from '../../lib/inflam-v230.js';
import { fips } from '../../lib/hepatology-prognosis-v220.js';
import { salazarCorcoran, feBicarbonate } from '../../lib/nephrology-v226.js';
import { cpisVap } from '../../lib/critcare-v112.js';

test('palbi answers a platelet count of 3500 (old own cap 3000, envelope 4000)', () => {
  assert.equal(palbi({ bilirubin: 1.0, albumin: 4.0, platelets: 3500 }).valid, true);
  assert.equal(palbi({ bilirubin: 1.0, albumin: 4.0, platelets: 4001 }).valid, false);
});

test('meldNa answers a creatinine of 60 and a sodium of 205 (old own caps 40 and 200)', () => {
  const base = { bilirubin: 2, inr: 1.5, creatinine: 1.5, sodium: 130 };
  const cr = meldNa({ ...base, creatinine: 60 });
  assert.equal(cr.valid, true);
  // The scoring cap of 4.0 still applies, so 60 scores exactly as 4 does.
  assert.equal(cr.score, meldNa({ ...base, creatinine: 4 }).score);
  const na = meldNa({ ...base, sodium: 205 });
  assert.equal(na.valid, true);
  assert.equal(na.score, meldNa({ ...base, sodium: 137 }).score);
  assert.equal(meldNa({ ...base, sodium: 211 }).valid, false);
});

test('meld3 answers a creatinine of 60 and a sodium of 205 (old own caps 40 and 200)', () => {
  const base = { sex: 'male', bilirubin: '2', inr: '1.5', creatinine: '2', sodium: '130', albumin: '2.5' };
  const cr = meld3({ ...base, creatinine: '60' });
  assert.equal(cr.valid, true);
  assert.equal(cr.score, meld3({ ...base, creatinine: '3.0' }).score);
  const na = meld3({ ...base, sodium: '205' });
  assert.equal(na.valid, true);
  assert.equal(na.score, meld3({ ...base, sodium: '137' }).score);
  assert.equal(meld3({ ...base, creatinine: '75.5' }).valid, false);
  assert.equal(meld3({ ...base, sodium: '211' }).valid, false);
});

test('adhereHf answers an SBP of 400 and a creatinine of 60 (old own caps 300 and 40)', () => {
  const hiBp = adhereHf({ bun: 50, sbp: 400 });
  assert.equal(hiBp.valid, true);
  assert.equal(adhereHf({ bun: 50, sbp: 501 }).valid, false);
  const cr = adhereHf({ bun: 50, sbp: 100, creatinine: 60 });
  assert.equal(cr.valid, true);
  assert.equal(cr.group, 'high');
});

test('aec answers a WBC of 1500 (old own cap 500, envelope 2000)', () => {
  const r = aec({ wbc: 1500, eosPct: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 15000);
});

test('plr and sii answer a platelet count of 3500 (old own cap 3000, envelope 4000)', () => {
  assert.equal(plr({ plt: 3500, alc: 1.5 }).valid, true);
  assert.equal(sii({ plt: 3500, anc: 6, alc: 1.5 }).valid, true);
});

test('binetCll and raiCll answer a platelet count of 3500 (old own cap 3000, envelope 4000)', () => {
  assert.equal(binetCll({ areas: 1, hb: 12, platelets: 3500 }).valid, true);
  assert.equal(raiCll({ lymphocytosis: true, lymphadenopathy: true, hb: 14, platelets: 3500 }).valid, true);
});

test('piv answers a platelet count of 3500 (old own cap 3000, envelope 4000)', () => {
  assert.equal(piv({ anc: 4.0, plt: 3500, amc: 0.5, alc: 2.0 }).valid, true);
});

test('fips answers a creatinine of 60 (old own cap 50, envelope 75)', () => {
  assert.equal(fips({ bilirubin: 3.0, creatinine: 60, age: 60, albumin: 3.0 }).valid, true);
});

test('salazarCorcoran and feBicarbonate answer a creatinine of 60 (old own cap 50, envelope 75)', () => {
  assert.equal(salazarCorcoran({ age: 50, weight: 120, height: 170, female: false, creatinine: 60 }).valid, true);
  assert.equal(feBicarbonate({ urineHco3: 20, plasmaHco3: 24, plasmaCr: 60, urineCr: 50 }).valid, true);
});

test('cpisVap answers a leukocyte count of 1,500,000/mm3 (old own cap 200,000, envelope 2,000,000)', () => {
  const ok = { temp: 38, wbc: 1500000, secretions: 'none', oxygenation: 'ok', radiograph: 'none', culture: 'none' };
  assert.notEqual(cpisVap(ok).valid, false);
});
