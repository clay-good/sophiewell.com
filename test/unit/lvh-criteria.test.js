// spec-v90 §2.2: ECG LVH voltage criteria (Sokolow-Lyon + Cornell voltage).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lvhCriteria } from '../../lib/cardio-v90.js';

test('worked example: Sokolow-Lyon positive, Cornell negative (male)', () => {
  const r = lvhCriteria({ sV1: 20, rV5: 18, rV6: 16, sV3: 12, rAVL: 10, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.sokolowSum, 38); // 20 + max(18,16)=18
  assert.equal(r.sokolowMet, true);
  assert.equal(r.cornellSum, 22); // 12 + 10
  assert.equal(r.cornellMet, false); // 22 not > 28
  assert.equal(r.anyMet, true);
});

test('Sokolow-Lyon 35 mm edge is met (>= 35)', () => {
  const at = lvhCriteria({ sV1: 17, rV5: 18, sex: 'male' });
  assert.equal(at.sokolowSum, 35);
  assert.equal(at.sokolowMet, true);
  // spec-v1149: this case used to assert `false` with RV6 left out, which is the
  // defect written down as an expectation -- 34 mm from one precordial lead is a
  // FLOOR, and an RV6 of 20 would meet the criterion. Both halves are asserted
  // now: undecided on one lead, negative on two.
  const belowOnOneLead = lvhCriteria({ sV1: 16, rV5: 18, sex: 'male' });
  assert.equal(belowOnOneLead.sokolowSum, 34);
  assert.equal(belowOnOneLead.sokolowMet, null);
  const belowOnBoth = lvhCriteria({ sV1: 16, rV5: 18, rV6: 15, sex: 'male' });
  assert.equal(belowOnBoth.sokolowSum, 34);
  assert.equal(belowOnBoth.sokolowMet, false);
});

test('Cornell threshold is sex-specific: sum 25 is positive for women, negative for men', () => {
  const female = lvhCriteria({ sV3: 13, rAVL: 12, sex: 'female' });
  assert.equal(female.cornellSum, 25);
  assert.equal(female.cornellThreshold, 20);
  assert.equal(female.cornellMet, true);
  const male = lvhCriteria({ sV3: 13, rAVL: 12, sex: 'male' });
  assert.equal(male.cornellThreshold, 28);
  assert.equal(male.cornellMet, false);
});

test('the larger of RV5/RV6 is used for Sokolow-Lyon', () => {
  const r = lvhCriteria({ sV1: 20, rV5: 10, rV6: 19, sex: 'male' });
  assert.equal(r.sokolowSum, 39); // 20 + 19
});

test('voltages clamp to a non-negative magnitude', () => {
  const r = lvhCriteria({ sV1: -20, rV5: 18, sex: 'male' });
  assert.equal(r.sokolowSum, 18); // -20 clamped to 0
});

test('a partial limb is reported as unknown, not a false negative', () => {
  // Sokolow complete (SV1 + RV5), Cornell partial (no SV3/RaVL).
  const r = lvhCriteria({ sV1: 20, rV5: 18, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.sokolowMet, true);
  assert.equal(r.cornellMet, null);
});

test('no amplitudes at all renders the complete-the-fields fallback', () => {
  assert.equal(lvhCriteria({ sex: 'male' }).valid, false);
});

test('spec-v1116: the Cornell threshold is sex-specific and waits for the sex', () => {
  // 24 mm is LVH in a woman (> 20) and not in a man (> 28). The default applied
  // the male cut-off and answered "no LVH voltage criterion met".
  const leads = { sV1: 10, rV5: 20, sV3: 14, rAVL: 10 };
  assert.match(lvhCriteria({ ...leads, sex: 'female' }).band, /LVH positive: Cornell voltage/);
  assert.match(lvhCriteria({ ...leads, sex: 'male' }).band, /No LVH voltage criterion met/);

  const r = lvhCriteria(leads);
  assert.equal(r.cornellMet, null);
  assert.equal(r.cornellSum, 24, 'the sum is arithmetic and still reported');
  assert.match(r.band, /the sex is needed before it can be read/);
});

test('spec-v1116: Sokolow-Lyon has no sex term and is unaffected', () => {
  const r = lvhCriteria({ sV1: 20, rV5: 20 });
  assert.equal(r.sokolowMet, true);
  assert.match(r.band, /LVH positive: Sokolow-Lyon/);
  assert.doesNotMatch(r.band, /the sex is needed/);
});

// spec-v1149: Sokolow-Lyon is SV1 + the LARGER of RV5 and RV6, so one lead forms
// a sum -- and that sum is a FLOOR, because the lead nobody measured may be the
// larger one. Read as a total it ruled OUT.
test('lvh-criteria: one precordial lead gives a floor, so it may rule in but not out', () => {
  const common = { sV1: 20, sV3: 12, rAVL: 10, sex: 'male' };
  // The defect, stated: SV1 20 + RV5 10 = 30 read as "no criterion met", while an
  // RV6 of 16 makes the real sum 36 and the criterion met.
  const partialLow = lvhCriteria({ ...common, rV5: 10 });
  assert.equal(partialLow.sokolowSum, 30);
  assert.equal(partialLow.sokolowMet, null);
  assert.equal(partialLow.sokolowPartial, true);
  assert.equal(partialLow.sokolowMissingLead, 'RV6');
  assert.match(partialLow.band, /RV6 is not entered/);
  assert.match(partialLow.band, /30 mm is a floor/);
  assert.equal(lvhCriteria({ ...common, rV5: 10, rV6: 16 }).sokolowMet, true);

  // At or above the threshold the reading stands whatever the missing lead is.
  const partialHigh = lvhCriteria({ ...common, rV5: 18 });
  assert.equal(partialHigh.sokolowMet, true);
  assert.equal(partialHigh.anyMet, true);
  assert.match(partialHigh.band, /positive/);

  // Both leads entered and below: a real negative, unchanged.
  const complete = lvhCriteria({ ...common, rV5: 10, rV6: 9 });
  assert.equal(complete.sokolowMet, false);
  assert.equal(complete.sokolowPartial, false);
  assert.equal(complete.band, 'No LVH voltage criterion met by the entered amplitudes.');
});
