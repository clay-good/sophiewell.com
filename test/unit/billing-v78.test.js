// spec-v78 §5 acceptance: the MPFS reimbursement engine. Each tile gets >=3
// boundary worked examples, including the indicator-0 not-payable gate, the
// facility / non-facility site differential, and a four-line MPPR chain. Money
// is integer cents; valid-input outputs are exact to the cent.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rvuPayment, mppr, bilateralPay, multiSurgeonPay, sequestrationAdjust,
  dollarsToCents, PFS_CONVERSION_FACTOR_CY2026,
} from '../../lib/billing-v78.js';

const CF = PFS_CONVERSION_FACTOR_CY2026; // 32.7442

// ---- 2.1 rvu-payment --------------------------------------------------------
// 99214 at National Average GPCI (1/1/1), CY2026 CF. Bundled RVUs:
//   work 1.92, PE non-facility 1.5, PE facility 0.69, MP 0.13.
// non-facility = (1.92 + 1.5 + 0.13) * 32.7442 = 3.55 * 32.7442 = $116.24
// facility     = (1.92 + 0.69 + 0.13) * 32.7442 = 2.74 * 32.7442 = $89.72
test('rvu-payment: 99214 national, both sites, to the cent', () => {
  const r = rvuPayment({
    workRvu: 1.92, peRvuNonFacility: 1.5, peRvuFacility: 0.69, mpRvu: 0.13,
    workGpci: 1, peGpci: 1, mpGpci: 1, conversionFactor: CF,
  });
  assert.equal(r.nonFacilityCents, 11624); // $116.24
  assert.equal(r.facilityCents, 8972);     // $89.72
  // Site differential equals the PE-RVU delta * peGPCI * CF:
  // (1.5 - 0.69) * 1 * 32.7442 = $26.52
  assert.equal(r.siteDifferentialCents, 2652);
});

test('rvu-payment: GPCI override scales every component; units multiply', () => {
  const r = rvuPayment({
    workRvu: 1.92, peRvuNonFacility: 1.5, peRvuFacility: 0.69, mpRvu: 0.13,
    workGpci: 1.058, peGpci: 1.225, mpGpci: 1.483, conversionFactor: CF, units: 2,
  });
  // non-facility total RVU = 1.92*1.058 + 1.5*1.225 + 0.13*1.483 = 4.075339
  // * 32.7442 = $133.446... -> $133.43 per unit, x2.
  const perUnit = Math.round((1.92 * 1.058 + 1.5 * 1.225 + 0.13 * 1.483) * CF * 100);
  assert.equal(r.nonFacilityCents, perUnit * 2);
  assert.equal(r.units, 2);
});

test('rvu-payment: zero PE facility never goes negative; bad input throws', () => {
  const r = rvuPayment({
    workRvu: 0, peRvuNonFacility: 0.1, peRvuFacility: 0, mpRvu: 0.01,
    workGpci: 1, peGpci: 1, mpGpci: 1, conversionFactor: CF,
  });
  assert.ok(r.facilityCents >= 0 && Number.isFinite(r.facilityCents));
  assert.throws(() => rvuPayment({
    workRvu: -1, peRvuNonFacility: 0, peRvuFacility: 0, mpRvu: 0,
    workGpci: 1, peGpci: 1, mpGpci: 1, conversionFactor: CF,
  }), RangeError);
  assert.throws(() => rvuPayment({
    workRvu: NaN, peRvuNonFacility: 0, peRvuFacility: 0, mpRvu: 0,
    workGpci: 1, peGpci: 1, mpGpci: 1, conversionFactor: CF,
  }), TypeError);
});

// ---- 2.2 mppr ---------------------------------------------------------------
test('mppr: four-line surgical 100/50/50/50 chain', () => {
  const r = mppr({ lines: [
    { feeCents: 100000 }, { feeCents: 60000 }, { feeCents: 40000 }, { feeCents: 20000 },
  ] });
  assert.deepEqual(r.lines.map((l) => l.allowedCents), [100000, 30000, 20000, 10000]);
  assert.equal(r.allowedTotalCents, 160000);
  assert.equal(r.fullCents, 220000);
  assert.equal(r.withheldCents, 60000);
  // Lines are re-ranked by fee, highest first, regardless of input order.
  const shuffled = mppr({ lines: [
    { feeCents: 20000 }, { feeCents: 100000 }, { feeCents: 40000 }, { feeCents: 60000 },
  ] });
  assert.equal(shuffled.lines[0].feeCents, 100000);
  assert.equal(shuffled.allowedTotalCents, 160000);
});

