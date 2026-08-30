// spec-v921: the sigma metric of a laboratory method.
//
// Sources:
//   Westgard JO, Westgard SA. The quality of laboratory testing today: an assessment of sigma
//   metrics for analytic quality using performance data from proficiency testing surveys and the
//   CLIA criteria for acceptable performance. Am J Clin Pathol. 2006;125(3):343-354.
//   Westgard JO. Six Sigma Quality Design and Control. 2nd ed. Madison: Westgard QC; 2006.
//
//   sigma = (TEa% - |bias%|) / CV%
//
//   TEa is the total allowable error: the goal. Bias and imprecision are the method's measured
//   performance against it.
//
// THE ANSWER IS ONLY AS GOOD AS THE GOAL. Sigma is a property of a method AND a goal together,
// never of the method alone. CLIA, the biological-variation goals, RCPA and EFLM all publish
// different allowable errors for the same analyte, and the same method can be six sigma against
// one and three against another. Nothing here chooses a goal, and the result says which number
// the answer belongs to.
//
// BIAS EATS THE BUDGET BEFORE IMPRECISION DOES. It is subtracted from the goal first, so a method
// with a large bias can fail on sigma while looking precise. When the bias alone exceeds the
// allowable error there is no budget left and sigma is zero or below, which is not a small number
// -- it is a method that cannot meet the goal at all.
//
// BELOW THREE IS NOT "A BIT WORSE". Three sigma is the floor at which the standard control rules
// can be run at all; below it, no practical amount of quality control makes the method reliable.
//
// Pure: no DOM, no clock, no network.

export const SIGMA_NOTE = 'The sigma metric of a laboratory method is the total allowable error minus the absolute bias, divided by the imprecision, with all three as percentages. It is a property of a method and a goal together, never of the method alone: CLIA, the biological-variation goals, RCPA and EFLM all publish different allowable errors for the same analyte, and the same method can be six sigma against one and three against another, so nothing here chooses a goal and the result says which number the answer belongs to. Bias eats the budget before imprecision does, because it is subtracted from the goal first, so a method with a large bias can fail on sigma while looking precise -- and when the bias alone exceeds the allowable error there is no budget left at all, which is not a small sigma but a method that cannot meet the goal. Below three sigma is not a bit worse: three is the floor at which the standard control rules can be run, and below it no practical amount of quality control makes the method reliable. The published bands are six and above world class, five to six excellent, four to five good, three to four marginal, and below three unacceptable. This is arithmetic on three numbers that were already measured or chosen. It does not choose the goal, and it does not design a control rule.';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeRound(n, places = 2) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

const BANDS = [
  { min: 6, label: 'World class', text: 'Six sigma and above. World class on the published bands.' },
  { min: 5, label: 'Excellent', text: 'Five to six sigma. Excellent on the published bands.' },
  { min: 4, label: 'Good', text: 'Four to five sigma. Good on the published bands.' },
  { min: 3, label: 'Marginal', text: 'Three to four sigma. Marginal: workable, but the control rules have to do more of the work.' },
  { min: -Infinity, label: 'Unacceptable', text: 'Below three sigma. Three is the floor at which the standard control rules can be run at all, and below it no practical amount of quality control makes the method reliable against this goal.' },
];

export function sigmaMetric(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const tea = num(o.totalAllowableError);
  const bias = num(o.bias);
  const cv = num(o.cv);

  if (tea === null || tea <= 0) {
    return { valid: false, message: 'Enter the total allowable error as a percent. It is the goal, not a measurement, and sigma has no meaning without naming which goal it is against.' };
  }
  if (bias === null) {
    return { valid: false, message: 'Enter the bias as a percent. A negative bias is fine; it enters the arithmetic as its size.' };
  }
  if (cv === null || cv <= 0) {
    return { valid: false, message: 'Enter the imprecision as a coefficient of variation in percent, above zero. It is the divisor.' };
  }

  const budget = tea - Math.abs(bias);
  const sigma = budget / cv;

  const noBudget = budget <= 0;
  const band = BANDS.find((b) => sigma >= b.min);

  const bandLabel = noBudget ? 'No budget left for imprecision' : `${safeRound(sigma)} sigma - ${band.label.toLowerCase()}`;

  const text = noBudget
    ? `The bias of ${safeRound(Math.abs(bias))}% already meets or exceeds the total allowable error of ${safeRound(tea)}%, so there is nothing left for imprecision. This is not a small sigma; it is a method that cannot meet this goal.`
    : `Sigma ${safeRound(sigma)}. ${band.text}`;

  const goalNote = `This answer belongs to a total allowable error of ${safeRound(tea)}%. Sigma is a property of a method and a goal together, never of the method alone, and CLIA, the biological-variation goals, RCPA and EFLM publish different allowable errors for the same analyte.`;

  const biasNote = noBudget
    ? 'Bias is subtracted from the goal before imprecision is divided into what is left, which is why it can exhaust the budget on its own.'
    : `Bias took ${safeRound(Math.abs(bias))}% of the ${safeRound(tea)}% allowed, leaving ${safeRound(budget)}% for imprecision. It is subtracted first, so a method with a large bias can fail on sigma while looking precise.`;

  const floorNote = 'Below three sigma is not a bit worse than three. Three is the floor at which the standard control rules can be run at all.';

  const signNote = 'The sign of the bias does not change the arithmetic: it enters as its size. Which direction it runs in still matters clinically, and nothing here reports that.';

  const scopeNote = 'This is arithmetic on three numbers that were already measured or chosen. It does not choose the goal, and it does not design a control rule.';

  return {
    valid: true,
    sigma: noBudget ? safeRound(sigma) : safeRound(sigma),
    budget: safeRound(budget),
    totalAllowableError: tea,
    bias,
    cv,
    noBudget,
    goalNote,
    biasNote,
    floorNote,
    signNote,
    scopeNote,
    abnormal: noBudget || sigma < 4,
    bandLabel,
    band: text,
    detail: `Sigma = (total allowable error minus the absolute bias) divided by the imprecision. Here that is (${safeRound(tea)} - ${safeRound(Math.abs(bias))}) / ${safeRound(cv)}.`,
    note: SIGMA_NOTE,
  };
}
