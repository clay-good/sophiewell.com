// spec-v58 §2.5: Bhutani nomogram + AAP-2022 phototherapy threshold.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bhutaniBilirubin } from '../../lib/scoring-v6.js';

test('example: 48 h, TSB 14, 38 wk -> high-risk zone, threshold 16', () => {
  const r = bhutaniBilirubin({ ageHours: 48, tsb: 14, gaWeeks: 38, riskFactors: false });
  assert.match(r.zone, /High-risk/);
  assert.equal(r.threshold, 16);
});
test('low TSB -> low-risk zone, below threshold', () => {
  const r = bhutaniBilirubin({ ageHours: 24, tsb: 3, gaWeeks: 40, riskFactors: false });
  assert.match(r.zone, /Low-risk/);
  assert.equal(r.abovePhoto, false);
});
test('neurotoxicity risk factor lowers the AAP threshold ~2 mg/dL', () => {
  const base = bhutaniBilirubin({ ageHours: 48, tsb: 14, gaWeeks: 38, riskFactors: false }).threshold;
  const risk = bhutaniBilirubin({ ageHours: 48, tsb: 14, gaWeeks: 38, riskFactors: true }).threshold;
  assert.ok(risk < base);
});
test('out-of-range gestational age throws', () => {
  assert.throws(() => bhutaniBilirubin({ ageHours: 48, tsb: 14, gaWeeks: 30, riskFactors: false }));
});
