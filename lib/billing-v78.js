// spec-v78 §2: the MPFS reimbursement engine -- five deterministic, cited
// Medicare Physician Fee Schedule calculators (spec-v77 billing & coding
// program, Group B "Billing & Reimbursement"). Each is a pure function over a
// handful of inputs: RVUs + GPCI + conversion factor for the base allowed
// amount, then the fixed-order reductions the line's modifiers and MPFS policy
// indicators trigger (multiple-procedure, bilateral, assistant/co/team surgeon,
// and the 2% sequestration cut).
//
// Money is integer cents end-to-end (spec-v78 §3): every compute works in cents
// and the renderer formats once at the edge through fmt() (lib/num.js), so no
// float toFixed leak and no NaN/Infinity can reach the DOM (spec-v59 output
// safety). Indicators GATE rather than guess: every not-payable / does-not-apply
// indicator path returns an explicit { payable: false, note } object, never a
// silent $0 or a wrong percentage. Bad numeric inputs throw TypeError/RangeError
// (caught by the view's safe() wrapper), never an Invalid Date or wrong number.
//
// Dated constants (the PFS conversion factor, the 2% sequestration rate, the
// 16% / 62.5% surgical percentages, the 100/50/50 and 150% reduction factors)
// are carried as named values here and ledger-tracked in pa-staleness-ledger.json
// (ruleFamily "billing-v78"); check-pa-staleness guards their currency in CI.

import { num } from './num.js';

// --- dated constants (ruleFamily billing-v78) --------------------------------
// CY2026 CMS PFS conversion factor (dollars per RVU). Overridable per call to
// model a non-Medicare contract priced as a percentage of the fee schedule.
export const PFS_CONVERSION_FACTOR_CY2026 = 32.7442;
// Medicare sequestration: 2% of the program-payment portion (Budget Control Act
// of 2011 §251A), applied AFTER deductible and coinsurance.
export const SEQUESTRATION_PCT = 2;
// CMS Pub. 100-04 Ch. 12 surgical payment percentages.
export const ASSISTANT_SURGEON_PCT = 16;   // mod 80/81/82/AS, of the primary fee
export const CO_SURGEON_PCT = 62.5;        // mod 62, to EACH co-surgeon
export const MULTIPLE_PROCEDURE_SUBSEQUENT_PCT = 50; // 100% highest, 50% each subsequent
export const BILATERAL_PCT = 150;          // indicator 1: 150% of the fee for the pair

// dollarsToCents(d) -> integer cents. Throws on a non-finite / negative dollar
// value so a bad fee can never become a silently-wrong amount.
export function dollarsToCents(dollars) {
  num('amount', dollars, { min: 0 });
  return Math.round(dollars * 100);
}

// roundCentsPct(cents, pct) -> integer cents of `pct` percent of `cents`. One
// rounding, at the edge, so composing reductions stays exact.
function roundCentsPct(cents, pct) {
  return Math.round((cents * pct) / 100);
}

// --- 2.1 rvu-payment ---------------------------------------------------------
// MPFS allowed = [ workRVU*workGPCI + peRVU*peGPCI + mpRVU*mpGPCI ] * CF.
// Computes both the non-facility and facility allowed amounts (the PE RVU
// differs by site of service) and the site-of-service differential (the dollars
// gained/lost moving the service into a facility). Money is integer cents.
export function rvuPayment({
  workRvu, peRvuNonFacility, peRvuFacility, mpRvu,
  workGpci, peGpci, mpGpci, conversionFactor, units = 1,
}) {
  num('workRvu', workRvu, { min: 0 });
  num('peRvuNonFacility', peRvuNonFacility, { min: 0 });
  num('peRvuFacility', peRvuFacility, { min: 0 });
  num('mpRvu', mpRvu, { min: 0 });
  num('workGpci', workGpci, { min: 0 });
  num('peGpci', peGpci, { min: 0 });
  num('mpGpci', mpGpci, { min: 0 });
  num('conversionFactor', conversionFactor, { min: 0 });
  num('units', units, { min: 1, max: 1000 });
  const u = Math.round(units);

  const adjWork = workRvu * workGpci;
  const adjPeNonFacility = peRvuNonFacility * peGpci;
  const adjPeFacility = peRvuFacility * peGpci;
  const adjMp = mpRvu * mpGpci;

  const totalRvuNonFacility = adjWork + adjPeNonFacility + adjMp;
  const totalRvuFacility = adjWork + adjPeFacility + adjMp;

  const nonFacilityCents = Math.round(totalRvuNonFacility * conversionFactor * 100) * u;
  const facilityCents = Math.round(totalRvuFacility * conversionFactor * 100) * u;
  // Positive = the non-facility line pays more (PE is reduced in a facility).
  const siteDifferentialCents = nonFacilityCents - facilityCents;

  return {
    adjWork, adjPeNonFacility, adjPeFacility, adjMp,
    totalRvuNonFacility, totalRvuFacility,
    nonFacilityCents, facilityCents, siteDifferentialCents,
    units: u,
  };
}

