// spec-v1634 tool 17: nephrotoxic medication exposure, as the NINJA program defines it.
//
// Source: Goldstein SL. Pediatric Acute Kidney Injury: The Time for Nihilism Is Over. Front Pediatr
// 2020;8:16 (PMC7005103, CC BY), re-read in full text on October 11, 2026: NINJA "identifies
// patients in near real time who are exposed to three or more nephrotoxic medications on the same
// day or receiving an IV aminoglycoside or IV vancomycin for three or more days. Exposed patients
// are then recommended to have a daily serum creatinine".
// This is the 2020 restatement of the program; the 2013 paper that first described it
// (Pediatrics, PMID 23940245) was not read, and neither was the program's medication list, so the
// reader decides which drugs count. Hospitalized children.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'An exposure flag for hospitalized children, not a diagnosis of kidney injury and not a list of nephrotoxic drugs: which medications count is the reader\'s call, since the program\'s list is not included. Not being flagged does not mean the kidneys are safe.';

export function ninjaNephrotoxinExposure(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the number of nephrotoxic medications given on the same day', o.nephrotoxinCount, 0, 50, ''],
    ['the consecutive days of an IV aminoglycoside (0 if none)', o.aminoglycosideDays, 0, 365, ''],
    ['the consecutive days of IV vancomycin (0 if none)', o.vancomycinDays, 0, 365, ''],
  ]);
  if (f) return { valid: false, message: f };
  const n = Number(o.nephrotoxinCount); const ag = Number(o.aminoglycosideDays); const van = Number(o.vancomycinDays);
  if (![n, ag, van].every(Number.isInteger)) return { valid: false, message: 'Enter the count and the days as whole numbers.' };
  const limbs = [];
  if (n >= 3) limbs.push(`${n} nephrotoxic medications on the same day (3 or more)`);
  if (ag >= 3) limbs.push(`an IV aminoglycoside for ${ag} days (3 or more)`);
  if (van >= 3) limbs.push(`IV vancomycin for ${van} days (3 or more)`);
  const exposed = limbs.length > 0;
  return {
    valid: true, flag: exposed ? 'exposed' : 'not-exposed', abnormal: exposed, exposed, limbs,
    band: exposed ? `Meets the NINJA definition of nephrotoxic medication exposure: ${limbs.join('; ')}.` : 'Does not meet the NINJA definition of nephrotoxic medication exposure.',
    bandLabel: exposed ? 'Exposed' : 'Not exposed',
    notes: [exposed ? 'The program recommends a daily serum creatinine for exposed patients, to look for acute kidney injury systematically.' : `Entered: ${n} nephrotoxic medication${n === 1 ? '' : 's'} on one day, ${ag} day${ag === 1 ? '' : 's'} of an IV aminoglycoside, ${van} day${van === 1 ? '' : 's'} of IV vancomycin. The definition needs 3 or more of any one.`,
      'Goldstein SL. Front Pediatr 2020;8:16 (CC BY), restating the NINJA program.'], note: NOTE,
  };
}
