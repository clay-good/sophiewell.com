// spec-v82 §5 acceptance: patient responsibility & coordination of benefits.
// Each of the four engines gets >=3 boundary worked examples, including the
// Part B deductible-then-20% boundary, a Part A day-banded stay, each of the
// four COB methods on one shared scenario (so their divergence is visible), the
// in-network balance-bill-prohibited flag, and the NSA protected/non-protected
// gate. All money is integer cents. One file, mirroring billing-v81.test.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  medicareCostShare, cobCalc, allowedAmount, nsaCostShare,
  COB_METHODS, NSA_CATEGORIES,
  PART_B_DEDUCTIBLE_CY2026, PART_A_INPATIENT_DEDUCTIBLE_CY2026,
} from '../../lib/billing-v82.js';

// ---- 2.1 medicare-cost-share ------------------------------------------------
test('medicare-cost-share Part B: annual deductible then 20% of the allowed; partial-deductible boundary', () => {
  // $500 approved, full $283 deductible remaining: pay $283 + 20% of the
  // remaining $217 = $326.40; Medicare pays $173.60.
  const r = medicareCostShare({ part: 'B', allowedCents: 50000, deductibleRemainingCents: PART_B_DEDUCTIBLE_CY2026 });
  assert.equal(r.deductibleAppliedCents, 28300);
  assert.equal(r.coinsuranceCents, 4340);
  assert.equal(r.patientCents, 32640);
  assert.equal(r.programPaysCents, 17360);
  // Deductible already met: flat 20% of the allowed.
  const met = medicareCostShare({ part: 'B', allowedCents: 50000, deductibleRemainingCents: 0 });
  assert.equal(met.patientCents, 10000);
  assert.equal(met.programPaysCents, 40000);
  // Allowed below the remaining deductible: patient owes the whole allowed, no
  // coinsurance, never a negative coinsurance base.
  const below = medicareCostShare({ part: 'B', allowedCents: 10000, deductibleRemainingCents: PART_B_DEDUCTIBLE_CY2026 });
  assert.equal(below.coinsuranceCents, 0);
  assert.equal(below.patientCents, 10000);
});

test('medicare-cost-share Part A: day-banded inpatient stay and SNF day-21-100 coinsurance', () => {
  // 95-day stay, deductible not yet met, 5 lifetime-reserve days elected:
  // $1,736 deductible + 30 x $434 (days 61-90) + 5 x $868 (LRD) = $19,096.
  const a = medicareCostShare({ part: 'A', lengthOfStay: 95, deductibleApplies: true, lifetimeReserveElected: 5 });
  assert.equal(a.deductibleCents, PART_A_INPATIENT_DEDUCTIBLE_CY2026);
  assert.equal(a.days6190, 30);
  assert.equal(a.coins6190Cents, 1302000);
  assert.equal(a.lrdUsed, 5);
  assert.equal(a.coinsLrdCents, 434000);
  assert.equal(a.patientCents, 1909600);
  // Day 91+ with no LRD elected -> uncovered days flagged, patient liable for all.
  const noLrd = medicareCostShare({ part: 'A', lengthOfStay: 95, deductibleApplies: true, lifetimeReserveElected: 0 });
  assert.equal(noLrd.uncoveredDays, 5);
  // SNF: days 1-20 free, days 21-100 at $217/day; 30 days -> 10 coinsurance days.
  const snf = medicareCostShare({ part: 'SNF', snfDays: 30 });
  assert.equal(snf.coinsuranceDays, 10);
  assert.equal(snf.patientCents, 217000);
  assert.equal(medicareCostShare({ part: 'SNF', snfDays: 15 }).patientCents, 0);
  assert.throws(() => medicareCostShare({ part: 'X', allowedCents: 100 }), TypeError);
});