// --- 2.2 mppr -- multiple-procedure payment reduction ------------------------
// Surgical: 100% of the highest-fee line, `subsequentPct` (default 50%) of each
// subsequent line, ranked by fee. Endoscopy base rule: highest paid full, each
// subsequent endoscopy = its fee minus the endoscopic base value. Returns the
// re-ranked lines with per-line and total expected allowed, and the dollars the
// reduction withholds. lines: [{ feeCents }]; feeCents is a non-negative integer.
export function mppr({ lines, mode = 'surgical', subsequentPct = MULTIPLE_PROCEDURE_SUBSEQUENT_PCT, baseFeeCents = 0 }) {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new TypeError('mppr requires a non-empty lines array');
  }
  const fees = lines.map((l, i) => {
    const c = l && l.feeCents;
    num(`lines[${i}].feeCents`, c, { min: 0 });
    return Math.round(c);
  });
  num('subsequentPct', subsequentPct, { min: 0, max: 100 });
  num('baseFeeCents', baseFeeCents, { min: 0 });

  // Rank by fee, highest first; keep the original index so the caller can map back.
  const ranked = fees
    .map((feeCents, index) => ({ feeCents, index }))
    .sort((a, b) => b.feeCents - a.feeCents);

  const isEndoscopy = mode === 'endoscopy';
  const base = Math.round(baseFeeCents);

  const resultLines = ranked.map((r, rank) => {
    let allowedCents;
    let appliedPct;
    if (rank === 0) {
      allowedCents = r.feeCents;
      appliedPct = 100;
    } else if (isEndoscopy) {
      // Endoscopy base rule: pay the difference over the endoscopic base value.
      allowedCents = Math.max(0, r.feeCents - base);
      appliedPct = r.feeCents > 0 ? Math.round((allowedCents / r.feeCents) * 100) : 0;
    } else {
      allowedCents = roundCentsPct(r.feeCents, subsequentPct);
      appliedPct = subsequentPct;
    }
    return { rank: rank + 1, originalIndex: r.index, feeCents: r.feeCents, allowedCents, appliedPct };
  });

  const fullCents = fees.reduce((a, b) => a + b, 0);
  const allowedTotalCents = resultLines.reduce((a, l) => a + l.allowedCents, 0);
  const withheldCents = fullCents - allowedTotalCents;

  return { mode, lines: resultLines, fullCents, allowedTotalCents, withheldCents };
}

// --- 2.3 bilateral-pay -- modifier 50 by MPFS BILAT SURG indicator -----------
// 0 = modifier 50 not payable; 1 = 150% of the fee for the pair; 2 = already
// priced as bilateral (100%); 3 = pay each side at full (200%); 9 = concept
// does not apply. Returns an explicit not-payable gate for 0/9.
export function bilateralPay({ feeCents, indicator }) {
  num('feeCents', feeCents, { min: 0 });
  const ind = Math.round(num('indicator', indicator, { min: 0, max: 9 }));
  const fee = Math.round(feeCents);
  if (ind === 1) {
    return { payable: true, indicator: ind, factorPct: 150, allowedCents: roundCentsPct(fee, 150),
      note: 'Indicator 1: pay 150% of the fee schedule for the bilateral pair (bill one line, modifier 50, one unit).' };
  }
  if (ind === 2) {
    return { payable: true, indicator: ind, factorPct: 100, allowedCents: fee,
      note: 'Indicator 2: the fee is already adjusted for the bilateral procedure; pay 100% (do not add 50% on top).' };
  }
  if (ind === 3) {
    return { payable: true, indicator: ind, factorPct: 200, allowedCents: roundCentsPct(fee, 200),
      note: 'Indicator 3: pay each side at the full fee (200% total); the bilateral reduction does not apply.' };
  }
  // 0, 4..9: not separately payable as bilateral.
  return { payable: false, indicator: ind, factorPct: null, allowedCents: null,
    note: ind === 9
      ? 'Indicator 9: the bilateral concept does not apply to this code -- modifier 50 is not used.'
      : 'Indicator 0: modifier 50 is not payable for this code -- bill it differently (do not append modifier 50).' };
}

