// spec-v920: the reference change value -- whether a change between two results on the same
// patient is bigger than the variation that was always going to be there.
//
// Sources:
//   Fraser CG, Harris EK. Generation and application of data on biological variation in clinical
//   chemistry. Crit Rev Clin Lab Sci. 1989;27(5):409-437.
//   Fraser CG. Reference change values. Clin Chem Lab Med. 2011;50(5):807-812.
//
//   RCV = sqrt(2) x Z x sqrt(CVa^2 + CVi^2)
//
//   CVa is the analytical imprecision of the assay, which the laboratory running it knows.
//   CVi is the within-subject biological variation of the analyte, which comes from published
//   tables and is a property of the analyte, not of this patient.
//   Z is the probability the answer is stated at: 1.96 two-sided at 95%, 1.65 one-sided at 95%,
//   2.58 two-sided at 99%, 2.33 one-sided at 99%.
//
// A CHANGE SMALLER THAN THE RCV IS NOT "STABLE". It is a change that cannot be told apart from
// the analytical and biological variation that was always going to be there. Those are different
// statements, and the second one is the one the arithmetic supports.
//
// A CHANGE LARGER THAN THE RCV IS REAL, NOT NECESSARILY IMPORTANT. The RCV answers whether
// something moved. It says nothing at all about whether the movement matters.
//
// ONE-SIDED AND TWO-SIDED ARE DIFFERENT QUESTIONS. If only a rise is being watched for, the
// one-sided Z is the right one; using the two-sided value makes the test harder to pass than the
// question asked for.
//
// IT ASSUMES A STEADY STATE. Across an acute illness, a transfusion, a fluid bolus or a dose
// change, the within-subject variation the published CVi describes is not the variation actually
// in front of you.
//
// Pure: no DOM, no clock, no network.

export const RCV_NOTE = 'The reference change value asks whether the difference between two results on the same patient is bigger than the variation that was always going to be there. It is the square root of two, times a probability factor, times the square root of the analytical imprecision squared plus the within-subject biological variation squared. The analytical imprecision belongs to the assay and the laboratory running it knows it; the within-subject variation is a property of the analyte and comes from published tables, not from this patient. Four things are worth stating plainly. A change smaller than the reference change value is not stable -- it is a change that cannot be told apart from analytical and biological variation, and those are different statements. A change larger than it is real and not necessarily important: the arithmetic answers whether something moved and says nothing about whether the movement matters. One-sided and two-sided are different questions, and if only a rise is being watched for then using the two-sided factor makes the test harder to pass than the question asked for. And it assumes a steady state: across an acute illness, a transfusion, a fluid bolus or a dose change, the published within-subject variation is not the variation actually in front of you. This compares a difference against a published formula. It does not decide whether a change matters.';

export const PROBABILITY_OPTIONS = [
  { value: 'two-95', text: 'Two-sided, 95% - a change in either direction' },
  { value: 'one-95', text: 'One-sided, 95% - a change in one direction only' },
  { value: 'two-99', text: 'Two-sided, 99%' },
  { value: 'one-99', text: 'One-sided, 99%' },
];

const Z = { 'two-95': 1.96, 'one-95': 1.65, 'two-99': 2.58, 'one-99': 2.33 };

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeRound(n, places = 2) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function referenceChangeValue(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const cvA = num(o.cvAnalytical);
  const cvI = num(o.cvIntraindividual);
  const probability = Z[String(o.probability)] ? String(o.probability) : 'two-95';
  const z = Z[probability];

  if (cvA === null || cvA < 0) {
    return { valid: false, message: 'Enter the analytical imprecision as a coefficient of variation in percent. The laboratory running the assay knows it; it is not a property of the patient.' };
  }
  if (cvI === null || cvI < 0) {
    return { valid: false, message: 'Enter the within-subject biological variation as a coefficient of variation in percent. It comes from published tables and is a property of the analyte, not of this patient.' };
  }

  const rcv = Math.SQRT2 * z * Math.sqrt(cvA * cvA + cvI * cvI);

  const previous = num(o.previousResult);
  const current = num(o.currentResult);
  const comparable = previous !== null && current !== null && previous !== 0;
  const observed = comparable ? ((current - previous) / previous) * 100 : null;
  const exceeded = comparable ? Math.abs(observed) > rcv : null;
  const direction = comparable ? (observed > 0 ? 'rise' : observed < 0 ? 'fall' : 'flat') : null;

  const rcvText = `${safeRound(rcv)}%`;

  const bandLabel = !comparable
    ? `Reference change value ${rcvText}`
    : exceeded
      ? `Change exceeds the reference change value of ${rcvText}`
      : `Change within the reference change value of ${rcvText}`;

  const band = !comparable
    ? `A difference has to exceed ${rcvText} to be distinguishable from analytical and biological variation, at this probability.`
    : exceeded
      ? `The observed ${direction} of ${safeRound(Math.abs(observed), 1)}% exceeds the reference change value of ${rcvText}. The change is bigger than the variation that was always going to be there.`
      : direction === 'flat'
        ? `The two results are identical, so nothing exceeds the reference change value of ${rcvText}.`
        : `The observed ${direction} of ${safeRound(Math.abs(observed), 1)}% does not exceed the reference change value of ${rcvText}. That is not the same as stable: it is a change that cannot be told apart from analytical and biological variation.`;

  const notStableNote = 'A change smaller than the reference change value is not "stable". It is a change that cannot be told apart from analytical and biological variation, and those are different statements.';

  const notImportantNote = 'A change larger than it is real, not necessarily important. The arithmetic answers whether something moved and says nothing about whether the movement matters.';

  const sidedNote = probability.startsWith('one')
    ? 'This is the one-sided factor, for a change watched for in one direction only. If a change in either direction would count, the two-sided factor is the right one.'
    : 'This is the two-sided factor, for a change in either direction. If only a rise, or only a fall, is being watched for, the one-sided factor is the right one and this makes the test harder to pass than the question asked for.';

  const steadyStateNote = 'It assumes a steady state. Across an acute illness, a transfusion, a fluid bolus or a dose change, the published within-subject variation is not the variation actually in front of you.';

  const sourceOfCviNote = 'The within-subject variation is a property of the analyte and comes from published biological-variation tables. Nothing here supplies it, and it is not measured from this patient.';

  const asymmetryNote = 'For large changes the rise and the fall are not symmetric, because the underlying distribution is closer to log-normal than normal. This uses the ordinary symmetric form.';

  const scopeNote = 'This compares a difference against a published formula. It does not decide whether a change matters.';

  return {
    valid: true,
    rcv: safeRound(rcv),
    z,
    probability,
    cvAnalytical: cvA,
    cvIntraindividual: cvI,
    observedChangePercent: observed === null ? null : safeRound(observed, 1),
    exceeded,
    notStableNote,
    notImportantNote,
    sidedNote,
    steadyStateNote,
    sourceOfCviNote,
    asymmetryNote,
    scopeNote,
    abnormal: exceeded === true,
    bandLabel,
    band,
    detail: `Reference change value = square root of 2, times ${z}, times the square root of the analytical CV squared plus the within-subject CV squared. Here that is 1.414 x ${z} x the square root of ${safeRound(cvA * cvA, 3)} plus ${safeRound(cvI * cvI, 3)}, which is ${rcvText}.`,
    note: RCV_NOTE,
  };
}
