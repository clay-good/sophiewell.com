// spec-v922: Cohen's kappa for two raters and a yes/no call, with the two indices that explain
// when it misbehaves.
//
// Sources:
//   Cohen J. A coefficient of agreement for nominal scales. Educ Psychol Meas. 1960;20(1):37-46.
//   Byrt T, Bishop J, Carlin JB. Bias, prevalence and kappa. J Clin Epidemiol. 1993;46(5):423-429.
//   Landis JR, Koch GG. The measurement of observer agreement for categorical data. Biometrics.
//   1977;33(1):159-174. (the strength-of-agreement labels, which its authors called arbitrary)
//
//   Po = (a + d) / n, the agreement observed.
//   Pe = ((a+b)(a+c) + (c+d)(b+d)) / n^2, the agreement expected by chance from the margins.
//   kappa = (Po - Pe) / (1 - Pe)
//   Prevalence index = |a - d| / n. Bias index = |b - c| / n. PABAK = 2Po - 1.
//
// KAPPA IS NOT PERCENT AGREEMENT, AND THE GAP BETWEEN THEM IS THE POINT. Two raters can agree on
// 95 of 100 cases and score a kappa near zero, because when almost every case falls in one
// category the agreement expected by chance is already near 95%. That is the first kappa paradox,
// and it is why the prevalence index prints on every result rather than sitting in a footnote.
//
// A HIGH BIAS INDEX MEANS THE RATERS DISAGREE IN A DIRECTION -- one says yes where the other says
// no, systematically, rather than at random. Kappa alone cannot show that.
//
// THE STRENGTH-OF-AGREEMENT LABELS ARE A CONVENTION, NOT A STANDARD. Landis and Koch described
// their own divisions as arbitrary, and nothing has made them less so since.
//
// Pure: no DOM, no clock, no network.

export const KAPPA_NOTE = 'Cohen\'s kappa measures how far two raters agree beyond the agreement chance would have produced from their own margins. Observed agreement is the proportion they both called the same way; expected agreement is what the margins would give by chance; kappa is the first minus the second, divided by one minus the second. Three things are worth stating plainly. Kappa is not percent agreement, and the gap between them is the point: two raters can agree on 95 of 100 cases and score a kappa near zero, because when almost every case falls in one category the agreement expected by chance is already near 95%. That is the first kappa paradox, which is why the prevalence index is reported on every result rather than left in a footnote. A high bias index means the raters disagree in a direction, one saying yes where the other says no systematically rather than at random, and kappa alone cannot show that. And the strength-of-agreement labels -- slight, fair, moderate, substantial, almost perfect -- are a convention rather than a standard: Landis and Koch described their own divisions as arbitrary, and nothing has made them less so. This is arithmetic on four counts. It does not decide whether the agreement is good enough for what the rating is for.';

const BANDS = [
  { min: 0.81, label: 'Almost perfect' },
  { min: 0.61, label: 'Substantial' },
  { min: 0.41, label: 'Moderate' },
  { min: 0.21, label: 'Fair' },
  { min: 0.0, label: 'Slight' },
  { min: -Infinity, label: 'Worse than chance' },
];

function count(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return null;
  return n;
}

