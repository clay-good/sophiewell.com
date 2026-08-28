// spec-v841: diagnosis of diabetes and prediabetes, from the American Diabetes Association
// Standards of Care.
//
// Source:
//   American Diabetes Association Professional Practice Committee. 2. Diagnosis and
//   Classification of Diabetes: Standards of Care in Diabetes-2025. Diabetes Care.
//   2025;48(Supplement_1):S27-S49.
//
// THE THRESHOLDS:
//                        prediabetes        diabetes
//   A1C                  5.7-6.4 %          >= 6.5 %
//   fasting plasma glucose  100-125 mg/dL   >= 126 mg/dL
//   2-h plasma glucose on a 75 g OGTT  140-199   >= 200 mg/dL
//   random plasma glucose   -               >= 200 mg/dL, ONLY with classic symptoms of
//                                           hyperglycemia or hyperglycemic crisis
//
// CONFIRMATION IS PART OF THE DEFINITION, AND IS ROUTINELY SKIPPED. The Standards say that
// in the absence of unequivocal hyperglycemia, "diagnosis requires two abnormal results from
// different tests which may be obtained at the same time (e.g., A1C and FPG), or the same
// test at two different time points". One abnormal result is not a diagnosis. A tool that
// reported diabetes from a single raised A1C would be making a diagnosis the Standards do not.
//
// THE RANDOM-GLUCOSE ROUTE IS THE EXCEPTION, AND IT HAS A CONDITION. A random glucose of 200
// or more counts only WITH classic symptoms or a hyperglycemic crisis - and because that is
// unequivocal hyperglycemia, it needs no confirmation. Both halves matter: without the
// symptoms it is not a diagnostic route at all, and with them no second test is required.
//
// A1C IS NOT ALWAYS INTERPRETABLE. The Standards list conditions that alter the result:
// altered erythrocyte turnover - anemia, iron status, splenectomy, blood loss, transfusion,
// hemolysis, glucose-6-phosphate dehydrogenase deficiency, erythropoietin - as well as HIV,
// cirrhosis, renal failure, dialysis and pregnancy, plus hemoglobin variants as an assay
// interference. Where any of these is present the A1C should not be used to diagnose.
//
// AND THE ORAL GLUCOSE TOLERANCE TEST HAS A PREPARATION REQUIREMENT. The Standards call for a
// mixed eating pattern with at least 150 g of carbohydrate daily for the 3 days beforehand.
// Antecedent carbohydrate restriction distorts the result, and a low-carbohydrate diet in the
// days before the test is common and rarely asked about.
//
// Pure: no DOM, no clock, no network.

export const DIABETES_NOTE = 'The Standards of Care (American Diabetes Association Professional Practice Committee, Diabetes Care 2025;48(Supplement 1):S27-S49) diagnose diabetes at a glycated hemoglobin of 6.5 percent or more, a fasting plasma glucose of 126 milligrams per deciliter or more, a two-hour plasma glucose of 200 or more during a 75 gram oral glucose tolerance test, or a random plasma glucose of 200 or more in someone with classic symptoms of hyperglycemia or a hyperglycemic crisis. Prediabetes covers a glycated hemoglobin of 5.7 to 6.4 percent, a fasting glucose of 100 to 125, or a two-hour glucose of 140 to 199. Confirmation is part of the definition and is routinely skipped: in the absence of unequivocal hyperglycemia the diagnosis requires two abnormal results, either from two different tests taken at the same time or from the same test at two different times, so a single raised value is not a diagnosis. The random-glucose route is the exception and carries a condition, since it counts only alongside classic symptoms or a crisis, and because that is unequivocal hyperglycemia it needs no second test. The glycated hemoglobin is not always interpretable, being altered by anything that changes red cell turnover including anemia, iron status, splenectomy, blood loss, transfusion, hemolysis, glucose-6-phosphate dehydrogenase deficiency and erythropoietin, as well as by HIV, cirrhosis, renal failure, dialysis, pregnancy and hemoglobin variants. And the tolerance test needs a mixed eating pattern with at least 150 grams of carbohydrate daily for three days beforehand, because carbohydrate restriction before the test distorts it. It interprets results already obtained and it does not start or adjust any treatment.';

