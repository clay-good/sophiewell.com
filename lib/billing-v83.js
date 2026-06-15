// spec-v83 §2: Claim integrity & facility payment -- the final feature spec of
// the spec-v77 billing & coding program (Group B "Billing & Reimbursement").
// Two families of deterministic work close the program at once:
//
//   CLAIM INTEGRITY (validators that catch a bad identifier or an out-of-balance
//   remittance BEFORE the clearinghouse rejects it):
//     2.1 npiValidate    -- NPI Luhn check-digit validate / generate
//     2.2 mbiValidate    -- Medicare Beneficiary Identifier position-grammar
//     2.3 icd10Validate  -- ICD-10-CM structural & 7th-character specificity
//     2.4 eraBalance     -- 835 / EOB remittance balancing (billed = paid + Sigma adj)
//
//   FACILITY PAYMENT (the UB-04 institutional side the professional fee schedule
//   in billing-v78 does not compute):
//     2.5 drgPayment     -- IPPS DRG payment (weight x wage-adjusted base rate)
//     2.6 apcPayment     -- OPPS APC payment (weight x CF, status-indicator
//                           packaging + multiple-procedure discount)
//
// Doctrine (spec-v77 §2): the validators verify FORMAT / STRUCTURE / CHECK-DIGIT
// only -- never enrollment, entitlement, or clinical correctness (stated on each
// tile). The facility pricers consume the bundled data/drg & data/apc relative
// weights but take every dated rate (IPPS operating/capital base, OPPS conversion
// factor, wage index) as an input/dated constant, so they price any DRG/APC or
// hospital not in the bundle (doctrine clause 2).
//
// Safety contract (spec-v59): validators are exact and reversible -- they name the
// first offending position/rule, not just "invalid". Money is integer cents and
// eraBalance proves billed - paid - Sigma(adjustments) to the cent. Bad inputs
// throw TypeError/RangeError (caught by the view's safe() wrapper); no returned
// string embeds NaN / Infinity / undefined.
//
// Dated constants (the IPPS operating/capital base rates, the OPPS conversion
// factor, the MBI excluded-letter set & position grammar) are ledger-tracked in
// pa-staleness-ledger.json (ruleFamily "billing-v83"); check-pa-staleness guards
// their currency in CI.

import { num } from './num.js';

// =============================================================================
// 2.1 npi-validate -- NPI Luhn check-digit validate / generate
// =============================================================================
// 45 CFR §162.406. The NPI carries a Luhn (ISO/IEC 7812) check digit computed
// over the 9-digit identifier prefixed with the 80840 issuer prefix. A 10-digit
// NPI is validated by recomputing the check digit from its first 9 digits; a
// 9-digit base has its 10th (check) digit generated. Catches the single most
// common provider-identifier typo (a transposition). Verifies the FORMAT/CHECK
// DIGIT only -- not that the NPI is enrolled in NPPES.
const NPI_PREFIX = '80840';

