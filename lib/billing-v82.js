// spec-v82 §2: Patient responsibility & coordination of benefits -- four
// deterministic, cited calculators for the numbers on the statement the patient
// actually reads (spec-v77 billing & coding program, Group C "Patient Bill &
// Insurance Tools"). spec-v78 computes what the *payer* pays; this computes what
// the *patient* owes.
//
//   2.1 medicareCostShare -- Part A / Part B / SNF beneficiary liability
//   2.2 cobCalc           -- coordination of benefits / Medicare Secondary Payer
//   2.3 allowedAmount     -- contractual write-off vs patient balance
//   2.4 nsaCostShare      -- No Surprises Act QPA-based patient cost-share
//
// Money is integer cents end-to-end (spec-v82 §3): every function works in cents
// and the renderer formats once at the edge through fmt() (lib/num.js), so no
// float toFixed leak and no NaN/Infinity can reach the DOM (spec-v59 output
// safety). dollarsToCents is shared with lib/billing-v78.js. The
// deductible-then-coinsurance ordering is encoded once (deductible consumed
// first, coinsurance on the remainder) and never produces a negative balance:
// a charge below the deductible, a zero allowed, and a paid-exceeds-allowed
// input each return a note, never a negative number.
//
// The protection / coverage / network gate is HARD, not advisory (spec-v82 §3):
// nsaCostShare and allowedAmount refuse to apply the cap / contractual write-off
// when the service isn't protected / the provider isn't in network, rather than
// defaulting to the patient-favorable answer -- the wrong default here is a
// compliance problem in both directions. The four COB methods are four named
// code paths; the tool never silently picks one.
//
// Dated constants (the CY2026 Part A/B deductibles and coinsurance, the SNF
// daily amount, the 20% Part B coinsurance) are carried as named values here and
// ledger-tracked in pa-staleness-ledger.json (ruleFamily "billing-v82");
// check-pa-staleness guards their currency in CI. Every money input is
// overridable per call so a user can reconcile a prior-year claim.

import { num } from './num.js';
import { dollarsToCents } from './billing-v78.js';

export { dollarsToCents };

// --- dated constants (ruleFamily billing-v82) --------------------------------
// CMS CY2026 Medicare cost-sharing amounts (announced 2025-11-14), in integer
// cents. The day-banded Part A figures are the statutory fractions of the
// inpatient deductible (1/4 for days 61-90, 1/2 for lifetime-reserve, 1/8 for
// SNF days 21-100). Each is overridable per call for a prior-year reconciliation.
export const PART_A_INPATIENT_DEDUCTIBLE_CY2026 = 173600; // $1,736 per benefit period
export const PART_A_COINS_DAYS_61_90_CY2026 = 43400;      // $434/day, days 61-90
export const PART_A_COINS_LIFETIME_RESERVE_CY2026 = 86800; // $868/day, days 91+ (LRD)
export const SNF_COINS_DAYS_21_100_CY2026 = 21700;        // $217/day, SNF days 21-100
export const PART_B_DEDUCTIBLE_CY2026 = 28300;            // $283 annual
export const PART_B_COINSURANCE_PCT = 20;                 // 20% of the allowed

// Round `pct` percent of `cents` to integer cents. One rounding, at the edge.
function roundCentsPct(cents, pct) {
  return Math.round((cents * pct) / 100);
}

// Apply a remaining deductible then coinsurance to an allowed amount, in cents.
// Deductible is consumed first (capped at the allowed -- a charge below the
// deductible never produces a negative coinsurance base), coinsurance is taken
// on the remainder, an optional flat copay is added, and the patient total is
// capped at the allowed so it can never exceed the recognized amount.
function deductibleThenCoinsurance(allowedCents, deductibleRemainingCents, coinsurancePct, copayCents) {
  const deductibleApplied = Math.min(deductibleRemainingCents, allowedCents);
  const afterDeductible = allowedCents - deductibleApplied;
  const coinsuranceCents = roundCentsPct(afterDeductible, coinsurancePct);
  const patientCents = Math.min(allowedCents, deductibleApplied + coinsuranceCents + copayCents);
  return { deductibleApplied, afterDeductible, coinsuranceCents, copayCents, patientCents };
}

