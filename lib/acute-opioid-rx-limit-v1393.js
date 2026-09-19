// spec-v1393: the day limit on an opioid prescription for acute pain (NY, NJ, TX).
//
// Sources (text read 2026-09-18):
//   NY  Public Health Law 3331(5): "not more than a seven-day supply" of a Schedule II, III, or IV
//       opioid "upon the initial consultation or treatment" for acute pain. Acute pain excludes
//       chronic pain and pain treated as part of cancer care, hospice or end-of-life care, or
//       palliative care. At a later consultation for the same pain, any appropriate renewal, refill,
//       or new prescription may be issued.
//   NJ  N.J.A.C. 13:35-7.6(g), (j): an initial opioid prescription for acute pain may not exceed a
//       five-day supply, at the lowest effective dose of an IMMEDIATE-RELEASE opioid, never
//       extended-release or long-acting. A subsequent prescription comes "no less than four days"
//       after the initial one, on the patient's request, after consultation, with the rationale
//       documented, and for no more than 30 days. Not applied to active cancer treatment, hospice,
//       palliative care, long-term-care residents, or treatment of substance use disorder.
//   TX  Health & Safety Code 481.07636: for acute pain, not more than a 10-day supply and no
//       refill -- EVERY acute-pain prescription, not only the first. Acute pain excludes chronic
//       pain and pain treated as part of cancer, hospice or end-of-life, or palliative care; the
//       limit does not apply to an opioid approved for treating substance addiction.
//
// CALIFORNIA IS NOT OFFERED: no general adult day limit was found in statute, and the tile does not
// show a state it would then refuse (spec-v1388 s.1). HSC 11158.1 (leginfo, as amended by SB 607,
// effective January 1, 2025; read 2026-09-19) is a counseling duty, not a day limit: before the first
// opioid prescription in a course, the prescriber discusses addiction and overdose risk, the added
// risk with mental and substance use disorders, and the danger with benzodiazepines, alcohol, or other
// depressants -- with the minor's parent or guardian too for a minor. It does not apply to emergency
// services, emergency surgery, or where the discussion would harm the patient.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, parseDate, scopeSentence } from './state-calendar.js';

