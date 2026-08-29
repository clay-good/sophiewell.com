// spec-v890: interpreting a methacholine challenge.
//
// Source:
//   Coates AL, Wanger J, Cockcroft DW, et al. ERS technical standard on bronchial challenge
//   testing: general considerations and performance of methacholine challenge tests.
//   Eur Respir J. 2017;49(5):1601526.
//
//   PD20, the DOSE producing a 20% fall in FEV1, is the metric the 2017 standard uses:
//     above 400 micrograms   normal
//     100 to 400             borderline
//     25 to 100              mild bronchial hyperresponsiveness
//     below 25               moderate to severe bronchial hyperresponsiveness
//
//   PC20, the CONCENTRATION producing the same fall, is the legacy metric, read against the
//   ATS 1999 two-minute tidal-breathing cutpoints:
//     above 16 mg/mL         normal
//     4 to 16                borderline
//     1 to 4                 mild
//     below 1                moderate to severe
//
// THE 2017 STANDARD MOVED THE PRIMARY METRIC FROM CONCENTRATION TO DOSE, AND THAT IS WHY THIS
// TILE EXISTS. A PC20 depends on the nebulizer output and the inhalation protocol, so a PC20 from
// one laboratory is not comparable with a PC20 from another. A PD20 is.
//
// A NEGATIVE TEST IS THE INFORMATIVE ONE. Its negative predictive value for current symptomatic
// asthma is high. A POSITIVE TEST DOES NOT DIAGNOSE ASTHMA on its own: bronchial
// hyperresponsiveness also occurs in allergic rhinitis, in chronic obstructive pulmonary disease,
// after a viral infection, and in smokers.
//
// A FALSELY NEGATIVE TEST IS USUALLY A MEDICATION THAT WAS NOT WITHHELD. Inhaled corticosteroids,
// bronchodilators, antihistamines and caffeine all blunt the response.
//
// Pure: no DOM, no clock, no network.

export const METHACHOLINE_NOTE = 'A methacholine challenge is read against the dose or the concentration that produces a 20 percent fall in FEV1. The 2017 European Respiratory Society technical standard uses the dose, PD20: above 400 micrograms is normal, 100 to 400 borderline, 25 to 100 mild bronchial hyperresponsiveness, and below 25 moderate to severe. The legacy concentration metric, PC20, is read against the two-minute tidal-breathing cutpoints of above 16 mg/mL normal, 4 to 16 borderline, 1 to 4 mild, and below 1 moderate to severe. Three things about the test are worth stating plainly. The 2017 standard moved the primary metric from concentration to dose because a concentration depends on the nebulizer output and the inhalation protocol, so a PC20 from one laboratory is not comparable with a PC20 from another while a PD20 is. The negative test is the informative one, since its negative predictive value for current symptomatic asthma is high, whereas a positive test does not diagnose asthma on its own because bronchial hyperresponsiveness also occurs in allergic rhinitis, in chronic obstructive pulmonary disease, after a viral infection and in smokers. And a falsely negative test is usually a medication that was not withheld, since inhaled corticosteroids, bronchodilators, antihistamines and caffeine all blunt the response. It reads a result against published cutpoints. It does not diagnose asthma, and it does not decide treatment.';

export const PD20_NORMAL = 400;
export const PD20_MILD = 100;
export const PD20_MODERATE = 25;
export const PC20_NORMAL = 16;
export const PC20_MILD = 4;
export const PC20_MODERATE = 1;