test('mppr: endoscopy base rule subtracts the base value from each subsequent', () => {
  // Highest endoscopy paid full; subsequent = fee - base ($200 base).
  const r = mppr({ mode: 'endoscopy', baseFeeCents: 20000, lines: [
    { feeCents: 50000 }, { feeCents: 40000 },
  ] });
  assert.equal(r.lines[0].allowedCents, 50000);           // full
  assert.equal(r.lines[1].allowedCents, 40000 - 20000);   // $200 over base
  assert.equal(r.allowedTotalCents, 70000);
});

test('mppr: empty list throws; single line pays in full', () => {
  assert.throws(() => mppr({ lines: [] }), TypeError);
  const r = mppr({ lines: [{ feeCents: 12345 }] });
  assert.equal(r.allowedTotalCents, 12345);
  assert.equal(r.withheldCents, 0);
});

// ---- 2.3 bilateral-pay ------------------------------------------------------
test('bilateral-pay: indicators 1/2/3 -> 150/100/200%', () => {
  assert.equal(bilateralPay({ feeCents: 10000, indicator: 1 }).allowedCents, 15000);
  assert.equal(bilateralPay({ feeCents: 10000, indicator: 2 }).allowedCents, 10000);
  assert.equal(bilateralPay({ feeCents: 10000, indicator: 3 }).allowedCents, 20000);
});

test('bilateral-pay: indicator 0 and 9 are hard not-payable gates', () => {
  const r0 = bilateralPay({ feeCents: 10000, indicator: 0 });
  assert.equal(r0.payable, false);
  assert.equal(r0.allowedCents, null);
  const r9 = bilateralPay({ feeCents: 10000, indicator: 9 });
  assert.equal(r9.payable, false);
  assert.equal(r9.allowedCents, null);
});

test('bilateral-pay: out-of-range indicator throws', () => {
  assert.throws(() => bilateralPay({ feeCents: 10000, indicator: 12 }), RangeError);
});

// ---- 2.4 multi-surgeon-pay --------------------------------------------------
test('multi-surgeon-pay: assistant 16%, co-surgeon 62.5%, team by-report', () => {
  const a = multiSurgeonPay({ feeCents: 100000, role: 'assistant', indicator: 2 });
  assert.equal(a.allowedCents, 16000);
  const c = multiSurgeonPay({ feeCents: 100000, role: 'co', indicator: 2 });
  assert.equal(c.allowedCents, 62500);
  const t = multiSurgeonPay({ feeCents: 100000, role: 'team', indicator: 2 });
  assert.equal(t.byReport, true);
  assert.equal(t.allowedCents, null);
});

test('multi-surgeon-pay: indicator 0 gates every role to not-payable', () => {
  for (const role of ['assistant', 'co', 'team']) {
    const r = multiSurgeonPay({ feeCents: 100000, role, indicator: 0 });
    assert.equal(r.payable, false);
    assert.equal(r.allowedCents, null);
  }
});

test('multi-surgeon-pay: unknown role throws', () => {
  assert.throws(() => multiSurgeonPay({ feeCents: 100000, role: 'nope', indicator: 2 }), TypeError);
});

// ---- 2.5 sequestration-adjust -----------------------------------------------
test('sequestration-adjust: 2% on the program-payment portion only', () => {
  // allowed $100, patient owes $20 (20% coinsurance) -> program payment $80.
  // 2% of $80 = $1.60 withheld; net Medicare check $78.40.
  const r = sequestrationAdjust({ allowedCents: 10000, patientResponsibilityCents: 2000 });
  assert.equal(r.programPaymentCents, 8000);
  assert.equal(r.sequestrationCents, 160);
  assert.equal(r.netPaymentCents, 7840);
});

test('sequestration-adjust: overridable rate; patient > allowed throws', () => {
  const r = sequestrationAdjust({ allowedCents: 10000, patientResponsibilityCents: 0, seqPct: 0 });
  assert.equal(r.sequestrationCents, 0);
  assert.equal(r.netPaymentCents, 10000);
  assert.throws(() => sequestrationAdjust({ allowedCents: 1000, patientResponsibilityCents: 2000 }), RangeError);
});

// ---- helper -----------------------------------------------------------------
test('dollarsToCents: rounds to the cent and rejects negatives', () => {
  assert.equal(dollarsToCents(116.245), 11625);
  assert.equal(dollarsToCents(0), 0);
  assert.throws(() => dollarsToCents(-1), RangeError);
});