function safeRound(n, places = 3) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function cohensKappa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const a = count(o.bothYes);
  const b = count(o.firstYesSecondNo);
  const c = count(o.firstNoSecondYes);
  const d = count(o.bothNo);

  if ([a, b, c, d].some((x) => x === null)) {
    return { valid: false, message: 'Enter all four counts as whole numbers of cases, none negative: both yes, first yes and second no, first no and second yes, and both no.' };
  }
  const n = a + b + c + d;
  if (n === 0) {
    return { valid: false, message: 'The four counts add to zero, so there are no cases to agree or disagree about.' };
  }

  const po = (a + d) / n;
  const pe = (((a + b) * (a + c)) + ((c + d) * (b + d))) / (n * n);
  const kappa = pe === 1 ? null : (po - pe) / (1 - pe);

  const prevalenceIndex = Math.abs(a - d) / n;
  const biasIndex = Math.abs(b - c) / n;
  const pabak = 2 * po - 1;

  if (kappa === null) {
    return {
      valid: true,
      undefinedKappa: true,
      n,
      observedAgreement: safeRound(po),
      expectedAgreement: safeRound(pe),
      kappa: null,
      prevalenceIndex: safeRound(prevalenceIndex),
      biasIndex: safeRound(biasIndex),
      pabak: safeRound(pabak),
      paradoxNote: 'Every case fell in one category for both raters, so chance alone predicts complete agreement and kappa has no value to report. Observed agreement is still what it is.',
      biasNote: 'The bias index is zero, because there were no disagreements to run in a direction.',
      labelsNote: 'The strength-of-agreement labels are a convention rather than a standard.',
      scopeNote: 'This is arithmetic on four counts. It does not decide whether the agreement is good enough for what the rating is for.',
      abnormal: false,
      bandLabel: 'Kappa is undefined here',
      band: `All ${n} cases fell in one category for both raters. Chance alone predicts complete agreement, the denominator is zero, and kappa has no value. Observed agreement is ${safeRound(po * 100, 1)}%.`,
      detail: 'Kappa = (observed agreement - expected agreement) / (1 - expected agreement). When expected agreement is 1, that denominator is zero.',
      note: KAPPA_NOTE,
    };
  }

  const band = BANDS.find((x) => kappa >= x.min);

  const paradoxNote = prevalenceIndex >= 0.7
    ? `The prevalence index is ${safeRound(prevalenceIndex)}, which is high: almost every case fell in one category, so chance already predicts most of the agreement and kappa is held down whatever the raters did. Observed agreement here is ${safeRound(po * 100, 1)}%.`
    : `The prevalence index is ${safeRound(prevalenceIndex)}. A high value means almost every case falls in one category, which holds kappa down however well the raters agree -- observed agreement here is ${safeRound(po * 100, 1)}%.`;

  const biasNote = biasIndex >= 0.2
    ? `The bias index is ${safeRound(biasIndex)}, which is substantial: the disagreements run in a direction rather than at random, one rater saying yes where the other says no.`
    : `The bias index is ${safeRound(biasIndex)}. A high value would mean the disagreements run in a direction rather than at random, which kappa alone cannot show.`;

  const labelsNote = 'The strength-of-agreement labels are a convention rather than a standard. Landis and Koch described their own divisions as arbitrary.';

  const pabakNote = `Prevalence-and-bias-adjusted kappa is ${safeRound(pabak)}, which is observed agreement rescaled and ignores both margins. It is reported for comparison, not as a correction.`;

  const scopeNote = 'This is arithmetic on four counts. It does not decide whether the agreement is good enough for what the rating is for.';

  return {
    valid: true,
    undefinedKappa: false,
    n,
    observedAgreement: safeRound(po),
    expectedAgreement: safeRound(pe),
    kappa: safeRound(kappa),
    prevalenceIndex: safeRound(prevalenceIndex),
    biasIndex: safeRound(biasIndex),
    pabak: safeRound(pabak),
    paradoxNote,
    biasNote,
    labelsNote,
    pabakNote,
    scopeNote,
    abnormal: kappa < 0.41,
    bandLabel: `Kappa ${safeRound(kappa)} - ${band.label.toLowerCase()}`,
    band: `Kappa ${safeRound(kappa)} across ${n} cases, on labels that are a convention: ${band.label.toLowerCase()}. Observed agreement ${safeRound(po * 100, 1)}%, expected by chance ${safeRound(pe * 100, 1)}%.`,
    detail: 'Kappa = (observed agreement - expected agreement) / (1 - expected agreement). Expected agreement comes from the raters\' own margins, which is why it moves with how common the finding is.',
    note: KAPPA_NOTE,
  };
}