export const METRICS = [
  { value: 'pd20', text: 'PD20, the dose in micrograms (the 2017 standard)' },
  { value: 'pc20', text: 'PC20, the concentration in mg/mL (the legacy metric)' },
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

export function methacholine(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const metric = oneOf(METRICS, o.metric, 'pd20');
  const value = num(o.value);

  const limit = metric === 'pd20' ? 10000 : 200;
  if (value === null) {
    return { valid: false, message: `Enter the ${metric === 'pd20' ? 'PD20 in micrograms' : 'PC20 in mg/mL'}.` };
  }
  if (value <= 0 || value > limit) {
    return { valid: false, message: `Enter the ${metric === 'pd20' ? 'PD20 in micrograms' : 'PC20 in mg/mL'} above 0 and no more than ${limit}.` };
  }

  const cuts = metric === 'pd20'
    ? { normal: PD20_NORMAL, mild: PD20_MILD, moderate: PD20_MODERATE, unit: 'micrograms' }
    : { normal: PC20_NORMAL, mild: PC20_MILD, moderate: PC20_MODERATE, unit: 'mg/mL' };

  const grade = value > cuts.normal
    ? 'normal'
    : value >= cuts.mild
      ? 'borderline'
      : value >= cuts.moderate
        ? 'mild'
        : 'moderate-severe';

  const gradeText = {
    normal: 'normal airway responsiveness',
    borderline: 'borderline airway responsiveness',
    mild: 'mild bronchial hyperresponsiveness',
    'moderate-severe': 'moderate to severe bronchial hyperresponsiveness',
  }[grade];

  const action = `${metric === 'pd20' ? 'PD20' : 'PC20'} ${value} ${cuts.unit}: ${gradeText}.`;

  // The reason the tile exists, on every result.
  const metricNote = metric === 'pc20'
    ? `PC20 is the legacy metric. A concentration depends on the nebulizer output and the inhalation protocol, so a PC20 from one laboratory is not comparable with a PC20 from another; the 2017 standard moved to the delivered dose for that reason. Read this alongside the protocol it was measured under.`
    : 'PD20 is the metric the 2017 standard uses, because a delivered dose is comparable between laboratories where a concentration is not.';

  const negativeNote = grade === 'normal'
    ? 'A negative test is the informative one here. Its negative predictive value for current symptomatic asthma is high, which is the main reason the challenge is done.'
    : null;

  const positiveNote = grade !== 'normal'
    ? 'A positive test does not diagnose asthma on its own. Bronchial hyperresponsiveness also occurs in allergic rhinitis, in chronic obstructive pulmonary disease, after a viral infection, and in smokers.'
    : null;

  const withholdNote = grade === 'normal' && !on(o.medicationsWithheld)
    ? 'Withholding of medications is not recorded. A falsely negative test is usually a drug that was not withheld: inhaled corticosteroids, bronchodilators, antihistamines and caffeine all blunt the response, and a negative result without that history says much less.'
    : on(o.medicationsWithheld)
      ? 'Medications are recorded as withheld for the required intervals, which is what a negative result depends on.'
      : 'Inhaled corticosteroids, bronchodilators, antihistamines and caffeine all blunt the response, and a test performed without withholding them is hard to read.';

  const safetyNote = 'The challenge is performed only above a baseline FEV1 threshold, and the standard sets contraindications of its own. Those are decided before the test, not read from the result.';

  const scopeNote = 'This reads a result against published cutpoints. It does not diagnose asthma, and it does not decide treatment.';

  return {
    valid: true,
    metric,
    value,
    grade,
    cutpoints: cuts,
    action,
    metricNote,
    negativeNote,
    positiveNote,
    withholdNote,
    safetyNote,
    scopeNote,
    abnormal: grade === 'mild' || grade === 'moderate-severe',
    bandLabel: {
      normal: 'Normal',
      borderline: 'Borderline',
      mild: 'Mild hyperresponsiveness',
      'moderate-severe': 'Moderate to severe hyperresponsiveness',
    }[grade],
    band: action,
    detail: `PD20 above ${PD20_NORMAL} micrograms is normal, ${PD20_MILD} to ${PD20_NORMAL} borderline, ${PD20_MODERATE} to ${PD20_MILD} mild, and below ${PD20_MODERATE} moderate to severe. PC20 above ${PC20_NORMAL} mg/mL is normal, ${PC20_MILD} to ${PC20_NORMAL} borderline, ${PC20_MODERATE} to ${PC20_MILD} mild, and below ${PC20_MODERATE} moderate to severe.`,
    note: METHACHOLINE_NOTE,
  };
}
