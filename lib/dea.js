// spec-v4 §5 utility 115: DEA Registration Number Validator.
//
// Format: 9 characters total.
//   - Position 0: registrant type letter
//       A/B/F = older Schedule II distributors and practitioners
//       M     = mid-level practitioners (NP/PA)
//       P/R   = manufacturers
//       G     = researcher
//       X     = Suboxone (DATA-Waived) prescribers
//       J/K   = newer registrant types (kept for flexibility; NOT used in
//               the canonical "checksum-only" guidance, but accepted here
//               since DEA continues to issue them).
//   - Position 1: first letter of the registrant's last name OR a business
//                 initial. We do not validate this against the registrant
//                 (this is intentional - it's a checksum tool, not a registry).
//   - Positions 2..8: seven digits. The 9th character is the checksum digit.
//
// Checksum:
//   sum1 = d[2] + d[4] + d[6]                 (positions 1, 3, 5 of the digit run)
//   sum2 = d[3] + d[5] + d[7]                 (positions 2, 4, 6 of the digit run)
//   total = sum1 + 2 * sum2
//   checkDigit = (total % 10)                 (the ones digit of total)
//   checkDigit must equal d[8] (the 9th character).

export const VALID_REGISTRANT_LETTERS = ['A','B','F','G','M','P','R','X'];

export function validateDEA(input) {
  const raw = String(input || '').trim().toUpperCase();
  if (!/^[A-Z]{2}\d{7}$/.test(raw)) {
    return { ok: false, error: 'DEA must be 2 letters followed by 7 digits.' };
  }
  const registrant = raw[0];
  if (!VALID_REGISTRANT_LETTERS.includes(registrant)) {
    return { ok: false, error: `Registrant letter ${registrant} is outside the canonical set (A/B/F/G/M/P/R/X). Modern DEA also issues other letters; verify by registry.` };
  }
  const digits = raw.slice(2).split('').map(Number);
  const sum1 = digits[0] + digits[2] + digits[4];
  const sum2 = digits[1] + digits[3] + digits[5];
  const total = sum1 + 2 * sum2;
  const expected = total % 10;
  const got = digits[6];
  return {
    ok: expected === got,
    input: raw,
    registrant,
    nameInitial: raw[1],
    digits,
    sum1, sum2, total, expectedCheckDigit: expected, gotCheckDigit: got,
    error: expected === got ? null : `Checksum digit mismatch: expected ${expected}, got ${got}.`,
  };
}
