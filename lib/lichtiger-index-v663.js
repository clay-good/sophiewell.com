// spec-v663: Lichtiger Index (Modified Truelove-Witts Severity Index) for ulcerative
// colitis disease activity.
//
// A companion to the built IBD instruments (truelove-witts severity classification,
// mayo-uc, cdai-crohns, harvey-bradshaw). Distinct from Truelove & Witts: this is an
// 8-item activity SUM (0-21), not the 6-criterion mild/moderate/severe classification.
// Source:
//   Lichtiger S, Present DH, Kornbluth A, et al. Cyclosporine in severe ulcerative
//   colitis refractory to steroid therapy. N Engl J Med. 1994;330(26):1841-1845.
//   PMID 8196726.
//
// Eight items summed to 0-21:
//   diarrhea (daily stools) 0-4; nocturnal diarrhea 0-1; visible blood in stool 0-3;
//   fecal incontinence 0-1; abdominal pain/cramping 0-3; general wellbeing 0-5;
//   abdominal tenderness 0-3; need for antidiarrheal drugs 0-1.
//
// Posture: the original paper defined response qualitatively; later trials operationalized
// a cutoff. The common convention is a score < 10 (on two consecutive days) = clinical
// response, >= 10 = active disease, with remission often defined as <= 3. The tile reports
// the total and treats the cutoffs as advisory. Pure: no DOM, no clock, no network.

const LEVELS = {
  diarrhea: { 0: '0-2 stools/day', 1: '3-4', 2: '5-6', 3: '7-9', 4: '>= 10' },
  nocturnal: { 0: 'no nocturnal diarrhea', 1: 'nocturnal diarrhea' },
  blood: { 0: 'no visible blood', 1: 'blood in < 50% of movements', 2: 'blood in >= 50%', 3: 'blood in 100%' },
  incontinence: { 0: 'no incontinence', 1: 'fecal incontinence' },
  pain: { 0: 'no abdominal pain', 1: 'mild pain', 2: 'moderate pain', 3: 'severe pain' },
  wellbeing: { 0: 'perfect wellbeing', 1: 'very good', 2: 'good', 3: 'average', 4: 'poor', 5: 'terrible' },
  tenderness: { 0: 'no tenderness', 1: 'mild, localized', 2: 'mild-moderate, diffuse', 3: 'severe or rebound' },
  antidiarrheal: { 0: 'no antidiarrheal needed', 1: 'antidiarrheal drugs needed' },
};

export const LICHTIGER_ITEMS = [
  { key: 'diarrhea', label: 'Diarrhea (daily stools)', max: 4 },
  { key: 'nocturnal', label: 'Nocturnal diarrhea', max: 1 },
  { key: 'blood', label: 'Visible blood in stool', max: 3 },
  { key: 'incontinence', label: 'Fecal incontinence', max: 1 },
  { key: 'pain', label: 'Abdominal pain / cramping', max: 3 },
  { key: 'wellbeing', label: 'General wellbeing', max: 5 },
  { key: 'tenderness', label: 'Abdominal tenderness', max: 3 },
  { key: 'antidiarrheal', label: 'Need for antidiarrheal drugs', max: 1 },
];

export const LICHTIGER_MIN = 0;
export const LICHTIGER_MAX = 21;

export const LICHTIGER_NOTE = 'Lichtiger Index (Modified Truelove-Witts Severity Index) for ulcerative colitis activity (Lichtiger S, et al., N Engl J Med 1994;330(26):1841-1845). Eight items are summed to 0 to 21: daily stools (0-4), nocturnal diarrhea (0-1), visible blood in stool (0-3), fecal incontinence (0-1), abdominal pain (0-3), general wellbeing (0-5), abdominal tenderness (0-3), and need for antidiarrheal drugs (0-1). The original paper defined response qualitatively; later trials commonly use a score under 10 on two consecutive days as clinical response and 10 or more as active disease, with remission often defined as 3 or less. These cutoffs vary across sources, so the tile reports the total and treats the thresholds as advisory. This estimates disease activity and supports the clinical assessment, read with the full picture and the team.';

export function lichtigerIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const bad = [];
  const parts = [];
  let total = 0;
  for (const it of LICHTIGER_ITEMS) {
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
  const active = total >= 10;
  const remission = total <= 3;
  return {
    valid: true,
    total,
    min: LICHTIGER_MIN,
    max: LICHTIGER_MAX,
    active,
    remission,
    abnormal: active,
    bandLabel: `Lichtiger ${total} of ${LICHTIGER_MAX}${active ? ' — active (>= 10)' : remission ? ' — remission (<= 3)' : ' — response range (< 10)'}`,
    thresholdNote: 'Advisory cutoffs (later trials, not the 1994 paper): < 10 = clinical response, >= 10 = active, <= 3 = remission.',
    detail: parts.join('; ') + '.',
    note: LICHTIGER_NOTE,
  };
}
