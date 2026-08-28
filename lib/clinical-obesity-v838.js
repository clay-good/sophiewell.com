// spec-v838: clinical and preclinical obesity, the 2025 Lancet Commission framework.
//
// Source:
//   Rubino F, Cummings DE, Eckel RH, et al. Definition and diagnostic criteria of clinical
//   obesity. Lancet Diabetes Endocrinol. 2025;13(3):221-262.
//
// THE DIAGNOSIS RUNS IN TWO STEPS, AND THE FIRST ONE IS THE POINT.
//
//   STEP 1 - CONFIRM EXCESS ADIPOSITY. Any one of:
//     (i)   direct body fat measurement, by dual-energy X-ray absorptiometry or bioimpedance
//     (ii)  at least ONE anthropometric criterion IN ADDITION TO body mass index
//     (iii) at least TWO anthropometric criteria, REGARDLESS of body mass index
//   with one exception: above a body mass index of 40, excess adiposity can pragmatically be
//   assumed and no further confirmation is required.
//
//   STEP 2 - CLASSIFY. Confirmed obesity is CLINICAL where there are signs or symptoms of
//   reduced function of tissues or organs due to the adiposity, or a substantial,
//   age-adjusted limitation of day-to-day activities. Otherwise it is PRECLINICAL:
//   excess adiposity with preserved organ function and an increased risk of progressing.
//
// BODY MASS INDEX ALONE IS NOT A DIAGNOSIS. That is the whole reform. The Commission
// recommends that it be used as a surrogate for risk at a POPULATION level rather than to
// assess an individual, and a body mass index on its own - at any value up to 40 - does not
// confirm obesity status here.
//
// AND THE MISS RUNS BOTH WAYS. Route (iii) confirms obesity on two anthropometric criteria
// REGARDLESS of body mass index, so someone with a normal index, a raised waist and a raised
// waist-to-height ratio has confirmed obesity. A tool that screened on body mass index first
// would never reach them.
//
// CLINICAL VERSUS PRECLINICAL IS ABOUT FUNCTION, NOT SIZE. A higher body mass index does not
// make obesity clinical, and nothing in the second step reads a number.
//
// THE ANTHROPOMETRIC CUTOFFS ARE DELIBERATELY NOT ENCODED HERE. The Commission specifies
// "validated methods and cutoff points appropriate to age, gender, and ethnicity" rather than
// publishing one set, so this tile asks whether each measure is raised against an appropriate
// cutoff instead of inventing numbers the Commission declined to fix.
//
// Pure: no DOM, no clock, no network.

export const OBESITY_NOTE = 'The 2025 Lancet Diabetes and Endocrinology Commission (Rubino F, Cummings DE, Eckel RH, et al, Lancet Diabetes Endocrinol 2025;13(3):221-262) diagnoses obesity in two steps. First, excess adiposity must be confirmed, by direct body fat measurement, or by at least one anthropometric criterion such as waist circumference, waist-to-hip ratio or waist-to-height ratio in addition to body mass index, or by at least two anthropometric criteria regardless of body mass index; above an index of 40 excess adiposity can pragmatically be assumed. Second, confirmed obesity is classified as clinical where there are signs or symptoms of reduced function of tissues or organs due to the adiposity, or a substantial age-adjusted limitation of day-to-day activities, and as preclinical where organ function is preserved. The reform is the first step: body mass index alone is not a diagnosis, and the Commission recommends it be used as a surrogate for risk at population level rather than to assess an individual. The miss runs both ways, because two anthropometric criteria confirm obesity regardless of the index, so a person with a normal index but a raised waist and waist-to-height ratio has confirmed obesity that an index-first screen would never reach. And the clinical versus preclinical distinction is about function rather than size, so a higher index does not make obesity clinical. The anthropometric cutoffs are not encoded here because the Commission specifies validated cutoffs appropriate to age, gender and ethnicity rather than publishing one set. It applies published criteria to findings already gathered and it does not prescribe treatment or counsel on weight.';

export const BMI_ASSUMED = 40; // above this, excess adiposity is assumed

