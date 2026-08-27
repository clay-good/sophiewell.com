// spec-v837: MASLD, MetALD and the steatotic liver disease nomenclature.
//
// Source:
//   Rinella ME, Lazarus JV, Ratziu V, et al. A multisociety Delphi consensus statement on new
//   fatty liver disease nomenclature. J Hepatol. 2023;79(6):1542-1556 / Hepatology.
//   2023;78(6):1966-1986.
//
// STEATOTIC LIVER DISEASE (SLD) is now the umbrella term. Within it:
//   MASLD   hepatic steatosis PLUS at least one of five cardiometabolic criteria, with
//           alcohol intake below the MetALD range.
//   MetALD  the same, but with an alcohol intake of 140-350 g/week in females or
//           210-420 g/week in males. A NEW category that did not exist before 2023.
//   ALD     alcohol above the MetALD range.
//   Cryptogenic SLD  steatosis with no cardiometabolic criterion and no other cause.
//
// THE CHANGE THAT MATTERS IS NOT THE NAME. NAFLD was a diagnosis of EXCLUSION: significant
// alcohol had to be ruled out before it could be given. MASLD is a POSITIVE diagnosis, made
// on steatosis plus metabolic dysfunction. And drinking above the MASLD threshold no longer
// makes the diagnosis go away - it makes it MetALD, a named category with its own definition.
// A tool still applying NAFLD logic reports "not NAFLD" for a patient who now has a named
// disease, and drops them.
//
// THE FIVE CARDIOMETABOLIC CRITERIA IN ADULTS, any ONE of which suffices:
//   1  BMI >=25 (>=23 in those of Asian ancestry), OR waist circumference above the
//      ancestry- and sex-specific threshold
//   2  fasting glucose >=100 mg/dL, or HbA1c >=5.7%, or type 2 diabetes, or treatment for it
//   3  blood pressure >=130/85 mmHg, or antihypertensive treatment
//   4  triglycerides >=150 mg/dL, or lipid-lowering treatment
//   5  HDL cholesterol <=40 mg/dL in males or <=50 mg/dL in females, or lipid-lowering
//      treatment
//
// TWO THRESHOLDS THAT ARE NOT ONE NUMBER: the BMI cut is ancestry-specific, and the HDL cut
// is sex-specific. Using a single figure for either mis-classifies a predictable group.
//
// AND THE ALCOHOL BANDS ARE PER WEEK, NOT PER DAY. 140-350 g/week and 210-420 g/week are the
// published figures; the daily equivalents people quote are approximations of them.
//
// Pure: no DOM, no clock, no network.

export const MASLD_NOTE = 'The 2023 multisociety Delphi consensus (Rinella ME, Lazarus JV, Ratziu V, et al, J Hepatol 2023;79(6):1542-1556) replaced fatty liver disease nomenclature with steatotic liver disease as an umbrella term. Metabolic dysfunction-associated steatotic liver disease means hepatic steatosis with at least one of five cardiometabolic criteria: a body mass index of 25 or more, or 23 in those of Asian ancestry, or a raised waist circumference; a fasting glucose of 100 milligrams per deciliter or more, or a glycated hemoglobin of 5.7 percent or more, or type 2 diabetes or its treatment; a blood pressure of 130 over 85 or more, or antihypertensive treatment; triglycerides of 150 or more, or lipid-lowering treatment; and a high density lipoprotein cholesterol at or below 40 in males or 50 in females, or lipid-lowering treatment. The change that matters is not the name. The old term was a diagnosis of exclusion in which significant alcohol had to be ruled out first, while this is a positive diagnosis made on steatosis plus metabolic dysfunction. Drinking above the threshold no longer removes the diagnosis; it makes it MetALD, a category created in 2023 for an intake of 140 to 350 grams a week in females and 210 to 420 in males, above which it is alcohol-related liver disease. A tool still applying the old logic reports no disease in a patient who now has a named one. Note also that the body mass index cut is ancestry-specific and the cholesterol cut is sex-specific, so a single figure for either misclassifies a predictable group, and that the alcohol bands are per week rather than per day. It applies published criteria to findings already gathered and it does not stage fibrosis or direct treatment.';

export const BMI_GENERAL = 25;
export const BMI_ASIAN = 23;
export const GLUCOSE_THRESHOLD = 100;   // mg/dL
export const HBA1C_THRESHOLD = 5.7;     // percent
export const SBP_THRESHOLD = 130;
export const DBP_THRESHOLD = 85;
export const TRIGLYCERIDE_THRESHOLD = 150; // mg/dL
export const HDL_MALE = 40;             // mg/dL, at or below
export const HDL_FEMALE = 50;
export const METALD_MIN_FEMALE = 140;   // g/week
export const METALD_MAX_FEMALE = 350;
export const METALD_MIN_MALE = 210;
export const METALD_MAX_MALE = 420;

