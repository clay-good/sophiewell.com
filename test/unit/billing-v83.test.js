// spec-v83 §5 acceptance: claim integrity & facility payment. Each of the six
// engines gets >=3 boundary worked examples: a Luhn transposition (npi), each
// MBI position/excluded-letter rule, the ICD-10 missing-7th-character case, an
// out-of-balance 835, a DRG transfer, and an OPPS multiple-procedure discount.
// All money is integer cents. One file, mirroring billing-v82.test.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  npiValidate, mbiValidate, icd10Validate, eraBalance, drgPayment, apcPayment,
  MBI_EXCLUDED_LETTERS,
} from '../../lib/billing-v83.js';

// ---- 2.1 npi-validate -------------------------------------------------------
test('npi-validate: validates a good NPI, catches a transposition, generates the check digit', () => {
  // 1234567893 is the canonical valid NPI (Luhn over 80840123456789 -> 3).
  const ok = npiValidate({ npi: '1234567893' });
  assert.equal(ok.valid, true);
  assert.equal(ok.expectedCheckDigit, 3);
  assert.equal(ok.checkDigit, 3);
  // A wrong/transposed final digit: invalid, with the expected digit shown.
  const bad = npiValidate({ npi: '1234567890' });
  assert.equal(bad.valid, false);
  assert.equal(bad.expectedCheckDigit, 3);
  // Generate the 10th digit from the 9-digit base.
  const gen = npiValidate({ npi: '123456789' });
  assert.equal(gen.mode, 'generate');
  assert.equal(gen.checkDigit, 3);
  assert.equal(gen.npi, '1234567893');
  // Hyphens/spaces tolerated; letters rejected; wrong length rejected.
  assert.equal(npiValidate({ npi: '123 456 7893' }).valid, true);
  assert.throws(() => npiValidate({ npi: '12345' }), RangeError);
  assert.throws(() => npiValidate({ npi: '12345abcde' }), RangeError);
  assert.throws(() => npiValidate({}), TypeError);
});

// ---- 2.2 mbi-validate -------------------------------------------------------
test('mbi-validate: accepts a well-formed MBI; names the first offending position/rule', () => {
  // CMS sample-format MBI: 1EG4-TE5-MK73.
  assert.equal(mbiValidate({ mbi: '1EG4-TE5-MK73' }).valid, true);
  // Position 2 must be alphabetic.
  const p2 = mbiValidate({ mbi: '12G4TE5MK73' });
  assert.equal(p2.valid, false);
  assert.equal(p2.firstError.position, 2);
  // An excluded letter (S) anywhere is flagged as the excluded-letter rule.
  const ex = mbiValidate({ mbi: '1SG4TE5MK73' });
  assert.equal(ex.valid, false);
  assert.match(ex.firstError.rule, /excluded letter/);
  // Wrong length.
  assert.equal(mbiValidate({ mbi: '1EG4TE5MK7' }).valid, false);
  assert.deepEqual(MBI_EXCLUDED_LETTERS, ['S', 'L', 'O', 'I', 'B', 'Z']);
  assert.throws(() => mbiValidate({}), TypeError);
});

// ---- 2.3 icd10-validate -----------------------------------------------------
test('icd10-validate: structural grammar + the required-7th-character specificity gate', () => {
  // A complete, valid code with no 7th char required.
  assert.equal(icd10Validate({ code: 'M54.5' }).valid, true);
  // 7th character required but absent -> incomplete (would deny for specificity).
  const need = icd10Validate({ code: 'S52.5', requires7th: true });
  assert.equal(need.valid, false);
  assert.equal(need.structurallyValid, true);
  assert.equal(need.has7th, false);
  // 7th character present -> valid.
  const full = icd10Validate({ code: 'S52.521A', requires7th: true });
  assert.equal(full.valid, true);
  assert.equal(full.has7th, true);
  // Bad character pattern: a leading digit is not a category letter.
  const bad = icd10Validate({ code: '5A4.5' });
  assert.equal(bad.valid, false);
  assert.equal(bad.structurallyValid, false);
  assert.throws(() => icd10Validate({}), TypeError);
});