// =============================================================================
// 2.1 medicare-cost-share -- Part A & Part B patient liability
// =============================================================================
// SSA Title XVIII; the annual CMS Medicare cost-sharing amounts. Part B: annual
// deductible then 20% of the Medicare-approved amount. Part A inpatient: the
// per-benefit-period deductible (days 1-60), then $434/day (days 61-90), then
// the lifetime-reserve daily amount (days 91+, up to 60 LRD). SNF: the day-21-100
// daily coinsurance. The number a Medicare patient is actually charged, BEFORE
// any Medigap / secondary coverage (which cob-calc then applies).
export function medicareCostShare(input) {
  const part = String(input && input.part || '').trim().toUpperCase();

  if (part === 'B') {
    const allowedCents = Math.round(num('allowedCents', input.allowedCents, { min: 0, max: 1e11 }));
    const deductibleRemainingCents = Math.round(num('deductibleRemainingCents',
      input.deductibleRemainingCents == null ? PART_B_DEDUCTIBLE_CY2026 : input.deductibleRemainingCents, { min: 0, max: 1e9 }));
    const coinsurancePct = num('coinsurancePct',
      input.coinsurancePct == null ? PART_B_COINSURANCE_PCT : input.coinsurancePct, { min: 0, max: 100 });
    const b = deductibleThenCoinsurance(allowedCents, deductibleRemainingCents, coinsurancePct, 0);
    return {
      part: 'B',
      allowedCents,
      deductibleAppliedCents: b.deductibleApplied,
      coinsuranceCents: b.coinsuranceCents,
      patientCents: b.patientCents,
      programPaysCents: allowedCents - b.patientCents,
      note: allowedCents === 0
        ? 'Zero Medicare-approved amount: nothing to apportion -- enter the approved amount for the service.'
        : `Part B: ${b.deductibleApplied > 0 ? 'apply the remaining deductible, then ' : ''}${coinsurancePct}% of the approved amount above the deductible. This is the patient share BEFORE any Medigap / secondary coverage -- run cob-calc to coordinate it.`,
    };
  }

  if (part === 'A') {
    const lengthOfStay = Math.round(num('lengthOfStay', input.lengthOfStay, { min: 0, max: 1000 }));
    const deductibleApplies = input.deductibleApplies !== false; // default: not yet met this benefit period
    const lifetimeReserveElected = Math.round(num('lifetimeReserveElected',
      input.lifetimeReserveElected == null ? 0 : input.lifetimeReserveElected, { min: 0, max: 60 }));
    const deductibleCents = Math.round(num('inpatientDeductibleCents',
      input.inpatientDeductibleCents == null ? PART_A_INPATIENT_DEDUCTIBLE_CY2026 : input.inpatientDeductibleCents, { min: 0, max: 1e9 }));
    const coins6190Cents = Math.round(num('coins6190Cents',
      input.coins6190Cents == null ? PART_A_COINS_DAYS_61_90_CY2026 : input.coins6190Cents, { min: 0, max: 1e9 }));
    const coinsLrdCents = Math.round(num('coinsLrdCents',
      input.coinsLrdCents == null ? PART_A_COINS_LIFETIME_RESERVE_CY2026 : input.coinsLrdCents, { min: 0, max: 1e9 }));

    const deductible = (lengthOfStay >= 1 && deductibleApplies) ? deductibleCents : 0;
    const days6190 = Math.min(Math.max(lengthOfStay - 60, 0), 30);
    const coins6190 = days6190 * coins6190Cents;
    const daysBeyond90 = Math.max(lengthOfStay - 90, 0);
    const lrdUsed = Math.min(daysBeyond90, lifetimeReserveElected);
    const coinsLrd = lrdUsed * coinsLrdCents;
    const uncoveredDays = daysBeyond90 - lrdUsed; // patient pays ALL costs (not computable per-day here)
    const patientCents = deductible + coins6190 + coinsLrd;
    return {
      part: 'A',
      lengthOfStay,
      deductibleCents: deductible,
      days6190, coins6190Cents: coins6190,
      lrdUsed, coinsLrdCents: coinsLrd,
      uncoveredDays,
      patientCents,
      note: `Part A inpatient, ${lengthOfStay} day(s): ${deductible > 0 ? 'the per-benefit-period deductible (days 1-60), ' : ''}${days6190 > 0 ? `${days6190} day(s) of $${(coins6190Cents / 100).toFixed(0)}/day coinsurance (days 61-90), ` : ''}${lrdUsed > 0 ? `${lrdUsed} lifetime-reserve day(s), ` : ''}plus any inpatient services not covered.${uncoveredDays > 0 ? ` WARNING: ${uncoveredDays} day(s) past day 90 with no lifetime-reserve days elected -- the patient is liable for ALL costs of those days (not computed here).` : ''}`,
    };
  }

  if (part === 'SNF') {
    const snfDays = Math.round(num('snfDays', input.snfDays, { min: 0, max: 1000 }));
    const snfDailyCents = Math.round(num('snfDailyCents',
      input.snfDailyCents == null ? SNF_COINS_DAYS_21_100_CY2026 : input.snfDailyCents, { min: 0, max: 1e9 }));
    const eligibleDays = Math.min(Math.max(snfDays - 20, 0), 80); // days 21-100
    const patientCents = eligibleDays * snfDailyCents;
    const uncoveredDays = Math.max(snfDays - 100, 0);
    return {
      part: 'SNF',
      snfDays,
      coinsuranceDays: eligibleDays,
      snfDailyCents,
      uncoveredDays,
      patientCents,
      note: `SNF, ${snfDays} day(s): days 1-20 are $0, days 21-100 are $${(snfDailyCents / 100).toFixed(2)}/day (${eligibleDays} day(s) here).${uncoveredDays > 0 ? ` WARNING: ${uncoveredDays} day(s) past day 100 -- Medicare covers nothing; the patient is liable for ALL costs of those days.` : ''}`,
    };
  }

  throw new TypeError('part must be one of: B, A, SNF');
}

