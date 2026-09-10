// spec-v1232: seven more threshold-comparison tiles, and the unit trap that
// decides how many of a tile's fields can be checked at all.
//
//   plasmic-ttp     platelets 20000 -> an ADAMTS13 probability band
//   french-ttp      creatinine 250  -> "intermediate probability of severe
//                                       ADAMTS13 deficiency"
//   jaam-dic        platelets 20000 -> "3 of 8 -- below the DIC threshold"
//   albi-grade      bilirubin 600   -> "grade 3: the poorest liver function"
//   meld-xi         bilirubin 600   -> "MELD-XI 47"
//   glasgow-imrie   WBC 2000        -> "predicts severe pancreatitis; 8 of 8
//                                       items assessed"
//   truelove-witts  temperature 450 -> the one systemic criterion that turns six
//                                       bloody stools into SEVERE
//
// `glasgow-imrie` is where spec-v1205's rule bites: an envelope is a claim about
// a quantity IN A UNIT. Imrie states calcium in mmol/L, albumin in g/L and
// glucose in mmol/L; BOUNDS holds all three in mg/dL and g/dL. Applying them
// would refuse every legitimate value on the tile. Two of the eight items match
// their envelope's unit and two are checked -- WBC, where x10^9/L is the same
// number as x10^3/uL, and PaO2 in mmHg. The test below pins BOTH halves: the
// impossible WBC is refused AND a legitimate calcium of 2.2 mmol/L still scores.
//
// `albi-grade` is the half-guarded shape: its albumin ceiling has been in place
// since spec-v1178 and the bilirubin beside it had none.
import test from 'node:test';
import assert from 'node:assert/strict';

import { plasmicTtp, frenchTtp, jaamDic } from '../../lib/heme-v132.js';
import { albiGrade, meldXi } from '../../lib/hep-v124.js';
import { glasgowImrie, trueloveWitts } from '../../lib/hepgi-v93.js';

const PLT = /plausible range for platelet count/;
const SCR = /plausible range for serum creatinine/;
const BILI = /plausible range for total bilirubin/;

test('the two TTP scores and JAAM DIC refuse the lab their criteria compare', () => {
  const P = { platelet: 18, hemolysis: 'yes', activeCancer: 'no', transplant: 'no', mcv: 85, inr: 1.2, creatinine: 2.4 };
  assert.match(plasmicTtp({ ...P, platelet: 20000 }).message, PLT);
  assert.match(plasmicTtp({ ...P, creatinine: 250 }).message, SCR);
  assert.equal(plasmicTtp(P).total, 6);

  const F = { platelet: 22, creatinine: 1.1, ana: 'no' };
  assert.match(frenchTtp({ ...F, platelet: 20000 }).message, PLT);
  assert.match(frenchTtp({ ...F, creatinine: 250 }).message, SCR);
  assert.equal(frenchTtp(F).total, 2);

  const J = { sirs: 'yes', platelet: 90, fdp: 30, ptRatio: 1.3 };
  assert.match(jaamDic({ ...J, platelet: 20000 }).message, PLT);
  assert.match(jaamDic({ ...J, priorPlatelet: 20000 }).message, PLT);
  assert.equal(jaamDic(J).total, 6);
  // A blank field is still asked for, in the tile's own words.
  assert.match(frenchTtp({ creatinine: 1.1, ana: 'no' }).message, /^Enter platelet count/);
});

test('albi-grade guards the bilirubin beside the albumin it already guarded', () => {
  assert.match(albiGrade({ albumin: 3.5, bilirubin: 600 }).message, BILI);
  // The spec-v1178 albumin guard is untouched, message and all.
  assert.match(albiGrade({ albumin: 70, bilirubin: 1.0 }).message, /is above ~7, beyond recorded extremes/);
  assert.match(albiGrade({ albumin: 3.5, bilirubin: 1.0 }).band, /ALBI score/);
});

test('meld-xi refuses the labs it floors and logs', () => {
  assert.match(meldXi({ bilirubin: 600, creatinine: 1.5 }).message, BILI);
  assert.match(meldXi({ bilirubin: 2.0, creatinine: 250 }).message, SCR);
  assert.match(meldXi({ bilirubin: 2.0, creatinine: 1.5 }).band, /^MELD-XI 18/);
});

test('glasgow-imrie checks the two items whose unit matches, and only those', () => {
  const G = { pao2: 70, age: 60, wbc: 12, calcium: 2.2, urea: 10, ldh: 400, albumin: 35, glucose: 8 };
  assert.match(glasgowImrie({ ...G, wbc: 2000 }).band, /white blood cell count/);
  assert.match(glasgowImrie({ ...G, pao2: 7000 }).band, /arterial PaO2/);
  // THE NEGATIVE HALF: calcium 2.2 mmol/L, albumin 35 g/L and glucose 8 mmol/L
  // are all outside their BOUNDS entries read as mg/dL and g/dL, and all three
  // are legitimate here. The tile must still score.
  assert.match(glasgowImrie(G).band, /Modified Glasgow \(Imrie\)/);
  assert.match(glasgowImrie({ ...G, calcium: 1.8, albumin: 28, glucose: 12 }).band, /Modified Glasgow \(Imrie\)/);
});

test('truelove-witts refuses the systemic values with an envelope in their own unit', () => {
  const T = { stools: 6, bleeding: 'present', temp: 38, heartRate: 95, hemoglobin: 9.5, esr: 35 };
  assert.match(trueloveWitts({ ...T, temp: 450 }).band, /core temperature/);
  assert.match(trueloveWitts({ ...T, heartRate: 3000 }).band, /heart rate/);
  assert.match(trueloveWitts({ ...T, hemoglobin: 250 }).band, /plausible range for hemoglobin/);
  // The ESR has no envelope and is left alone; the tile still grades.
  assert.match(trueloveWitts({ ...T, esr: 35 }).band, /severe/);
  assert.match(trueloveWitts({}).band, /^Enter the number of stools/);
});
