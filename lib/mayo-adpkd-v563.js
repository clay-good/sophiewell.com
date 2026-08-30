// spec-v563: the Mayo Imaging Classification of autosomal dominant polycystic kidney disease (ADPKD).
// "adpkd" was zero-hit across corpus.json, app.js and lib/meta.js, and
// `grep -c "id: 'mayo-adpkd-imaging'" app.js` returned 0.
//
// TWO STEPS, AND ONLY THE SECOND IS ARITHMETIC.
//   1. A radiologist classifies the MORPHOLOGY as typical (class 1) or atypical (class 2).
//   2. Class 1 patients only are then subclassified 1A to 1E from their height-adjusted total kidney
//      volume and their age.
//
// **CLASS 2 IS A TERMINAL DEAD END, NOT A ROUTE TO A LOW SUBCLASS.** Atypical patients receive NO 1A-1E
// subclass at all: the classification explicitly does not risk-stratify them. A tile that ran the formula
// anyway would hand an atypical patient a growth-rate class the instrument refuses to give, and because
// atypical morphology often means asymmetric or segmental disease the computed number would look
// reassuringly low. This lib returns `subclassified: false` and says the classification stops there.
//
// **THE MORPHOLOGY CLASS IS A DESCRIPTOR, NOT A COMPUTED INPUT.** Whether a patient is class 1 or class 2
// is a radiologist's judgment about the pattern of cystic replacement, and nothing in the volume or the age
// can determine it. It is therefore asked for and never inferred.
//
// THE SUBCLASSIFICATION MODEL. From a theoretical starting height-adjusted total kidney volume of 150 mL/m
// at age 0, the estimated yearly percentage growth rate is
//     rate = 100 x ( (htTKV / 150)^(1/age) - 1 )
// and the subclasses are rate below 1.5 percent (1A), 1.5 to 3 (1B), 3 to 4.5 (1C), 4.5 to 6 (1D), and
// above 6 (1E).
//
// **AGE SITS IN A DENOMINATOR INSIDE AN EXPONENT, AND THE MODEL IS NOT VALIDATED BELOW AGE 15.** The
// published cut-off table starts at 15, and the reciprocal exponent makes the estimate increasingly
// unstable as age falls -- at very low ages a small volume difference swings the class. This lib refuses
// below 15 rather than returning a confident-looking number from the unvalidated, numerically unstable end
// of the model.
//
// BOUNDARY CONVENTION, STATED BECAUSE THE PRINTED BANDS ADJOIN. The source writes "<1.5%", "1.5%-3%",
// "3%-4.5%", "4.5%-6%" and ">6%", so the endpoints 1.5, 3 and 4.5 each appear in two adjacent bands. This
// lib makes each band lower-inclusive and upper-exclusive except the last pair, which follows the printed
// text exactly: 4.5 to 6 inclusive is 1D and strictly above 6 is 1E.
//
// **K = 150 IS THE PUBLISHED MODEL. A COMPETING K = 130 EXISTS AND IS A RIVAL PARAMETERIZATION, NOT A
// CORRECTION.** A later proposal substitutes 130 for the theoretical starting volume; an independent
// validation found it tended to OVERESTIMATE the class. The classification as published uses 150 with a
// theoretical starting age of 0, which is what this implements, and the alternative is named rather than
// silently adopted or silently ignored (spec-v97).
//
// HOW THE VOLUME WAS MEASURED MATTERS ENOUGH TO CHANGE THE CLASS. The ellipsoid method, TKV = pi/6 x
// length x width x depth, overestimated stereologic volume by a mean of about 5.3 percent in an independent
// cohort, with wide spread -- enough to move a patient a whole subclass. The method is therefore reported
// as an input rather than assumed.
//
// HIGH-STAKES: an imaging-based risk stratification built to SELECT PATIENTS FOR CLINICAL TRIALS. It does
// NOT diagnose ADPKD, which rests on imaging criteria by age and family history, or on genetic testing. It
// does not measure kidney function: a patient can sit in a high subclass with a normal eGFR, and the
// classification says nothing about current function. It does not decide treatment, and in particular it is
// not by itself an indication for a vasopressin receptor antagonist, which has its own eligibility and
// monitoring requirements. It does not apply to atypical morphology, to other cystic kidney diseases, or
// below the validated age (spec-v11 section 5.3). The clinical decision stays with the nephrologist.
//
// CLASSES, EQUATION AND BAND LIMITS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the original
// report and an independent validation that restates the equation and every band boundary verbatim:
//   - Irazabal MV, Rangel LJ, Bergstralh EJ, et al. Imaging classification of autosomal dominant polycystic
//     kidney disease: a simple model for selecting patients for clinical trials. J Am Soc Nephrol.
//     2015;26(1):160-172.
//   - Park HC, et al. Mayo imaging classification is a good predictor of rapid progress among Korean ADPKD
//     patients. Kidney Res Clin Pract. 2022;41(4):432-441.