// ---- 2.2 cob-calc -----------------------------------------------------------
test('cob-calc: the four methods diverge on one shared dual-coverage scenario', () => {
  // Charge $1,000; primary allowed $600, paid $480 -> patient balance $120.
  // Secondary allowed $500, would-pay $400 as primary.
  const base = {
    billedChargeCents: 100000, primaryAllowedCents: 60000, primaryPaidCents: 48000,
    secondaryAllowedCents: 50000, secondaryWouldPayCents: 40000,
  };
  const lesser = cobCalc({ ...base, method: 'lesser-of' });
  assert.equal(lesser.patientAfterPrimaryCents, 12000);
  assert.equal(lesser.secondaryPaysCents, 12000);
  assert.equal(lesser.patientResidualCents, 0);
  const whole = cobCalc({ ...base, method: 'come-out-whole' });
  assert.equal(whole.secondaryPaysCents, 2000);   // $500 allowed - $480 primary paid
  assert.equal(whole.patientResidualCents, 10000); // $100 left
  const nondup = cobCalc({ ...base, method: 'non-duplication' });
  assert.equal(nondup.secondaryPaysCents, 0);     // would-pay $400 < primary paid $480
  assert.equal(nondup.patientResidualCents, 12000);
  const msp = cobCalc({ ...base, method: 'msp' });
  assert.equal(msp.secondaryPaysCents, 12000);    // gap to higher allowed, $0 residual
  assert.equal(msp.patientResidualCents, 0);
  assert.deepEqual(COB_METHODS, ['lesser-of', 'come-out-whole', 'non-duplication', 'msp']);
});

test('cob-calc: guards reject a method it does not know and paid-exceeds-allowed', () => {
  assert.throws(() => cobCalc({ method: 'split', billedChargeCents: 100, primaryAllowedCents: 100, primaryPaidCents: 0, secondaryAllowedCents: 0 }), TypeError);
  assert.throws(() => cobCalc({ method: 'lesser-of', billedChargeCents: 100, primaryAllowedCents: 50, primaryPaidCents: 60, secondaryAllowedCents: 0 }), RangeError);
});

// ---- 2.3 allowed-amount -----------------------------------------------------
test('allowed-amount: in-network write-off + cost-share + payer payment, with the balance-bill flag', () => {
  // Charge $1,000, allowed $600, $100 deductible left, 20% coinsurance.
  const inn = allowedAmount({ billedChargeCents: 100000, allowedCents: 60000, deductibleRemainingCents: 10000, coinsurancePct: 20, inNetwork: true });
  assert.equal(inn.contractualWriteOffCents, 40000);      // $400 written off
  assert.equal(inn.patientResponsibilityCents, 20000);    // $100 ded + 20% of $500
  assert.equal(inn.payerPaymentCents, 40000);             // $400
  assert.equal(inn.balanceBillProhibited, true);
  // allowed = payer + patient; charge = allowed + write-off.
  assert.equal(inn.payerPaymentCents + inn.patientResponsibilityCents, inn.allowedCents);
  assert.equal(inn.allowedCents + inn.contractualWriteOffCents, inn.billedChargeCents);
  // Out-of-network: NO contractual write-off; the gap may be balance-billed.
  const oon = allowedAmount({ billedChargeCents: 100000, allowedCents: 60000, deductibleRemainingCents: 10000, coinsurancePct: 20, inNetwork: false });
  assert.equal(oon.contractualWriteOffCents, 0);
  assert.equal(oon.balanceBillProhibited, false);
  assert.equal(oon.patientResponsibilityCents, 20000);
});

// ---- 2.4 nsa-cost-share -----------------------------------------------------
test('nsa-cost-share: protected emergency caps at the QPA; non-protected refuses the cap', () => {
  // Emergency, QPA $800, billed $2,000, 20% coinsurance, deductible met.
  const prot = nsaCostShare({ serviceCategory: 'emergency', qpaCents: 80000, billedChargeCents: 200000, coinsurancePct: 20 });
  assert.equal(prot.protected, true);
  assert.equal(prot.patientCostShareCents, 16000);          // 20% of the $800 QPA
  assert.equal(prot.planPaysCents, 64000);
  assert.equal(prot.prohibitedBalanceBillCents, 120000);    // $1,200 may NOT be billed
  // Non-protected: the cap does not apply, no patient cost-share computed.
  const non = nsaCostShare({ serviceCategory: 'non-protected', qpaCents: 80000, billedChargeCents: 200000, coinsurancePct: 20 });
  assert.equal(non.protected, false);
  assert.equal(non.patientCostShareCents, null);
  assert.equal(non.prohibitedBalanceBillCents, 0);
  assert.deepEqual(NSA_CATEGORIES, ['emergency', 'ancillary-in-network-facility', 'non-protected']);
  assert.throws(() => nsaCostShare({ serviceCategory: 'dental', qpaCents: 100, billedChargeCents: 200 }), TypeError);
});
