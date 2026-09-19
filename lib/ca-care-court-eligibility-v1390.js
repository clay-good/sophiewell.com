// spec-v1390: California CARE Court eligibility, Welfare and Institutions Code 5972 (as amended by SB 27).
//
// Source: WIC 5972 (leginfo text read 2026-09-18; amended by Stats. 2025, ch. 528 (SB 27), effective
// January 1, 2026). A person qualifies for the CARE process only if ALL of the following are met:
//   (a) 18 years of age or older.
//   (b) currently experiencing a serious mental disorder (5600.3(b)(2)) with a diagnosis in the
//       schizophrenia spectrum and other psychotic disorders class, or bipolar I disorder with
//       psychotic features, except psychosis related to current intoxication. Not a psychotic
//       disorder due to a medical condition or not primarily psychiatric (traumatic brain injury,
//       autism, dementia, neurologic conditions). A substance use disorder alone does not qualify.
//   (c) not clinically stabilized in ongoing voluntary treatment.
//   (d) at least one of: (1) unlikely to survive safely in the community without supervision, and
//       the condition is substantially deteriorating; or (2) needs services and supports to prevent a
//       relapse or deterioration likely to result in grave disability or serious harm to self or
//       others.
//   (e) a CARE plan or agreement would be the least restrictive alternative necessary.
//   (f) the person is likely to benefit from a CARE plan or agreement.
// WIC 5970.5 set the county start dates; the last was December 1, 2025.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const CARE_VERIFIED = '2026-09-18';
export const DIAGNOSES = [
  { value: 'schizophrenia-spectrum', text: 'Schizophrenia spectrum or other psychotic disorder' },
  { value: 'bipolar-psychotic', text: 'Bipolar I disorder with psychotic features' },
  { value: 'bipolar-no-psychosis', text: 'Bipolar I disorder without psychotic features' },
  { value: 'intoxication', text: 'Psychosis related to current intoxication' },
  { value: 'medical', text: 'Psychosis due to a medical or neurologic condition (TBI, dementia, autism)' },
  { value: 'sud-only', text: 'Substance use disorder without a qualifying diagnosis' },
  { value: 'other', text: 'Another diagnosis' },
];
export const CRITERION = [
  { value: 'met', text: 'Met' },
  { value: 'not-met', text: 'Not met' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
const s3 = (v) => (v === 'met' || v === 'not-met' ? v : null);

const DX_EXCLUDED = {
  'bipolar-no-psychosis': 'bipolar I disorder qualifies only with psychotic features',
  intoxication: 'psychosis related to current intoxication is excluded',
  medical: 'a psychotic disorder due to a medical condition, or not primarily psychiatric, is excluded',
  'sud-only': 'a substance use disorder alone does not qualify',
  other: 'the diagnosis is not in a qualifying class',
};

export function caCareCourtEligibility(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = Number(String(o.age ?? '').trim());
  if (isBlank(o.age) || !Number.isFinite(age) || age < 0 || age > 120) return { valid: false, message: 'Enter the age in years. CARE is for adults, 18 or older.' };
  if (isBlank(o.diagnosis) || !DIAGNOSES.some((d) => d.value === o.diagnosis)) return { valid: false, message: 'Choose the diagnosis. Since SB 27 (2026), bipolar I with psychotic features qualifies alongside the schizophrenia spectrum.' };

  let dState = null;
  const d1 = s3(o.d1);
  const d2 = s3(o.d2);
  if (d1 === 'met' || d2 === 'met') dState = 'met';
  else if (d1 === 'not-met' && d2 === 'not-met') dState = 'not-met';

  const dxOk = !DX_EXCLUDED[o.diagnosis];
  const serious = s3(o.serious);
  const bState = !dxOk ? 'not-met' : serious;
  const rows = [
    { key: '(a)', label: '(a) 18 or older', state: age >= 18 ? 'met' : 'not-met' },
    { key: '(b)', label: '(b) a serious mental disorder with a qualifying diagnosis', state: bState, why: !dxOk ? DX_EXCLUDED[o.diagnosis] : null },
    { key: '(c)', label: '(c) not clinically stabilized in ongoing voluntary treatment', state: s3(o.notStabilized) },
    { key: '(d)', label: '(d) unlikely to survive safely and deteriorating, or needs support to prevent relapse or deterioration', state: dState },
    { key: '(e)', label: '(e) CARE is the least restrictive alternative necessary', state: s3(o.leastRestrictive) },
    { key: '(f)', label: '(f) likely to benefit from a CARE plan or agreement', state: s3(o.likelyBenefit) },
  ];
  const WORD = { met: 'met', 'not-met': 'not met' };
  const criteria = rows.map((r) => `${r.label}: ${r.state ? WORD[r.state] : 'not assessed'}${r.why ? ` (${r.why})` : ''}`);
  const unassessed = rows.filter((r) => !r.state).map((r) => r.label);
  const failed = rows.filter((r) => r.state === 'not-met').map((r) => (r.why ? `${r.key} ${r.why}` : r.label));

  let verdict;
  let bandLabel;
  let band;
  if (unassessed.length) {
    verdict = null;
    bandLabel = 'Incomplete';
    band = `Not decided. Still needed: ${unassessed.join('; ')}.${failed.length ? ` Recorded as not met: ${failed.join('; ')}.` : ''}`;
  } else if (failed.length) {
    verdict = 'does-not-qualify';
    bandLabel = 'Does not qualify';
    band = `Does not qualify for the CARE process under WIC 5972. Failing: ${failed.join('; ')}.`;
  } else {
    verdict = 'qualifies';
    bandLabel = 'Qualifies';
    band = 'Meets every WIC 5972 criterion as documented. The court decides after the petition.';
  }
  return {
    valid: true,
    verdict,
    abnormal: verdict === 'qualifies',
    bandLabel,
    band,
    criteria,
    sb27Note: 'SB 27 added bipolar I disorder with psychotic features, effective January 1, 2026. Psychosis from current intoxication, and a substance use disorder alone, still do not qualify.',
    postureNote: scopeSentence(CARE_VERIFIED),
  };
}