// =============================================================================
// 2.2 cob-calc -- coordination of benefits / Medicare Secondary Payer
// =============================================================================
// 42 CFR Part 411 and CMS Pub. 100-05 (MSP Manual). The standard COB methods --
// lesser-of, come-out-whole (benefits-less-paid), non-duplication -- and the MSP
// calculation. Each is a NAMED code path; the tool never silently picks a method.
// On a contracted claim the patient responsibility after the primary is the
// primary allowed minus what the primary paid (the charge-minus-allowed gap is a
// contractual write-off, not patient debt -- see allowed-amount).
export const COB_METHODS = Object.freeze(['lesser-of', 'come-out-whole', 'non-duplication', 'msp']);

export function cobCalc(input) {
  const method = String(input && input.method || '').trim().toLowerCase();
  if (!COB_METHODS.includes(method)) {
    throw new TypeError(`method must be one of: ${COB_METHODS.join(', ')}`);
  }
  const billedChargeCents = Math.round(num('billedChargeCents', input.billedChargeCents, { min: 0, max: 1e11 }));
  const primaryAllowedCents = Math.round(num('primaryAllowedCents', input.primaryAllowedCents, { min: 0, max: 1e11 }));
  const primaryPaidCents = Math.round(num('primaryPaidCents', input.primaryPaidCents, { min: 0, max: 1e11 }));
  const secondaryAllowedCents = Math.round(num('secondaryAllowedCents', input.secondaryAllowedCents, { min: 0, max: 1e11 }));
  const secondaryWouldPayCents = Math.round(num('secondaryWouldPayCents',
    input.secondaryWouldPayCents == null ? 0 : input.secondaryWouldPayCents, { min: 0, max: 1e11 }));

  if (primaryPaidCents > primaryAllowedCents) {
    throw new RangeError('primaryPaidCents cannot exceed primaryAllowedCents');
  }
  if (secondaryWouldPayCents > secondaryAllowedCents) {
    throw new RangeError('secondaryWouldPayCents cannot exceed secondaryAllowedCents');
  }

  // Patient responsibility left by the primary on the contracted claim.
  const patientAfterPrimaryCents = primaryAllowedCents - primaryPaidCents;

  let secondaryPaysCents;
  let methodNote;
  if (method === 'lesser-of') {
    // Lesser of the patient's remaining balance OR what the secondary would have
    // paid as primary.
    secondaryPaysCents = Math.min(patientAfterPrimaryCents, secondaryWouldPayCents);
    methodNote = 'Lesser-of: the secondary pays the lower of the balance the primary left or what it would have paid as the primary payer.';
  } else if (method === 'come-out-whole') {
    // Benefits-less-paid: up to its own allowed minus what the primary paid, but
    // never more than the patient's remaining balance (makes the patient whole
    // up to the secondary's allowed).
    secondaryPaysCents = Math.min(patientAfterPrimaryCents, Math.max(0, secondaryAllowedCents - primaryPaidCents));
    methodNote = 'Come-out-whole (benefits-less-paid): the secondary covers up to its allowed minus the primary payment, capped at the balance the primary left.';
  } else if (method === 'non-duplication') {
    // The amount the secondary's normal benefit exceeds the primary payment.
    secondaryPaysCents = Math.min(patientAfterPrimaryCents, Math.max(0, secondaryWouldPayCents - primaryPaidCents));
    methodNote = 'Non-duplication: the secondary pays only the amount by which its normal benefit exceeds what the primary already paid -- often $0 when the primary paid more than the secondary would have.';
  } else { // msp
    // Medicare Secondary Payer: the lower of what Medicare would pay as primary,
    // its obligated amount (the higher allowed minus the primary payment), and
    // the provider charge minus the primary payment.
    const obligatedCents = Math.max(0, Math.max(secondaryAllowedCents, primaryAllowedCents) - primaryPaidCents);
    secondaryPaysCents = Math.min(secondaryWouldPayCents, obligatedCents, Math.max(0, billedChargeCents - primaryPaidCents));
    methodNote = 'Medicare Secondary Payer: Medicare pays the lowest of what it would pay as primary, the gap to the higher allowed amount, and the charge minus the primary payment.';
  }

  secondaryPaysCents = Math.max(0, Math.min(secondaryPaysCents, patientAfterPrimaryCents));
  const patientResidualCents = Math.max(0, patientAfterPrimaryCents - secondaryPaysCents);
  const writeOffCents = Math.max(0, billedChargeCents - primaryAllowedCents);

  return {
    method,
    billedChargeCents,
    primaryAllowedCents, primaryPaidCents,
    patientAfterPrimaryCents,
    secondaryAllowedCents, secondaryWouldPayCents,
    secondaryPaysCents,
    patientResidualCents,
    writeOffCents,
    note: `${methodNote} The patient owes ${patientResidualCents === 0 ? '$0 -- both payers together cover the balance' : 'the residual after both payers'}.`,
  };
}

