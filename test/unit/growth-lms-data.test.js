// spec-v141 §3: the CDC 2000 / WHO 2006 LMS compiled constants and the LMS
// z-transform. Explicitly exercises the L -> 0 branch and overflow guards the
// spec calls out, plus the verbatim-source spot checks (no fabrication).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CDC_BMI_AGE, WHO_WT_AGE, WHO_LEN_AGE, interpLMS, lmsToZ } from '../../lib/growth-lms-data.js';

test('tables have aligned, monotonically increasing ages and matching array lengths', () => {
  const strata = [CDC_BMI_AGE.male, CDC_BMI_AGE.female, WHO_WT_AGE.male, WHO_WT_AGE.female, WHO_LEN_AGE.male, WHO_LEN_AGE.female];
  for (const s of strata) {
    assert.ok(s.age.length > 0);
    assert.equal(s.L.length, s.age.length);
    assert.equal(s.M.length, s.age.length);
    assert.equal(s.S.length, s.age.length);
    for (let i = 1; i < s.age.length; i++) assert.ok(s.age[i] > s.age[i - 1], 'ages must increase');
    for (const m of s.M) assert.ok(m > 0, 'M must be positive');
    for (const sd of s.S) assert.ok(sd > 0, 'S must be positive');
  }
});

test('verbatim source spot checks (CDC bmiagerev / WHO data files)', () => {
  // CDC BMI male first row, 24 mo: L,M,S = -2.01118107, 16.57502768, 0.080592465
  assert.equal(CDC_BMI_AGE.male.age[0], 24);
  assert.equal(CDC_BMI_AGE.male.L[0], -2.01118107);
  assert.equal(CDC_BMI_AGE.male.M[0], 16.57502768);
  assert.equal(CDC_BMI_AGE.male.S[0], 0.080592465);
  // WHO weight boys at 0 mo: 0.3487, 3.3464, 0.14602
  assert.equal(WHO_WT_AGE.male.M[0], 3.3464);
  // WHO length uses L = 1 throughout
  assert.ok(WHO_LEN_AGE.female.L.every((l) => l === 1));
});

test('lmsToZ: z at the median (X = M) is exactly 0', () => {
  assert.equal(lmsToZ(0.5, 16, 0.08, 16), 0);
  assert.equal(lmsToZ(1, 50, 0.04, 50), 0); // L = 1
});

test('lmsToZ: L -> 0 uses the log limit z = ln(X/M)/S', () => {
  const z = lmsToZ(0, 10, 0.1, 12);
  assert.ok(Math.abs(z - Math.log(12 / 10) / 0.1) < 1e-12);
});

test('lmsToZ: guards M<=0, S<=0, X<=0, and non-finite -> null (never NaN/Infinity)', () => {
  for (const bad of [lmsToZ(0.5, 0, 0.1, 10), lmsToZ(0.5, 10, 0, 10), lmsToZ(0.5, 10, 0.1, 0),
    lmsToZ(NaN, 10, 0.1, 10), lmsToZ(0.5, 10, 0.1, Infinity), lmsToZ(0.5, 10, 0.1, -5)]) {
    assert.equal(bad, null);
  }
});

test('interpLMS: interpolates within range, returns null outside, null on garbage', () => {
  const mid = interpLMS(WHO_WT_AGE.male, 0.5);
  assert.ok(mid && mid.M > WHO_WT_AGE.male.M[0]); // weight rises from birth
  assert.equal(interpLMS(WHO_WT_AGE.male, 25), null); // beyond 24 mo
  assert.equal(interpLMS(CDC_BMI_AGE.male, 12), null); // below 24 mo
  assert.equal(interpLMS(5, 6), null); // garbage stratum
  assert.equal(interpLMS(WHO_WT_AGE.male, NaN), null);
});
