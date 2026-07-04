// spec-v243: ENT / sleep screening tools — the NOSE scale, the Reflux Finding
// Score, the No-Apnea OSA screen, and the sleep-efficiency index. Each id was
// verified absent by a fixed-string scan of the extracted app.js id/name lists AND
// the MCP adapter set first (spec-v85 §6.2). v243 runs no AI and makes no runtime
// network call.
//
// These score / screen / compute a value — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   nose-scale         - Nasal Obstruction Symptom Evaluation (0-100)
//   rfs-reflux-finding - Reflux Finding Score (0-26)
//   no-apnea-score     - No-Apnea OSA screen (0-9)
//   sleep-efficiency   - sleep-efficiency index (%)
//
// POINT SYSTEMS / FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- NOSE scale --------------------------------------------------------------
// Stewart MG, et al. Otolaryngol Head Neck Surg. 2004: 5 items (congestion,
// blockage, trouble breathing, trouble sleeping, exertional airflow) each 0-4;
// raw sum x 5 = 0-100. 0 none, 5-25 mild, 30-50 moderate, 55-75 severe, 80-100
// extreme obstruction. Cross-verified: resref; BackTable.
const NOSE_ITEMS = ['congestion', 'blockage', 'breathing', 'sleep', 'exertion'];
const NOSE_NOTE = 'NOSE scale (Stewart MG, et al. Otolaryngol Head Neck Surg. 2004): 5 items (nasal congestion, blockage, trouble breathing, trouble sleeping, exertional airflow) each 0-4; raw sum x 5 = 0-100. 0 none, 5-25 mild, 30-50 moderate, 55-75 severe, 80-100 extreme obstruction. A symptom score, not a diagnosis or treatment order.';
export function noseScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let raw = 0;
  for (const k of NOSE_ITEMS) raw += lvl(o[k], 4);
  const score = Math.round(num('NOSE', raw * 5, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (score >= 80) tier = 'extreme obstruction (80-100)';
  else if (score >= 55) tier = 'severe obstruction (55-75)';
  else if (score >= 30) tier = 'moderate obstruction (30-50)';
  else if (score >= 5) { tier = 'mild obstruction (5-25)'; abnormal = false; }
  else { tier = 'no obstruction (0)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `NOSE ${score}`, band: `NOSE score ${score} of 100 — ${tier}.`, detail: '5 items each 0-4, x 5.', note: NOSE_NOTE };
}

// --- Reflux Finding Score (RFS) ----------------------------------------------
// Belafsky PC, et al. Laryngoscope. 2001: subglottic edema (0/2), ventricular
// obliteration (0/2/4), erythema (0/2/4), vocal-fold edema (0-4), diffuse
// laryngeal edema (0-4), posterior commissure hypertrophy (0-4), granuloma (0/2),
// thick endolaryngeal mucus (0/2). Total 0-26; > 7 indicates LPR with ~95%
// certainty. Cross-verified: otoscape; drsanu.
const RFS_NOTE = 'Reflux Finding Score (Belafsky PC, et al. Laryngoscope. 2001): subglottic edema (0/2), ventricular obliteration (0/2/4), erythema (0/2/4), vocal-fold edema (0-4), diffuse laryngeal edema (0-4), posterior commissure hypertrophy (0-4), granuloma (0/2), thick endolaryngeal mucus (0/2). Total 0-26; > 7 indicates laryngopharyngeal reflux with ~95% certainty. A laryngoscopic score, not a diagnosis or treatment order.';
export function rfsRefluxFinding(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = lvl(o.subglottic, 2) + lvl(o.ventricular, 4) + lvl(o.erythema, 4) + lvl(o.vocalFoldEdema, 4)
    + lvl(o.diffuseEdema, 4) + lvl(o.posteriorHypertrophy, 4) + lvl(o.granuloma, 2) + lvl(o.mucus, 2);
  const score = Math.round(num('RFS', s, { min: 0, max: 26 }));
  const abnormal = score > 7;
  return { valid: true, score, abnormal, bandLabel: `RFS ${score}`, band: `Reflux Finding Score ${score} of 26 — ${abnormal ? 'LPR likely (> 7)' : 'LPR unlikely (<= 7)'}.`, detail: '8 laryngoscopic findings.', note: RFS_NOTE };
}

// --- No-Apnea OSA screen -----------------------------------------------------
// Duarte RLM, et al. 2018: neck circumference (< 37 cm = 0, 37-39.9 = 1, 40-42.9
// = 3, >= 43 = 6) + age (< 35 = 0, 35-44 = 1, 45-54 = 2, >= 55 = 3). Total 0-9;
// > 3 indicates high risk of OSAHS. Cross-verified: PMC6837961; Nature 2025.
const NOAPNEA_NOTE = 'No-Apnea OSA screen (Duarte RLM, et al. 2018): neck circumference (< 37 cm = 0, 37-39.9 = 1, 40-42.9 = 3, >= 43 = 6) + age (< 35 = 0, 35-44 = 1, 45-54 = 2, >= 55 = 3). Total 0-9; > 3 indicates high risk of obstructive sleep apnea-hypopnea. A screen, not a diagnosis or treatment order.';
function binNeck(n) { if (n < 37) return 0; if (n < 40) return 1; if (n < 43) return 3; return 6; }
function binAge(a) { if (a < 35) return 0; if (a < 45) return 1; if (a < 55) return 2; return 3; }
export function noApnea(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const neck = fin(o.neck, 20, 70);
  const age = fin(o.age, 0, 120);
  if (neck === null || age === null) return { valid: false, message: 'Enter neck circumference (cm) and age (years).' };
  const score = Math.round(num('No-Apnea', binNeck(neck) + binAge(age), { min: 0, max: 9 }));
  const abnormal = score > 3;
  return { valid: true, score, abnormal, bandLabel: `No-Apnea ${score}`, band: `No-Apnea score ${score} of 9 — ${abnormal ? 'high OSA risk (> 3)' : 'lower OSA risk (<= 3)'}.`, detail: `Neck ${binNeck(neck)}, age ${binAge(age)}.`, note: NOAPNEA_NOTE };
}

// --- Sleep-efficiency index --------------------------------------------------
// Sleep efficiency = total sleep time / time in bed x 100. >= 85% normal, 75-84%
// moderate, < 75% poor (insomnia); > 95% may signal sleep deprivation. Cross-
// verified: Wikipedia; sleep-medicine references.
const SE_NOTE = 'Sleep efficiency = total sleep time / time in bed x 100. >= 85% normal, 75-84% moderately reduced, < 75% poor (associated with insomnia); > 95% may signal sleep deprivation / short time in bed. A ratio, not a diagnosis or treatment order.';
export function sleepEfficiency(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tst = fin(o.tst, 0, 1440);
  const tib = fin(o.tib, 1, 1440);
  if (tst === null || tib === null) return { valid: false, message: 'Enter total sleep time and time in bed (same units).' };
  if (tst > tib) return { valid: false, message: 'Total sleep time cannot exceed time in bed.' };
  const score = r1(num('Sleep efficiency', tst / tib * 100, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (score >= 85) { tier = 'normal (>= 85%)'; abnormal = false; }
  else if (score >= 75) tier = 'moderately reduced (75-84%)';
  else tier = 'poor (< 75%)';
  return { valid: true, score, abnormal, bandLabel: `${score}%`, band: `Sleep efficiency ${score}% — ${tier}.`, detail: `TST ${tst} / TIB ${tib}.`, note: SE_NOTE };
}