// --- 2.4 multi-surgeon-pay -- assistant / co-surgeon / team-surgeon ----------
// role: 'assistant' (mod 80/81/82/AS) = 16% of the primary fee; 'co' (mod 62) =
// 62.5% to each co-surgeon; 'team' (mod 66) = by report (carrier-priced). The
// code's matching surgical indicator gates whether the role is payable at all:
// 0/9 = not separately payable; 1 = payable with documentation; 2 = payable.
export function multiSurgeonPay({ feeCents, role, indicator }) {
  num('feeCents', feeCents, { min: 0 });
  const ind = Math.round(num('indicator', indicator, { min: 0, max: 9 }));
  const fee = Math.round(feeCents);
  const r = String(role);

  if (ind === 0 || ind === 9) {
    return { payable: false, role: r, factorPct: null, allowedCents: null, byReport: false,
      note: ind === 9
        ? 'Indicator 9: the concept does not apply to this code -- this role is not used here.'
        : 'Indicator 0: this assisting role is not separately payable for this code (the not-payable gate).' };
  }
  const docNote = ind === 1 ? ' Indicator 1: payable only with supporting documentation of medical necessity.' : '';

  if (r === 'assistant') {
    return { payable: true, role: r, factorPct: ASSISTANT_SURGEON_PCT, allowedCents: roundCentsPct(fee, ASSISTANT_SURGEON_PCT), byReport: false,
      note: `Assistant at surgery (modifier 80/81/82, or AS for a PA/NP/CNS): ${ASSISTANT_SURGEON_PCT}% of the primary fee.` + docNote };
  }
  if (r === 'co') {
    return { payable: true, role: r, factorPct: CO_SURGEON_PCT, allowedCents: roundCentsPct(fee, CO_SURGEON_PCT), byReport: false,
      note: `Co-surgeon (modifier 62): ${CO_SURGEON_PCT}% of the fee to EACH of the two surgeons.` + docNote };
  }
  if (r === 'team') {
    return { payable: true, role: r, factorPct: null, allowedCents: null, byReport: true,
      note: 'Team surgeon (modifier 66): by report -- carrier-priced from the operative documentation; no fixed percentage.' + docNote };
  }
  throw new TypeError('role must be one of: assistant, co, team');
}

// --- 2.5 sequestration-adjust -- the 2% Medicare sequestration cut -----------
// The 2% reduction applies to the program-payment portion (allowed minus the
// beneficiary's deductible + coinsurance), NEVER to the allowed amount or the
// patient's cost-share. The last reduction in the chain. seqPct overridable to
// model the suspended/phased rates Congress has set in the past.
export function sequestrationAdjust({ allowedCents, patientResponsibilityCents = 0, seqPct = SEQUESTRATION_PCT }) {
  num('allowedCents', allowedCents, { min: 0 });
  num('patientResponsibilityCents', patientResponsibilityCents, { min: 0 });
  num('seqPct', seqPct, { min: 0, max: 100 });
  const allowed = Math.round(allowedCents);
  const patient = Math.round(patientResponsibilityCents);
  if (patient > allowed) {
    throw new RangeError('patientResponsibilityCents cannot exceed allowedCents');
  }
  const programPaymentCents = allowed - patient;
  const sequestrationCents = roundCentsPct(programPaymentCents, seqPct);
  const netPaymentCents = programPaymentCents - sequestrationCents;
  return { allowedCents: allowed, patientResponsibilityCents: patient, programPaymentCents, sequestrationCents, netPaymentCents, seqPct };
}
