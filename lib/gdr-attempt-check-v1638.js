// spec-v1638 tool 22: gradual dose reduction attempts in the first year on a psychotropic.
//
// Sources, re-read October 12, 2026:
//   42 CFR 483.45(e)(2) (eCFR as current October 8, 2026): "Residents who use psychotropic drugs
//     receive gradual dose reductions, and behavioral interventions, unless clinically
//     contraindicated, in an effort to discontinue these drugs".
//   CMS State Operations Manual, Appendix PP, "Gradual Dose Reduction for Psychotropic
//     Medications" (read in the Rev. 225 edition CMS serves): "Compliance with the requirement to
//     perform a GDR may be met if, for example, within the first year in which a resident is
//     admitted on a psychotropic medication or after the prescribing practitioner has initiated a
//     psychotropic medication, a facility attempts a GDR in two separate quarters (with at least
//     one month between the attempts), unless clinically contraindicated."
// CMS words this as an example ("may be met if, for example"), and the result keeps that wording.
// The passage gives no schedule after the first year. Neither "quarter" nor "one month" is
// defined: the tool reads quarters as four equal parts of the first year from the start date
// (three calendar months each) and "one month" as one calendar month, and says so.
// Whether a reduction is clinically contraindicated is the physician's documented judgment.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addMonthsUtc, addCalendarDaysUtc } from './deadline.js';

export const CONTRAINDICATION = [
  { value: 'contraindication-documented', text: 'A clinical contraindication is documented in the record' },
  { value: 'no-contraindication-documented', text: 'None is documented' },
];
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function gdrAttemptCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const start = date(o.started);
  if (!start) return { valid: false, message: 'Enter the date the resident was admitted on the psychotropic, or the date it was started.' };
  const contra = CONTRAINDICATION.find((c) => c.value === String(o.contraindication ?? '').trim());
  if (!contra) return { valid: false, message: 'Choose whether a clinical contraindication to dose reduction is documented: the example applies "unless clinically contraindicated".' };
  const attempts = [];
  for (const raw of String(o.attempts ?? '').split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)) {
    const d = date(raw);
    if (!d) return { valid: false, message: `Enter each attempt date as YYYY-MM-DD. "${raw.slice(0, 20)}" was not read.` };
    attempts.push(d);
  }
  if (attempts.length > 40) return { valid: false, message: 'Enter no more than 40 attempt dates.' };
  attempts.sort((a, b) => a.getTime() - b.getTime());
  const yearEnd = addCalendarDaysUtc(addMonthsUtc(start, 12), -1);
  const bounds = [0, 3, 6, 9, 12].map((m) => addMonthsUtc(start, m));
  const quarterOf = (d) => { for (let q = 0; q < 4; q += 1) if (d.getTime() >= bounds[q].getTime() && d.getTime() < bounds[q + 1].getTime()) return q + 1; return null; };
  const inYear = attempts.filter((d) => quarterOf(d) !== null);
  const outside = attempts.length - inYear.length;
  const notes = [`First year: ${say(start)} through ${say(yearEnd)}, read as four quarters of three calendar months from the start date: ${[0, 1, 2, 3].map((q) => `Q${q + 1} from ${say(bounds[q])}`).join('; ')}.`];
  for (const d of inYear) notes.push(`Attempt ${say(d)}: quarter ${quarterOf(d)}.`);
  if (outside) notes.push(`${outside} attempt date${outside === 1 ? ' is' : 's are'} outside the first year and ${outside === 1 ? 'was' : 'were'} not placed.`);
  // Two attempts in separate quarters with at least one calendar month between them.
  let pair = null;
  for (let i = 0; i < inYear.length && !pair; i += 1) for (let j = i + 1; j < inYear.length; j += 1) {
    if (quarterOf(inYear[i]) !== quarterOf(inYear[j]) && inYear[j].getTime() >= addMonthsUtc(inYear[i], 1).getTime()) { pair = [inYear[i], inYear[j]]; break; }
  }
  const out = { valid: true, firstYearEnds: fmtUtc(yearEnd), attemptsInFirstYear: inYear.length };
  let flag; let band; let label;
  if (pair) {
    flag = 'example-met'; label = 'Example met';
    band = 'The CMS first-year example is met: attempts in two separate quarters, at least one month apart.';
    notes.push(`${say(pair[0])} (quarter ${quarterOf(pair[0])}) and ${say(pair[1])} (quarter ${quarterOf(pair[1])}) are in separate quarters and at least one calendar month apart.`);
  } else if (inYear.length) {
    // The earliest date a second attempt can satisfy both conditions after the first attempt in the year.
    const first = inYear[0];
    const monthLater = addMonthsUtc(first, 1);
    const nextQuarter = bounds[quarterOf(first)]; // start of the following quarter, or the year's end bound
    const earliest = monthLater.getTime() > nextQuarter.getTime() ? monthLater : nextQuarter;
    if (earliest.getTime() <= yearEnd.getTime()) {
      flag = 'still-reachable'; label = 'Still reachable';
      band = `Not yet met: a second attempt from ${say(earliest)} through ${say(yearEnd)} would meet the example.`;
      out.secondAttemptFrom = fmtUtc(earliest); out.secondAttemptThrough = fmtUtc(yearEnd);
      notes.push(`After the attempt on ${say(first)}, a second attempt meets both conditions from ${say(earliest)} (a different quarter, and one calendar month later) through the end of the first year. Whether those dates are still ahead depends on today's date, which this does not read.`);
    } else {
      flag = 'not-met-in-first-year'; label = 'Not met';
      band = 'The CMS first-year example cannot be met from these attempts: no later quarter is left in the first year.';
      notes.push(`The only attempt${inYear.length === 1 ? '' : 's'} in the first year ${inYear.length === 1 ? 'is' : 'are'} in the last quarter, or too close to the year's end for a second one a month later in another quarter.`);
    }
  } else {
    flag = 'no-attempt-in-first-year'; label = 'No attempt in the first year';
    band = `No attempt is recorded in the first year, which ends ${say(yearEnd)}.`;
    // The last day of quarter 3: a second attempt a month later still falls in quarter 4.
    const lastFirst = addCalendarDaysUtc(bounds[3], -1);
    out.firstAttemptBy = fmtUtc(lastFirst);
    notes.push(`For two attempts in separate quarters a month apart, the first would fall no later than ${say(lastFirst)}, leaving the last quarter for the second.`);
  }
  if (contra.value === 'contraindication-documented') {
    notes.push('A clinical contraindication is documented. The example applies "unless clinically contraindicated", so the attempts are not required while that documented judgment stands; this does not assess it.');
    if (flag !== 'example-met') { flag = 'contraindication-documented'; label = 'Contraindication documented'; }
  }
  notes.push('CMS gives this as an example of how compliance "may be met", not as the only way. Its guidance gives no schedule after the first year; later timing follows the facility\'s policy and standards of practice. "Quarter" and "one month" are not defined; the readings used here are stated above.');
  return { ...out, flag, abnormal: flag === 'not-met-in-first-year' || flag === 'no-attempt-in-first-year', band, bandLabel: label, notes, note: notes.join(' ') };
}
