// spec-v897: preoperative fasting intervals before elective anesthesia.
//
// Source:
//   American Society of Anesthesiologists Task Force on Preoperative Fasting. 2023 American
//   Society of Anesthesiologists Practice Guidelines for Preoperative Fasting.
//   Anesthesiology. 2023;138(2):132-151.
//
//   Minimum fasting intervals before an elective procedure under sedation or general anesthesia:
//     clear liquids                     2 hours
//     breast milk                       4 hours
//     infant formula                    6 hours
//     nonhuman milk, or a light meal    6 hours
//     fried or fatty food, or meat      8 hours or more
//
// THESE ARE MINIMUM INTERVALS, NOT TARGETS, AND THAT IS WHY THIS TILE EXISTS. "Nothing by mouth
// after midnight" is the practice the guideline was written against: prolonged fasting is not
// safer, and it causes thirst, hypoglycemia, irritability and hypovolemia without reducing
// aspiration risk.
//
// THE CLOCK RUNS TO INDUCTION, NOT TO THE SCHEDULED TIME. A case that is delayed does not extend
// the fast that has already been served; it lengthens it, which is the harm above.
//
// "CLEAR" MEANS CLEAR. Water, pulp-free juice, carbonated drinks, black tea and black coffee are
// clear. Anything with milk in it is not, and alcohol is not.
//
// THE INTERVALS ARE FOR AN ELECTIVE PROCEDURE IN A PATIENT WITHOUT IMPAIRED GASTRIC EMPTYING, and
// they never guarantee an empty stomach. Emergency surgery, delayed emptying, and glucagon-like
// peptide-1 receptor agonists are each handled outside this table.
//
// Pure: no DOM, no clock, no network.

export const FASTING_NOTE = 'The 2023 American Society of Anesthesiologists practice guidelines set minimum fasting intervals before an elective procedure under sedation or general anesthesia: two hours for clear liquids, four for breast milk, six for infant formula, six for nonhuman milk or a light meal, and eight or more for fried or fatty food or meat. Four things about the table are worth stating plainly. These are minimum intervals rather than targets, and nothing by mouth after midnight is the practice the guideline was written against, since prolonged fasting is not safer and causes thirst, hypoglycemia, irritability and hypovolemia without reducing aspiration risk. The clock runs to the moment of induction rather than to the scheduled time, so a delayed case does not extend a fast that has already been served but lengthens it. Clear means clear: water, pulp-free juice, carbonated drinks, black tea and black coffee qualify, while anything containing milk does not, and neither does alcohol. And the intervals are for an elective procedure in a patient without impaired gastric emptying and never guarantee an empty stomach, so emergency surgery, delayed emptying and glucagon-like peptide-1 receptor agonists are each handled outside this table. It reads a published table against an interval already elapsed. It does not clear a patient for anesthesia, and it does not overrule the anesthesia team.';

export const INTAKES = [
  { value: 'clear-liquid', hours: 2, text: 'Clear liquids: water, pulp-free juice, carbonated drinks, black tea or coffee' },
  { value: 'breast-milk', hours: 4, text: 'Breast milk' },
  { value: 'formula', hours: 6, text: 'Infant formula' },
  { value: 'light-meal', hours: 6, text: 'Nonhuman milk, or a light meal' },
  { value: 'heavy-meal', hours: 8, text: 'Fried or fatty food, or meat' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);
const round1 = (n) => Math.round(n * 10) / 10;
const hrs = (n) => `${n} hour${n === 1 ? '' : 's'}`;

export function preopFasting(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const intake = oneOf(INTAKES, o.lastIntake, 'clear-liquid');
  const elapsed = num(o.hoursSinceIntake);

  if (elapsed !== null && (elapsed < 0 || elapsed > 72)) {
    return { valid: false, message: 'Enter the hours since the last intake, between 0 and 72.' };
  }

  const row = INTAKES.find((i) => i.value === intake);
  const required = row.hours;
  const met = elapsed !== null && elapsed >= required;
  const shortBy = elapsed === null ? null : round1(Math.max(0, required - elapsed));
  const overBy = elapsed === null ? null : round1(Math.max(0, elapsed - required));

  const action = elapsed === null
    ? `${row.text.split(':')[0]} calls for a minimum of ${hrs(required)}. Enter the hours elapsed to compare against it.`
    : met
      ? `${hrs(elapsed)} since ${row.text.split(':')[0].toLowerCase()}, against a minimum of ${required}. The interval is met${overBy > 0 ? `, by ${hrs(overBy)}` : ''}.`
      : `${hrs(elapsed)} since ${row.text.split(':')[0].toLowerCase()}, against a minimum of ${required}. Short by ${hrs(shortBy)}.`;

  // The reason the tile exists, on every result.
  const minimumNote = 'These are minimum intervals, not targets. Nothing by mouth after midnight is the practice this guideline was written against: prolonged fasting is not safer, and it causes thirst, hypoglycemia, irritability and hypovolemia without reducing aspiration risk.';

  const overshootNote = overBy !== null && overBy >= 4
    ? `${hrs(overBy)} beyond the minimum is a long fast, not a safer one. If the case is not imminent, the guideline supports clear liquids up to two hours before induction rather than continued abstinence.`
    : null;

  const clockNote = 'The clock runs to the moment of induction, not to the scheduled time. A delayed case does not extend a fast that has already been served; it lengthens it.';

  const clearNote = intake === 'clear-liquid'
    ? 'Clear means clear. Water, pulp-free juice, carbonated drinks, black tea and black coffee qualify. Anything with milk in it does not, and neither does alcohol.'
    : null;

  const scopeOfTableNote = 'The table is for an elective procedure in a patient without impaired gastric emptying, and it never guarantees an empty stomach. Emergency surgery, delayed emptying and glucagon-like peptide-1 receptor agonists are each handled outside it.';

  const scopeNote = 'This reads a published table against an interval already elapsed. It does not clear a patient for anesthesia, and it does not overrule the anesthesia team.';

  return {
    valid: true,
    lastIntake: intake,
    requiredHours: required,
    hoursSinceIntake: elapsed,
    met,
    shortBy,
    overBy,
    action,
    minimumNote,
    overshootNote,
    clockNote,
    clearNote,
    scopeOfTableNote,
    scopeNote,
    abnormal: elapsed !== null && !met,
    bandLabel: elapsed === null ? `${required} hour minimum` : met ? 'Interval met' : `Short by ${hrs(shortBy)}`,
    band: action,
    detail: 'Clear liquids 2 hours; breast milk 4; infant formula 6; nonhuman milk or a light meal 6; fried or fatty food or meat 8 or more. Minimum intervals before an elective procedure, measured to induction, and never a guarantee of an empty stomach.',
    note: FASTING_NOTE,
  };
}
