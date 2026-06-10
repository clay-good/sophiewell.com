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

// --- neo-phototherapy (spec-v62 §3.3 wave 2): AAP-2022 photo + exchange -----
import { neoPhototherapy } from '../../lib/scoring-v6.js';

test('neoPhototherapy: 38 wk, 48 h, TSB 18 -> photo 16, exchange 25, escalate 23, above photo by 2', () => {
  const r = neoPhototherapy({ gaWeeks: 38, ageHours: 48, tsb: 18, riskFactors: false });
  assert.equal(r.photoThreshold, 16);
  assert.equal(r.exchangeThreshold, 25);
  assert.equal(r.escalationThreshold, 23);
  assert.equal(r.marginToPhoto, 2);
  assert.equal(r.atPhoto, true);
  assert.equal(r.atExchange, false);
  assert.match(r.band, /phototherapy threshold/);
});
test('neoPhototherapy: low TSB sits below the phototherapy line', () => {
  const r = neoPhototherapy({ gaWeeks: 40, ageHours: 24, tsb: 8, riskFactors: false });
  assert.equal(r.atPhoto, false);
  assert.ok(r.marginToPhoto < 0);
  assert.match(r.band, /Below the AAP-2022 phototherapy/);
});
test('neoPhototherapy: risk factors lower both thresholds; high TSB crosses the exchange line', () => {
  const base = neoPhototherapy({ gaWeeks: 38, ageHours: 96, tsb: 10, riskFactors: false });
  const risk = neoPhototherapy({ gaWeeks: 38, ageHours: 96, tsb: 10, riskFactors: true });
  assert.ok(risk.photoThreshold < base.photoThreshold);
  assert.ok(risk.exchangeThreshold < base.exchangeThreshold);
  const high = neoPhototherapy({ gaWeeks: 35, ageHours: 96, tsb: 26, riskFactors: true });
  assert.equal(high.atExchange, true);
  assert.match(high.band, /exchange-transfusion threshold/);
});
test('neoPhototherapy: out-of-range input throws (no non-finite leak)', () => {
  assert.throws(() => neoPhototherapy({ gaWeeks: 30, ageHours: 48, tsb: 18, riskFactors: false }), RangeError);
  assert.throws(() => neoPhototherapy({ gaWeeks: 38, ageHours: 48, tsb: NaN, riskFactors: false }), TypeError);
});