export const THEORETICAL_START_HTTKV = 150; // mL/m, the published K
export const ALTERNATIVE_K = 130;           // a rival parameterization, not implemented
export const MIN_VALIDATED_AGE = 15;        // the published cut-off table starts here

export const MORPHOLOGY_CLASSES = [
  {
    value: '1',
    label: 'Class 1 (typical ADPKD)',
    subclassifiable: true,
    text: 'Bilateral and diffuse distribution, with mild, moderate or severe replacement of kidney tissue by cysts, where all cysts contribute similarly to total kidney volume.',
  },
  {
    value: '2A',
    label: 'Class 2A (atypical)',
    subclassifiable: false,
    text: 'Unilateral, segmental, asymmetric or lopsided presentation.',
  },
  {
    value: '2B',
    label: 'Class 2B (atypical)',
    subclassifiable: false,
    text: 'Bilateral presentation with acquired unilateral atrophy, or bilateral kidney atrophy.',
  },
];

// Lower-inclusive, upper-exclusive, except 1D which takes 6 exactly, per the printed text.
const SUBCLASSES = [
  { value: '1A', below: 1.5, text: 'Estimated yearly growth below 1.5 percent.' },
  { value: '1B', below: 3, text: 'Estimated yearly growth of 1.5 to under 3 percent.' },
  { value: '1C', below: 4.5, text: 'Estimated yearly growth of 3 to under 4.5 percent.' },
  { value: '1D', below: null, text: 'Estimated yearly growth of 4.5 to 6 percent inclusive.' },
  { value: '1E', below: null, text: 'Estimated yearly growth above 6 percent.' },
];

export const TKV_METHODS = [
  { value: 'stereologic', text: 'Stereologic (planimetric) measurement' },
  { value: 'ellipsoid', text: 'Ellipsoid equation: pi/6 x length x width x depth' },
];

export const ELLIPSOID_NOTE = 'The ellipsoid method overestimated stereologic volume by a mean of about 5.3 percent in an independent cohort, with wide spread. That is enough to move a patient a whole subclass, so the method is recorded rather than assumed.';

const ATYPICAL_TEXT = 'Atypical morphology. The Mayo imaging classification assigns NO 1A to 1E subclass to atypical patients: it explicitly does not risk-stratify them, and the classification stops here. Running the growth model anyway would hand back a class the instrument refuses to give, and because atypical disease is often asymmetric or segmental the computed figure would look falsely reassuring.';

const K_TEXT = `Computed with the published theoretical starting height-adjusted volume of ${THEORETICAL_START_HTTKV} mL/m at age 0. A later proposal substitutes ${ALTERNATIVE_K}; an independent validation found that it tended to OVERESTIMATE the class, and it is a rival parameterization rather than a correction, so it is named here but not applied.`;

const BOUNDARY_TEXT = 'The published bands adjoin, so each is lower-inclusive and upper-exclusive here, except that 4.5 to 6 inclusive is 1D and strictly above 6 is 1E, following the printed text.';

const NOTE = 'The Mayo imaging classification of autosomal dominant polycystic kidney disease (Irazabal and colleagues 2015) works in two steps, and only the second is arithmetic. A radiologist first classifies the morphology as typical, class 1, meaning bilateral and diffuse cystic replacement where all cysts contribute similarly to total kidney volume, or atypical, class 2, covering unilateral, segmental, asymmetric or lopsided presentations and bilateral presentations with acquired atrophy. Only class 1 patients are then subclassified. Atypical patients receive no 1A to 1E subclass at all, because the classification explicitly does not risk-stratify them, and running the growth model on an atypical patient would return a class the instrument refuses to give while looking falsely reassuring, since atypical disease is often asymmetric. The morphology class is a radiologist’s descriptor and cannot be inferred from the volume or the age. For class 1 patients the estimated yearly percentage growth rate is 100 times the quantity height-adjusted total kidney volume divided by 150, raised to the power of one over age, minus one, where the height-adjusted volume is total kidney volume in milliliters divided by height in meters and the total is the sum of both kidneys. The subclasses are growth below 1.5 percent for 1A, 1.5 to 3 for 1B, 3 to 4.5 for 1C, 4.5 to 6 for 1D, and above 6 for 1E. Age sits in a denominator inside an exponent, so the estimate becomes unstable as age falls, and the published cut-off table starts at age 15, below which the classification is not validated. The published model uses a theoretical starting volume of 150 mL/m at a theoretical starting age of 0; a later proposal substitutes 130, which an independent validation found tended to overestimate the class, and that is a rival parameterization rather than a correction. How the volume was measured matters enough to change the class, because the ellipsoid equation, pi over six times length times width times depth, overestimated stereologic volume by a mean of about 5.3 percent in an independent cohort with wide spread. This is an imaging-based risk stratification built to select patients for clinical trials. It does not diagnose ADPKD, which rests on imaging criteria by age together with family history, or on genetic testing. It does not measure kidney function, and a patient can sit in a high subclass with a normal estimated glomerular filtration rate, so the classification says nothing about current function. It does not decide treatment and is not by itself an indication for a vasopressin receptor antagonist, which carries its own eligibility and monitoring requirements. It does not apply to atypical morphology, to other cystic kidney diseases, or below the validated age.';

