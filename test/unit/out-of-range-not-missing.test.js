// spec-v1226: a refusal with no way out.
//
// `scripts/probe-envelope-unbounded.mjs` keeps these in a section of their own,
// apart from the tiles that answer FROM an impossible value, because it is a
// different defect: not a wrong answer, a loop. The cause is one line, copied
// into eighteen library files:
//
//   function pos(v, max) {
//     ...
//     if (!Number.isFinite(n) || n <= 0 || n > max) return null;   // three
//     return n;                                                    // things,
//   }                                                              // one null
//
// Blank, non-numeric and out-of-range all return `null`, and every caller reads
// `null` as absent. So a reader who typed a hematocrit of 750% was told *"Enter
// hematocrit (%) and hemoglobin (g/dL), both greater than 0"*, retyped the same
// number, and got the same sentence back.
//
// `gradeFault` (lib/num.js, spec-v1209) is the half that tells the two apart: it
// SKIPS a blank, so each function's own missing-value message still runs and
// still names every empty field at once, and it reports only the value that is
// out of range -- by name, with the range.
//
// THE BOUNDS ARE THE CALLERS' OWN, copied from the `pos` / `real` / `inRange`
// call that already enforced them silently. No envelope moves in this wave: the
// same inputs are accepted and rejected as before, and the rejected ones now say
// why.
import test from 'node:test';
import assert from 'node:assert/strict';

import { watsonTbw, salazarCorcoran, epvs, furosemideStressTest, feBicarbonate, correctedPotassiumPh } from '../../lib/nephrology-v226.js';
import { abicScore, globeScore, pageB, mayoPscRisk } from '../../lib/liver-v196.js';
import { papi, shuntFraction } from '../../lib/hemo-v194.js';

const CHECK = /Check the value entered/;
const ASKS = /^Enter /;

test('epvs names the hematocrit it rejected instead of asking for it again', () => {
  const bad = epvs({ hematocrit: 750, hemoglobin: 12 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /hematocrit in % must be greater than 0 and at most 100/i);
  assert.match(bad.message, CHECK);
  // A blank field is still asked for, in the tile's own words.
  assert.match(epvs({ hemoglobin: 12 }).message, ASKS);
  assert.equal(epvs({ hematocrit: 45, hemoglobin: 12 }).value, 4.58);
});

test('corrected-potassium-ph names whichever of the two is out of range', () => {
  assert.match(correctedPotassiumPh({ potassium: 100, ph: 7.2 }).message, /potassium in mEq\/L must be greater than 0 and at most 20/i);
  assert.match(correctedPotassiumPh({ potassium: 4, ph: 9 }).message, /arterial pH must be between 6.5 and 8/i);
  assert.match(correctedPotassiumPh({ ph: 7.2 }).message, ASKS);
  assert.equal(correctedPotassiumPh({ potassium: 4, ph: 7.2 }).corrected, 2.8);
});

test('the other four nephrology tiles carry the same distinction', () => {
  assert.match(watsonTbw({ age: 900, height: 170, weight: 80 }).message, CHECK);
  assert.match(salazarCorcoran({ age: 60, weight: 120, height: 170, creatinine: 500 }).message, /creatinine in mg\/dL must be/i);
  assert.match(furosemideStressTest({ weight: 900, urineOutput2h: 150 }).message, CHECK);
  assert.match(feBicarbonate({ urineHco3: 20, plasmaHco3: 600, plasmaCr: 1.2, urineCr: 60 }).message, CHECK);
  // and each still answers at its own worked values
  assert.equal(watsonTbw({ age: 60, height: 170, weight: 80 }).value, 42.1);
  assert.equal(salazarCorcoran({ age: 60, weight: 120, height: 170, creatinine: 1.2 }).value, 87);
  assert.equal(furosemideStressTest({ weight: 80, urineOutput2h: 150 }).dose, 80);
  assert.equal(feBicarbonate({ urineHco3: 20, plasmaHco3: 24, plasmaCr: 1.2, urineCr: 60 }).value, 1.67);
});

test('the liver scores name the lab, in the words their own missing list uses', () => {
  const bad = abicScore({ age: 50, bilirubin: 600, creatinine: 1.2, inr: 1.5 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /^Bilirubin \(mg\/dL\) must be/);
  // Same field, same words, when it is blank rather than impossible.
  assert.match(abicScore({ age: 50, creatinine: 1.2, inr: 1.5 }).message, /^Enter the bilirubin \(mg\/dL\)\.$/);
  assert.equal(abicScore({ age: 50, bilirubin: 6, creatinine: 1.2, inr: 1.5 }).value, 7.04);

  assert.match(globeScore({ age: 50, bili: 1, alp: 1, albumin: 1, platelets: 20000 }).message, /^Platelet count \(× 10⁹\/L\) must be/);
  assert.match(pageB({ age: 50, platelets: 20000, sex: 'male' }).message, /^Platelet count \(× 10⁹\/L\) must be/);
  assert.match(mayoPscRisk({ age: 50, bilirubin: 600, albumin: 3, ast: 80 }).message, /^Bilirubin \(mg\/dL\) must be/);
});

test('the haemodynamic tiles do too', () => {
  assert.match(papi({ pasp: 3000, padp: 20, rap: 8 }).message, /^PA systolic pressure \(mmHg\) must be/);
  assert.match(papi({ padp: 20, rap: 8 }).message, ASKS);
  assert.equal(papi({ pasp: 50, padp: 20, rap: 8 }).value, 3.75);
  assert.match(shuntFraction({ hb: 300, pAO2: 600, sao2: 98, pao2: 90, svo2: 70, pvo2: 40 }).message, /^Hemoglobin \(g\/dL\) must be/);
});

// The rule that must not break (spec-v1207): the range check runs where a blank
// still reaches the missing-value branch. If a tile has one blank field and one
// impossible one, the reader must not be sent to the field they already filled.
test('a blank field and an impossible one are reported separately', () => {
  const both = abicScore({ bilirubin: 600, creatinine: 1.2, inr: 1.5 });
  assert.match(both.message, /must be/); // the impossible value wins, and it names itself
  assert.doesNotMatch(both.message, /^Enter /);
  assert.match(abicScore({ creatinine: 1.2, inr: 1.5 }).message, /^Enter the age \(years\), bilirubin \(mg\/dL\)\.$/);
});
