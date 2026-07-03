// spec-v224: neurology screening, disability & epilepsy-outcome instruments — the
// ID Migraine screener, the Overall Neuropathy Limitations Scale, the END-IT
// status-epilepticus outcome score, Engel and ILAE epilepsy-surgery outcome
// classes, the Salzburg NCSE criteria, and the Dizziness Handicap Inventory.
// Every id was verified absent by a direct scan of app.js first (spec-v85 §6.2).
// None duplicates a live tile; v224 runs no AI and makes no runtime network call.
// These screen / classify / score — they are NOT a treatment order (spec-v11
// §5.3).
//
//   idMigraine  - ID Migraine screener
//   onls        - Overall Neuropathy Limitations Scale
//   endIt       - END-IT score (convulsive status epilepticus outcome)
//   engel       - Engel epilepsy-surgery outcome class
//   ilaeOutcome - ILAE epilepsy-surgery outcome class
//   salzburg    - Salzburg consensus criteria for NCSE
//   dhi         - Dizziness Handicap Inventory
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function selN(v, lo, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return 0;
  return n;
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- ID Migraine -------------------------------------------------------------
// Lipton RB, et al, Neurology 2003;61(3):375-382 + Cousins G, et al, Headache
// 2011: three yes/no items over the past 3 months - Nausea, Photophobia, and
// headache-related Disability. >= 2 positive is a positive screen for migraine.
const IDMIG_NOTE = 'ID Migraine screener (Lipton RB, et al, Neurology 2003;61(3):375-382): three yes/no items over the past 3 months - nausea, photophobia (light bothers you much more with headaches), and disability (headaches limited activity for >= 1 day). >= 2 of 3 positive is a positive screen for migraine (PPV ~93%). A screening tool, not a diagnosis.';
export function idMigraine(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.nausea)) { s += 1; p.push('nausea'); }
  if (bool(o.photophobia)) { s += 1; p.push('photophobia'); }
  if (bool(o.disability)) { s += 1; p.push('disability'); }
  const score = Math.round(num('ID Migraine', s, { min: 0, max: 3 }));
  const abnormal = score >= 2;
  return { valid: true, score, abnormal, bandLabel: `ID Migraine ${score}/3`, band: `ID Migraine ${score}/3 — ${abnormal ? 'positive screen for migraine (>= 2)' : 'negative screen (< 2)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No items.', note: IDMIG_NOTE };
}

// --- ONLS --------------------------------------------------------------------
// Graham RC, Hughes RAC, J Neurol Neurosurg Psychiatry 2006;77(8):973-976: arm
// scale 0-5 plus leg scale 0-7, total 0-12. Higher scores indicate greater
// neuropathy-related functional limitation.
const ONLS_NOTE = 'Overall Neuropathy Limitations Scale (Graham RC, Hughes RAC, J Neurol Neurosurg Psychiatry 2006;77(8):973-976): arm scale (0-5) plus leg scale (0-7), total 0-12. Higher scores indicate greater neuropathy-related functional limitation. A disability measure, not a treatment order.';
export function onls(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const arm = selN(o.arm, 0, 5);
  const leg = selN(o.leg, 0, 7);
  const score = Math.round(num('ONLS', arm + leg, { min: 0, max: 12 }));
  return { valid: true, score, abnormal: score > 0, bandLabel: `ONLS ${score}`, band: `ONLS ${score} / 12 — arm ${arm} + leg ${leg}; higher scores indicate greater functional limitation.`, detail: `arm ${arm} + leg ${leg} = ${score}.`, note: ONLS_NOTE };
}

// --- END-IT ------------------------------------------------------------------
// Gao Q, et al, Crit Care 2016;20:46: Encephalitis 1, Nonconvulsive SE 1,
// Diazepam resistance 1, Imaging (unilateral lesions 1, bilateral / diffuse edema
// 2), Tracheal intubation 1 (0-6). A score >= 3 predicts an unfavorable functional
// outcome (mRS 3-6 at discharge).
const ENDIT_NOTE = 'END-IT score (Gao Q, et al, Crit Care 2016;20:46): Encephalitis 1, Nonconvulsive SE 1, Diazepam resistance 1, Imaging (unilateral lesions 1, bilateral / diffuse cerebral edema 2), and Tracheal intubation 1 (0-6). A score >= 3 predicts an unfavorable functional outcome after convulsive status epilepticus. A prognostic score, not a treatment order.';
export function endIt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.encephalitis)) { s += 1; p.push('encephalitis'); }
  if (bool(o.ncse)) { s += 1; p.push('nonconvulsive SE'); }
  if (bool(o.diazepamResistance)) { s += 1; p.push('diazepam resistance'); }
  const img = selN(o.imaging, 0, 2); s += img; if (img) p.push(`imaging (+${img})`);
  if (bool(o.intubation)) { s += 1; p.push('tracheal intubation'); }
  const score = Math.round(num('END-IT', s, { min: 0, max: 6 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `END-IT ${score}`, band: `END-IT score ${score} — ${abnormal ? 'unfavorable outcome likely (>= 3)' : 'favorable outcome more likely (< 3)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: ENDIT_NOTE };
}

// --- Engel epilepsy-surgery outcome ------------------------------------------
// Engel J Jr, 1993 (Surgical Treatment of the Epilepsies, 2nd ed) + Wieser HG, et
// al, Epilepsia 2001;42(2):282-286: Class I free of disabling seizures; Class II
// rare disabling seizures; Class III worthwhile improvement; Class IV no
// worthwhile improvement.
const ENGEL_NOTE = 'Engel epilepsy-surgery outcome classification (Engel J Jr, 1993): Class I free of disabling seizures; Class II rare disabling seizures ("almost seizure-free"); Class III worthwhile improvement; Class IV no worthwhile improvement. A postoperative outcome classification, not a treatment order.';
export function engel(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const c = selN(o.outcome, 1, 4);
  if (!c) return { valid: false, message: 'Select the postoperative seizure outcome (free of disabling seizures / rare disabling / worthwhile improvement / no worthwhile improvement).' };
  const map = { 1: ['I', 'free of disabling seizures'], 2: ['II', 'rare disabling seizures'], 3: ['III', 'worthwhile improvement'], 4: ['IV', 'no worthwhile improvement'] };
  const [cls, desc] = map[c];
  return { valid: true, engelClass: cls, abnormal: c >= 3, bandLabel: `Engel ${cls}`, band: `Engel class ${cls} — ${desc}.`, detail: `Class ${cls}.`, note: ENGEL_NOTE };
}

// --- ILAE epilepsy-surgery outcome -------------------------------------------
// Wieser HG, et al, Epilepsia 2001;42(2):282-286: Class 1 completely seizure-free,
// no auras; 2 only auras; 3 1-3 seizure days/year; 4 4 seizure days/year to 50%
// reduction of baseline; 5 < 50% reduction to 100% increase; 6 > 100% increase of
// baseline seizure days.
const ILAE_NOTE = 'ILAE epilepsy-surgery outcome classification (Wieser HG, et al, Epilepsia 2001;42(2):282-286): Class 1 completely seizure-free, no auras; 2 only auras; 3 1-3 seizure days/year; 4 4/year to 50% reduction of baseline; 5 < 50% reduction to 100% increase; 6 > 100% increase of baseline seizure days. A postoperative outcome classification, not a treatment order.';
export function ilaeOutcome(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const days = pos(o.seizureDays, 100000);
  const baseline = pos(o.baselineDays, 100000);
  if (days === null || baseline === null || baseline <= 0) {
    return { valid: false, message: 'Enter current seizure days/year and baseline (preoperative) seizure days/year (> 0), and mark seizure-free / auras-only.' };
  }
  const seizureFree = bool(o.seizureFree);
  const aurasOnly = bool(o.aurasOnly);
  let cls;
  if (seizureFree && !aurasOnly) cls = 1;
  else if (aurasOnly && days === 0) cls = 2;
  else if (days <= 3) cls = 3;
  else if (days <= baseline * 0.5) cls = 4;
  else if (days <= baseline * 2) cls = 5;
  else cls = 6;
  return { valid: true, ilaeClass: cls, abnormal: cls >= 3, bandLabel: `ILAE class ${cls}`, band: `ILAE outcome class ${cls} — ${cls === 1 ? 'completely seizure-free' : cls === 2 ? 'auras only' : `${days} seizure days/year vs baseline ${baseline}`}.`, detail: `class ${cls}.`, note: ILAE_NOTE };
}

// --- Salzburg NCSE criteria --------------------------------------------------
// Leitinger M, et al, Epilepsy Behav 2015;49:158-163 + Leitinger M, et al, Lancet
// Neurol 2016;15(10):1054-1062 (patients without pre-existing epileptic
// encephalopathy): epileptiform discharges (EDs) > 2.5/s -> definite NCSE; EDs <=
// 2.5/s or rhythmic delta/theta > 0.5/s -> definite only with >= 1 secondary
// criterion (typical evolution, subtle clinical ictal phenomena, or clinical AND
// EEG improvement after IV AED); EEG-only improvement -> possible NCSE.
const SALZBURG_NOTE = 'Salzburg consensus criteria for NCSE (Leitinger M, et al, Epilepsy Behav 2015;49:158-163): epileptiform discharges > 2.5/s = definite NCSE; discharges <= 2.5/s or rhythmic delta/theta > 0.5/s = definite only with >= 1 secondary criterion (typical spatiotemporal evolution, subtle clinical ictal phenomena, or clinical AND EEG improvement after IV antiepileptic); EEG-only improvement = possible NCSE. Applies to patients without a pre-existing epileptic encephalopathy. A diagnostic classification, not a treatment order.';
export function salzburg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pattern = selN(o.pattern, 0, 2); // 0 neither, 1 <=2.5/s or rhythmic delta-theta, 2 >2.5/s
  const secondary = bool(o.evolution) || bool(o.subtleIctal) || bool(o.clinicalEegImprovement);
  let verdict; let abnormal = true;
  if (pattern === 2) verdict = 'Definite NCSE (epileptiform discharges > 2.5/s)';
  else if (pattern === 1) {
    if (secondary) verdict = 'Definite NCSE (pattern plus a secondary criterion)';
    else if (bool(o.eegOnlyImprovement)) verdict = 'Possible NCSE (EEG-only improvement after IV antiepileptic)';
    else { verdict = 'Criteria for NCSE not fulfilled'; abnormal = false; }
  } else { verdict = 'Criteria for NCSE not fulfilled'; abnormal = false; }
  return { valid: true, verdict, abnormal, bandLabel: verdict.startsWith('Definite') ? 'Definite NCSE' : verdict.startsWith('Possible') ? 'Possible NCSE' : 'Not fulfilled', band: `Salzburg criteria: ${verdict}.`, detail: verdict, note: SALZBURG_NOTE };
}