export const A1C_DIABETES = 6.5;
export const A1C_PREDIABETES = 5.7;
export const FPG_DIABETES = 126;
export const FPG_PREDIABETES = 100;
export const OGTT_DIABETES = 200;
export const OGTT_PREDIABETES = 140;
export const RANDOM_DIABETES = 200;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function diabetesDiagnosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const a1c = num(o.a1c);
  const fpg = num(o.fastingGlucose);
  const ogtt = num(o.twoHourGlucose);
  const random = num(o.randomGlucose);
  for (const [label, v, hi] of [
    ['A1C', a1c, 30], ['Fasting plasma glucose', fpg, 3000],
    ['2-hour plasma glucose', ogtt, 3000], ['Random plasma glucose', random, 3000],
  ]) {
    if (v !== null && (v < 0 || v > hi)) return { valid: false, message: `${label} is out of range.` };
  }

  const symptoms = truthy(o.classicSymptoms);
  const a1cUnreliable = truthy(o.a1cConfounder);
  const carbRestricted = truthy(o.carbRestrictedBeforeOgtt);
  const confirmedSeparately = truthy(o.confirmedOnRepeat);

  // A1C is set aside entirely where a confounder is present.
  const a1cUsable = a1c !== null && !a1cUnreliable;

  const diabetesRange = [];
  if (a1cUsable && a1c >= A1C_DIABETES) diabetesRange.push(`an A1C of ${a1c} percent`);
  if (fpg !== null && fpg >= FPG_DIABETES) diabetesRange.push(`a fasting glucose of ${fpg} mg/dL`);
  if (ogtt !== null && ogtt >= OGTT_DIABETES && !carbRestricted) diabetesRange.push(`a 2-hour glucose of ${ogtt} mg/dL`);

  // The unequivocal route: no confirmation required.
  const unequivocal = random !== null && random >= RANDOM_DIABETES && symptoms;

  // Two abnormal results: two different tests, or the same test repeated.
  const confirmed = diabetesRange.length >= 2 || (diabetesRange.length >= 1 && confirmedSeparately);

  const prediabetesRange = [];
  if (a1cUsable && a1c >= A1C_PREDIABETES && a1c < A1C_DIABETES) prediabetesRange.push(`an A1C of ${a1c} percent`);
  if (fpg !== null && fpg >= FPG_PREDIABETES && fpg < FPG_DIABETES) prediabetesRange.push(`a fasting glucose of ${fpg} mg/dL`);
  if (ogtt !== null && ogtt >= OGTT_PREDIABETES && ogtt < OGTT_DIABETES && !carbRestricted) prediabetesRange.push(`a 2-hour glucose of ${ogtt} mg/dL`);

  let verdict = null;
  let basis = null;
  if (unequivocal) {
    verdict = 'Diabetes';
    basis = `a random glucose of ${random} mg/dL with classic symptoms, which is unequivocal hyperglycemia and needs no confirmation`;
  } else if (confirmed) {
    verdict = 'Diabetes';
    basis = diabetesRange.length >= 2
      ? `two abnormal results: ${diabetesRange.join(' and ')}`
      : `${diabetesRange[0]}, confirmed on a repeat test`;
  } else if (diabetesRange.length === 1) {
    verdict = 'Meets a diabetes threshold, not yet confirmed';
    basis = `${diabetesRange[0]}, a single abnormal result`;
  } else if (prediabetesRange.length >= 1) {
    verdict = 'Prediabetes';
    basis = prediabetesRange.join(' and ');
  } else if (a1c !== null || fpg !== null || ogtt !== null || random !== null) {
    verdict = 'Below the diagnostic thresholds';
    basis = 'no value in the prediabetes or diabetes range';
  }

  // Confirmation, which is part of the definition.
  const confirmationNote = verdict === 'Meets a diabetes threshold, not yet confirmed'
    ? 'One abnormal result is not a diagnosis. In the absence of unequivocal hyperglycemia the Standards require TWO abnormal results, either from two different tests at the same time, such as an A1C and a fasting glucose, or from the same test at two different time points.'
    : null;

  // The random-glucose route, both halves.
  const randomNote = random !== null && random >= RANDOM_DIABETES && !symptoms
    ? `A random glucose of ${random} mg/dL is NOT a diagnostic route without classic symptoms of hyperglycemia or a hyperglycemic crisis. Confirm with a fasting glucose, an A1C or a tolerance test.`
    : (unequivocal
      ? 'This route needs no confirmation, because classic symptoms with a random glucose at or above 200 is the unequivocal hyperglycemia the Standards except from confirmatory testing.'
      : null);

  const a1cNote = a1cUnreliable && a1c !== null
    ? 'A condition that alters the A1C is recorded, so the A1C is not used here. Altered red cell turnover, HIV, cirrhosis, renal failure, dialysis, pregnancy and hemoglobin variants all change the result, and a glucose-based test should be used instead.'
    : null;

  const ogttNote = carbRestricted && ogtt !== null
    ? 'Carbohydrate restriction in the days before the tolerance test is recorded, so the 2-hour value is not used here. The Standards call for a mixed eating pattern with at least 150 g of carbohydrate daily for 3 days beforehand; restriction distorts the result.'
    : null;

  return {
    valid: true,
    verdict,
    basis,
    diabetesRangeTests: diabetesRange,
    prediabetesRangeTests: prediabetesRange,
    unequivocal,
    confirmationNote,
    randomNote,
    a1cNote,
    ogttNote,
    abnormal: verdict === 'Diabetes' || verdict === 'Meets a diabetes threshold, not yet confirmed' || verdict === 'Prediabetes',
    bandLabel: verdict || 'Nothing entered',
    band: verdict
      ? `${verdict} — ${basis}.`
      : 'Nothing entered. An A1C, a fasting glucose, a 2-hour tolerance test value or a random glucose is needed.',
    detail: `Diabetes: A1C ${A1C_DIABETES} percent or more, fasting glucose ${FPG_DIABETES} or more, 2-hour glucose ${OGTT_DIABETES} or more, or a random glucose ${RANDOM_DIABETES} or more WITH classic symptoms. Prediabetes: A1C ${A1C_PREDIABETES} to 6.4, fasting ${FPG_PREDIABETES} to 125, 2-hour ${OGTT_PREDIABETES} to 199. Without unequivocal hyperglycemia, two abnormal results are required.`,
    note: DIABETES_NOTE,
  };
}