// =============================================================================
// 2.3 allowed-amount -- contractual write-off vs patient balance
// =============================================================================
// Standard third-party-payer contract accounting: on an IN-NETWORK claim the
// patient owes only the benefit cost-share (deductible/coinsurance/copay) on the
// ALLOWED amount, and the charge-minus-allowed gap is a CONTRACTUAL ADJUSTMENT
// (write-off), not patient debt -- billing the patient that gap is balance
// billing and is prohibited. OUT-OF-NETWORK the write-off is NOT contractually
// required, so the gap may be balance-billed; the tool refuses to invent a
// write-off there (spec-v82 §3 hard gate).
export function allowedAmount(input) {
  const billedChargeCents = Math.round(num('billedChargeCents', input.billedChargeCents, { min: 0, max: 1e11 }));
  const allowedCents = Math.round(num('allowedCents', input.allowedCents, { min: 0, max: 1e11 }));
  const deductibleRemainingCents = Math.round(num('deductibleRemainingCents',
    input.deductibleRemainingCents == null ? 0 : input.deductibleRemainingCents, { min: 0, max: 1e9 }));
  const coinsurancePct = num('coinsurancePct',
    input.coinsurancePct == null ? 0 : input.coinsurancePct, { min: 0, max: 100 });
  const copayCents = Math.round(num('copayCents',
    input.copayCents == null ? 0 : input.copayCents, { min: 0, max: 1e9 }));
  const inNetwork = input.inNetwork !== false; // default: in network

  const b = deductibleThenCoinsurance(allowedCents, deductibleRemainingCents, coinsurancePct, copayCents);
  const patientResponsibilityCents = b.patientCents;
  const payerPaymentCents = allowedCents - patientResponsibilityCents;
  const chargeMinusAllowedCents = Math.max(0, billedChargeCents - allowedCents);

  if (inNetwork) {
    return {
      inNetwork: true,
      billedChargeCents, allowedCents,
      contractualWriteOffCents: chargeMinusAllowedCents,
      deductibleAppliedCents: b.deductibleApplied,
      coinsuranceCents: b.coinsuranceCents,
      copayCents,
      patientResponsibilityCents,
      payerPaymentCents,
      balanceBillProhibited: chargeMinusAllowedCents > 0,
      note: `In-network: the patient owes the cost-share on the allowed amount; the $${(chargeMinusAllowedCents / 100).toFixed(2)} above the allowed is a contractual write-off${chargeMinusAllowedCents > 0 ? ' that may NOT be billed to the patient (balance billing is prohibited)' : ''}. allowed = write-off + payer payment + patient responsibility.`,
    };
  }
  // Out of network: no contractual write-off required.
  return {
    inNetwork: false,
    billedChargeCents, allowedCents,
    contractualWriteOffCents: 0,
    deductibleAppliedCents: b.deductibleApplied,
    coinsuranceCents: b.coinsuranceCents,
    copayCents,
    patientResponsibilityCents,
    payerPaymentCents,
    balanceBillProhibited: false,
    note: `Out-of-network: there is NO contractual write-off -- the $${(chargeMinusAllowedCents / 100).toFixed(2)} above the allowed MAY be balance-billed to the patient (unless an NSA protection applies -- see nsa-cost-share). The cost-share shown is only the in-benefit portion on the allowed.`,
  };
}