// Ancestry- and sex-specific waist thresholds, in cm.
const WAIST = {
  european: { male: 94, female: 80 },
  'south-asian-chinese': { male: 90, female: 80 },
  japanese: { male: 85, female: 90 },
};

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function masldCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sex = String(o.sex == null ? '' : o.sex).trim().toLowerCase() || 'female';
  if (!['male', 'female'].includes(sex)) return { valid: false, message: 'Sex must be male or female.' };

  const ancestry = String(o.ancestry == null ? '' : o.ancestry).trim().toLowerCase() || 'european';
  if (!Object.prototype.hasOwnProperty.call(WAIST, ancestry)) {
    return { valid: false, message: 'Ancestry must be european, south-asian-chinese or japanese.' };
  }
  const asianBmiCut = ancestry !== 'european';

  const bmi = num(o.bmi);
  const waist = num(o.waistCm);
  const glucose = num(o.fastingGlucose);
  const hba1c = num(o.hba1c);
  const sbp = num(o.systolic);
  const dbp = num(o.diastolic);
  const trig = num(o.triglycerides);
  const hdl = num(o.hdl);
  const alcohol = num(o.alcoholGramsPerWeek);
  for (const [label, v, hi] of [
    ['BMI', bmi, 150], ['Waist circumference', waist, 300], ['Fasting glucose', glucose, 2000],
    ['HbA1c', hba1c, 30], ['Systolic pressure', sbp, 300], ['Diastolic pressure', dbp, 200],
    ['Triglycerides', trig, 10000], ['HDL cholesterol', hdl, 500], ['Alcohol grams per week', alcohol, 10000],
  ]) {
    if (v !== null && (v < 0 || v > hi)) return { valid: false, message: `${label} is out of range.` };
  }

  const steatosis = truthy(o.hepaticSteatosis);
  const bmiCut = asianBmiCut ? BMI_ASIAN : BMI_GENERAL;
  const waistCut = WAIST[ancestry][sex];

  const met = [];
  if ((bmi !== null && bmi >= bmiCut) || (waist !== null && waist >= waistCut)) {
    met.push(`adiposity (BMI cut ${bmiCut}, waist cut ${waistCut} cm for this ancestry and sex)`);
  }
  if ((glucose !== null && glucose >= GLUCOSE_THRESHOLD)
    || (hba1c !== null && hba1c >= HBA1C_THRESHOLD)
    || truthy(o.type2Diabetes)) {
    met.push('dysglycemia or type 2 diabetes');
  }
  if ((sbp !== null && sbp >= SBP_THRESHOLD) || (dbp !== null && dbp >= DBP_THRESHOLD) || truthy(o.antihypertensive)) {
    met.push('raised blood pressure or its treatment');
  }
  if ((trig !== null && trig >= TRIGLYCERIDE_THRESHOLD) || truthy(o.lipidLowering)) {
    met.push('raised triglycerides or lipid-lowering treatment');
  }
  const hdlCut = sex === 'male' ? HDL_MALE : HDL_FEMALE;
  if ((hdl !== null && hdl <= hdlCut) || truthy(o.lipidLowering)) {
    met.push(`low HDL cholesterol (cut ${hdlCut} mg/dL for this sex) or lipid-lowering treatment`);
  }

  const metabolic = met.length >= 1;
  const metaldMin = sex === 'male' ? METALD_MIN_MALE : METALD_MIN_FEMALE;
  const metaldMax = sex === 'male' ? METALD_MAX_MALE : METALD_MAX_FEMALE;

  let category = null;
  if (steatosis) {
    if (alcohol !== null && alcohol > metaldMax) {
      category = 'ALD, alcohol-related liver disease';
    } else if (metabolic && alcohol !== null && alcohol >= metaldMin) {
      category = 'MetALD';
    } else if (metabolic) {
      category = 'MASLD';
    } else if (truthy(o.otherCause)) {
      category = 'SLD of specific etiology';
    } else {
      category = 'Cryptogenic SLD';
    }
  }

  // The change that actually matters.
  const nomenclatureNote = category === 'MetALD'
    ? `An intake of ${alcohol} g/week sits in the MetALD band for this sex (${metaldMin} to ${metaldMax} g/week). Under the old nomenclature this patient would have been excluded from a fatty liver diagnosis altogether, because it required ruling out significant alcohol. MetALD is a named category created in 2023 precisely for them.`
    : (category === 'MASLD' && alcohol !== null
      ? 'This is a positive diagnosis on steatosis plus metabolic dysfunction, not a diagnosis of exclusion. The old term required alcohol to be ruled out first; this one does not.'
      : null);

  // Two thresholds that are not one number.
  const thresholdNote = (asianBmiCut && bmi !== null && bmi >= BMI_ASIAN && bmi < BMI_GENERAL)
    ? `A BMI of ${bmi} meets the criterion at the ancestry-specific cut of ${BMI_ASIAN}, though it would not at the general cut of ${BMI_GENERAL}. Using one figure for everyone misses this group.`
    : (sex === 'female' && hdl !== null && hdl > HDL_MALE && hdl <= HDL_FEMALE
      ? `An HDL of ${hdl} mg/dL meets the criterion at the female cut of ${HDL_FEMALE}, though it would not at the male cut of ${HDL_MALE}. The cut is sex-specific.`
      : null);

  const alcoholUnitNote = alcohol !== null
    ? `Alcohol here is grams per WEEK. The MetALD band for this sex is ${metaldMin} to ${metaldMax} g/week; the daily figures often quoted are approximations of these.`
    : null;

  return {
    valid: true,
    category,
    criteriaMet: met,
    metabolicDysfunction: metabolic,
    bmiCut,
    waistCut,
    hdlCut,
    metaldBand: [metaldMin, metaldMax],
    nomenclatureNote,
    thresholdNote,
    alcoholUnitNote,
    abnormal: !!category,
    bandLabel: category || 'No steatotic liver disease',
    band: category
      ? `${category} — hepatic steatosis with ${metabolic ? `${met.length} of 5 cardiometabolic criteria` : 'no cardiometabolic criterion'}.`
      : 'No steatotic liver disease: hepatic steatosis is the entry finding and has not been recorded.',
    detail: `Steatotic liver disease is the umbrella. MASLD is steatosis plus at least one of five cardiometabolic criteria; MetALD is the same with an alcohol intake of ${metaldMin} to ${metaldMax} g/week for this sex; above that is alcohol-related liver disease. Steatosis with no cardiometabolic criterion and no other cause is cryptogenic.`,
    note: MASLD_NOTE,
  };
}

export { WAIST };
