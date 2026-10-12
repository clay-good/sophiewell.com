// spec-v1637 tool 18: an NDC inside a GTIN, and the GTIN check digit.
//
// Sources, re-read October 12, 2026:
//   GS1 General Specifications, release 26.0 (ratified January 2026):
//     7.9.1, Table 7-8: from the right, excluding the check digit, multiply the digits alternately
//       by 3 and 1 (the digit next to the check digit takes 3); "Subtract sum from nearest equal or
//       higher multiple of ten = check digit". Table 7-9 is a unit test (37610425002123456 -> 9).
//     Table 1-6: GS1 Prefix 03, U.P.C. Prefix 3, "Used to issue U.P.C. Company Prefixes, reserved
//       for alignment with FDA Labeler Code".
//     Table 1-9: a GTIN-12 in a 14-digit field takes two leading zeros that "simply act as filler
//       digits".
//     Table 2-16: a GTIN-14 built on a GTIN-12 is the indicator, a zero, the first 11 digits of
//       the GTIN-12 and a new check digit; "The indicator is a digit with a value of 1 to 8";
//       "Indicator digit 9 is reserved for variable measure trade items". Table 2-17 is a unit
//       test (061414112345 -> 2; with indicator 1 -> 9; with indicator 8 -> 8).
//   FDA, proposed bar code rule, 68 FR 12500 (March 14, 2003): "if the drug's NDC number were
//     1234567890, the UPC number might be 312345678906, where the first digit (3) signifies that
//     the product is a drug, and the last digit is a 'check digit'"; "some drugs, particularly OTC
//     drugs, may have a UPC number that does not contain the NDC number". That example is a unit
//     test.
//   FDA's 12-digit NDC rule (91 FR 10749; effective March 7, 2033) is carried by lib/ndc.js.
// GS1 reserves the prefix; it does not say every GTIN beginning 03 holds an NDC. The result says
// "the digits in the NDC position", and that the three NDC segments cannot be recovered from the
// digits alone. No GS1 text ships; the tool implements the arithmetic.
//
// Pure: the clock is a parameter (used only for the 2033 format date).

import { ndc12Status } from './ndc.js';

export const INDICATORS = ['1', '2', '3', '4', '5', '6', '7', '8'].map((v) => ({ value: `indicator-${v}`, text: `Grouping, indicator digit ${v}` }));

