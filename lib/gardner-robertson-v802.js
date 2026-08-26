// spec-v802: Gardner-Robertson hearing classification.
//
// Source:
//   Gardner G, Robertson JH. Hearing preservation in unilateral acoustic neuroma surgery.
//   Ann Otol Rhinol Laryngol. 1988;97(1):55-66. (PMID 3277525.) Table as reproduced in the
//   vestibular schwannoma outcome literature.
//
//   class  pure tone average    speech discrimination
//   I      0-30 dB              70-100%     good to excellent
//   II     31-50 dB             50-69%      serviceable
//   III    51-90 dB             5-49%       non-serviceable
//   IV     91 dB or more        1-4%        poor
//   V      not testable         0%          none
//
// THE WORSE OF THE TWO MEASURES GOVERNS. When the pure tone average and the speech
// discrimination fall in different classes, the poorer class is the answer. That is why
// serviceable hearing is defined as a pure tone average of 50 dB OR BETTER **and** a speech
// discrimination of 50% OR BETTER - both, not either.
//
// Classes I and II are serviceable hearing, the threshold that drives management in
// vestibular schwannoma.
//
// Pure: no DOM, no clock, no network.

export const GARDNER_ROBERTSON_NOTE = 'The Gardner-Robertson classification (Gardner G, Robertson JH, Ann Otol Rhinol Laryngol 1988;97(1):55-66) grades hearing in five classes from two audiometric numbers, the pure tone average and the speech discrimination score. Class I is a pure tone average of 0 to 30 decibels with 70 to 100 percent discrimination, class II is 31 to 50 decibels with 50 to 69 percent, class III is 51 to 90 decibels with 5 to 49 percent, class IV is 91 decibels or more with 1 to 4 percent, and class V is hearing that cannot be tested or scores 0 percent. When the two measures fall in different classes the poorer one governs, which is exactly why serviceable hearing means a pure tone average of 50 decibels or better AND a discrimination of 50 percent or better, both rather than either. Classes I and II are serviceable, the threshold that drives management in vestibular schwannoma. It grades an audiogram already performed and says nothing about the cause of the loss or what to do about it.';

const NAMES = { 1: 'good to excellent', 2: 'serviceable', 3: 'non-serviceable', 4: 'poor', 5: 'none' };
const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

function classFromPta(pta) {
  if (pta <= 30) return 1;
  if (pta <= 50) return 2;
  if (pta <= 90) return 3;
  return 4;
}
function classFromSds(sds) {
  if (sds === 0) return 5;
  if (sds >= 70) return 1;
  if (sds >= 50) return 2;
  if (sds >= 5) return 3;
  return 4;
}

export function gardnerRobertson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const notTestable = truthy(o.notTestable);
  const pta = optNum(o.pta, 0, 130);
  if (pta === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'pta', message: 'Enter a pure tone average between 0 and 130 dB.', note: GARDNER_ROBERTSON_NOTE };
  const sds = optNum(o.sds, 0, 100);
  if (sds === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'sds', message: 'Enter a speech discrimination score between 0 and 100 percent.', note: GARDNER_ROBERTSON_NOTE };

  if (!notTestable && pta === null && sds === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'pta', message: 'Enter a pure tone average, a speech discrimination score, or mark the hearing not testable.', note: GARDNER_ROBERTSON_NOTE };
  }

  const ptaClass = notTestable ? 5 : (pta === null ? null : classFromPta(pta));
  const sdsClass = sds === null ? null : classFromSds(sds);

  // The poorer of the two measures governs; a higher class number is poorer.
  const grade = Math.max(ptaClass || 0, sdsClass || 0);
  const serviceable = grade <= 2;
  const disagree = ptaClass !== null && sdsClass !== null && ptaClass !== sdsClass;

  return {
    valid: true,
    grade,
    className: NAMES[grade],
    ptaClass,
    sdsClass,
    serviceable,
    disagree,
    abnormal: !serviceable,
    bandLabel: `Gardner-Robertson class ${ROMAN[grade]}`,
    band: `Gardner-Robertson class ${ROMAN[grade]} — ${NAMES[grade]}. ${serviceable ? 'Serviceable hearing.' : 'Not serviceable hearing.'}${disagree ? ` The two measures disagreed (pure tone average class ${ROMAN[ptaClass]}, discrimination class ${ROMAN[sdsClass]}); the poorer governs.` : ''}`,
    detail: 'Class I is 0-30 dB with 70-100% discrimination; II is 31-50 dB with 50-69%; III is 51-90 dB with 5-49%; IV is 91 dB or more with 1-4%; V is not testable or 0%. When the two measures fall in different classes the poorer one governs, which is why serviceable hearing needs a pure tone average of 50 dB or better AND a discrimination of 50% or better, both rather than either. Classes I and II are serviceable.',
    note: GARDNER_ROBERTSON_NOTE,
  };
}
