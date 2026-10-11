// spec-v1634 tool 7: RIOSORD, the Risk Index for Overdose or Serious Opioid-induced Respiratory
// Depression, in its two published versions.
//
// Sources, re-read on October 11, 2026 from the full text (NCBI and Europe PMC):
//   Veterans (VHA): Zedler B, Xie L, Wang L, et al. Pain Med 2015;16(8):1566-1579 (PMC4744747),
//   Table 3 (points; maximum 115) and Table 4 (ten risk classes).
//   Commercially insured: Zedler BK, Saunders WB, Joyce AR, Vick CC, Murrelle EL. Pain Med
//   2018;19(1):68-78 (PMC5939826), Table 3 (points; maximum 146) and Table 4 (seven risk classes).
// Both papers are CC BY-NC-ND. The point values and classes are facts; the item wording here is
// paraphrased, not copied.
//
// Rules carried from the tables' footnotes:
//   - The ER/LA points are counted once, however many ER/LA products are taken.
//   - Methadone is long-acting, so it scores its own points and the ER/LA points (both versions).
//     In the commercial version a fentanyl ER product does the same; short-acting fentanyl scores
//     the ingredient only. The reader says whether an ER/LA product is taken; methadone sets it.
//   - Conditions count when a visit in the past 6 months involved them, not only as the main reason.
// The printed probability is the model's average within a case-control sample (cases are
// over-represented), not an incidence in a population.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const VERSIONS = [
  { value: 'vha', text: 'Veterans (VHA), 2015' },
  { value: 'commercial', text: 'Commercially insured, 2018' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
// points: [vha, commercial]; null means the item is not in that version.
export const ITEMS = [
  { arg: 'substanceUse', dom: 'substance-use', points: [15, 25], text: 'Opioid dependence (veterans) or substance use disorder (commercial) visit', said: ['A visit in the past 6 months involving opioid dependence', 'A visit in the past 6 months involving a substance use disorder'] },
  { arg: 'hepatitis', dom: 'hepatitis', points: [9, null], text: 'Chronic hepatitis or cirrhosis (veterans version)' },
  { arg: 'bipolar', dom: 'bipolar', points: [7, 10], text: 'Bipolar disorder or schizophrenia' },
  { arg: 'pulmonary', dom: 'pulmonary', points: [5, 5], text: 'Chronic pulmonary disease' },
  { arg: 'kidney', dom: 'kidney', points: [5, 8], text: 'Kidney disease with clinically significant renal impairment' },
  { arg: 'trauma', dom: 'trauma', points: [4, null], text: 'An active traumatic injury, excluding burns (veterans version)' },
  { arg: 'sleepApnea', dom: 'sleep-apnea', points: [3, null], text: 'Sleep apnea (veterans version)' },
  { arg: 'stroke', dom: 'stroke', points: [null, 9], text: 'Stroke or other cerebrovascular disease (commercial version)' },
  { arg: 'heartFailure', dom: 'heart-failure', points: [null, 7], text: 'Heart failure (commercial version)' },
  { arg: 'pancreatic', dom: 'pancreatic', points: [null, 7], text: 'Nonmalignant pancreatic disease (commercial version)' },
  { arg: 'headache', dom: 'headache', points: [null, 5], text: 'Recurrent headache (commercial version)' },
  { arg: 'erla', dom: 'erla', points: [9, 5], text: 'An extended-release or long-acting opioid product (counted once)' },
  { arg: 'methadone', dom: 'methadone', points: [9, 10], text: 'Methadone' },
  { arg: 'oxycodone', dom: 'oxycodone', points: [3, null], text: 'Oxycodone (veterans version)' },
  { arg: 'fentanyl', dom: 'fentanyl', points: [null, 13], text: 'Fentanyl (commercial version)' },
  { arg: 'morphine', dom: 'morphine', points: [null, 11], text: 'Morphine (commercial version)' },
  { arg: 'hydromorphone', dom: 'hydromorphone', points: [null, 7], text: 'Hydromorphone (commercial version)' },
  { arg: 'antidepressant', dom: 'antidepressant', points: [7, 8], text: 'A prescription antidepressant' },
  { arg: 'benzodiazepine', dom: 'benzodiazepine', points: [4, 9], text: 'A prescription benzodiazepine' },
  { arg: 'edVisit', dom: 'ed-visit', points: [11, null], text: 'One or more emergency department visits in the past 6 months (veterans version)' },
  { arg: 'hospitalized', dom: 'hospitalized', points: [8, null], text: 'Hospitalized for one or more days in the past 6 months (veterans version)' },
];
// [upper score of the class, average predicted probability in percent]
const CLASSES = {
  vha: [[24, 3], [32, 14], [37, 24], [42, 34], [46, 46], [49, 55], [54, 64], [59, 76], [66, 85], [Infinity, 94]],
  commercial: [[4, 1.9], [7, 4.8], [9, 6.8], [17, 15.1], [25, 29.8], [41, 55.1], [Infinity, 83.4]],
};
const MAX = { vha: 115, commercial: 146 };
const SAMPLE = { vha: '8,987 veterans, 817 of them cases', commercial: '36,166 commercially insured patients, 7,234 of them cases' };
const CITE = { vha: 'Zedler B, et al. Pain Med 2015;16:1566-1579, Tables 3 and 4.', commercial: 'Zedler BK, et al. Pain Med 2018;19:68-78, Tables 3 and 4.' };
const NOTE = 'The index was built for a health care professional to complete and is not a replacement for clinical judgment. A low score does not rule out an overdose, and the tool does not say what to prescribe.';

function mmePoints(version, mme) {
  if (version === 'commercial') return mme >= 100 ? 7 : 0;
  return mme >= 100 ? 16 : mme >= 50 ? 9 : mme >= 20 ? 5 : 0;
}

export function riosord(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const version = String(o.version ?? '').trim();
  if (version !== 'vha' && version !== 'commercial') return { valid: false, message: 'Choose the version: veterans (2015) or commercially insured (2018). The two have different items and points.' };
  const v = version === 'vha' ? 0 : 1;
  const mine = ITEMS.filter((it) => it.points[v] !== null);
  const answers = {};
  for (const it of mine) {
    const a = String(o[it.arg] ?? '').trim();
    if (a !== 'yes' && a !== 'no') return { valid: false, message: `Choose yes or no: ${(it.said ? it.said[v] : it.text.replace(/ \((veterans|commercial) version\)$/, '')).replace(/^./, (c) => c.toLowerCase())}. Every item of the version chosen is needed; an unanswered item is not counted as no.` };
    answers[it.arg] = a === 'yes';
  }
  const f = inputFault([['the maximum prescribed opioid dose', o.mme, 0, 5000, 'MME a day']]);
  if (f) return { valid: false, message: f };
  const mme = Number(o.mme);
  const notes = [];
  if (answers.methadone && !answers.erla) { answers.erla = true; notes.push('Methadone is long-acting, so the extended-release or long-acting points are counted as well, as the index instructs.'); }
  const scored = mine.filter((it) => answers[it.arg]).map((it) => ({ item: it.said ? it.said[v] : it.text.replace(/ \((veterans|commercial) version\)$/, '').replace(/^./, (c) => c.toUpperCase()), points: it.points[v] }));
  const mp = mmePoints(version, mme);
  if (mp) scored.push({ item: `Maximum prescribed dose ${mme.toLocaleString('en-US')} MME a day`, points: mp });
  const score = scored.reduce((a, s) => a + s.points, 0);
  const idx = CLASSES[version].findIndex(([upper]) => score <= upper);
  const [upper, pct] = CLASSES[version][idx];
  const lower = idx === 0 ? 0 : CLASSES[version][idx - 1][0] + 1;
  const range = upper === Infinity ? `${lower} or more` : `${lower} to ${upper}`;
  notes.unshift(scored.length ? `Points: ${scored.map((s) => `${s.item} (${s.points})`).join('; ')}.` : 'No item scored.');
  notes.push(`The ${pct}% is the model's average predicted probability for the class within the study sample (${SAMPLE[version]}). Cases are over-represented in such a sample, so it is not the incidence in a population.`);
  if (answers.fentanyl && !answers.erla) notes.push('A fentanyl patch or other extended-release fentanyl also scores the extended-release item; short-acting fentanyl scores the ingredient only.');
  notes.push(CITE[version]);
  return {
    valid: true, flag: `class-${idx + 1}`, abnormal: false, version, score, max: MAX[version], riskClass: idx + 1, classes: CLASSES[version].length, probabilityPercent: pct, contributors: scored,
    band: `RIOSORD ${score} of ${MAX[version]}: risk class ${idx + 1} of ${CLASSES[version].length} (${range} points), average predicted probability ${pct}% over 6 months in the study sample.`,
    bandLabel: `${score} points, class ${idx + 1}`,
    notes, note: NOTE,
  };
}