// checkDigit(body) -> the GS1 check digit for a string of digits that excludes it.
export function gs1CheckDigit(body) {
  let sum = 0;
  for (let i = body.length - 1, w = 3; i >= 0; i -= 1, w = w === 3 ? 1 : 3) sum += Number(body[i]) * w;
  return String((10 - (sum % 10)) % 10);
}
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function ndcGtinConvert(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.value ?? '').trim();
  if (!raw) return { valid: false, message: 'Enter a 10-digit NDC as printed on the label, or a GTIN of 12, 13 or 14 digits.' };
  if (!/^[\d\s-]+$/.test(raw)) return { valid: false, message: 'Enter digits only, with or without hyphens: a 10-digit NDC, or a GTIN of 12, 13 or 14 digits.' };
  const digits = raw.replace(/\D/g, '');
  let indicator = null;
  if (!blank(o.indicator)) {
    const hit = INDICATORS.find((i) => i.value === String(o.indicator).trim());
    if (!hit) return { valid: false, message: 'Choose an indicator digit from 1 to 8, or leave it blank for the single item.' };
    indicator = hit.value.slice(-1);
  }
  const status = (() => { try { return ndc12Status(now); } catch { return null; } })();
  const notes = [];
  const segments = 'The three NDC segments cannot be recovered from the 10 digits alone: 4-4-2, 5-3-2 and 5-4-1 look the same without the hyphens, so the hyphenated NDC comes from the label or FDA\'s directory.';

  if (digits.length === 10) {
    const gtin12 = `3${digits}${gs1CheckDigit(`3${digits}`)}`;
    const single14 = `00${gtin12}`;
    const out = { valid: true, flag: 'gtin-built', ndcDigits: digits, gtin12, gtin14: single14 };
    notes.push(`GTIN-12 (UPC): 3, then the 10 NDC digits, then the check digit: ${gtin12}. In a 14-digit field the single item is ${single14}, with two filler zeros and the same check digit.`);
    if (indicator) {
      const body = `${indicator}03${digits}`;
      out.groupingGtin14 = `${body}${gs1CheckDigit(body)}`;
      notes.push(`A grouping with indicator digit ${indicator} is ${out.groupingGtin14}: the indicator, a zero, the 3, the NDC digits, and a check digit recalculated for the 14 digits.`);
    } else notes.push('No indicator digit was chosen, so no GTIN-14 for a case or other grouping is shown. A grouping takes an indicator of 1 to 8 and its own check digit.');
    notes.push('The check digit: from the right, the digits are multiplied alternately by 3 and 1, summed, and the sum is subtracted from the next multiple of ten (GS1 General Specifications, 7.9.1).');
    notes.push('GS1 reserves U.P.C. prefix 3 for alignment with the FDA labeler code. FDA notes some drugs, particularly over-the-counter ones, carry a UPC that does not contain the NDC, so this is the GTIN the NDC would give, not proof of the one printed on a package.');
    if (status) {
      if (status.inEffect) { out.flag = 'gtin-built-10-digit-form'; notes.push(`These are the 10-digit form. ${status.text} A 12-digit NDC is too long to be embedded in a GTIN; GS1 created application identifier (715) to carry it.`); }
      else notes.push(`${status.text} A 12-digit NDC will be too long to be embedded in a GTIN; GS1 created application identifier (715) to carry it.`);
    }
    notes.push(segments);
    return { ...out, abnormal: false, band: `GTIN-12 ${gtin12}; in a 14-digit field ${single14}.`, bandLabel: indicator ? `Grouping GTIN-14 ${out.groupingGtin14}` : 'Single item', notes, note: notes.join(' ') };
  }
  if (digits.length === 11) return { valid: false, message: 'Enter the 10-digit NDC as printed on the label. An 11-digit billing NDC has a zero added to one segment, and which one depends on the label layout; the NDC converter gives the label form from a hyphenated NDC.' };
  if (![12, 13, 14].includes(digits.length)) return { valid: false, message: `Enter a 10-digit NDC, or a GTIN of 12, 13 or 14 digits. ${digits.length} digits were entered.` };

  const body = digits.slice(0, -1); const given = digits.slice(-1); const want = gs1CheckDigit(body);
  const ok = given === want;
  const padded = digits.padStart(14, '0');
  const out = { valid: true, checkDigitValid: ok, expectedCheckDigit: want, gtin14: padded };
  notes.push(ok ? `Check digit ${given}: correct for these ${digits.length} digits.` : `Check digit ${given}: not correct. These ${digits.length - 1} digits take a check digit of ${want}, so one digit was misread or mistyped.`);
  // In the 14-digit form: N1 is filler or indicator, N2 is 0, N3 is 3 for U.P.C. prefix 3.
  if (padded[1] === '0' && padded[2] === '3') {
    out.ndcPositionDigits = padded.slice(3, 13);
    const lead = padded[0];
    out.indicator = lead;
    notes.push(`The GTIN carries U.P.C. prefix 3, which GS1 reserves for alignment with the FDA labeler code. The 10 digits in the NDC position are ${out.ndcPositionDigits}.`);
    notes.push(lead === '0' ? 'The first digit of the 14-digit form is a filler zero: a single item.' : lead === '9' ? 'Indicator digit 9 is reserved for variable measure trade items.' : `Indicator digit ${lead}: a grouping (a case or other package level) of the item whose GTIN-12 is 3${out.ndcPositionDigits}${gs1CheckDigit(`3${out.ndcPositionDigits}`)}.`);
    notes.push('These are the digits in the NDC position, not a confirmed NDC: GS1 reserves the prefix and does not say every such GTIN holds an NDC.');
    if (status && status.inEffect) notes.push(`They are the 10-digit form. ${status.text}`);
    notes.push(segments);
  } else notes.push('The GTIN does not carry U.P.C. prefix 3 (a 14-digit form of x03...), so no digits are in the NDC position. Some drugs, particularly over-the-counter ones, have a UPC that does not contain the NDC.');
  return { ...out, flag: !ok ? 'check-digit-wrong' : out.ndcPositionDigits ? 'ndc-position-read' : 'no-ndc-position', abnormal: !ok,
    band: ok ? (out.ndcPositionDigits ? `Check digit correct. Digits in the NDC position: ${out.ndcPositionDigits}.` : 'Check digit correct. No digits in the NDC position.') : `Check digit wrong: expected ${want}, read ${given}.`,
    bandLabel: ok ? 'Check digit correct' : 'Check digit wrong', notes, note: notes.join(' ') };
}
