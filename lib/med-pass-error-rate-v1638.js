// spec-v1638 tool 23: the nursing-facility medication administration error rate.
//
// Sources, re-read October 12, 2026:
//   42 CFR 483.45(f) (eCFR as current October 8, 2026): "The facility must ensure that its (1)
//     Medication error rates are not 5 percent or greater; and (2) Residents are free of any
//     significant medication errors."
//   CMS State Operations Manual, Appendix PP, F759 and F760 (text Rev. 173, read in the Rev. 225
//     edition CMS serves): "Medication Error Rate = Number of Errors Observed divided by the
//     Opportunities for Errors (doses given plus doses ordered but not given) X 100. The error
//     rate must be 5% or greater in order to cite F759. Rounding up of a lower rate (e.g., 4.6%)
//     to a 5% rate is not permitted." "any significant medication error, whether or not the error
//     rate is 5% or greater, should be cited at F760." The numerator is errors "both significant
//     and non-significant". A dose "administered 60 or more minutes earlier or later than its
//     scheduled time" counts only where the wrong time can cause discomfort or jeopardize health.
//
// The rate is truncated to one decimal, never rounded up. This is the nursing-facility survey
// definition; the 5% line is not a hospital requirement. The tool does not classify an error as
// significant.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const whole = (label, v, hi = 100000) => inputFault([[label, v, 0, hi, '']]) || (Number.isInteger(Number(v)) ? null : `Enter ${label} as a whole number.`);
const trunc1 = (n) => Math.floor(n * 10 + 1e-9) / 10;

export function medPassErrorRate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  for (const [label, v] of [['the doses observed being administered', o.dosesGiven], ['the doses ordered but not administered (0 if none)', o.dosesOmitted], ['the errors observed, significant and non-significant together (0 if none)', o.errors], ['how many of the errors were significant (0 if none)', o.significantErrors]]) {
    const f = whole(label, v); if (f) return { valid: false, message: f };
  }
  const given = Number(o.dosesGiven); const omitted = Number(o.dosesOmitted); const errors = Number(o.errors); const significant = Number(o.significantErrors);
  const opportunities = given + omitted;
  if (opportunities <= 0) return { valid: false, message: 'Enter at least one dose observed or ordered: with no opportunities there is no rate.' };
  if (errors > opportunities) return { valid: false, message: 'Enter no more errors than opportunities (doses given plus doses ordered but not given).' };
  if (significant > errors) return { valid: false, message: 'Enter no more significant errors than errors in all: the significant ones are part of the count.' };
  // Exact comparison, so 5 of 100 is 5% and 49 of 981 is not.
  const atOrOver = errors * 20 >= opportunities;
  const rate = trunc1((errors / opportunities) * 100);
  const notes = [`Opportunities for error: ${given} doses given + ${omitted} ordered but not given = ${opportunities}. ${errors} error${errors === 1 ? '' : 's'} is ${rate}% (truncated to one decimal; CMS does not permit rounding a lower rate up to 5%).`];
  notes.push(atOrOver ? 'The rate is 5% or greater, which does not meet 42 CFR 483.45(f)(1) (survey tag F759).' : 'The rate is under 5%, which meets 42 CFR 483.45(f)(1) (survey tag F759).');
  notes.push(significant > 0 ? `${significant} significant error${significant === 1 ? '' : 's'}: residents must be free of any significant medication error, whatever the rate (483.45(f)(2), tag F760).` : 'No significant error was entered. Any significant error fails 483.45(f)(2) (tag F760) whatever the rate.');
  const out = { valid: true, opportunities, ratePercent: rate, atOrOverFivePercent: atOrOver, significantErrors: significant };
  if (atOrOver) {
    // Fewest further error-free opportunities n with errors * 20 < opportunities + n.
    const more = errors * 20 - opportunities + 1;
    out.errorFreeOpportunitiesToGoUnder = more;
    notes.push(`With no further errors, ${more} more error-free opportunit${more === 1 ? 'y' : 'ies'} would bring the rate under 5%.`);
  } else {
    // Fewest further errors k (each also an opportunity) with (errors + k) * 20 >= opportunities + k.
    const k = Math.ceil((opportunities - errors * 20) / 19);
    out.furtherErrorsToReachFivePercent = k;
    notes.push(`${k} more error${k === 1 ? '' : 's'}, each on a new opportunity, would bring the rate to 5% or greater.`);
  }
  notes.push('Timing: a dose given 60 or more minutes early or late counts as an error only if the wrong time can cause the resident discomfort or jeopardize health; a before-meals drug given after meals always counts. Errors found by record review, not observation, are outside the rate, though a significant one is still cited.');
  notes.push('This is the nursing-facility survey definition. A hospital may use the formula, but the 5% line is a nursing-facility requirement only. Whether an error is significant is a professional judgment this does not make. The same counts can be given a Wilson interval in the proportion confidence interval tool.');
  const fail = atOrOver || significant > 0;
  return { ...out, flag: atOrOver ? 'five-percent-or-greater' : significant > 0 ? 'significant-error' : 'under-five-percent', abnormal: fail, band: `Medication error rate ${rate}%: ${atOrOver ? '5% or greater' : 'under 5%'}.`, bandLabel: significant > 0 ? `${significant} significant error${significant === 1 ? '' : 's'}` : atOrOver ? '5% or greater' : 'Under 5%, no significant error', notes, note: notes.join(' ') };
}