function readNumber(raw, { min, max } = {}) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return NaN;
  if (min !== undefined && n < min) return NaN;
  if (max !== undefined && n > max) return NaN;
  return n;
}

function subclassFor(rate) {
  for (const s of SUBCLASSES) {
    if (s.below !== null && rate < s.below) return s;
  }
  return rate <= 6 ? SUBCLASSES[3] : SUBCLASSES[4];
}

// input:
//   morphology -- '1', '2A' or '2B'. Required, and never inferred.
//   tkv        -- total kidney volume in mL, both kidneys summed. Required for class 1.
//   height     -- metres. Required for class 1.
//   age        -- years. Required for class 1, and must be at least 15.
//   tkvMethod  -- optional, 'stereologic' or 'ellipsoid'. Recorded, not used in the arithmetic.
export function mayoAdpkd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rawMorphology = o.morphology;
  if (rawMorphology === '' || rawMorphology === null || rawMorphology === undefined) {
    return { valid: false, message: 'Choose the imaging morphology class: 1 for typical ADPKD, or 2A or 2B for atypical. This is a radiologist’s descriptor and cannot be computed from the volume or the age.' };
  }
  const morphology = MORPHOLOGY_CLASSES.find((m) => m.value === String(rawMorphology).trim().toUpperCase());
  if (!morphology) {
    return { valid: false, message: 'Morphology must be 1, 2A or 2B.' };
  }

  const rawMethod = o.tkvMethod;
  let tkvMethod = null;
  if (rawMethod !== '' && rawMethod !== null && rawMethod !== undefined) {
    const found = TKV_METHODS.find((m) => m.value === String(rawMethod).trim().toLowerCase());
    if (!found) return { valid: false, message: 'The volume method must be stereologic or ellipsoid, or left blank.' };
    tkvMethod = found.value;
  }

  if (!morphology.subclassifiable) {
    return {
      valid: true,
      morphology: morphology.value,
      morphologyLabel: morphology.label,
      subclassified: false,
      subclass: null,
      tkvMethod,
      bandLabel: `${morphology.label}: no subclass`,
      bandText: `${morphology.label}. ${morphology.text} ${ATYPICAL_TEXT}`,
      note: NOTE,
    };
  }

  const tkv = readNumber(o.tkv, { min: 1, max: 20000 });
  if (tkv === null) {
    return { valid: false, message: 'Enter the total kidney volume in mL, summed across both kidneys.' };
  }
  if (Number.isNaN(tkv)) {
    return { valid: false, message: 'Total kidney volume must be a number in mL between 1 and 20000, summed across both kidneys.' };
  }

  const height = readNumber(o.height, { min: 0.5, max: 2.5 });
  if (height === null) {
    return { valid: false, message: 'Enter the patient height in meters.' };
  }
  if (Number.isNaN(height)) {
    return { valid: false, message: 'Height must be a number in meters between 0.5 and 2.5.' };
  }

  const age = readNumber(o.age, { min: 0, max: 100 });
  if (age === null) {
    return { valid: false, message: 'Enter the patient age in years.' };
  }
  if (Number.isNaN(age)) {
    return { valid: false, message: 'Age must be a number of years between 0 and 100.' };
  }
  if (age < MIN_VALIDATED_AGE) {
    return { valid: false, message: `The Mayo imaging classification is not validated below age ${MIN_VALIDATED_AGE}: the published cut-off table starts there, and because age sits in a denominator inside an exponent the estimate becomes unstable as age falls. No class is given below that age.` };
  }

  const htTkv = tkv / height;
  const rate = 100 * ((htTkv / THEORETICAL_START_HTTKV) ** (1 / age) - 1);
  const roundedRate = Math.round(rate * 100) / 100;
  const subclass = subclassFor(roundedRate);

  return {
    valid: true,
    morphology: morphology.value,
    morphologyLabel: morphology.label,
    subclassified: true,
    subclass: subclass.value,
    htTkv: Math.round(htTkv * 10) / 10,
    growthRate: roundedRate,
    tkvMethod,
    bandLabel: `Mayo class ${subclass.value}`,
    bandText: `Mayo imaging class ${subclass.value}. ${subclass.text} Height-adjusted total kidney volume ${Math.round(htTkv * 10) / 10} mL/m, giving an estimated yearly growth of ${roundedRate} percent. ${K_TEXT} ${BOUNDARY_TEXT}${tkvMethod ? ` Volume measured by the ${tkvMethod} method. ${ELLIPSOID_NOTE}` : ` ${ELLIPSOID_NOTE}`} This selects patients for trials and does not measure kidney function: a high subclass is compatible with a normal eGFR.`,
    note: NOTE,
  };
}
