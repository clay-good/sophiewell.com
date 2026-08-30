// spec-v923: analytical performance specifications derived from biological variation.
//
// Sources:
//   Fraser CG. Biological Variation: From Principles to Practice. Washington: AACC Press; 2001.
//   Sandberg S, Fraser CG, Horvath AR, et al. Defining analytical performance specifications:
//   consensus statement from the 1st Strategic Conference of the EFLM. Clin Chem Lab Med.
//   2015;53(6):833-835. (the Milan hierarchy, which places these in model 2)
//
//   With CVi the within-subject and CVg the between-subject biological variation:
//     IMPRECISION   optimum 0.25 x CVi, desirable 0.50 x CVi, minimum 0.75 x CVi
//     BIAS          optimum 0.125 x sqrt(CVi^2 + CVg^2), desirable 0.250 x, minimum 0.375 x
//     TOTAL ERROR   1.65 x the allowable imprecision at that tier, plus the allowable bias at
//                   that tier
//
// THERE ARE THREE TIERS, NOT ONE SPECIFICATION. "The" biological-variation goal almost always
// means the desirable tier, and quoting it without saying so hides that optimum is twice as hard
// and minimum is half. All three are reported here, always.
//
// THESE ARE GOALS FROM BIOLOGY, NOT FROM WHAT AN ANALYZER CAN DO. A method that misses them is
// not thereby unusable, and a method that meets them is not thereby clinically sufficient -- the
// Milan hierarchy puts outcome-based specifications above these, and they are the ones that
// answer a clinical question.
//
// THE BIAS SPECIFICATION NEEDS BOTH VARIATIONS. Imprecision is set by within-subject variation
// alone; bias is set by the two combined, because a shifted method moves a result relative to a
// population reference interval. Give only CVi and the imprecision goals stand while the bias and
// total-error goals cannot be computed.
//
// Pure: no DOM, no clock, no network.

export const BV_GOALS_NOTE = 'Analytical performance specifications derived from biological variation come in three tiers, not one. Imprecision is set by within-subject variation alone: a quarter of it at the optimum tier, half at the desirable tier, three quarters at the minimum tier. Bias is set by the within-subject and between-subject variations combined, at one eighth, one quarter and three eighths of the square root of their squares summed. Total error at each tier is 1.65 times that tier\'s allowable imprecision, plus that tier\'s allowable bias. Three things are worth stating plainly. There are three tiers and not one specification: "the" biological-variation goal almost always means the desirable tier, and quoting it without saying so hides that optimum is twice as hard and minimum is half, so all three are reported here every time. These are goals from biology rather than from what an analyzer can do -- a method that misses them is not thereby unusable and a method that meets them is not thereby clinically sufficient, and the Milan hierarchy places outcome-based specifications above them. And the bias specification needs both variations while imprecision needs only the within-subject one, because a shifted method moves a result relative to a population reference interval; with only the within-subject variation entered, the imprecision goals stand and the rest cannot be computed. This is arithmetic on published variation estimates. It does not choose which tier applies, and it does not judge a method.';

const IMPRECISION_FACTORS = { optimum: 0.25, desirable: 0.50, minimum: 0.75 };
const BIAS_FACTORS = { optimum: 0.125, desirable: 0.250, minimum: 0.375 };
const TIERS = ['optimum', 'desirable', 'minimum'];

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeRound(n, places = 2) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function biologicalVariationGoals(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const cvi = num(o.cvWithinSubject);
  const cvg = num(o.cvBetweenSubject);

  if (cvi === null || cvi <= 0) {
    return { valid: false, message: 'Enter the within-subject biological variation as a coefficient of variation in percent. Every specification here starts from it.' };
  }

  const hasBias = cvg !== null && cvg >= 0;
  const combined = hasBias ? Math.sqrt(cvi * cvi + cvg * cvg) : null;

  const tiers = TIERS.map((tier) => {
    const imprecision = IMPRECISION_FACTORS[tier] * cvi;
    const bias = hasBias ? BIAS_FACTORS[tier] * combined : null;
    const totalError = bias === null ? null : 1.65 * imprecision + bias;
    return {
      tier,
      imprecision: safeRound(imprecision),
      bias: bias === null ? null : safeRound(bias),
      totalError: totalError === null ? null : safeRound(totalError),
    };
  });

  const desirable = tiers.find((t) => t.tier === 'desirable');

  const bandLabel = hasBias
    ? `Desirable: imprecision ${desirable.imprecision}%, bias ${desirable.bias}%, total error ${desirable.totalError}%`
    : `Desirable imprecision ${desirable.imprecision}%`;

  const band = hasBias
    ? `At the desirable tier: imprecision at or below ${desirable.imprecision}%, bias at or below ${desirable.bias}%, total error at or below ${desirable.totalError}%. Optimum and minimum are reported beside it, because there is no single specification.`
    : `At the desirable tier, imprecision at or below ${desirable.imprecision}%. The bias and total-error specifications need the between-subject variation as well, and it was not entered.`;

  const tiersNote = 'There are three tiers, not one specification. "The" biological-variation goal almost always means the desirable tier, and saying it without saying which hides that optimum is twice as hard and minimum is half.';

  const sourceNote = 'These are goals derived from biology, not from what an analyzer can do. A method that misses them is not thereby unusable, and a method that meets them is not thereby clinically sufficient.';

  const hierarchyNote = 'The Milan hierarchy places outcome-based specifications above these. Where an outcome study exists for the analyte, it answers the clinical question and this does not.';

  const biasInputNote = hasBias
    ? `Imprecision is set by the within-subject variation alone; bias is set by both combined, here ${safeRound(combined)}%, because a shifted method moves a result relative to a population reference interval.`
    : 'Imprecision is set by the within-subject variation alone, which is why it is reported. Bias is set by both variations combined, because a shifted method moves a result relative to a population reference interval, so it needs the between-subject variation too.';

  const scopeNote = 'This is arithmetic on published variation estimates. It does not choose which tier applies, and it does not judge a method.';

  return {
    valid: true,
    cvWithinSubject: cvi,
    cvBetweenSubject: hasBias ? cvg : null,
    combinedVariation: combined === null ? null : safeRound(combined),
    tiers,
    hasBiasSpecifications: hasBias,
    tiersNote,
    sourceNote,
    hierarchyNote,
    biasInputNote,
    scopeNote,
    // A specification is not a finding; nothing here is normal or abnormal.
    abnormal: false,
    bandLabel,
    band,
    detail: 'Imprecision is a quarter, a half and three quarters of the within-subject variation at the optimum, desirable and minimum tiers. Bias is an eighth, a quarter and three eighths of the square root of the two variations squared and summed. Total error at each tier is 1.65 times that tier\'s imprecision plus its bias.',
    note: BV_GOALS_NOTE,
  };
}
