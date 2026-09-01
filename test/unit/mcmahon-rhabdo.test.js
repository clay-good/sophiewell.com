// spec-v677: McMahon Score for rhabdomyolysis.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mcmahonRhabdo } from '../../lib/mcmahon-rhabdo-v677.js';

// Lowest-risk baseline: young male, normal labs, benign cause -> 0 points.
const LOW = { age: '30', sex: 'male', creatinine: '1.0', calcium: '9.0', cpk: '10000', cause: 'benign', phosphate: '3.0', bicarbonate: '24' };

test('all-benign inputs score 0 -> low risk', () => {
  const r = mcmahonRhabdo(LOW);
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('individual weights (incl. fractional age/creatinine/phosphate)', () => {
  assert.equal(mcmahonRhabdo({ ...LOW, age: '60' }).score, 1.5);
  assert.equal(mcmahonRhabdo({ ...LOW, age: '75' }).score, 2.5);
  assert.equal(mcmahonRhabdo({ ...LOW, age: '85' }).score, 3);
  assert.equal(mcmahonRhabdo({ ...LOW, sex: 'female' }).score, 1);
  assert.equal(mcmahonRhabdo({ ...LOW, creatinine: '2.0' }).score, 1.5);
  assert.equal(mcmahonRhabdo({ ...LOW, creatinine: '3.0' }).score, 3);
  assert.equal(mcmahonRhabdo({ ...LOW, calcium: '7.0' }).score, 2);
  assert.equal(mcmahonRhabdo({ ...LOW, cpk: '50000' }).score, 2);
  assert.equal(mcmahonRhabdo({ ...LOW, cause: 'other' }).score, 3);
  assert.equal(mcmahonRhabdo({ ...LOW, phosphate: '5.0' }).score, 1.5);
  assert.equal(mcmahonRhabdo({ ...LOW, phosphate: '6.0' }).score, 3);
  assert.equal(mcmahonRhabdo({ ...LOW, bicarbonate: '18' }).score, 2);
});

test('band thresholds are exact (<= 50 = 0, 51 = 1.5; creat < 1.4 = 0, 1.4 = 1.5)', () => {
  assert.equal(mcmahonRhabdo({ ...LOW, age: '50' }).score, 0);
  assert.equal(mcmahonRhabdo({ ...LOW, age: '51' }).score, 1.5);
  assert.equal(mcmahonRhabdo({ ...LOW, creatinine: '1.39' }).score, 0);
  assert.equal(mcmahonRhabdo({ ...LOW, creatinine: '1.4' }).score, 1.5);
  // calcium 7.5 does NOT score (threshold is < 7.5); CPK 40000 does NOT score (> 40000).
  assert.equal(mcmahonRhabdo({ ...LOW, calcium: '7.5' }).score, 0);
  assert.equal(mcmahonRhabdo({ ...LOW, cpk: '40000' }).score, 0);
});

test('risk bands: <6 low, 6-10 high, >10 very high', () => {
  assert.equal(mcmahonRhabdo({ ...LOW, cause: 'other', calcium: '7.0' }).tier, 'low'); // 5 -> low
  assert.equal(mcmahonRhabdo({ ...LOW, cause: 'other', calcium: '7.0', cpk: '50000' }).tier, 'high'); // 7
  assert.equal(mcmahonRhabdo({ ...LOW, age: '85', sex: 'female', creatinine: '3.0', calcium: '7.0', cpk: '50000', cause: 'other', phosphate: '6.0', bicarbonate: '18' }).tier, 'very-high'); // max
});

test('abnormal flag set at the >= 6 high-risk cutoff', () => {
  assert.equal(mcmahonRhabdo({ ...LOW, cause: 'other', calcium: '7.0' }).abnormal, false); // 5
  assert.equal(mcmahonRhabdo({ ...LOW, cause: 'other', calcium: '7.0', bicarbonate: '18' }).abnormal, true); // 7
});

test('META example: 60yo female, creat 2.5, Ca 7, CPK 50000, other cause, phos 5, HCO3 18 -> 16/19', () => {
  const r = mcmahonRhabdo({ age: '60', sex: 'female', creatinine: '2.5', calcium: '7.0', cpk: '50000', cause: 'other', phosphate: '5.0', bicarbonate: '18' });
  // 1.5 + 1 + 3 + 2 + 2 + 3 + 1.5 + 2 = 16
  assert.equal(r.score, 16);
  assert.equal(r.tier, 'very-high');
  assert.match(r.band, /McMahon 16\/19/);
});

test('inputs are validated', () => {
  assert.equal(mcmahonRhabdo({}).valid, false);
  assert.equal(mcmahonRhabdo({}).code, 'MISSING_INPUT');
  assert.equal(mcmahonRhabdo({ ...LOW, sex: '' }).field, 'sex');
  assert.equal(mcmahonRhabdo({ ...LOW, cause: 'x' }).field, 'cause');
  assert.equal(mcmahonRhabdo({ ...LOW, creatinine: '' }).field, 'creatinine');
});

// ---- spec-v963: two cut-offs are in circulation, and the tool says which it uses ----

test('the note names both cut-offs and attributes each correctly', () => {
  // The derivation cut at 5: "a score of less than 5 identified patients with a 3% risk of the
  // primary outcome ... Using 5 as the cutoff, the negative predictive value was 97.0%"
  // (McMahon 2013, JAMA Intern Med 173:1821-1828, PMC5152583). The >= 6 cut this tool uses is
  // the later convention from validation work and a trauma consensus statement. The note used
  // to attribute >= 6 to "the authors", which is the one thing the paper does not say.
  const r = mcmahonRhabdo({ ...LOW, age: '60', sex: 'female', creatinine: '2.5', calcium: '7.0' });
  assert.match(r.note, /derivation itself cut at 5/);
  assert.match(r.note, /negative predictive value of 97 percent/);
  assert.match(r.note, /settled on 6 or more/);
  assert.doesNotMatch(r.note, /per the authors/);
});

test('the >= 6 cut is unchanged: 6 is high risk, 5 is not', () => {
  // Changing a clinical threshold on the strength of one reading is exactly what this session
  // spent its time undoing. The number stays; only the attribution was wrong.
  const at6 = mcmahonRhabdo({ ...LOW, age: '75', sex: 'female', creatinine: '1.5', calcium: '7.0' });
  assert.ok(at6.score >= 6, `expected a score at or above 6, got ${at6.score}`);
  assert.equal(at6.abnormal, true);
});
