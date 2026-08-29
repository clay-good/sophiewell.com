// spec-v891: the peak expiratory flow zones of a written asthma action plan.
//
// Source:
//   National Asthma Education and Prevention Program. Expert Panel Report 3: Guidelines for the
//   Diagnosis and Management of Asthma. NIH Publication No. 07-4051; 2007.
//
//   Green   80% or more of personal best.
//   Yellow  50% to below 80% of personal best.
//   Red     below 50% of personal best.
//
// THE ZONES ARE A FRACTION OF THE PATIENT'S OWN PERSONAL BEST, NOT OF A PREDICTED VALUE, AND THAT
// IS WHY THIS TILE EXISTS. A predicted peak flow comes from a population equation and can be far
// from what this person achieves when well; using it shifts every boundary and can put a patient
// in the wrong zone in either direction.
//
// A PERSONAL BEST IS ESTABLISHED WHEN THE PATIENT IS WELL AND ON TREATMENT, over a period of
// measurement, and it is re-established periodically. A number recorded during an exacerbation is
// not a personal best.
//
// SYMPTOMS OVERRIDE THE NUMBER. The zones are one input to an action plan, and severe symptoms in
// the green zone are still severe symptoms; a meter cannot see accessory muscle use, speech in
// single words, or a silent chest.
//
// PEAK FLOW IS EFFORT-DEPENDENT AND METER-DEPENDENT. Compare like with like: the same meter, the
// same technique, and the best of three attempts.
//
// Pure: no DOM, no clock, no network.

export const PEF_NOTE = 'A written asthma action plan divides peak expiratory flow into three zones as a fraction of the patient\\u2019s personal best: green at 80 percent or more, yellow from 50 percent to below 80, and red below 50. Four things about this are worth stating plainly. The fraction is of the patient\\u2019s own personal best and not of a predicted value, because a predicted peak flow comes from a population equation and can be far from what a given person achieves when well, so using it shifts every boundary and can place a patient in the wrong zone in either direction. A personal best is established while the patient is well and on treatment, over a period of measurement, and is re-established periodically; a number recorded during an exacerbation is not one. Symptoms override the number, since the zones are one input to an action plan and severe symptoms in the green zone are still severe symptoms, and a meter cannot see accessory muscle use, speech in single words, or a silent chest. And peak flow is effort-dependent and meter-dependent, so readings should be compared like with like: the same meter, the same technique, and the best of three attempts. It computes a percentage against a reference the patient supplies. It does not decide treatment, and it does not replace the written plan.';

export const GREEN_MIN = 80;
export const YELLOW_MIN = 50;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function pefZones(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const current = num(o.currentPef);
  const best = num(o.personalBest);

  for (const [label, v] of [['current peak flow', current], ['personal best peak flow', best]]) {
    if (v !== null && (v <= 0 || v > 900)) {
      return { valid: false, message: `Enter the ${label} in L/min, above 0 and no more than 900.` };
    }
  }
  if (current === null || best === null) {
    return { valid: false, message: 'Enter the current peak flow and the personal best, both in L/min.' };
  }

  const percent = Math.round((current / best) * 1000) / 10;
  const zone = percent >= GREEN_MIN ? 'green' : percent >= YELLOW_MIN ? 'yellow' : 'red';

  const greenAt = Math.round(best * GREEN_MIN / 100);
  const yellowAt = Math.round(best * YELLOW_MIN / 100);

  const action = {
    green: `${current} of a personal best of ${best} is ${percent} percent: the green zone, at or above ${GREEN_MIN} percent. The green zone on this personal best starts at ${greenAt} L/min.`,
    yellow: `${current} of a personal best of ${best} is ${percent} percent: the yellow zone, from ${YELLOW_MIN} to below ${GREEN_MIN} percent. On this personal best the yellow zone runs from ${yellowAt} to ${greenAt - 1} L/min.`,
    red: `${current} of a personal best of ${best} is ${percent} percent: the red zone, below ${YELLOW_MIN} percent. On this personal best the red zone is anything below ${yellowAt} L/min.`,
  }[zone];

  // The reason the tile exists, on every result.
  const personalBestNote = 'The fraction is of this patient\'s personal best, not of a predicted value. A predicted peak flow comes from a population equation and can be far from what a given person achieves when well, so using it shifts every boundary and can place a patient in the wrong zone in either direction.';

  const establishNote = on(o.bestFromWellPeriod)
    ? 'The personal best is recorded as established while the patient was well and on treatment, which is what these percentages depend on.'
    : 'The personal best is not recorded as having been established while the patient was well and on treatment. A number measured during an exacerbation is not a personal best, and every zone here moves with it.';

  const symptomsNote = 'Symptoms override the number. These zones are one input to a written plan, and severe symptoms in the green zone are still severe symptoms: a meter cannot see accessory muscle use, speech in single words, or a silent chest.';

  const techniqueNote = 'Peak flow is effort-dependent and meter-dependent. Compare like with like: the same meter, the same technique, and the best of three attempts.';

  const staleBestNote = percent > 110
    ? `At ${percent} percent the current reading is well above the recorded personal best, which usually means the personal best is out of date rather than that the patient is unusually well. It is worth re-establishing.`
    : null;

  const scopeNote = 'This computes a percentage against a reference the patient supplies. It does not decide treatment, and it does not replace the written plan.';

  return {
    valid: true,
    currentPef: current,
    personalBest: best,
    percent,
    zone,
    greenAt,
    yellowAt,
    action,
    personalBestNote,
    establishNote,
    symptomsNote,
    techniqueNote,
    staleBestNote,
    scopeNote,
    abnormal: zone !== 'green',
    bandLabel: { green: 'Green zone', yellow: 'Yellow zone', red: 'Red zone' }[zone],
    band: action,
    detail: `Green is ${GREEN_MIN} percent or more of personal best, yellow is ${YELLOW_MIN} to below ${GREEN_MIN}, and red is below ${YELLOW_MIN}. The reference is the patient's own personal best, established while well and on treatment, not a predicted value.`,
    note: PEF_NOTE,
  };
}
