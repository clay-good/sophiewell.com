// spec-v190 §2: hepatology / GI instruments - PALBI grade, MELD-Na, Clichy,
// Rome IV IBS. Coefficients / boundaries / criteria cross-verified (spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palbi, meldNa, clichy, romeIvIbs } from '../../lib/hepgi-v190.js';

test('palbi: three grades across the two cut-points', () => {
  // bilirubin 0.5 mg/dL, albumin 4.5 g/dL, platelets 300 -> ~ -2.66 -> grade 1
  const g1 = palbi({ bilirubin: 0.5, albumin: 4.5, platelets: 300 });
  assert.equal(g1.grade, 1);
  assert.ok(g1.score <= -2.53);
  // bilirubin 1.0, albumin 4.0, platelets 250 -> ~ -2.21 -> grade 2
  const g2 = palbi({ bilirubin: 1.0, albumin: 4.0, platelets: 250 });
  assert.equal(g2.grade, 2);
  assert.ok(g2.score > -2.53 && g2.score <= -2.09);
  // bilirubin 5.0, albumin 2.5, platelets 80 -> ~ -1.44 -> grade 3
  const g3 = palbi({ bilirubin: 5.0, albumin: 2.5, platelets: 80 });
  assert.equal(g3.grade, 3);
  assert.ok(g3.score > -2.09);
  assert.equal(palbi({ bilirubin: 1 }).valid, false);
});

test('meld-na: hyponatremia adjustment, flooring, dialysis, bounds', () => {
  // bili 2, INR 1.5, Cr 1.5, Na 130 -> MELD(i) 17, MELD-Na 22
  const r = meldNa({ bilirubin: 2, inr: 1.5, creatinine: 1.5, sodium: 130 });
  assert.equal(r.meldI, 17);
  assert.equal(r.score, 22);
  // all labs floored to 1.0, Na 140 -> MELD(i) 6, no sodium adjustment, floor 6
  const low = meldNa({ bilirubin: 0.5, inr: 1.0, creatinine: 0.8, sodium: 140 });
  assert.equal(low.meldI, 6);
  assert.equal(low.score, 6);
  // dialysis sets creatinine to 4.0
  const dial = meldNa({ bilirubin: 3, inr: 2, creatinine: 0.9, sodium: 128, dialysis: '1' });
  assert.equal(dial.meldI, 32);
  assert.equal(dial.score, 34);
  assert.equal(meldNa({ bilirubin: 2, inr: 1.5 }).valid, false);
});

test('clichy: age-branched factor-V threshold', () => {
  assert.equal(clichy({ age: 25, factorV: 15, encephalopathy: '1' }).met, true);  // <30 -> <20
  assert.equal(clichy({ age: 25, factorV: 25, encephalopathy: '1' }).met, false); // 25 !< 20
  assert.equal(clichy({ age: 40, factorV: 25, encephalopathy: '1' }).met, true);  // >=30 -> <30
  assert.equal(clichy({ age: 40, factorV: 35, encephalopathy: '1' }).met, false); // 35 !< 30
  assert.equal(clichy({ age: 25, factorV: 15, encephalopathy: false }).met, false); // no HE
  assert.equal(clichy({ age: 40, factorV: 25, encephalopathy: '1' }).threshold, 30);
  assert.equal(clichy({ factorV: 15 }).valid, false);
});

test('rome-iv-ibs: met/not-met and subtype', () => {
  const met = romeIvIbs({ painFrequency: '1', onset6mo: '1', defecation: '1', stoolFrequency: '1', subtype: 'ibs-d' });
  assert.equal(met.met, true);
  assert.match(met.subtype, /IBS-D/);
  assert.equal(met.associated, 2);
  // only one associated feature -> not met
  assert.equal(romeIvIbs({ painFrequency: '1', onset6mo: '1', defecation: '1' }).met, false);
  // no pain -> not met
  assert.equal(romeIvIbs({ onset6mo: '1', defecation: '1', stoolFrequency: '1' }).met, false);
  // met but no subtype selected
  const noSub = romeIvIbs({ painFrequency: '1', onset6mo: '1', stoolFrequency: '1', stoolForm: '1' });
  assert.equal(noSub.met, true);
  assert.equal(noSub.subtype, null);
});
