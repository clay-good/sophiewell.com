// spec-v667: FGSI (Fournier's Gangrene Severity Index).
//
// A companion to the built critical-care severity scores (apache2, saps-ii). Source:
//   Laor E, Palmer LS, Tolia BM, Reid RE, Winter HI. Outcome prediction in patients with
//   Fournier's gangrene. J Urol. 1995;154(1):89-92. PMID 7776464.
//
// FGSI is the acute-physiology portion of APACHE II applied to 9 parameters, each scored
// 0-4 by deviation from normal in either direction, summed. It drops APACHE II's mean
// arterial pressure, oxygenation, and Glasgow Coma Scale, and uses serum bicarbonate
// (APACHE II's standard substitute for arterial pH). A total > 9 predicts high mortality.
//
// The eight shared parameter bands are reused verbatim from the repo's verified apache2
// (lib/scoring-v6.js); the ninth (serum bicarbonate) uses the standard APACHE II HCO3
// row. Creatinine points DOUBLE for acute renal failure (the APACHE II rule); this is
// exposed as an explicit toggle because some FGSI implementations omit it.
//
// Pure: no DOM, no clock, no network.

function apsStep(v, breaks) {
  // breaks: [lowInclusive, highInclusive, points] in descending point order.
  for (const [lo, hi, pts] of breaks) if (v >= lo && v <= hi) return pts;
  return 0;
}

// Bands verbatim from apache2 (lib/scoring-v6.js) for the eight shared variables; the
// bicarbonate row is the standard APACHE II HCO3 substitution for pH.
const BANDS = {
  temp: [[41, 99, 4], [39, 40.9, 3], [38.5, 38.9, 1], [36, 38.4, 0], [34, 35.9, 1], [32, 33.9, 2], [30, 31.9, 3], [0, 29.9, 4]],
  hr: [[180, 999, 4], [140, 179, 3], [110, 139, 2], [70, 109, 0], [55, 69, 2], [40, 54, 3], [0, 39, 4]],
  rr: [[50, 999, 4], [35, 49, 3], [25, 34, 1], [12, 24, 0], [10, 11, 1], [6, 9, 2], [0, 5, 4]],
  na: [[180, 999, 4], [160, 179, 3], [155, 159, 2], [150, 154, 1], [130, 149, 0], [120, 129, 2], [111, 119, 3], [0, 110, 4]],
  k: [[7, 99, 4], [6, 6.9, 3], [5.5, 5.9, 1], [3.5, 5.4, 0], [3, 3.4, 1], [2.5, 2.9, 2], [0, 2.4, 4]],
  creatinine: [[3.5, 99, 4], [2, 3.4, 3], [1.5, 1.9, 2], [0.6, 1.4, 0], [0, 0.59, 2]],
  hct: [[60, 999, 4], [50, 59.9, 2], [46, 49.9, 1], [30, 45.9, 0], [20, 29.9, 2], [0, 19.9, 4]],
  wbc: [[40, 999, 4], [20, 39.9, 2], [15, 19.9, 1], [3, 14.9, 0], [1, 2.9, 2], [0, 0.9, 4]],
  bicarbonate: [[52, 999, 4], [41, 51.9, 3], [32, 40.9, 1], [22, 31.9, 0], [18, 21.9, 2], [15, 17.9, 3], [0, 14.9, 4]],
};

export const FGSI_PARAMS = [
  { key: 'temp', label: 'Temperature (°C)' },
  { key: 'hr', label: 'Heart rate (beats/min)' },
  { key: 'rr', label: 'Respiratory rate (breaths/min)' },
  { key: 'na', label: 'Serum sodium (mmol/L)' },
  { key: 'k', label: 'Serum potassium (mmol/L)' },
  { key: 'creatinine', label: 'Serum creatinine (mg/dL)' },
  { key: 'hct', label: 'Hematocrit (%)' },
  { key: 'wbc', label: 'White blood cell count (x10^3/mm3)' },
  { key: 'bicarbonate', label: 'Serum bicarbonate (mmol/L)' },
];

export const FGSI_MIN = 0;
export const FGSI_MAX = 36;
export const FGSI_CUTOFF = 9;

export const FGSI_NOTE = 'FGSI (Fournier’s Gangrene Severity Index; Laor E, et al., J Urol 1995;154(1):89-92). It is the acute-physiology portion of APACHE II applied to nine parameters: temperature, heart rate, respiratory rate, serum sodium, potassium, creatinine, hematocrit, white blood cell count, and serum bicarbonate. Each is scored 0 to 4 by how far it deviates from normal in either direction, and the points are summed (nominal range 0 to 36). A total greater than 9 predicts high mortality (the original series found survivors averaged about 6.9 and non-survivors about 13.5). The creatinine points double in acute renal failure per the APACHE II rule, which raises the maximum to 40; this tile applies the doubling only when the acute-renal-failure option is set, because some published implementations omit it. This estimates severity from the values entered and supports the assessment, not an individual prognosis.';

export function fgsi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const bad = [];
  const vals = {};
  for (const p of FGSI_PARAMS) {
    const raw = o[p.key];
    if (raw === '' || raw === null || raw === undefined) { missing.push(p.key); continue; }
    const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
    if (!Number.isFinite(n)) { bad.push(`${p.key} = "${raw}"`); continue; }
    vals[p.key] = n;
  }
  if (missing.length) {
    return { valid: false, code: 'MISSING_INPUT', field: missing[0], message: `Enter all nine physiologic values. Still needed: ${missing.join(', ')}.` };
  }
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each value must be a number. Check: ${bad.join('; ')}.` };
  }

  const arf = o.acuteRenalFailure === true || ['true', 'yes', '1', 'on'].includes(String(o.acuteRenalFailure).trim().toLowerCase());
  const parts = [];
  let total = 0;
  for (const p of FGSI_PARAMS) {
    let pts = apsStep(vals[p.key], BANDS[p.key]);
    if (p.key === 'creatinine' && arf) pts *= 2;
    total += pts;
    parts.push(`${p.label}: ${pts}`);
  }

  const highMortality = total > FGSI_CUTOFF;
  return {
    valid: true,
    total,
    min: FGSI_MIN,
    max: arf ? 40 : FGSI_MAX,
    cutoff: FGSI_CUTOFF,
    acuteRenalFailure: arf,
    highMortality,
    abnormal: highMortality,
    bandLabel: `FGSI ${total}${arf ? '' : ' of 36'}${highMortality ? ' — high mortality risk (> 9)' : ''}`,
    detail: parts.join('; ') + '.',
    note: FGSI_NOTE,
  };
}