export const RX_LIMIT_VERIFIED = '2026-09-18';
export const RX_LIMIT_STATES = stateOptions(['NY', 'NJ', 'TX']);
export const CATEGORIES = [
  { value: 'acute', text: 'Acute pain' },
  { value: 'chronic', text: 'Chronic pain' },
  { value: 'cancer', text: 'Cancer care' },
  { value: 'hospice', text: 'Hospice or end-of-life care' },
  { value: 'palliative', text: 'Palliative care' },
  { value: 'long-term-care', text: 'Long-term-care resident with acute pain' },
  { value: 'sud', text: 'Treatment of substance use disorder' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const DAY = 86400000;
function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

const EXEMPT = {
  NY: { chronic: 'chronic pain is not acute pain', cancer: 'pain treated as part of cancer care', hospice: 'pain treated as part of hospice or end-of-life care', palliative: 'pain treated as part of palliative care' },
  NJ: { chronic: 'the rule covers acute pain only', cancer: 'a patient in active treatment for cancer', hospice: 'a patient receiving hospice care', palliative: 'a patient receiving palliative care', 'long-term-care': 'a resident of a long-term-care facility', sud: 'medication for substance use disorder or opioid dependence' },
  TX: { chronic: 'chronic pain is not acute pain', cancer: 'pain treated as part of cancer care', hospice: 'pain treated as part of hospice or end-of-life care', palliative: 'pain treated as part of palliative care', sud: 'an opioid approved for treating substance addiction' },
};
const LIMIT = { NY: 7, NJ: 5, TX: 10 };
const SOURCE = { NY: 'N.Y. Public Health Law 3331(5)', NJ: 'N.J.A.C. 13:35-7.6', TX: 'Tex. Health & Safety Code 481.07636' };

export function acuteOpioidRxLimit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !LIMIT[o.state]) {
    return { valid: false, message: 'Choose New York, New Jersey, or Texas. California has no general adult day limit in statute, so it is not offered.' };
  }
  if (isBlank(o.category) || !CATEGORIES.some((c) => c.value === o.category)) return { valid: false, message: 'Choose what the opioid is for. The limits cover acute pain, and each state names its own exceptions.' };
  const days = Number(String(o.days ?? '').trim());
  if (isBlank(o.days) || !Number.isFinite(days) || days <= 0 || days > 365) return { valid: false, message: 'Enter the days supplied, from 1 to 365.' };
  if (isBlank(o.initial) || !['yes', 'no'].includes(o.initial)) return { valid: false, message: 'Say whether this is the initial prescription for this pain.' };

  const st = o.state;
  const limit = LIMIT[st];
  const why = EXEMPT[st][o.category];
  const base = { valid: true, state: st, limit, postureNote: scopeSentence(RX_LIMIT_VERIFIED), note: `${SOURCE[st]}.` };

  if (why) {
    return { ...base, verdict: 'exempt', abnormal: false, bandLabel: 'Outside the limit', band: `The ${limit}-day limit does not apply: ${why}.`, problems: [] };
  }

  const problems = [];
  if (st === 'NY') {
    if (o.initial === 'no') {
      return { ...base, verdict: 'not-initial', abnormal: false, bandLabel: 'Not an initial prescription', band: 'The 7-day limit is for the initial consultation or treatment for acute pain. At a later consultation for the same pain, any appropriate renewal, refill, or new prescription may be issued, within the general 30-day supply limit.', problems };
    }
    if (days > limit) problems.push(`${days} days is ${days - limit} over the 7-day limit on an initial prescription for acute pain.`);
  } else if (st === 'NJ') {
    if (o.initial === 'yes') {
      if (days <= limit && o.extendedRelease !== 'yes' && o.extendedRelease !== 'no') return { valid: false, message: 'Say whether the opioid is extended-release or long-acting. An initial New Jersey prescription for acute pain must be immediate-release.' };
      if (days > limit) problems.push(`${days} days is ${days - limit} over the 5-day limit on an initial prescription for acute pain.`);
      if (o.extendedRelease === 'yes') problems.push('An initial prescription for acute pain must be an immediate-release opioid, never extended-release or long-acting.');
    } else {
      if (isBlank(o.previous) || isBlank(o.today)) return { valid: false, message: 'For a subsequent prescription, enter the date of the initial prescription and today\'s date. It may be issued no less than four days after the initial one.' };
      const p = parseDate(o.previous);
      const t = parseDate(o.today);
      if (p === null || t === null) return { valid: false, message: 'Enter both dates as dates.' };
      const gap = Math.round((t - p) / DAY);
      if (gap < 0) return { valid: false, message: 'The initial prescription is dated after today. Check the dates.' };
      if (gap < 4) problems.push(`Only ${gap} day${gap === 1 ? '' : 's'} after the initial prescription; a subsequent one may be issued no less than four days after it.`);
      if (days > 30) problems.push(`${days} days is over the 30-day supply a subsequent prescription may carry.`);
      if (!problems.length) {
        return { ...base, verdict: 'within', abnormal: false, bandLabel: 'Subsequent prescription allowed', band: `A subsequent prescription ${gap} days after the initial one is allowed on the patient's request, after consultation, with the rationale documented, for no more than 30 days.`, problems };
      }
    }
  } else if (days <= limit && o.refills !== 'yes' && o.refills !== 'no') {
    return { valid: false, message: 'Say whether refills are ordered. Texas allows no refill on an opioid prescription for acute pain.' };
  } else if (days > limit || o.refills === 'yes') {
    if (days > limit) problems.push(`${days} days is ${days - limit} over the 10-day limit for acute pain.`);
    if (o.refills === 'yes') problems.push('No refill is allowed on an opioid prescription for acute pain.');
  }

  if (problems.length) {
    return { ...base, verdict: 'over', abnormal: true, bandLabel: 'Over the limit', band: problems.join(' '), problems };
  }
  const tail = st === 'TX' ? ' Texas applies this to every acute-pain opioid prescription, not only the first.' : '';
  return { ...base, verdict: 'within', abnormal: false, bandLabel: 'Within the limit', band: `${days} days is within the ${limit}-day limit for acute pain.${tail}`, problems };
}
