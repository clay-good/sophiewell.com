// spec-v1637 tool 21: the DSCSA small-dispenser exemption (and the pieces tool 20 shares with it).
//
// Sources, re-read October 12, 2026:
//   21 U.S.C. 360eee-1(d)(4)(A)(ii)(II) (United States Code, 2024 edition, govinfo.gov): the
//     investigation of a suspect product includes "verifying that the product identifier,
//     including the standardized numerical identifier, of at least 3 packages or 10 percent of
//     such suspect product, whichever is greater, or all packages, if there are fewer than 3,
//     corresponds with the product identifier for such product".
//   FDA, "DSCSA Exemptions from Certain Requirements Under Section 582 of the FD&C Act for Small
//     Business Dispensers Until November 27, 2027", issued August 6, 2026:
//     - "a small business dispenser if the corporate entity that owns the dispenser has a total of
//       25 or fewer full-time employees licensed as pharmacists or qualified as pharmacy
//       technicians", "as of November 27, 2026";
//     - full-time is the IRS definition: "on average at least 30 hours of service per week, or 130
//       hours of service per month";
//     - exemptions "from November 27, 2026, until November 27, 2027" (the July 2024 exemption
//       "remains applicable until November 27, 2026") from 582(d)(4)(A)(ii)(II) and (B)(iii)
//       (product-identifier verification of suspect or illegitimate product) and 582(g)(1)(A)
//       through (F); "still obligated to meet all other verification requirements of section
//       582(d)(4)"; the exemptions "do not apply to other requirements in section 582";
//     - "do not need to submit any additional information to FDA".
//
// DATED EXEMPTION: it ends November 27, 2027. After that date the tools say the letter they read
// has run out and ask for FDA's current notice.
// The statute does not say how to round 10 percent. Rounding up is the only reading that meets
// "at least", and the result says so.
//
// Pure: the clock is a parameter (used only for the exemption's end date).

import { EXEMPT_THROUGH, whole, lapsed, LAPSED_NOTE } from './dscsa-exemption-v1637.js';

const COVERED = [
  'Verifying the product identifier of the statutory share of suspect or illegitimate product (section 582(d)(4)(A)(ii)(II) and (B)(iii)).',
  'Exchanging transaction information and statements in a secure, interoperable, electronic manner (582(g)(1)(A)).',
  'Including the package-level product identifier in transaction information (582(g)(1)(B)).',
  'Systems and processes for package-level verification (582(g)(1)(C)).',
  'Systems and processes to respond promptly with transaction information on request (582(g)(1)(D)).',
  'Systems and processes to gather the transaction information needed in a recall or investigation (582(g)(1)(E)).',
  'Associating a saleable return with its transaction information before accepting it (582(g)(1)(F)).',
];
export function dscsaSmallDispenserCheck(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = whole('the number of full-time pharmacists and pharmacy technicians at the company that owns the dispenser', o.fullTimeStaff, 0, 100000);
  if (f) return { valid: false, message: f };
  const n = Number(o.fullTimeStaff);
  const small = n <= 25;
  const gone = lapsed(now);
  const notes = [`${n} full-time employee${n === 1 ? '' : 's'} licensed as pharmacists or qualified as pharmacy technicians, counted across the corporate entity that owns the dispenser as of November 27, 2026: ${small ? '25 or fewer, so FDA treats it as a small business dispenser' : 'more than 25, so it is not a small business dispenser under FDA\'s letter'}.`];
  notes.push('The count is by owner, not by store, and it is of pharmacists and technicians only; clerks are not counted. Full-time is the IRS definition FDA adopts: on average at least 30 hours of service a week, or 130 hours a month.');
  if (!small) {
    notes.push('The enhanced drug distribution security requirements remain in effect for trading partners that do not meet the definition.');
    return { valid: true, flag: 'not-exempt', exempt: false, abnormal: true, band: 'Not a small business dispenser: FDA\'s exemptions do not apply.', bandLabel: 'Not exempt', notes, note: notes.join(' ') };
  }
  if (gone) {
    notes.push(LAPSED_NOTE);
    return { valid: true, flag: 'exemption-date-passed', exempt: null, abnormal: true, band: 'A small business dispenser, but the exemption this tool read ended November 27, 2027.', bandLabel: 'Read FDA\'s current notice', notes, note: notes.join(' ') };
  }
  notes.push('FDA\'s exemptions run until November 27, 2027 (the July 2024 exemption until November 27, 2026, then the letter of August 6, 2026). They cover:', ...COVERED.map((c, i) => `(${i + 1}) ${c}`));
  notes.push('The exemptions do not apply to the other requirements of section 582, and a small business dispenser is still obligated to meet all other verification requirements of section 582(d)(4). Nothing needs to be filed with FDA to rely on them; FDA recommends telling trading partners.');
  notes.push('The statute\'s own phrase is "25 or fewer full-time employees" of any kind; FDA\'s letter says its test, which counts only pharmacists and technicians, reaches a broader group.');
  return { valid: true, flag: 'exempt-until-2027-11-27', exempt: true, exemptThrough: EXEMPT_THROUGH, abnormal: false, band: 'A small business dispenser: FDA\'s exemptions apply until November 27, 2027.', bandLabel: 'Exempt until November 27, 2027', notes, note: notes.join(' ') };
}
