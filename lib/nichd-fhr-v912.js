// spec-v912: the NICHD three-tier categorization of a fetal heart rate tracing.
//
// Source:
//   Macones GA, Hankins GDV, Spong CY, Hauth J, Moore T. The 2008 National Institute of Child
//   Health and Human Development workshop report on electronic fetal monitoring. Obstet Gynecol.
//   2008;112(3):661-666, as carried into ACOG Practice Bulletin 106.
//
//   CATEGORY I needs ALL of: a baseline of 110 to 160 beats per minute; moderate variability;
//     late decelerations absent; variable decelerations absent. Early decelerations and
//     accelerations may be present or absent and do not change the category.
//   CATEGORY III is either: ABSENT variability together with recurrent late decelerations,
//     recurrent variable decelerations, or bradycardia; OR a sinusoidal pattern.
//   CATEGORY II is everything else.
//
// CATEGORY II IS A RESIDUAL, NOT A MIDDLE SEVERITY. It is defined as every tracing that is
// neither I nor III, it covers an enormous range, and the great majority of tracings fall in it.
// It is not a diagnosis and it is not itself a reason to act; it calls for evaluation and
// continued surveillance.
//
// CATEGORY III NEEDS *ABSENT* VARIABILITY, NOT MINIMAL. Minimal variability with recurrent late
// decelerations is Category II. Reading minimal as absent is the most common way this system is
// got wrong, so the result says which one was entered whenever the decelerations would otherwise
// have reached Category III.
//
// THE CATEGORY DESCRIBES THE TRACING AT A POINT IN TIME. It is not a prediction, tracings move
// between categories, and none of the three is a management algorithm.
//
// Pure: no DOM, no clock, no network.

export const NICHD_FHR_NOTE = 'The 2008 NICHD workshop sorts a fetal heart rate tracing into three categories. Category I needs all of a baseline of 110 to 160 beats per minute, moderate variability, late decelerations absent, and variable decelerations absent; early decelerations and accelerations may be present or absent and change nothing. Category III is either absent variability together with recurrent late decelerations, recurrent variable decelerations or bradycardia, or else a sinusoidal pattern. Category II is everything else. Three things are worth stating plainly. Category II is a residual rather than a middle severity: it is defined as every tracing that is neither I nor III, it covers an enormous range, most tracings fall in it, and it is not a diagnosis but a call for evaluation and continued surveillance. Category III needs absent variability and not minimal variability, so minimal variability with recurrent late decelerations is Category II, and reading minimal as absent is the most common way this system is got wrong. And the category describes the tracing at a point in time: it is not a prediction, tracings move between categories, and none of the three is a management algorithm. This sorts findings already read from the tracing. It does not interpret the tracing itself, and it does not decide on delivery.';

export const VARIABILITY_OPTIONS = [
  { value: 'moderate', text: 'Moderate (6 to 25 beats per minute)' },
  { value: 'minimal', text: 'Minimal (detectable, 5 beats per minute or fewer)' },
  { value: 'absent', text: 'Absent (undetectable)' },
  { value: 'marked', text: 'Marked (over 25 beats per minute)' },
];

export const DECEL_OPTIONS = [
  { value: 'absent', text: 'Absent' },
  { value: 'intermittent', text: 'Present, with fewer than half the contractions' },
  { value: 'recurrent', text: 'Recurrent, with half or more of the contractions' },
];

export const PRESENCE_OPTIONS = [
  { value: 'absent', text: 'Absent' },
  { value: 'present', text: 'Present' },
];

function pick(v, allowed, fallback) {
  const s = String(v == null ? fallback : v);
  return allowed.includes(s) ? s : fallback;
}

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1' || v === 'present';
}

