// spec-v167 (the closing feature spec of the spec-v162 Cross-Discipline
// Completion program): six deterministic single-formula instruments, each
// filling a named one-tile gap in a different subspecialty (ventilation, fetal
// Doppler, vascular, GI, audiology, IBD endoscopy). None duplicates a live tile;
// v167 runs no AI and makes no runtime network call.
//
//   meanAirwayPressure   - mean airway pressure from PIP/PEEP/Ti/Te
//   cerebroplacentalRatio - CPR = MCA-PI / UA-PI (fetal redistribution)
//   toeBrachialIndex     - TBI = toe / brachial systolic pressure
//   stoolOsmoticGap      - 290 − 2·(stool Na + K)
//   pureToneAverage      - 3-/4-frequency pure-tone average + severity band
//   rutgeerts            - post-op Crohn's endoscopic recurrence grade i0–i4
//
// Per the spec-v100 §2 doctrine (including the §2 classification-tile
// clarification) the five computes are guarded arithmetic and rutgeerts is a
// deterministic input->grade mapping. Citations live inline in lib/meta.js; the
// renderers in views/group-v167.js render the spec-v50 §3 posture note and defer
// the decision to the clinician (spec-v11 §5.3).
//
// SOURCE-GOVERNANCE (formulas / thresholds cross-verified, spec-v97):
//   - meanAirwayPressure (Marini JJ, Crit Care Med 1992;20(11):1604-1616):
//     Pₘₐw = [(PIP·Ti) + (PEEP·Te)]/(Ti + Te), the square-wave approximation;
//     guards (Ti + Te).
//   - cerebroplacentalRatio (Gramellini D, et al, Obstet Gynecol 1992;79(3):
//     416-420): CPR = MCA-PI / UA-PI; < 1 indicates cerebral redistribution /
//     at-risk; guards UA-PI.
//   - toeBrachialIndex (Aboyans V, et al, Circulation 2012;126(24):2890-2909):
//     TBI = toe systolic / brachial systolic; < 0.70 is abnormal (PAD); the test
//     of choice when the ABI is non-compressible (> 1.40); guards brachial.
//   - stoolOsmoticGap (Eherer AJ, Fordtran JS, Gastroenterology 1992;103(2):
//     545-551): gap = 290 − 2·(stool Na + stool K); > 100 osmotic, < 50
//     secretory, 50–100 indeterminate; fixed 290 mOsm/kg assumption.
//   - pureToneAverage (four-frequency PTA, standard audiometric average):
//     3FA = mean(500, 1000, 2000 Hz), 4FA = mean(500, 1000, 2000, 4000 Hz);
//     severity (dB HL): normal ≤ 25, mild 26–40, moderate 41–55, moderately
//     severe 56–70, severe 71–90, profound > 90.
//   - rutgeerts (Rutgeerts P, et al, Gastroenterology 1990;99(4):956-963): i0 no
//     lesions; i1 ≤ 5 aphthous lesions; i2 > 5 aphthous lesions with normal
//     mucosa between / skip areas / lesions confined to the anastomosis; i3
//     diffuse aphthous ileitis with diffusely inflamed mucosa; i4 diffuse
//     inflammation with large ulcers, nodules, and/or stenosis. ≥ i2 predicts
//     clinical recurrence.

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
// Finite value within [lo, hi] allowing zero/negative (dB HL, stool electrolytes).
function bounded(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function pick(v, map) {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(map, v) ? v : '';
}

// --- 2.1 Mean airway pressure -----------------------------------------------
const MAW_NOTE = 'Mean airway pressure, square-wave approximation (Marini JJ, Crit Care Med 1992;20(11):1604-1616). Pₘₐw = [(PIP·Ti) + (PEEP·Te)] / (Ti + Te), with PIP and PEEP in cmH₂O and the inspiratory/expiratory times Ti/Te in seconds. A simplified estimate; the true pressure–time integral depends on the inspiratory waveform. Mean airway pressure is a determinant of oxygenation and of the oxygenation index.';

export function meanAirwayPressure(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pip = pos(o.pip, 120);
  const peep = o.peep === '' || o.peep === null || o.peep === undefined ? null : bounded(o.peep, 0, 60);
  const ti = pos(o.ti, 30);
  const te = pos(o.te, 60);
  const missing = [];
  if (pip === null) missing.push('peak inspiratory pressure PIP (cmH₂O)');
  if (peep === null) missing.push('PEEP (cmH₂O)');
  if (ti === null) missing.push('inspiratory time Ti (s)');
  if (te === null) missing.push('expiratory time Te (s)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const maw = r1(num('mean airway pressure', (pip * ti + peep * te) / (ti + te), { min: 0, max: 120 }));
  const ratio = r1(ti / te);
  return {
    valid: true,
    maw,
    ieRatio: ratio,
    bandLabel: 'Mean airway pressure',
    band: `Mean airway pressure ${maw} cmH₂O (PIP ${pip}, PEEP ${peep}, I:E ≈ 1:${r1(te / ti)}).`,
    detail: 'Square-wave approximation; a determinant of mean alveolar pressure and oxygenation (feeds the oxygenation index).',
    note: MAW_NOTE,
  };
}

// --- 2.2 Cerebroplacental ratio ---------------------------------------------
const CPR_NOTE = 'Cerebroplacental ratio (Gramellini D, et al, Obstet Gynecol 1992;79(3):416-420). CPR = middle-cerebral-artery pulsatility index (MCA-PI) / umbilical-artery pulsatility index (UA-PI). A CPR below 1 (or below the gestational-age centile) indicates cerebral redistribution ("brain-sparing") and is associated with adverse perinatal outcome. Interpret against gestational-age reference ranges; the < 1 cutoff is a common screening threshold.';

export function cerebroplacentalRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mca = pos(o.mca, 10);
  const ua = pos(o.ua, 10);
  const missing = [];
  if (mca === null) missing.push('MCA pulsatility index');
  if (ua === null) missing.push('umbilical-artery pulsatility index');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const cpr = r2(num('CPR', mca / ua, { min: 0, max: 100 }));
  const abnormal = cpr < 1;
  return {
    valid: true,
    cpr,
    abnormal,
    bandLabel: abnormal ? 'Abnormal (redistribution)' : 'Normal',
    band: `CPR ${cpr} — ${abnormal ? 'below 1: cerebral redistribution / at-risk' : 'at or above 1'}.`,
    detail: 'Compare against the gestational-age reference range; a CPR below 1 (or below the GA centile) suggests brain-sparing and warrants closer surveillance.',
    note: CPR_NOTE,
  };
}

// --- 2.3 Toe-brachial index -------------------------------------------------
const TBI_NOTE = 'Toe-brachial index (Aboyans V, et al, Circulation 2012;126(24):2890-2909). TBI = toe systolic pressure / higher brachial systolic pressure. A TBI below 0.70 is abnormal and supports peripheral arterial disease. The TBI is the test of choice when the ankle-brachial index is non-compressible (ABI > 1.40), as the digital arteries are usually spared from medial calcification.';

export function toeBrachialIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const toe = pos(o.toe, 400);
  const brachial = pos(o.brachial, 400);
  const missing = [];
  if (toe === null) missing.push('toe systolic pressure (mmHg)');
  if (brachial === null) missing.push('brachial systolic pressure (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const tbi = r2(num('TBI', toe / brachial, { min: 0, max: 10 }));
  const abnormal = tbi < 0.70;
  return {
    valid: true,
    tbi,
    abnormal,
    bandLabel: abnormal ? 'Abnormal (PAD)' : 'Normal',
    band: `TBI ${tbi} — ${abnormal ? 'below 0.70: abnormal, supports peripheral arterial disease' : 'at or above 0.70'}.`,
    detail: 'Use when the ABI is non-compressible (> 1.40). The 0.70 threshold supports PAD; correlate with symptoms and other vascular testing.',
    note: TBI_NOTE,
  };
}

// --- 2.4 Stool osmotic gap --------------------------------------------------
const SOG_NOTE = 'Stool osmotic gap (Eherer AJ, Fordtran JS, Gastroenterology 1992;103(2):545-551). Gap = 290 − 2·(stool Na + stool K), using a fixed fecal osmolality of 290 mOsm/kg. A gap > 100 mOsm/kg indicates osmotic diarrhea, < 50 secretory diarrhea, and 50–100 is indeterminate. Stool Na and K are entered in mEq/L (mmol/L).';

export function stoolOsmoticGap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const na = bounded(o.na, 0, 200);
  const k = bounded(o.k, 0, 200);
  const missing = [];
  if (na === null) missing.push('stool sodium (mEq/L)');
  if (k === null) missing.push('stool potassium (mEq/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const gap = r1(num('osmotic gap', 290 - 2 * (na + k), { min: -200, max: 290 }));
  let band; let abnormal;
  if (gap > 100) { band = 'osmotic diarrhea (gap > 100)'; abnormal = true; }
  else if (gap < 50) { band = 'secretory diarrhea (gap < 50)'; abnormal = true; }
  else { band = 'indeterminate (gap 50–100)'; abnormal = false; }
  return {
    valid: true,
    gap,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `Stool osmotic gap ${gap} mOsm/kg — ${band}.`,
    detail: 'Fixed 290 mOsm/kg assumption; > 100 osmotic, < 50 secretory, 50–100 indeterminate. Correlate with the clinical picture and stool studies.',
    note: SOG_NOTE,
  };
}

// --- 2.5 Pure tone average --------------------------------------------------
const PTA_NOTE = 'Pure-tone average (standard audiometric average). The 3-frequency PTA is the mean of the air-conduction thresholds at 500, 1000, and 2000 Hz; the 4-frequency PTA adds 4000 Hz. Severity (dB HL): normal ≤ 25, mild 26–40, moderate 41–55, moderately severe 56–70, severe 71–90, profound > 90. Thresholds are entered in dB HL.';

function ptaBand(db) {
  if (db <= 25) return { label: 'normal', abnormal: false };
  if (db <= 40) return { label: 'mild', abnormal: true };
  if (db <= 55) return { label: 'moderate', abnormal: true };
  if (db <= 70) return { label: 'moderately severe', abnormal: true };
  if (db <= 90) return { label: 'severe', abnormal: true };
  return { label: 'profound', abnormal: true };
}

export function pureToneAverage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const t500 = bounded(o.t500, -10, 130);
  const t1000 = bounded(o.t1000, -10, 130);
  const t2000 = bounded(o.t2000, -10, 130);
  const t4000 = o.t4000 === '' || o.t4000 === null || o.t4000 === undefined ? null : bounded(o.t4000, -10, 130);
  const missing = [];
  if (t500 === null) missing.push('500 Hz');
  if (t1000 === null) missing.push('1000 Hz');
  if (t2000 === null) missing.push('2000 Hz');
  if (missing.length) return { valid: false, message: `Enter the air-conduction thresholds (${missing.join(', ')}).` };
  const pta3 = r1(num('3FA', (t500 + t1000 + t2000) / 3, { min: -10, max: 130 }));
  const pta4 = t4000 !== null ? r1(num('4FA', (t500 + t1000 + t2000 + t4000) / 4, { min: -10, max: 130 })) : null;
  const headline = pta4 !== null ? pta4 : pta3;
  const b = ptaBand(headline);
  return {
    valid: true,
    pta3,
    pta4,
    abnormal: b.abnormal,
    bandLabel: b.label.replace(/^./, (m) => m.toUpperCase()),
    band: `${pta4 !== null ? `4-frequency PTA ${pta4}` : `3-frequency PTA ${pta3}`} dB HL — ${b.label} hearing.`,
    detail: `3FA ${pta3} dB HL${pta4 !== null ? `; 4FA ${pta4} dB HL` : ' (enter 4000 Hz for the 4-frequency average)'}. Severity: normal ≤25, mild 26–40, moderate 41–55, moderately severe 56–70, severe 71–90, profound >90.`,
    note: PTA_NOTE,
  };
}

