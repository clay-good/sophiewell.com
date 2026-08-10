// spec-v696: Framingham criteria for the clinical diagnosis of heart failure.
//
// A bedside, history-and-exam rule for diagnosing congestive heart failure. Source:
//   McKee PA, Castelli WP, McNamara PM, Kannel WB. The natural history of congestive heart
//   failure: the Framingham study. N Engl J Med. 1971;285(26):1441-1446. (PMID 5122894.)
//
// The diagnosis of heart failure requires either:
//   >= 2 MAJOR criteria, OR
//   1 MAJOR criterion AND >= 2 MINOR criteria.
//
// MAJOR criteria (8): acute pulmonary edema; cardiomegaly; hepatojugular reflux; neck-vein
//   distention (raised JVP); paroxysmal nocturnal dyspnea or orthopnea; pulmonary rales; S3
//   gallop; weight loss > 4.5 kg in 5 days in response to heart-failure treatment.
// MINOR criteria (6): ankle edema; dyspnea on exertion; hepatomegaly; nocturnal cough;
//   pleural effusion; tachycardia (heart rate > 120/min). A minor criterion counts only if
//   it is not attributable to another medical condition.
//
// Pure: no DOM, no clock, no network.

export const FRAMINGHAM_HF_NOTE = 'Framingham criteria for the clinical diagnosis of heart failure (McKee PA, Castelli WP, McNamara PM, Kannel WB, N Engl J Med 1971;285(26):1441-1446). Heart failure is diagnosed when either two or more major criteria are present, or one major criterion is present together with two or more minor criteria. The eight major criteria are acute pulmonary edema, cardiomegaly, hepatojugular reflux, neck-vein distention (a raised jugular venous pressure), paroxysmal nocturnal dyspnea or orthopnea, pulmonary rales, a third heart sound (S3 gallop), and weight loss over 4.5 kg in 5 days in response to heart-failure treatment. The six minor criteria are ankle edema, dyspnea on exertion, hepatomegaly, nocturnal cough, pleural effusion, and a heart rate over 120 per minute; a minor criterion counts only if it cannot be attributed to another condition. It is a clinical rule with good sensitivity and was the standard in epidemiologic studies; it supports rather than replaces objective assessment (such as natriuretic peptides and echocardiography) and clinical judgment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const MAJOR = ['acutePulmonaryEdema', 'cardiomegaly', 'hepatojugularReflux', 'neckVeinDistention', 'pndOrthopnea', 'rales', 's3Gallop', 'weightLossTreatment'];
const MINOR = ['ankleEdema', 'dyspneaExertion', 'hepatomegaly', 'nocturnalCough', 'pleuralEffusion', 'tachycardia'];

export function framinghamHfCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let major = 0;
  for (const k of MAJOR) if (truthy(o[k])) major += 1;
  let minor = 0;
  for (const k of MINOR) if (truthy(o[k])) minor += 1;

  const met = major >= 2 || (major >= 1 && minor >= 2);

  return {
    valid: true,
    major,
    minor,
    met,
    abnormal: met,
    bandLabel: met ? 'HF criteria met' : 'HF criteria not met',
    band: `Framingham criteria ${met ? 'MET — heart failure' : 'not met'} (${major} major, ${minor} minor).`,
    detail: met
      ? 'Diagnosis of heart failure is supported (>= 2 major, or 1 major + >= 2 minor). Confirm with objective testing (natriuretic peptides, echocardiography).'
      : 'Criteria not met: needs >= 2 major, or 1 major with >= 2 minor. A minor criterion counts only if not attributable to another condition.',
    note: FRAMINGHAM_HF_NOTE,
  };
}
