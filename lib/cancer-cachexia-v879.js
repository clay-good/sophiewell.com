// spec-v879: the international consensus definition and stages of cancer cachexia.
//
// Source:
//   Fearon K, Strasser F, Anker SD, et al. Definition and classification of cancer cachexia:
//   an international consensus. Lancet Oncol. 2011;12(5):489-495.
//
//   Cachexia is met by ANY ONE of three routes:
//     weight loss above 5% over the past six months; or
//     a body mass index below 20 with weight loss above 2%; or
//     sarcopenia with weight loss above 2%.
//
//   Precachexia   weight loss of 5% or less with anorexia and metabolic change, in a patient who
//                 does not yet meet the definition.
//   Refractory    active catabolism with a cancer that is not responsive to treatment, a WHO
//                 performance status of 3 or 4, and an expected survival under three months.
//
// THE BODY MASS INDEX CHANGES THE THRESHOLD, AND THAT IS WHY THIS TILE EXISTS. Three percent of
// body weight lost by a patient with a body mass index of 19 meets the definition; the same three
// percent in a patient at 30 does not. The percentage alone never answers the question.
//
// CACHEXIA IS DEFINED AS NOT FULLY REVERSIBLE BY NUTRITIONAL SUPPORT. That is written into the
// consensus definition, and it is the reason the diagnosis matters rather than the weight itself.
//
// REFRACTORY CACHEXIA IS DEFINED BY THE CANCER AND THE PERFORMANCE STATUS, NOT BY THE WEIGHT
// LOSS. It is a stage in which aggressive nutritional support is not indicated, and no amount of
// weight loss reaches it on its own.
//
// Pure: no DOM, no clock, no network.

export const CACHEXIA_NOTE = 'The international consensus definition of cancer cachexia (Fearon and colleagues, Lancet Oncology, 2011) is met by any one of three routes: weight loss of more than 5 percent over the past six months, or a body mass index below 20 with weight loss of more than 2 percent, or sarcopenia with weight loss of more than 2 percent. A patient with 5 percent or less weight loss who has anorexia and metabolic change but does not yet meet the definition is in precachexia. Refractory cachexia is a separate stage: active catabolism with a cancer not responsive to treatment, a WHO performance status of 3 or 4, and an expected survival under three months. Three things about the definition are worth stating plainly. The body mass index changes the threshold, so 3 percent lost by a patient with a body mass index of 19 meets the definition while the same 3 percent at a body mass index of 30 does not, and the percentage alone never answers the question. The consensus defines cachexia as not fully reversible by nutritional support, which is why the diagnosis matters rather than the weight itself. And refractory cachexia is defined by the cancer and the performance status rather than by the weight loss, so it is a stage in which aggressive nutritional support is not indicated and no amount of weight loss reaches it on its own. It applies a published consensus definition to values already recorded. It does not decide nutritional or oncologic treatment.';

