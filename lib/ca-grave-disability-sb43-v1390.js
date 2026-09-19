// spec-v1390: California "gravely disabled" after SB 43, Welfare and Institutions Code 5008(h).
//
// Source: WIC 5008(h) (leginfo text read 2026-09-18; SB 43 of 2023; last amended by
// SB 1238, Stats. 2024, ch. 644).
//   (h)(1) For 5150, 5200, 5225, 5250, and LPS conservatorship (Chapter 3, 5350), "gravely disabled"
//     means (A) a condition in which a person, as a result of a mental health disorder, a severe
//     substance use disorder, or a co-occurring mental health disorder and a severe substance use
//     disorder, is unable to provide for their basic personal needs for food, clothing, shelter,
//     personal safety, or necessary medical care; or (B) the Penal Code 1370 incompetence path.
//   (h)(2) For 5225, 5250, and conservatorship only (not 5150 or 5200), it also includes impairment
//     by chronic alcoholism with the same inability.
//   (h)(3) It does not include intellectual disability by reason of that disability alone.
//   (h)(4) A county could defer the SB 43 changes to January 1, 2026. That date has passed, so the
//     amended definition applies in every county.
//
// "Severe" is the DSM-5 severity specifier; the tile takes the clinician's classification and does
// not count DSM criteria. The (h)(1)(B) Penal Code path is not covered.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const GD_VERIFIED = '2026-09-18';
export const CAUSES = [
  { value: 'mh', text: 'Mental health disorder' },
  { value: 'sud-severe', text: 'Severe substance use disorder' },
  { value: 'both', text: 'Co-occurring mental health disorder and severe substance use disorder' },
  { value: 'sud-not-severe', text: 'Substance use disorder, mild or moderate' },
  { value: 'alcohol', text: 'Impairment by chronic alcoholism' },
  { value: 'id-alone', text: 'Intellectual disability alone' },
];
export const HOLDS = [
  { value: '5150', text: '72-hour hold (5150) or court-ordered evaluation (5200)' },
  { value: '5250', text: '14-day certification (5250) or a 5225 petition' },
  { value: 'conservatorship', text: 'LPS conservatorship (5350)' },
];
export const NEED_STATE = [
  { value: 'unable', text: 'Unable to provide' },
  { value: 'able', text: 'Able to provide' },
];
export const CRITERION = [
  { value: 'met', text: 'Met' },
  { value: 'not-met', text: 'Not met' },
];
export const NEEDS = [
  ['food', 'food'],
  ['clothing', 'clothing'],
  ['shelter', 'shelter'],
  ['personalSafety', 'personal safety'],
  ['medicalCare', 'necessary medical care'],
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function caGraveDisabilitySb43(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.cause) || !CAUSES.some((c) => c.value === o.cause)) return { valid: false, message: 'Choose the cause. SB 43 added severe substance use disorder alone; mild or moderate does not qualify.' };
  const hold = HOLDS.some((h) => h.value === o.hold) ? o.hold : null;

  const history = 'SB 43 (2023) added severe substance use disorder, personal safety, and necessary medical care. Counties could defer it to January 1, 2026; that date has passed, so it applies statewide.';
  const base = { valid: true, postureNote: scopeSentence(GD_VERIFIED), historyNote: history, severeNote: '"Severe" is the DSM-5 severity specifier, as the clinician classifies it; this tool does not count DSM criteria. The Penal Code 1370 incompetence path (5008(h)(1)(B)) is not covered.' };

  if (o.cause === 'sud-not-severe' || o.cause === 'id-alone') {
    return {
      ...base, verdict: 'does-not-meet', abnormal: false, bandLabel: 'Does not meet 5008(h)',
      band: o.cause === 'id-alone'
        ? 'Does not meet 5008(h): intellectual disability by reason of that disability alone is excluded (5008(h)(3)).'
        : 'Does not meet 5008(h): only a SEVERE substance use disorder qualifies, alone or with a mental health disorder.',
      needs: [],
    };
  }
  if (o.cause === 'alcohol') {
    if (!hold) return { valid: false, message: 'Choose the hold or proceeding. Chronic alcoholism counts for 5250 and conservatorship, not for a 5150 hold.' };
    if (hold === '5150') {
      return {
        ...base, verdict: 'does-not-meet', abnormal: false, bandLabel: 'Does not meet 5008(h) for a 5150',
        band: 'Does not meet 5008(h) for a 5150 hold or 5200 evaluation: chronic alcoholism counts only for 5225, 5250, and conservatorship (5008(h)(2)). A severe substance use disorder is its own ground under (h)(1).',
        needs: [],
      };
    }
  }

  const needs = NEEDS.map(([k, label]) => ({ label, state: o[k] === 'unable' || o[k] === 'able' ? o[k] : null }));
  const unable = needs.filter((n) => n.state === 'unable').map((n) => n.label);
  const unassessed = needs.filter((n) => !n.state).map((n) => n.label);
  const result = o.result === 'met' || o.result === 'not-met' ? o.result : null;
  const lines = needs.map((n) => `${n.label}: ${n.state === 'unable' ? 'unable to provide' : n.state === 'able' ? 'able to provide' : 'not assessed'}`);
  lines.push(`the inability results from the ${o.cause === 'alcohol' ? 'chronic alcoholism' : 'disorder'}: ${result === 'met' ? 'met' : result === 'not-met' ? 'not met' : 'not assessed'}`);

  if (result === 'not-met') {
    return { ...base, verdict: 'does-not-meet', abnormal: false, bandLabel: 'Does not meet 5008(h)', band: 'Does not meet 5008(h): the inability is recorded as not resulting from the qualifying condition.', needs: lines };
  }
  if (unable.length && result === 'met') {
    return {
      ...base, verdict: 'meets', abnormal: true, bandLabel: 'Meets 5008(h)',
      band: `Meets the 5008(h)${o.cause === 'alcohol' ? '(2)' : '(1)(A)'} definition as documented: unable to provide for ${unable.join(', ')}.`,
      needs: lines,
    };
  }
  if (!unable.length && !unassessed.length) {
    return { ...base, verdict: 'does-not-meet', abnormal: false, bandLabel: 'Does not meet 5008(h)', band: 'Does not meet 5008(h): able to provide for all five basic personal needs as documented.', needs: lines };
  }
  const missing = [];
  if (!unable.length) missing.push(`whether the person can provide for ${unassessed.join(', ')}`);
  if (!result) missing.push('whether the inability results from the qualifying condition');
  return { ...base, verdict: null, abnormal: false, bandLabel: 'Incomplete', band: `Not decided. Still needed: ${missing.join('; ')}.`, needs: lines };
}