export function nichdFhr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const baseline = Number(o.baseline);
  if (!Number.isFinite(baseline) || baseline <= 0) {
    return { valid: false, message: 'Enter the baseline fetal heart rate in beats per minute. Both Category I and the bradycardia route into Category III are written on it.' };
  }

  const variability = pick(o.variability, ['moderate', 'minimal', 'absent', 'marked'], 'moderate');
  const lateDecels = pick(o.lateDecels, ['absent', 'intermittent', 'recurrent'], 'absent');
  const variableDecels = pick(o.variableDecels, ['absent', 'intermittent', 'recurrent'], 'absent');
  const sinusoidal = on(o.sinusoidal);

  const bradycardia = baseline < 110;
  const tachycardia = baseline > 160;
  const normalBaseline = !bradycardia && !tachycardia;

  const thirdTierDecels = lateDecels === 'recurrent' || variableDecels === 'recurrent' || bradycardia;
  const categoryThree = sinusoidal || (variability === 'absent' && thirdTierDecels);
  const categoryOne = normalBaseline && variability === 'moderate'
    && lateDecels === 'absent' && variableDecels === 'absent';

  const category = categoryThree ? 'III' : categoryOne ? 'I' : 'II';

  const baselineText = bradycardia
    ? `a baseline of ${baseline} beats per minute, which is bradycardia`
    : tachycardia
      ? `a baseline of ${baseline} beats per minute, which is tachycardia`
      : `a baseline of ${baseline} beats per minute, which is normal`;

  const missingForOne = [];
  if (!normalBaseline) missingForOne.push('the baseline is outside 110 to 160');
  if (variability !== 'moderate') missingForOne.push(`variability is ${variability}, not moderate`);
  if (lateDecels !== 'absent') missingForOne.push(`late decelerations are ${lateDecels === 'recurrent' ? 'recurrent' : 'present'}`);
  if (variableDecels !== 'absent') missingForOne.push(`variable decelerations are ${variableDecels === 'recurrent' ? 'recurrent' : 'present'}`);

  const band = category === 'III'
    ? (sinusoidal
      ? 'Category III on the sinusoidal pattern, which reaches this category on its own.'
      : `Category III: variability is absent together with ${[lateDecels === 'recurrent' ? 'recurrent late decelerations' : null, variableDecels === 'recurrent' ? 'recurrent variable decelerations' : null, bradycardia ? 'bradycardia' : null].filter(Boolean).join(', ')}.`)
    : category === 'I'
      ? `Category I: ${baselineText}, moderate variability, and neither late nor variable decelerations.`
      : `Category II, which is everything that is neither I nor III. Not Category I because ${missingForOne.join('; ')}.`;

  // The single most common way this system is got wrong.
  const minimalNote = variability === 'minimal' && thirdTierDecels
    ? 'Variability was entered as minimal, not absent. Category III needs absent variability, so this is Category II. Reading minimal as absent is the most common way this system is got wrong.'
    : 'Category III needs absent variability, not minimal. Minimal variability with recurrent late decelerations is Category II.';

  const residualNote = 'Category II is a residual, not a middle severity. It is defined as every tracing that is neither I nor III, it covers an enormous range, and most tracings fall in it. It calls for evaluation and continued surveillance rather than standing as a diagnosis.';

  const momentNote = 'The category describes the tracing at a point in time. It is not a prediction, tracings move between categories, and none of the three is a management algorithm.';

  const ignoredNote = 'Early decelerations and accelerations may be present or absent in Category I and do not change any category.';

  const scopeNote = 'This sorts findings already read from the tracing. It does not interpret the tracing itself, and it does not decide on delivery.';

  return {
    valid: true,
    category,
    baseline,
    bradycardia,
    tachycardia,
    variability,
    lateDecels,
    variableDecels,
    sinusoidal,
    minimalNote,
    residualNote,
    momentNote,
    ignoredNote,
    scopeNote,
    abnormal: category !== 'I',
    bandLabel: `Category ${category}`,
    band,
    detail: 'Category I needs all of a baseline of 110 to 160 beats per minute, moderate variability, late decelerations absent and variable decelerations absent. Category III is absent variability with recurrent late decelerations, recurrent variable decelerations or bradycardia, or a sinusoidal pattern. Category II is everything else.',
    note: NICHD_FHR_NOTE,
  };
}