// Standard Luhn check digit for a numeric payload string (rightmost digit is
// doubled first, since the check digit will sit to its right).
function luhnCheckDigit(payload) {
  let sum = 0;
  let dbl = true;
  for (let i = payload.length - 1; i >= 0; i -= 1) {
    let d = payload.charCodeAt(i) - 48;
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    dbl = !dbl;
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

export function npiValidate(input) {
  const raw = String(input && input.npi != null ? input.npi : '').replace(/[\s-]/g, '');
  if (raw === '') throw new TypeError('enter a 9-digit base (to generate) or a 10-digit NPI (to validate)');
  if (!/^\d+$/.test(raw)) {
    throw new RangeError('an NPI is digits only -- remove any letters or symbols');
  }

  if (raw.length === 9) {
    const checkDigit = luhnCheckDigit(NPI_PREFIX + raw);
    const npi = raw + String(checkDigit);
    return {
      mode: 'generate',
      base: raw,
      checkDigit,
      npi,
      valid: true,
      note: `Generated check digit ${checkDigit} (Luhn over ${NPI_PREFIX}${raw}); the complete NPI is ${npi}. This validates the format/check digit, not NPPES enrollment.`,
    };
  }

  if (raw.length === 10) {
    const base = raw.slice(0, 9);
    const stated = raw.charCodeAt(9) - 48;
    const expected = luhnCheckDigit(NPI_PREFIX + base);
    const valid = stated === expected;
    return {
      mode: 'validate',
      npi: raw,
      base,
      checkDigit: stated,
      expectedCheckDigit: expected,
      valid,
      note: valid
        ? `Valid NPI: the check digit ${stated} matches the Luhn digit recomputed over ${NPI_PREFIX}${base}. (Format/check-digit only -- not an enrollment check.)`
        : `INVALID NPI: the check digit should be ${expected} (Luhn over ${NPI_PREFIX}${base}), not ${stated}. A wrong check digit means a typo or transposition -- fix the digits before submitting.`,
    };
  }

  throw new RangeError(`an NPI is 10 digits (or a 9-digit base to generate the 10th) -- got ${raw.length} digits`);
}

// =============================================================================
// 2.2 mbi-validate -- Medicare Beneficiary Identifier format validator
// =============================================================================
// CMS MBI format: 11 characters in a fixed position grammar, excluding the
// easily-confused letters S, L, O, I, B, Z. Position types:
//   1  C  numeric 1-9
//   2  A  alphabetic (excluding SLOIBZ)
//   3  AN alphanumeric (digit, or alphabetic excluding SLOIBZ)
//   4  N  numeric 0-9
//   5  A  alphabetic
//   6  AN alphanumeric
//   7  N  numeric
//   8  A  alphabetic
//   9  A  alphabetic
//   10 N  numeric
//   11 N  numeric
// Names the FIRST offending position and rule so the user can fix the character.
// Validates FORMAT only, not active entitlement.
export const MBI_EXCLUDED_LETTERS = Object.freeze(['S', 'L', 'O', 'I', 'B', 'Z']);
const MBI_EXCLUDED = new Set(MBI_EXCLUDED_LETTERS);
// Position grammar, index 0 = position 1.
const MBI_GRAMMAR = Object.freeze(['C', 'A', 'AN', 'N', 'A', 'AN', 'N', 'A', 'A', 'N', 'N']);
const MBI_RULE_TEXT = Object.freeze({
  C: 'a non-zero digit (1-9)',
  N: 'a digit (0-9)',
  A: 'a letter, excluding S, L, O, I, B, Z',
  AN: 'a digit or a letter excluding S, L, O, I, B, Z',
});

function mbiCharOk(type, ch) {
  const isDigit = ch >= '0' && ch <= '9';
  const isAlpha = ch >= 'A' && ch <= 'Z';
  if (type === 'C') return isDigit && ch !== '0';
  if (type === 'N') return isDigit;
  if (type === 'A') return isAlpha && !MBI_EXCLUDED.has(ch);
  // AN
  return isDigit || (isAlpha && !MBI_EXCLUDED.has(ch));
}

export function mbiValidate(input) {
  const raw = String(input && input.mbi != null ? input.mbi : '').replace(/[\s-]/g, '').toUpperCase();
  if (raw === '') throw new TypeError('enter an MBI (11 characters)');

  if (raw.length !== 11) {
    return {
      valid: false,
      mbi: raw,
      firstError: { position: null, rule: `an MBI is exactly 11 characters; got ${raw.length}`, got: null },
      note: `INVALID: an MBI is exactly 11 characters (no spaces or hyphens) -- got ${raw.length}.`,
    };
  }

  for (let i = 0; i < 11; i += 1) {
    const ch = raw[i];
    const type = MBI_GRAMMAR[i];
    if (!mbiCharOk(type, ch)) {
      const isAlpha = ch >= 'A' && ch <= 'Z';
      const excluded = isAlpha && MBI_EXCLUDED.has(ch);
      const rule = excluded
        ? `contains the excluded letter "${ch}" (S, L, O, I, B, Z are never used)`
        : `position ${i + 1} must be ${MBI_RULE_TEXT[type]}; got "${ch}"`;
      return {
        valid: false,
        mbi: raw,
        firstError: { position: i + 1, rule, got: ch },
        note: `INVALID: ${rule}. (Format only -- this does not confirm active Medicare entitlement.)`,
      };
    }
  }
  return {
    valid: true,
    mbi: raw,
    firstError: null,
    note: 'Valid MBI: all 11 positions satisfy the CMS position grammar and no excluded letter is present. (Format only -- not an entitlement check.)',
  };
}

// =============================================================================
// 2.3 icd10-validate -- ICD-10-CM structural & specificity checker
// =============================================================================
// ICD-10-CM code-set conventions: a 3-character category (letter, digit,
// alphanumeric), an optional decimal, then up to four more alphanumeric
// characters; the placeholder X; and the required 7th character for certain
// chapters. Flags a missing/invalid character pattern, a missing 7th character
// where required, and an unfilled placeholder. Validates STRUCTURE and
// SPECIFICITY only -- it does not assert the code is the clinically correct
// diagnosis. Existence against the bundled data/icd10cm shards is a near-neighbor
// check done in the renderer; the structural grammar works for any code.
function isAlnum(ch) { return (ch >= '0' && ch <= '9') || (ch >= 'A' && ch <= 'Z'); }

export function icd10Validate(input) {
  const raw = String(input && input.code != null ? input.code : '').replace(/\s/g, '').toUpperCase();
  const requires7th = !!(input && input.requires7th);
  if (raw === '') throw new TypeError('enter an ICD-10-CM code');

  // Strip the decimal; remember the dot was present for the display string.
  const code = raw.replace('.', '');
  if (raw.indexOf('.') !== raw.lastIndexOf('.')) {
    return invalidIcd(raw, 'a code has at most one decimal point', requires7th);
  }
  if (code.length < 3) return invalidIcd(raw, `a code is at least 3 characters (category); got ${code.length}`, requires7th);
  if (code.length > 7) return invalidIcd(raw, `a code is at most 7 characters; got ${code.length}`, requires7th);

  // Character-class grammar.
  if (!(code[0] >= 'A' && code[0] <= 'Z')) return invalidIcd(raw, 'character 1 (category) must be a letter', requires7th);
  if (!(code[1] >= '0' && code[1] <= '9')) return invalidIcd(raw, 'character 2 (category) must be a digit', requires7th);
  if (!isAlnum(code[2])) return invalidIcd(raw, 'character 3 (category) must be a digit or letter', requires7th);
  for (let i = 3; i < code.length; i += 1) {
    if (!isAlnum(code[i])) return invalidIcd(raw, `character ${i + 1} must be a digit or letter (or the placeholder X)`, requires7th);
  }

  const has7th = code.length === 7;
  const display = code.length > 3 ? `${code.slice(0, 3)}.${code.slice(3)}` : code;

  if (requires7th && !has7th) {
    // A 7th character is required: the code must be 7 long, padding unused
    // positions 4-6 with the placeholder X.
    const padded = (code + 'XXXX').slice(0, 6) + '<7th>';
    return {
      valid: false,
      code: display,
      structurallyValid: true,
      requires7th: true,
      has7th: false,
      note: `INCOMPLETE: this code requires a 7th character, but "${display}" has only ${code.length}. Pad unused positions 4-6 with the placeholder X and add the 7th character (e.g. ${code.slice(0, 3)}.${padded.slice(3)}). It would deny for lack of specificity.`,
    };
  }

  return {
    valid: true,
    code: display,
    structurallyValid: true,
    requires7th,
    has7th,
    note: `Valid structure: ${display} satisfies the ICD-10-CM grammar${requires7th ? ' and carries the required 7th character' : ''}. (Structure/specificity only -- it does not assert the code is the clinically correct diagnosis.)`,
  };
}

function invalidIcd(display, rule, requires7th) {
  return {
    valid: false,
    code: display,
    structurallyValid: false,
    requires7th: !!requires7th,
    has7th: false,
    note: `INVALID: ${rule}. (Structure only -- fix the code pattern before submitting.)`,
  };
}

// =============================================================================
// 2.4 era-balance -- 835 / EOB remittance balancing
// =============================================================================
// ASC X12 835 balancing: billed = paid + Sigma(claim adjustments), where the
// adjustments are the CAS group amounts CO (contractual obligation), PR (patient
// responsibility), OA (other adjustment), PI (payer-initiated). The patient
// responsibility the practice should post and bill is Sigma(PR). All integer
// cents; the residual is proven to the cent. The pre-posting check that stops an
// unbalanced remittance from corrupting the ledger.
export function eraBalance(input) {
  const billedCents = Math.round(num('billedCents', input.billedCents, { min: 0, max: 1e11 }));
  const paidCents = Math.round(num('paidCents', input.paidCents, { min: 0, max: 1e11 }));
  const coCents = Math.round(num('coCents', input.coCents == null ? 0 : input.coCents, { min: -1e11, max: 1e11 }));
  const prCents = Math.round(num('prCents', input.prCents == null ? 0 : input.prCents, { min: -1e11, max: 1e11 }));
  const oaCents = Math.round(num('oaCents', input.oaCents == null ? 0 : input.oaCents, { min: -1e11, max: 1e11 }));
  const piCents = Math.round(num('piCents', input.piCents == null ? 0 : input.piCents, { min: -1e11, max: 1e11 }));

  const sumAdjCents = coCents + prCents + oaCents + piCents;
  const residualCents = billedCents - paidCents - sumAdjCents;
  const balanced = residualCents === 0;
  const patientResponsibilityCents = prCents;

  return {
    billedCents, paidCents,
    coCents, prCents, oaCents, piCents,
    sumAdjCents,
    residualCents,
    balanced,
    patientResponsibilityCents,
    note: balanced
      ? `Balances: billed - paid - adjustments = $0.00. Post the payment and bill the patient $${(patientResponsibilityCents / 100).toFixed(2)} (Sigma PR).`
      : `OUT OF BALANCE by $${(Math.abs(residualCents) / 100).toFixed(2)} (${residualCents > 0 ? 'billed exceeds paid + adjustments -- a posting line is missing' : 'paid + adjustments exceed billed -- an adjustment is over-stated'}). Do not post until billed - paid - Sigma(adjustments) = 0.`,
  };
}

// =============================================================================
// 2.5 drg-payment -- IPPS DRG payment estimate
// =============================================================================
// 42 CFR Part 412. DRG payment = relative weight x the wage-index-adjusted
// hospital base rate (operating + capital standardized amounts), before
// outlier/IME/DSH add-ons. A post-acute TRANSFER pays a per-diem (double the
// first day, single each subsequent day, capped at the full DRG). Estimates the
// OPERATING model; outlier/IME/DSH/new-tech precision needs the hospital's own
// cost-report factors. Relative weight & GMLOS come from data/drg or are entered.
export function drgPayment(input) {
  const relativeWeight = num('relativeWeight', input.relativeWeight, { min: 0, max: 1000 });
  const operatingBaseCents = Math.round(num('operatingBaseCents', input.operatingBaseCents, { min: 0, max: 1e11 }));
  const capitalBaseCents = Math.round(num('capitalBaseCents', input.capitalBaseCents == null ? 0 : input.capitalBaseCents, { min: 0, max: 1e11 }));
  const wageIndex = num('wageIndex', input.wageIndex == null ? 1 : input.wageIndex, { min: 0, max: 10 });
  const addOnCents = Math.round(num('addOnCents', input.addOnCents == null ? 0 : input.addOnCents, { min: 0, max: 1e11 }));
  const isTransfer = !!input.isTransfer;
  const lengthOfStay = Math.round(num('lengthOfStay', input.lengthOfStay == null ? 0 : input.lengthOfStay, { min: 0, max: 10000 }));
  const gmlos = num('gmlos', input.gmlos == null ? 0 : input.gmlos, { min: 0, max: 10000 });

  // Wage-adjust the base (operating + capital), then weight it.
  const wageAdjustedBaseCents = operatingBaseCents * wageIndex + capitalBaseCents * wageIndex;
  const baseDrgCents = Math.round(relativeWeight * wageAdjustedBaseCents);

  let transferAdjustedCents = baseDrgCents;
  let perDiemCents = null;
  let isTransferPriced = false;
  if (isTransfer && gmlos > 0 && lengthOfStay > 0) {
    perDiemCents = Math.round(baseDrgCents / gmlos);
    // First day double, each subsequent day single, capped at the full DRG.
    const transferRaw = Math.round(perDiemCents * Math.min(lengthOfStay + 1, gmlos + 1));
    transferAdjustedCents = Math.min(baseDrgCents, transferRaw);
    isTransferPriced = transferAdjustedCents < baseDrgCents;
  }

  const totalCents = transferAdjustedCents + addOnCents;

  return {
    relativeWeight,
    wageIndex,
    operatingBaseCents, capitalBaseCents,
    wageAdjustedBaseCents: Math.round(wageAdjustedBaseCents),
    baseDrgCents,
    isTransfer,
    isTransferPriced,
    perDiemCents,
    transferAdjustedCents,
    addOnCents,
    totalCents,
    note: isTransferPriced
      ? `Transfer case: paid per diem (~$${(perDiemCents / 100).toFixed(2)}/day; first day doubled, capped at the full DRG) = $${(transferAdjustedCents / 100).toFixed(2)}, not the full $${(baseDrgCents / 100).toFixed(2)}.${addOnCents > 0 ? ` Plus $${(addOnCents / 100).toFixed(2)} entered add-ons.` : ''} Estimates the operating model only; outlier/IME/DSH need the hospital's cost-report factors.`
      : `Base DRG payment = weight ${relativeWeight} x wage-adjusted base $${(wageAdjustedBaseCents / 100).toFixed(2)} = $${(baseDrgCents / 100).toFixed(2)}.${addOnCents > 0 ? ` Plus $${(addOnCents / 100).toFixed(2)} entered add-ons.` : ''} Estimates the operating model only; outlier/IME/DSH/new-tech need the hospital's own factors.`,
  };
}

// =============================================================================
// 2.6 apc-payment -- OPPS APC payment estimate
// =============================================================================
// 42 CFR Part 419. APC payment = relative weight x the OPPS conversion factor,
// wage adjusted, with status-indicator packaging (some lines are bundled into
// the primary and pay $0 separately) and the multiple-procedure DISCOUNT (a
// reduction on the lower-weighted discountable procedures on the same claim).
// The outpatient-facility counterpart to rvu-payment. Relative weights & status
// indicators come from data/apc or are entered.
//
// Status indicators: 'T' = significant procedure, subject to the multiple-
// procedure discount; 'J1' = comprehensive APC (separately payable, primary);
// 'S','V' = separately payable, NOT discounted; 'N' (and 'Q'/packaged) = packaged
// into the primary, paid $0 separately.
const APC_PACKAGED = new Set(['N', 'PACKAGED']);
const APC_DISCOUNTABLE = new Set(['T']);

export function apcPayment(input) {
  if (!Array.isArray(input.lines)) {
    throw new TypeError('lines must be an array of { weight, statusIndicator } APC entries');
  }
  if (input.lines.length === 0) throw new RangeError('enter at least one APC line');
  if (input.lines.length > 100) throw new RangeError('too many APC lines (max 100)');

  const conversionFactorCents = Math.round(num('conversionFactorCents', input.conversionFactorCents, { min: 0, max: 1e9 }));
  const wageIndex = num('wageIndex', input.wageIndex == null ? 1 : input.wageIndex, { min: 0, max: 10 });
  const discountPct = num('discountPct', input.discountPct == null ? 50 : input.discountPct, { min: 0, max: 100 });

  // Price each line: weight x CF x wage, $0 if packaged.
  const priced = input.lines.map((ln, i) => {
    const weight = num(`line ${i + 1} weight`, ln && ln.weight, { min: 0, max: 1e6 });
    const si = String(ln && ln.statusIndicator != null ? ln.statusIndicator : '').trim().toUpperCase();
    const packaged = APC_PACKAGED.has(si) || si === '';
    const fullCents = packaged ? 0 : Math.round(weight * conversionFactorCents * wageIndex);
    return {
      index: i, weight, statusIndicator: si || 'N',
      packaged, discountable: APC_DISCOUNTABLE.has(si),
      fullCents, payCents: fullCents,
    };
  });

  // Multiple-procedure discount: among the DISCOUNTABLE ('T') lines, the
  // highest-paying pays 100%, every subsequent one pays discountPct.
  const discountables = priced.filter((p) => p.discountable && p.fullCents > 0)
    .sort((a, b) => b.fullCents - a.fullCents);
  discountables.forEach((p, rank) => {
    if (rank === 0) return;
    p.payCents = Math.round(p.fullCents * discountPct / 100);
    p.discounted = true;
  });

  const totalCents = priced.reduce((s, p) => s + p.payCents, 0);
  const anyDiscount = discountables.length > 1;
  const anyPackaged = priced.some((p) => p.packaged);

  return {
    conversionFactorCents,
    wageIndex,
    discountPct,
    lines: priced,
    totalCents,
    note: `Total OPPS payment $${(totalCents / 100).toFixed(2)}: each separately-payable APC = weight x $${(conversionFactorCents / 100).toFixed(2)} CF x wage ${wageIndex}.${anyPackaged ? ' Packaged (status N) lines pay $0 -- bundled into the primary.' : ''}${anyDiscount ? ` The lower-weighted significant procedure(s) (status T) are reduced to ${discountPct}% by the multiple-procedure discount.` : ''} Estimates the base model; pass-through and comprehensive-APC nuances need the facility's own factors.`,
  };
}