const ANTHRO = [
  { arg: 'waistRaised', text: 'a raised waist circumference' },
  { arg: 'waistHipRaised', text: 'a raised waist-to-hip ratio' },
  { arg: 'waistHeightRaised', text: 'a raised waist-to-height ratio' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function clinicalObesity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const bmi = num(o.bmi);
  if (bmi !== null && (bmi < 5 || bmi > 200)) return { valid: false, message: 'Body mass index is out of range.' };

  const anthro = ANTHRO.filter((a) => truthy(o[a.arg])).map((a) => a.text);
  const directFat = truthy(o.directBodyFatExcess);
  const bmiRaised = bmi !== null && bmi >= 30;
  const bmiVeryHigh = bmi !== null && bmi > BMI_ASSUMED;

  let route = null;
  if (bmiVeryHigh) route = `a body mass index above ${BMI_ASSUMED}, at which excess adiposity is assumed`;
  else if (directFat) route = 'direct body fat measurement';
  else if (bmiRaised && anthro.length >= 1) route = `a raised body mass index with ${anthro.join(' and ')}`;
  else if (anthro.length >= 2) route = `${anthro.join(' and ')}, which confirms obesity regardless of the body mass index`;

  const confirmed = route !== null;

  const organDysfunction = truthy(o.organDysfunction);
  const activityLimitation = truthy(o.activityLimitation);
  const clinical = confirmed && (organDysfunction || activityLimitation);

  const category = confirmed ? (clinical ? 'Clinical obesity' : 'Preclinical obesity') : null;

  // The reform: an index on its own confirms nothing below 40.
  const bmiOnlyNote = !confirmed && bmiRaised && !bmiVeryHigh
    ? `A body mass index of ${bmi} on its own does not confirm obesity status. The Commission requires direct body fat measurement, or one anthropometric criterion in addition to the index, or two anthropometric criteria without it - and recommends the index be used as a population-level surrogate for risk rather than to assess an individual. Only above ${BMI_ASSUMED} is excess adiposity assumed.`
    : null;

  // The miss that runs the other way.
  const normalBmiNote = confirmed && anthro.length >= 2 && bmi !== null && !bmiRaised
    ? `Obesity is confirmed here with a body mass index of ${bmi}, because two anthropometric criteria confirm it regardless of the index. A screen that started from the index would never have reached this person.`
    : null;

  // Function, not size.
  const functionNote = category
    ? 'The clinical and preclinical distinction turns on function, not size. A higher body mass index does not make obesity clinical, and nothing in this second step reads a number.'
    : null;

  const cutoffNote = anthro.length >= 1
    ? 'The Commission specifies validated cutoffs appropriate to age, gender and ethnicity rather than publishing one set, so this tile takes whether each measure is raised against an appropriate cutoff rather than a raw measurement.'
    : null;

  const missing = [];
  if (!confirmed) missing.push('confirmation of excess adiposity by body fat measurement, one anthropometric criterion with a raised body mass index, or two anthropometric criteria');

  return {
    valid: true,
    category,
    confirmed,
    route,
    clinical,
    anthropometricCriteria: anthro,
    bmiOnlyNote,
    normalBmiNote,
    functionNote,
    cutoffNote,
    missing,
    abnormal: clinical,
    bandLabel: category || 'Obesity status not confirmed',
    band: category
      ? `${category} — confirmed on ${route}${clinical ? `, with ${[organDysfunction ? 'reduced organ or tissue function' : null, activityLimitation ? 'substantial limitation of day-to-day activities' : null].filter(Boolean).join(' and ')}` : ', with preserved organ function'}.`
      : `Obesity status not confirmed — outstanding: ${missing.join('; ')}.`,
    detail: `Step one confirms excess adiposity: direct body fat measurement, or one anthropometric criterion in addition to body mass index, or two anthropometric criteria regardless of it, with adiposity assumed above an index of ${BMI_ASSUMED}. Step two classifies confirmed obesity as clinical where organ or tissue function is reduced or day-to-day activities are substantially limited, and preclinical otherwise.`,
    note: OBESITY_NOTE,
  };
}

export { ANTHRO };