// --- Dizziness Handicap Inventory --------------------------------------------
// Jacobson GP, Newman CW, Arch Otolaryngol Head Neck Surg 1990;116(4):424-427: 25
// items answered No (0), Sometimes (2), or Yes (4); total 0-100. 0-30 mild, 31-60
// moderate, 61-100 severe perceived handicap.
const DHI_NOTE = 'Dizziness Handicap Inventory (Jacobson GP, Newman CW, Arch Otolaryngol Head Neck Surg 1990;116(4):424-427): 25 items answered No (0), Sometimes (2), or Yes (4); total 0-100. 0-30 mild, 31-60 moderate, 61-100 severe perceived handicap. A patient-reported handicap measure, not a treatment order.';
export function dhi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const yes = pos(o.numberYes, 25);
  const sometimes = pos(o.numberSometimes, 25);
  if (yes === null || sometimes === null || yes + sometimes > 25) {
    return { valid: false, message: 'Enter the number of "Yes" and "Sometimes" answers (each 0-25; the two together no more than 25).' };
  }
  const score = Math.round(num('DHI', yes * 4 + sometimes * 2, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (score >= 61) tier = 'severe handicap (61-100)';
  else if (score >= 31) tier = 'moderate handicap (31-60)';
  else { tier = 'mild handicap (0-30)'; abnormal = score > 0; }
  return { valid: true, score, abnormal, bandLabel: `DHI ${score}`, band: `Dizziness Handicap Inventory ${score} / 100 — ${tier}.`, detail: `${Math.round(yes)} Yes x4 + ${Math.round(sometimes)} Sometimes x2 = ${score}.`, note: DHI_NOTE };
}
