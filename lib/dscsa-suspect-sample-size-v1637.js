// spec-v1637 tool 20: how many packages of a suspect lot a dispenser verifies under the DSCSA.
//
// Source: 21 U.S.C. 360eee-1(d)(4)(A)(ii)(II) (United States Code, 2024 edition, govinfo.gov),
// re-read October 12, 2026: "verifying that the product identifier, including the standardized
// numerical identifier, of at least 3 packages or 10 percent of such suspect product, whichever is
// greater, or all packages, if there are fewer than 3, corresponds with the product identifier for
// such product". FDA's letter of August 6, 2026 exempts small business dispensers from this
// verification until November 27, 2027 (quoted in dscsa-small-dispenser-check-v1637.js).
//
// The statute does not say how to round 10 percent. Rounding up is the only reading that meets
// "at least", and the result says so.
//
// Pure: the clock is a parameter (used only for the exemption's end date).

import { SMALL, EXEMPT_THROUGH, whole, lapsed, LAPSED_NOTE } from './dscsa-exemption-v1637.js';

export { SMALL };

export function dscsaSuspectSampleSize(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = whole('the number of packages of the suspect product in your possession', o.packages, 1, 10000000);
  if (f) return { valid: false, message: f };
  const size = SMALL.find((s) => s.value === String(o.dispenser ?? '').trim());
  if (!size) return { valid: false, message: 'Choose whether this is a small business dispenser: FDA has exempted those from this verification for now.' };
  const n = Number(o.packages);
  const tenth = Math.ceil(n / 10);
  const verify = n < 3 ? n : Math.max(3, tenth);
  const notes = [n < 3
    ? `${n} package${n === 1 ? '' : 's'}: fewer than 3, so all of them (21 U.S.C. 360eee-1(d)(4)(A)(ii)(II)).`
    : `${n.toLocaleString('en-US')} packages: 10 percent is ${(n / 10).toLocaleString('en-US')}${Number.isInteger(n / 10) ? '' : `, rounded up to ${tenth.toLocaleString('en-US')}`}; the rule is at least 3 packages or 10 percent, whichever is greater, so ${verify.toLocaleString('en-US')} (21 U.S.C. 360eee-1(d)(4)(A)(ii)(II)).`];
  notes.push('The statute does not say how to round 10 percent; rounding up is the only reading that meets "at least".');
  notes.push('This is one part of the investigation. The dispenser also quarantines the product, checks that the lot number corresponds, validates the transaction history and information it holds, and otherwise investigates (360eee-1(d)(4)(A)(i) and (ii)).');
  const out = { valid: true, verify, tenPercentRoundedUp: tenth };
  if (size.value === 'small-business-dispenser') {
    const gone = lapsed(now);
    if (gone) { notes.push(LAPSED_NOTE); out.exempt = null; }
    else { notes.push('A small business dispenser is exempted from this product-identifier verification until November 27, 2027 (FDA letter of August 6, 2026), and is still obligated to meet all other verification requirements of section 582(d)(4).'); out.exempt = true; out.exemptThrough = EXEMPT_THROUGH; }
  } else out.exempt = false;
  return { ...out, flag: out.exempt === true ? 'exempt-until-2027-11-27' : out.exempt === null ? 'exemption-date-passed' : 'verify', abnormal: false, band: `Verify the product identifier of at least ${verify.toLocaleString('en-US')} of ${n.toLocaleString('en-US')} package${n === 1 ? '' : 's'}.`, bandLabel: out.exempt === true ? 'Exempted for a small business dispenser until November 27, 2027' : out.exempt === null ? 'Read FDA\'s current notice' : 'Required', notes, note: notes.join(' ') };
}