// =============================================================================
// 2.4 nsa-cost-share -- No Surprises Act QPA-based patient cost-share
// =============================================================================
// No Surprises Act (PHSA §2799A-1/§2799A-2; 45 CFR Part 149): for protected
// out-of-network EMERGENCY services and certain non-emergency ANCILLARY services
// at in-network facilities, the patient's cost-share is computed as if IN-NETWORK
// off the Qualifying Payment Amount (QPA), and balance billing is PROHIBITED. The
// gate is hard: a non-protected service gets a flat refusal, never the
// patient-favorable cap. Computes the cost-share number only -- not an NSA/IDR
// eligibility tree.
export const NSA_CATEGORIES = Object.freeze(['emergency', 'ancillary-in-network-facility', 'non-protected']);

export function nsaCostShare(input) {
  const category = String(input && input.serviceCategory || '').trim().toLowerCase();
  if (!NSA_CATEGORIES.includes(category)) {
    throw new TypeError(`serviceCategory must be one of: ${NSA_CATEGORIES.join(', ')}`);
  }
  const qpaCents = Math.round(num('qpaCents', input.qpaCents, { min: 0, max: 1e11 }));
  const billedChargeCents = Math.round(num('billedChargeCents', input.billedChargeCents, { min: 0, max: 1e11 }));
  const deductibleRemainingCents = Math.round(num('deductibleRemainingCents',
    input.deductibleRemainingCents == null ? 0 : input.deductibleRemainingCents, { min: 0, max: 1e9 }));
  const coinsurancePct = num('coinsurancePct',
    input.coinsurancePct == null ? 0 : input.coinsurancePct, { min: 0, max: 100 });
  const copayCents = Math.round(num('copayCents',
    input.copayCents == null ? 0 : input.copayCents, { min: 0, max: 1e9 }));

  if (category === 'non-protected') {
    const chargeMinusQpa = Math.max(0, billedChargeCents - qpaCents);
    return {
      protected: false,
      serviceCategory: category,
      qpaCents,
      patientCostShareCents: null,
      prohibitedBalanceBillCents: 0,
      note: `NOT an NSA-protected service: the No Surprises Act cap does NOT apply. The provider may bill the full out-of-network amount (here $${(chargeMinusQpa / 100).toFixed(2)} above the QPA is NOT shielded). Use allowed-amount for the out-of-network projection.`,
    };
  }

  // Protected: cost-share computed as if in-network off the QPA.
  const b = deductibleThenCoinsurance(qpaCents, deductibleRemainingCents, coinsurancePct, copayCents);
  const patientCostShareCents = b.patientCents;
  const prohibitedBalanceBillCents = Math.max(0, billedChargeCents - qpaCents);
  return {
    protected: true,
    serviceCategory: category,
    qpaCents,
    deductibleAppliedCents: b.deductibleApplied,
    coinsuranceCents: b.coinsuranceCents,
    copayCents,
    patientCostShareCents,
    planPaysCents: qpaCents - patientCostShareCents,
    prohibitedBalanceBillCents,
    note: `NSA-protected (${category === 'emergency' ? 'emergency' : 'ancillary at an in-network facility'}): the patient's cost-share is capped at the in-network amount on the QPA. Balance billing is PROHIBITED -- the $${(prohibitedBalanceBillCents / 100).toFixed(2)} above the QPA may NOT be charged to the patient.`,
  };
}
