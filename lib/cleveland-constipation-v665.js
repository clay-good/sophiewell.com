// spec-v665: Cleveland Clinic Constipation Score (Wexner / Agachan constipation scoring
// system).
//
// DISTINCT from the built Wexner FECAL INCONTINENCE score (id: wexner; Jorge & Wexner
// 1993) -- same author group, different instrument (constipation vs incontinence).
// Source:
//   Agachan F, Chen T, Pfeifer J, Reissman P, Wexner SD. A constipation scoring system
//   to simplify evaluation and management of constipated patients. Dis Colon Rectum.
//   1996;39(6):681-685. PMID 8646957.
//
// Eight items summed to 0-30. Seven items are scored 0-4; the Assistance item is scored
// 0-2, which is why the maximum is 30 (7 x 4 + 2), not 32.
//
// Posture: the derivation cohort all scored > 15, so > 15 is the commonly used cutoff for
// constipation; secondary sources vary (some write >= 15), so the tile reports the total
// and treats the cutoff as advisory. Pure: no DOM, no clock, no network.

const LEVELS = {
  frequency: { 0: '1-2 times per 1-2 days', 1: '2 times per week', 2: 'once per week', 3: 'less than once per week', 4: 'less than once per month' },
  difficulty: { 0: 'never', 1: 'rarely', 2: 'sometimes', 3: 'usually', 4: 'always' },
  completeness: { 0: 'never', 1: 'rarely', 2: 'sometimes', 3: 'usually', 4: 'always' },
  pain: { 0: 'never', 1: 'rarely', 2: 'sometimes', 3: 'usually', 4: 'always' },
  time: { 0: '< 5 min', 1: '5-10 min', 2: '10-20 min', 3: '20-30 min', 4: '> 30 min' },
  assistance: { 0: 'without assistance', 1: 'stimulant laxatives', 2: 'digital assistance or enema' },
  failure: { 0: 'never', 1: 'rarely', 2: 'sometimes', 3: 'usually', 4: 'always' },
  history: { 0: '0 years', 1: '1-5 years', 2: '5-10 years', 3: '10-20 years', 4: '> 20 years' },
};

export const CLEVELAND_ITEMS = [
  { key: 'frequency', label: 'Frequency of bowel movements', max: 4 },
  { key: 'difficulty', label: 'Difficulty (painful evacuation effort)', max: 4 },
  { key: 'completeness', label: 'Feeling of incomplete evacuation', max: 4 },
  { key: 'pain', label: 'Abdominal pain', max: 4 },
  { key: 'time', label: 'Time in lavatory per attempt', max: 4 },
  { key: 'assistance', label: 'Type of assistance', max: 2 },
  { key: 'failure', label: 'Unsuccessful attempts per 24 h', max: 4 },
  { key: 'history', label: 'Duration of constipation', max: 4 },
];

export const CLEVELAND_MIN = 0;
export const CLEVELAND_MAX = 30;
export const CLEVELAND_CUTOFF = 15; // constipation if strictly greater than 15

export const CLEVELAND_NOTE = 'Cleveland Clinic Constipation Score (Wexner constipation score; Agachan F, Chen T, Pfeifer J, Reissman P, Wexner SD, Dis Colon Rectum 1996;39(6):681-685). Eight items are summed to 0 to 30: frequency of bowel movements, difficulty (painful evacuation effort), feeling of incomplete evacuation, abdominal pain, time in the lavatory per attempt, type of assistance, unsuccessful attempts per 24 hours, and duration of constipation. Seven items score 0 to 4 and the assistance item scores 0 to 2 (so the maximum is 30, not 32). Higher scores mean more severe constipation; the derivation cohort all scored more than 15, so a score above 15 is commonly used as the cutoff for constipation, though secondary sources vary and the tile treats it as advisory. This is distinct from the Wexner fecal incontinence score. It estimates constipation severity and supports the assessment, read with the full picture.';

export function clevelandConstipation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const bad = [];
  const parts = [];
  let total = 0;
  for (const it of CLEVELAND_ITEMS) {
    const raw = o[it.key];
    if (raw === '' || raw === null || raw === undefined) { missing.push(it.key); continue; }
    const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
    if (!Number.isInteger(n) || n < 0 || n > it.max) { bad.push(`${it.key} = "${raw}" (0-${it.max})`); continue; }
    total += n;
    parts.push(`${it.label}: ${LEVELS[it.key][n]} (${n})`);
  }
  if (missing.length) {
    return { valid: false, code: 'MISSING_INPUT', field: missing[0], message: `Score all eight items. Still needed: ${missing.join(', ')}.` };
  }
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Check: ${bad.join('; ')}.` };
  }
  const constipated = total > CLEVELAND_CUTOFF;
  return {
    valid: true,
    total,
    min: CLEVELAND_MIN,
    max: CLEVELAND_MAX,
    cutoff: CLEVELAND_CUTOFF,
    constipated,
    abnormal: constipated,
    bandLabel: `Cleveland constipation ${total} of ${CLEVELAND_MAX}${constipated ? ' — above the > 15 cutoff' : ''}`,
    thresholdNote: 'A score above 15 is the commonly cited cutoff for constipation (the derivation cohort all scored > 15); secondary sources vary, so it is advisory.',
    detail: parts.join('; ') + '.',
    note: CLEVELAND_NOTE,
  };
}