export const WEIGHT_LOSS_MAIN = 5;
export const WEIGHT_LOSS_SECONDARY = 2;
export const BMI_LOW = 20;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function cancerCachexia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const weightLoss = num(o.weightLossPercent);
  const bmi = num(o.bmi);

  for (const [label, v, lo, hi] of [
    ['weight loss as a percentage of body weight', weightLoss, 0, 100],
    ['body mass index', bmi, 5, 100],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  const sarcopenia = on(o.sarcopenia);
  const anorexia = on(o.anorexiaOrMetabolicChange);
  const refractoryCancer = on(o.cancerNotResponsive);
  const poorPerformance = on(o.performanceStatusThreeOrFour);
  const shortSurvival = on(o.survivalUnderThreeMonths);

  const routes = [];
  if (weightLoss !== null && weightLoss > WEIGHT_LOSS_MAIN) {
    routes.push(`weight loss of ${weightLoss} percent, above ${WEIGHT_LOSS_MAIN}`);
  }
  if (weightLoss !== null && weightLoss > WEIGHT_LOSS_SECONDARY && bmi !== null && bmi < BMI_LOW) {
    routes.push(`weight loss of ${weightLoss} percent with a body mass index of ${bmi}, below ${BMI_LOW}`);
  }
  if (weightLoss !== null && weightLoss > WEIGHT_LOSS_SECONDARY && sarcopenia) {
    routes.push(`weight loss of ${weightLoss} percent with sarcopenia`);
  }

  const meetsCachexia = routes.length > 0;
  const refractory = refractoryCancer && poorPerformance && shortSurvival;
  const precachexia = !meetsCachexia && anorexia
    && weightLoss !== null && weightLoss <= WEIGHT_LOSS_MAIN;

  const stage = refractory && meetsCachexia
    ? 'refractory'
    : meetsCachexia
      ? 'cachexia'
      : precachexia
        ? 'precachexia'
        : 'not-met';

  const action = {
    refractory: `Refractory cachexia: the definition is met by ${routes.join('; and by ')}, with a cancer not responsive to treatment, a performance status of 3 or 4, and an expected survival under three months.`,
    cachexia: `Cachexia, on ${routes.join('; and on ')}.`,
    precachexia: `Precachexia: weight loss of ${weightLoss} percent, at or below ${WEIGHT_LOSS_MAIN}, with anorexia or metabolic change, and none of the three routes to cachexia met.`,
    'not-met': 'Neither cachexia nor precachexia is met by what was entered.',
  }[stage];

  // The reason the tile exists, on every result.
  const bmiNote = 'The body mass index changes the threshold. Three percent lost at a body mass index of 19 meets the definition; the same three percent at 30 does not. The percentage alone never answers the question.';

  const bmiMissingNote = weightLoss !== null && weightLoss > WEIGHT_LOSS_SECONDARY && weightLoss <= WEIGHT_LOSS_MAIN && bmi === null
    ? `At ${weightLoss} percent the answer turns on the body mass index and on whether there is sarcopenia, and neither is entered. Below a body mass index of ${BMI_LOW}, this weight loss would meet the definition.`
    : null;

  const irreversibilityNote = 'The consensus defines cachexia as not fully reversible by nutritional support. That is written into the definition, and it is why the diagnosis matters rather than the weight itself.';

  const refractoryNote = meetsCachexia && !refractory && (refractoryCancer || poorPerformance || shortSurvival)
    ? 'Refractory cachexia needs all three of a cancer not responsive to treatment, a performance status of 3 or 4, and an expected survival under three months. Not all three are recorded, so this is not that stage.'
    : refractory && !meetsCachexia
      ? 'The three refractory features are recorded, but the definition of cachexia itself is not met by what was entered. Refractory cachexia is a stage of cachexia, not a substitute for it.'
      : null;

  const refractoryMeaningNote = 'Refractory cachexia is defined by the cancer and the performance status, not by the weight loss. No amount of weight loss reaches it on its own, and it is the stage in which aggressive nutritional support is not indicated.';

  const recordedNote = `Recorded: weight loss ${weightLoss === null ? 'not entered' : `${weightLoss} percent`}, body mass index ${bmi === null ? 'not entered' : bmi}, sarcopenia ${sarcopenia ? 'present' : 'not recorded'}.`;

  const scopeNote = 'This applies a published consensus definition to values already recorded. It does not decide nutritional or oncologic treatment.';

  return {
    valid: true,
    stage,
    meetsCachexia,
    refractory,
    routes,
    weightLossPercent: weightLoss,
    bmi,
    action,
    recordedNote,
    bmiNote,
    bmiMissingNote,
    irreversibilityNote,
    refractoryNote,
    refractoryMeaningNote,
    scopeNote,
    abnormal: stage === 'cachexia' || stage === 'refractory',
    bandLabel: {
      refractory: 'Refractory cachexia',
      cachexia: 'Cachexia',
      precachexia: 'Precachexia',
      'not-met': 'Definition not met',
    }[stage],
    band: action,
    detail: `Cachexia is met by any one of weight loss above ${WEIGHT_LOSS_MAIN} percent over six months, a body mass index below ${BMI_LOW} with weight loss above ${WEIGHT_LOSS_SECONDARY} percent, or sarcopenia with weight loss above ${WEIGHT_LOSS_SECONDARY} percent. Precachexia is weight loss of ${WEIGHT_LOSS_MAIN} percent or less with anorexia and metabolic change. Refractory cachexia adds a cancer not responsive to treatment, a performance status of 3 or 4, and an expected survival under three months.`,
    note: CACHEXIA_NOTE,
  };
}