// --- 2.6 Rutgeerts score ----------------------------------------------------
const RUTGEERTS_NOTE = 'Rutgeerts score (Rutgeerts P, et al, Gastroenterology 1990;99(4):956-963). Endoscopic grading of post-operative Crohn’s recurrence in the neoterminal ileum: i0 no lesions; i1 ≤ 5 aphthous lesions; i2 > 5 aphthous lesions with normal mucosa between, skip areas of larger lesions, or lesions confined to the ileocolonic anastomosis; i3 diffuse aphthous ileitis with diffusely inflamed mucosa; i4 diffuse inflammation with large ulcers, nodules, and/or stenosis. A grade ≥ i2 predicts clinical recurrence.';

const RUTGEERTS_FINDING = {
  i0: { grade: 'i0', label: 'No lesions', recurrence: false },
  i1: { grade: 'i1', label: '≤ 5 aphthous lesions', recurrence: false },
  i2: { grade: 'i2', label: '> 5 aphthous lesions (normal mucosa between), skip areas, or lesions confined to the anastomosis', recurrence: true },
  i3: { grade: 'i3', label: 'Diffuse aphthous ileitis with diffusely inflamed mucosa', recurrence: true },
  i4: { grade: 'i4', label: 'Diffuse inflammation with large ulcers, nodules, and/or stenosis', recurrence: true },
};

export function rutgeerts(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const finding = pick(o.finding, RUTGEERTS_FINDING);
  if (!finding) return { valid: false, message: 'Choose the neoterminal-ileum endoscopic finding.' };
  const def = RUTGEERTS_FINDING[finding];
  return {
    valid: true,
    grade: def.grade,
    recurrence: def.recurrence,
    abnormal: def.recurrence,
    bandLabel: `Rutgeerts ${def.grade}`,
    band: `Rutgeerts ${def.grade} — ${def.recurrence ? 'predicts clinical recurrence (≥ i2)' : 'low risk of recurrence'}.`,
    detail: `${def.label}. A grade ≥ i2 predicts clinical recurrence; i0–i1 is low risk.`,
    note: RUTGEERTS_NOTE,
  };
}
