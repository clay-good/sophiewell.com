// spec-v201 2.2: CLIF-C AD score worked examples and band spread.
// Formula (EF-CLIF, verbatim): 10 * [0.03*age + 0.66*ln(creat) + 1.71*ln(INR)
// + 0.88*ln(WBC) - 0.05*Na + 8]. Five predictors; the spec-v201 draft omitted
// INR, the source governs (spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clifcAd } from '../../lib/hepatology-gibleed-v201.js';

test('high CLIF-C AD -> high-risk band (worked example)', () => {
  const r = clifcAd({ age: 65, creatinine: 2.0, inr: 1.6, wbc: 12, sodium: 128 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 70);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high-risk/);
});

test('low CLIF-C AD -> low-risk band', () => {
  const r = clifcAd({ age: 55, creatinine: 1.0, inr: 1.2, wbc: 6, sodium: 138 });
  assert.equal(r.score, 46.4);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low-risk/);
});

test('mid CLIF-C AD -> intermediate band', () => {
  const r = clifcAd({ age: 60, creatinine: 1.5, inr: 1.4, wbc: 8, sodium: 132 });
  assert.equal(r.score, 58.7);
  assert.match(r.band, /intermediate-risk/);
});

test('formula matches a hand computation', () => {
  const age = 60, creat = 1.5, inr = 1.4, wbc = 8, na = 132;
  const expected = Math.round(10 * (0.03 * age + 0.66 * Math.log(creat) + 1.71 * Math.log(inr) + 0.88 * Math.log(wbc) - 0.05 * na + 8) * 10) / 10;
  assert.equal(clifcAd({ age, creatinine: creat, inr, wbc, sodium: na }).score, expected);
});

test('non-positive lab -> complete-the-fields (ln guarded)', () => {
  const r = clifcAd({ age: 60, creatinine: 0, inr: 1.4, wbc: 8, sodium: 132 });
  assert.equal(r.valid, false);
  assert.match(r.message, /positive/);
});

test('missing INR -> complete-the-fields', () => {
  const r = clifcAd({ age: 60, creatinine: 1.5, wbc: 8, sodium: 132 });
  assert.equal(r.valid, false);
});