// ---- 2.4 era-balance --------------------------------------------------------
test('era-balance: a balanced 835 nets to $0; an unbalanced one reports the exact residual + Sigma PR', () => {
  // Billed $200, paid $120, CO $50, PR $30 -> balances; patient owes $30.
  const ok = eraBalance({ billedCents: 20000, paidCents: 12000, coCents: 5000, prCents: 3000 });
  assert.equal(ok.balanced, true);
  assert.equal(ok.residualCents, 0);
  assert.equal(ok.patientResponsibilityCents, 3000);
  assert.equal(ok.sumAdjCents, 8000);
  // Same claim, PR understated by $10 -> out of balance by exactly $10.
  const off = eraBalance({ billedCents: 20000, paidCents: 12000, coCents: 5000, prCents: 2000 });
  assert.equal(off.balanced, false);
  assert.equal(off.residualCents, 1000);
  // Over-stated adjustment -> negative residual.
  const over = eraBalance({ billedCents: 20000, paidCents: 12000, coCents: 5000, prCents: 4000 });
  assert.equal(over.residualCents, -1000);
  assert.throws(() => eraBalance({ paidCents: 1 }), TypeError); // missing billed
});

// ---- 2.5 drg-payment --------------------------------------------------------
test('drg-payment: weight x wage-adjusted base, and the per-diem transfer reduction', () => {
  // Weight 1.5, operating $6,000 + capital $500, wage 1.0 -> base $9,750.
  const base = drgPayment({ relativeWeight: 1.5, operatingBaseCents: 600000, capitalBaseCents: 50000, wageIndex: 1 });
  assert.equal(base.wageAdjustedBaseCents, 650000);
  assert.equal(base.baseDrgCents, 975000);
  assert.equal(base.totalCents, 975000);
  assert.equal(base.isTransferPriced, false);
  // Transfer: GMLOS 5, LOS 2 -> per diem $1,950, first day doubled => $5,850.
  const xfer = drgPayment({ relativeWeight: 1.5, operatingBaseCents: 600000, capitalBaseCents: 50000, wageIndex: 1, isTransfer: true, lengthOfStay: 2, gmlos: 5 });
  assert.equal(xfer.perDiemCents, 195000);
  assert.equal(xfer.transferAdjustedCents, 585000);
  assert.equal(xfer.isTransferPriced, true);
  // A long transfer stay is capped at the full DRG, never above it.
  const longXfer = drgPayment({ relativeWeight: 1.5, operatingBaseCents: 600000, capitalBaseCents: 50000, wageIndex: 1, isTransfer: true, lengthOfStay: 20, gmlos: 5 });
  assert.equal(longXfer.transferAdjustedCents, 975000);
  // Wage index scales the base.
  const wage = drgPayment({ relativeWeight: 1, operatingBaseCents: 100000, capitalBaseCents: 0, wageIndex: 1.2 });
  assert.equal(wage.baseDrgCents, 120000);
  assert.throws(() => drgPayment({ operatingBaseCents: 1 }), TypeError); // missing weight
});

// ---- 2.6 apc-payment --------------------------------------------------------
test('apc-payment: weight x CF, status-indicator packaging, multiple-procedure discount', () => {
  // CF $87, wage 1. T weight 10 -> $870 (100%); T weight 4 -> $348 -> 50% $174;
  // N weight 2 -> packaged $0. Total $1,044.
  const r = apcPayment({
    lines: [
      { weight: 10, statusIndicator: 'T' },
      { weight: 4, statusIndicator: 'T' },
      { weight: 2, statusIndicator: 'N' },
    ],
    conversionFactorCents: 8700, wageIndex: 1,
  });
  assert.equal(r.lines[0].payCents, 87000);
  assert.equal(r.lines[1].payCents, 17400);
  assert.equal(r.lines[1].discounted, true);
  assert.equal(r.lines[2].packaged, true);
  assert.equal(r.lines[2].payCents, 0);
  assert.equal(r.totalCents, 104400);
  // A status S line is separately payable but NOT discounted even with two of them.
  const s = apcPayment({ lines: [{ weight: 2, statusIndicator: 'S' }, { weight: 1, statusIndicator: 'S' }], conversionFactorCents: 10000, wageIndex: 1 });
  assert.equal(s.totalCents, 30000); // 2*100 + 1*100, no discount
  assert.throws(() => apcPayment({ lines: [], conversionFactorCents: 1 }), RangeError);
  assert.throws(() => apcPayment({ conversionFactorCents: 1 }), TypeError);
});
