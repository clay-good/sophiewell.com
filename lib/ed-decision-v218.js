// spec-v218: emergency-department, trauma & infection decision instruments — a
// geriatric-syncope score, an adult head-CT rule, two "need for echocardiography"
// bacteremia scores, a prosthetic-joint-infection definition, and two appendicitis
// scores. Every id was verified absent by a direct scan of app.js first (spec-v85
// §6.2). None duplicates a live tile; v218 runs no AI and makes no runtime network
// call. These stratify / classify — they are NOT an imaging, admission, or surgery
// order (spec-v11 §5.3).
//
//   faint      - FAINT score (serious cardiac outcome in older ED syncope)
//   nexusHead  - NEXUS Head CT decision instrument (adult)
//   handoc     - HANDOC score (echo need in non-beta-hemolytic strep bacteremia)
//   denova     - DENOVA score (echo need in E. faecalis bacteremia)
//   icmPji     - 2018 ICM definition of periprosthetic joint infection
//   airScore   - Appendicitis Inflammatory Response (AIR) score
//   adultAppendicitis - Adult Appendicitis Score (AAS)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function sel(v, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- FAINT score -------------------------------------------------------------
// Probst MA, et al, Ann Emerg Med 2020;75(2):147-158: one point each for history
// of heart Failure, history of cardiac Arrhythmia, abnormal Initial ECG, and
// elevated hs-Troponin; two points for elevated NT-proBNP (0-6). A score of 0 is
// low risk (~0.9% 30-day serious cardiac outcome); >= 1 is not low risk (~6.9%).
const FAINT_NOTE = 'FAINT score (Probst MA, et al, Ann Emerg Med 2020;75(2):147-158): for ED patients >= 60 years with syncope/near-syncope — one point each for history of heart Failure, history of cardiac Arrhythmia, abnormal Initial ECG, elevated hs-Troponin; two points for elevated NT-proBNP (0-6). Score 0 = low risk (~0.9% 30-day serious cardiac outcome); >= 1 = not low risk (~6.9%). A risk score, not an admission order.';
export function faint(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.heartFailure)) { s += 1; p.push('heart failure history'); }
  if (bool(o.arrhythmia)) { s += 1; p.push('cardiac arrhythmia history'); }
  if (bool(o.abnormalEcg)) { s += 1; p.push('abnormal initial ECG'); }
  if (bool(o.ntprobnp)) { s += 2; p.push('elevated NT-proBNP (+2)'); }
  if (bool(o.troponin)) { s += 1; p.push('elevated hs-troponin'); }
  const score = Math.round(num('FAINT', s, { min: 0, max: 6 }));
  const abnormal = score >= 1;
  return { valid: true, score, abnormal, bandLabel: `FAINT ${score}`, band: `FAINT score ${score} — ${abnormal ? 'not low risk (~6.9% 30-day serious cardiac outcome)' : 'low risk (~0.9%)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: FAINT_NOTE };
}

// --- NEXUS Head CT (adult) ---------------------------------------------------
// Mower WR, et al, J Trauma 2005;59(4):954-959 + Mower WR, et al, PLoS Med
// 2017;14(7):e1002313: head CT is indicated if ANY of 8 findings is present —
// significant skull fracture, scalp hematoma, neurologic deficit, altered
// alertness, abnormal behavior, coagulopathy, persistent vomiting, age >= 65. If
// all are absent, CT can be safely deferred.
const NEXUS_HEAD_NOTE = 'NEXUS Head CT decision instrument (Mower WR, et al, J Trauma 2005;59(4):954-959): head CT is indicated if ANY of - significant skull fracture, scalp hematoma, neurologic deficit, altered level of alertness, abnormal behavior, coagulopathy, persistent vomiting, age >= 65. If all eight are absent the patient is low risk and CT can be deferred (100% sensitivity for neurosurgical injury). A decision rule, not a CT order.';
export function nexusHead(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const items = [
    ['skullFracture', 'significant skull fracture'],
    ['scalpHematoma', 'scalp hematoma'],
    ['neuroDeficit', 'neurologic deficit'],
    ['alteredAlertness', 'altered level of alertness'],
    ['abnormalBehavior', 'abnormal behavior'],
    ['coagulopathy', 'coagulopathy'],
    ['vomiting', 'persistent vomiting'],
    ['ageOver65', 'age >= 65'],
  ];
  const present = items.filter(([k]) => bool(o[k])).map(([, l]) => l);
  const ctIndicated = present.length > 0;
  return { valid: true, ctIndicated, abnormal: ctIndicated, bandLabel: ctIndicated ? 'CT indicated' : 'Low risk — CT deferrable', band: ctIndicated ? `Head CT indicated — ${present.length} criterion/criteria present: ${present.join('; ')}.` : 'Low risk — all eight criteria absent; CT can be deferred.', detail: ctIndicated ? '' : 'No NEXUS Head criteria present.', note: NEXUS_HEAD_NOTE };
}

// --- HANDOC score ------------------------------------------------------------
// Sunnerhagen T, et al, Clin Infect Dis 2018;66(5):693-698 + Sunnerhagen T, et
// al, Infect Dis (Lond) 2020;52(1):54-57: Heart murmur/valve disease +1;
// Aetiology (S. mutans/bovis/sanguinis group +1, S. anginosus group -1, other
// 0); Number of positive cultures >= 2 +1; Duration >= 7 days +1; Only one
// species +1; Community-acquired +1 (-1 to 6). Score >= 3 -> echocardiography.
const HANDOC_NOTE = 'HANDOC score (Sunnerhagen T, et al, Clin Infect Dis 2018;66(5):693-698): in non-beta-hemolytic streptococcal bacteremia - Heart murmur/valve disease +1; Aetiology (S. mutans/bovis/sanguinis +1, S. anginosus -1, other 0); Number of positive cultures >= 2 +1; Duration >= 7 days +1; Only one species +1; Community-acquired +1 (-1 to 6). Score >= 3 recommends echocardiography. A decision rule, not an imaging order.';
export function handoc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.murmur)) { s += 1; p.push('murmur/valve disease'); }
  const aet = sel(o.aetiology, 2); // 0 other, 1 high-risk species, 2 = S.anginosus (-1)
  if (aet === 1) { s += 1; p.push('high-risk species (+1)'); }
  else if (aet === 2) { s -= 1; p.push('S. anginosus (-1)'); }
  if (bool(o.cultures2)) { s += 1; p.push('>= 2 positive cultures'); }
  if (bool(o.duration7)) { s += 1; p.push('duration >= 7 days'); }
  if (bool(o.oneSpecies)) { s += 1; p.push('only one species'); }
  if (bool(o.community)) { s += 1; p.push('community-acquired'); }
  const score = Math.round(num('HANDOC', s, { min: -1, max: 6 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `HANDOC ${score}`, band: `HANDOC score ${score} — ${abnormal ? 'echocardiography recommended (>= 3)' : 'echocardiography can be omitted (<= 2)'}.`, detail: p.length ? `Factors: ${p.join('; ')}.` : 'No factors.', note: HANDOC_NOTE };
}

// --- DENOVA score ------------------------------------------------------------
// Berge A, et al, Infection 2019;47(1):45-50: one point each for Duration of
// symptoms >= 7 days, Embolization, Number of positive cultures >= 2, Origin
// unknown, Valve disease, and Auscultated murmur (0-6). Score >= 3 -> perform
// echocardiography in Enterococcus faecalis bacteremia.
const DENOVA_NOTE = 'DENOVA score (Berge A, et al, Infection 2019;47(1):45-50): in Enterococcus faecalis bacteremia - one point each for Duration of symptoms >= 7 days, Embolization, Number of positive cultures >= 2, Origin unknown, Valve disease, and Auscultated murmur (0-6). Score >= 3 recommends echocardiography. A decision rule, not an imaging order.';
export function denova(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.duration7)) { s += 1; p.push('duration >= 7 days'); }
  if (bool(o.embolization)) { s += 1; p.push('embolization'); }
  if (bool(o.cultures2)) { s += 1; p.push('>= 2 positive cultures'); }
  if (bool(o.originUnknown)) { s += 1; p.push('origin unknown'); }
  if (bool(o.valveDisease)) { s += 1; p.push('valve disease'); }
  if (bool(o.murmur)) { s += 1; p.push('murmur'); }
  const score = Math.round(num('DENOVA', s, { min: 0, max: 6 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `DENOVA ${score}`, band: `DENOVA score ${score} — ${abnormal ? 'echocardiography recommended (>= 3)' : 'echocardiography can be omitted (<= 2)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: DENOVA_NOTE };
}

// --- 2018 ICM definition of PJI ----------------------------------------------
// Parvizi J, et al, J Arthroplasty 2018;33(5):1309-1314 + Renz N, et al (PMID
// 36047011): a major criterion (sinus tract or >= 2 same-pathogen cultures) is
// infected. Otherwise sum the preoperative minor criteria - elevated CRP or
// D-dimer +2; elevated ESR +1; elevated synovial WBC or positive leukocyte
// esterase +3; positive alpha-defensin +3; elevated synovial PMN% +2; elevated
// synovial CRP +1. Preop: >= 6 infected, 2-5 inconclusive, 0-1 not infected.
const ICM_NOTE = '2018 ICM definition of periprosthetic joint infection (Parvizi J, et al, J Arthroplasty 2018;33(5):1309-1314): a major criterion (sinus tract, or >= 2 cultures with the same organism) means infected. Otherwise sum preoperative minor criteria - serum CRP > 10 or D-dimer > 860 +2; ESR > 30 +1; synovial WBC > 3000 or positive leukocyte esterase +3; positive alpha-defensin +3; synovial PMN% > 80 +2; synovial CRP > 6.9 +1. Preoperative bands: >= 6 infected, 2-5 inconclusive, 0-1 not infected. A definition, not a treatment order.';
export function icmPji(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (bool(o.major)) {
    return { valid: true, score: null, infected: true, abnormal: true, bandLabel: 'Infected (major criterion)', band: 'Infected — a major criterion is met (sinus tract, or >= 2 cultures with the same organism).', detail: 'Major criterion present.', note: ICM_NOTE };
  }
  let s = 0; const p = [];
  if (bool(o.crpDdimer)) { s += 2; p.push('CRP > 10 or D-dimer > 860 (+2)'); }
  if (bool(o.esr)) { s += 1; p.push('ESR > 30'); }
  if (bool(o.synovialWbcLe)) { s += 3; p.push('synovial WBC > 3000 or +LE (+3)'); }
  if (bool(o.alphaDefensin)) { s += 3; p.push('alpha-defensin (+3)'); }
  if (bool(o.pmn)) { s += 2; p.push('synovial PMN% > 80 (+2)'); }
  if (bool(o.synovialCrp)) { s += 1; p.push('synovial CRP > 6.9'); }
  const score = Math.round(num('ICM-PJI', s, { min: 0, max: 12 }));
  let tier; let abnormal = true;
  if (score >= 6) tier = 'infected (>= 6)';
  else if (score >= 2) tier = 'inconclusive (2-5)';
  else { tier = 'not infected (0-1)'; abnormal = false; }
  return { valid: true, score, infected: score >= 6, abnormal, bandLabel: `ICM-PJI ${score}`, band: `2018 ICM PJI minor-criteria score ${score} — ${tier}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No minor criteria.', note: ICM_NOTE };
}

// --- Appendicitis Inflammatory Response (AIR) --------------------------------
// Andersson M, Andersson RE, World J Surg 2008;32(8):1843-1849 + Andersson M, et
// al, World J Surg 2021: Vomiting +1; RIF pain +1; rebound/defense (light 1,
// medium 2, strong 3); temperature >= 38.5 +1; WBC 10-14.9 +1 / >= 15 +2; PMN
// 70-84% +1 / >= 85% +2; CRP 10-49 +1 / >= 50 +2 (0-12). Low 0-4, indeterminate
// 5-8, high 9-12.
const AIR_NOTE = 'Appendicitis Inflammatory Response (AIR) score (Andersson M, Andersson RE, World J Surg 2008;32(8):1843-1849): Vomiting +1; right-iliac-fossa pain +1; rebound/defense (light 1, medium 2, strong 3); temperature >= 38.5 C +1; WBC 10-14.9 +1 / >= 15 +2; neutrophils 70-84% +1 / >= 85% +2; CRP 10-49 +1 / >= 50 +2 (0-12). Low 0-4, indeterminate 5-8, high 9-12. A risk score, not a surgery order.';
export function airScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wbc = pos(o.wbc, 1000);
  const pmn = pos(o.pmnPct, 100);
  const crp = pos(o.crp, 100000);
  if (wbc === null || pmn === null || crp === null) {
    return { valid: false, message: 'Enter WBC (x10^9/L), neutrophil percentage, and CRP (mg/L), and mark vomiting / RIF pain / rebound grade / temperature >= 38.5.' };
  }
  let s = 0; const p = [];
  if (bool(o.vomiting)) { s += 1; p.push('vomiting'); }
  if (bool(o.rifPain)) { s += 1; p.push('RIF pain'); }
  const rebound = sel(o.rebound, 3); s += rebound; if (rebound) p.push(`rebound (+${rebound})`);
  if (bool(o.fever)) { s += 1; p.push('temp >= 38.5'); }
  const wbcPts = wbc >= 15 ? 2 : wbc >= 10 ? 1 : 0; s += wbcPts; if (wbcPts) p.push(`WBC ${wbc} (+${wbcPts})`);
  const pmnPts = pmn >= 85 ? 2 : pmn >= 70 ? 1 : 0; s += pmnPts; if (pmnPts) p.push(`PMN ${pmn}% (+${pmnPts})`);
  const crpPts = crp >= 50 ? 2 : crp >= 10 ? 1 : 0; s += crpPts; if (crpPts) p.push(`CRP ${crp} (+${crpPts})`);
  const score = Math.round(num('AIR', s, { min: 0, max: 12 }));
  let tier; let abnormal = true;
  if (score >= 9) tier = 'high probability of appendicitis (9-12)';
  else if (score >= 5) tier = 'indeterminate (5-8)';
  else { tier = 'low probability (0-4)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `AIR ${score}`, band: `AIR score ${score} — ${tier}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: AIR_NOTE };
}

// --- Adult Appendicitis Score (AAS) ------------------------------------------
// Sammalkorpi HE, et al, BMC Gastroenterol 2014;14:114 + Scand J Surg 2017: Pain
// in RLQ +2; pain relocation +2; RLQ tenderness (men or age >= 50: 3, women 16-49:
// 1); guarding (mild 2, moderate/severe 4); WBC (7.2-10.9 1, 10.9-14.0 2, >= 14
// 3); neutrophils (62-75% 2, 75-83% 3, >= 83% 4); CRP by symptom duration (< 24 h:
// 4-11 2, 11-25 3, 25-83 5, >= 83 1; >= 24 h: 12-53 2, 53-152 2, >= 152 1). Low
// 0-10, intermediate 11-15, high >= 16.
const AAS_NOTE = 'Adult Appendicitis Score (Sammalkorpi HE, et al, BMC Gastroenterol 2014;14:114): pain in RLQ +2; pain relocation +2; RLQ tenderness (men or age >= 50 = 3, women 16-49 = 1); guarding (mild 2, moderate/severe 4); WBC band; neutrophil% band; CRP band that depends on symptom duration (< or >= 24 h). Low 0-10, intermediate 11-15, high >= 16. A risk score, not a surgery order.';
export function adultAppendicitis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const wbc = pos(o.wbc, 1000);
  const pmn = pos(o.pmnPct, 100);
  const crp = pos(o.crp, 100000);
  if (age === null || wbc === null || pmn === null || crp === null) {
    return { valid: false, message: 'Enter age, WBC (x10^9/L), neutrophil %, and CRP (mg/L); select sex, guarding, and symptom duration; and mark RLQ pain / relocation / tenderness.' };
  }
  const female = bool(o.female);
  let s = 0; const p = [];
  if (bool(o.rlqPain)) { s += 2; p.push('RLQ pain (+2)'); }
  if (bool(o.relocation)) { s += 2; p.push('pain relocation (+2)'); }
  if (bool(o.tenderness)) { const t = (!female || age >= 50) ? 3 : 1; s += t; p.push(`RLQ tenderness (+${t})`); }
  const guard = sel(o.guarding, 4); s += guard; if (guard) p.push(`guarding (+${guard})`);
  const wbcPts = wbc >= 14 ? 3 : wbc >= 10.9 ? 2 : wbc >= 7.2 ? 1 : 0; s += wbcPts; if (wbcPts) p.push(`WBC ${wbc} (+${wbcPts})`);
  const pmnPts = pmn >= 83 ? 4 : pmn >= 75 ? 3 : pmn >= 62 ? 2 : 0; s += pmnPts; if (pmnPts) p.push(`PMN ${pmn}% (+${pmnPts})`);
  const over24 = bool(o.durationOver24h);
  let crpPts;
  if (over24) crpPts = crp >= 152 ? 1 : crp >= 12 ? 2 : 0;
  else crpPts = crp >= 83 ? 1 : crp >= 25 ? 5 : crp >= 11 ? 3 : crp >= 4 ? 2 : 0;
  s += crpPts; if (crpPts) p.push(`CRP ${crp} (+${crpPts})`);
  const score = Math.round(num('AAS', s, { min: 0, max: 25 }));
  let tier; let abnormal = true;
  if (score >= 16) tier = 'high probability of appendicitis (>= 16)';
  else if (score >= 11) tier = 'intermediate (11-15)';
  else { tier = 'low probability (0-10)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `AAS ${score}`, band: `Adult Appendicitis Score ${score} — ${tier}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: AAS_NOTE };
}
