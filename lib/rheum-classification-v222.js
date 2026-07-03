// spec-v222: rheumatology classification & activity instruments — the 2017
// EULAR/ACR myositis criteria, the 2012 PMR criteria, Bohan & Peter criteria, the
// 2013 systemic-sclerosis criteria, the modified Rodnan skin score, the 2016
// Sjogren criteria, and ESSPRI. Every id was verified absent by a direct scan of
// app.js first (spec-v85 §6.2). None duplicates a live tile; v222 runs no AI and
// makes no runtime network call. These classify / score activity — they are NOT a
// treatment order (spec-v11 §5.3).
//
//   iimEularAcr   - 2017 EULAR/ACR idiopathic inflammatory myopathy criteria
//   pmrEularAcr   - 2012 EULAR/ACR polymyalgia rheumatica criteria
//   bohanPeter    - Bohan & Peter criteria (PM/DM)
//   ssc2013       - 2013 ACR/EULAR systemic sclerosis criteria
//   mrss          - modified Rodnan skin score
//   sjogren2016   - 2016 ACR/EULAR Sjogren criteria
//   esspri        - EULAR Sjogren Syndrome Patient Reported Index
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

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

// --- 2017 EULAR/ACR IIM criteria (without-biopsy weights) --------------------
// Lundberg IE, et al, Arthritis Rheumatol 2017;69(12):2271-2282 (Table 2, without
// muscle-biopsy column): age of onset 18-<40 y 1.3 / >= 40 y 2.1; proximal
// upper-extremity weakness 0.7; proximal lower-extremity weakness 0.8; neck
// flexors weaker than extensors 1.9; leg proximal weaker than distal 0.9;
// heliotrope rash 3.1; Gottron papules 2.1; Gottron sign 3.3; dysphagia 0.7;
// anti-Jo-1 3.9; elevated CK/LDH/AST/ALT 1.3. Definite >= 7.5, probable >= 5.5,
// possible >= 5.3.
const IIM_NOTE = '2017 EULAR/ACR classification criteria for idiopathic inflammatory myopathies (Lundberg IE, et al, Arthritis Rheumatol 2017;69(12):2271-2282), without-biopsy weights. Aggregate score: age onset (18-<40 = 1.3, >= 40 = 2.1); proximal upper 0.7; proximal lower 0.8; neck flexors weaker than extensors 1.9; leg proximal weaker than distal 0.9; heliotrope 3.1; Gottron papules 2.1; Gottron sign 3.3; dysphagia 0.7; anti-Jo-1 3.9; elevated CK/LDH/AST/ALT 1.3. Definite >= 7.5, probable >= 5.5, possible >= 5.3. A classification, not a treatment order.';
export function iimEularAcr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  const age = selN(o.ageBand, 0, 2.1); s += age; // pass 0 / 1.3 / 2.1
  if (bool(o.proximalUpper)) s += 0.7;
  if (bool(o.proximalLower)) s += 0.8;
  if (bool(o.neckFlexors)) s += 1.9;
  if (bool(o.legProximal)) s += 0.9;
  if (bool(o.heliotrope)) s += 3.1;
  if (bool(o.gottronPapules)) s += 2.1;
  if (bool(o.gottronSign)) s += 3.3;
  if (bool(o.dysphagia)) s += 0.7;
  if (bool(o.antiJo1)) s += 3.9;
  if (bool(o.elevatedEnzymes)) s += 1.3;
  const score = r2(num('IIM', s, { min: 0, max: 20 }));
  let tier; let abnormal = true;
  if (score >= 7.5) tier = 'definite inflammatory myopathy (>= 7.5, ~90% probability)';
  else if (score >= 5.5) tier = 'probable (5.5-7.4, ~55%)';
  else if (score >= 5.3) tier = 'possible (5.3-5.4)';
  else { tier = 'below the classification threshold (< 5.3)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `IIM ${score}`, band: `2017 EULAR/ACR myositis score ${score} — ${tier}.`, detail: `weighted aggregate = ${score}.`, note: IIM_NOTE };
}

// --- 2012 EULAR/ACR PMR criteria ---------------------------------------------
// Dasgupta B, et al, Ann Rheum Dis 2012;71(4):484-492: entry criteria (age >= 50,
// bilateral shoulder aching, abnormal CRP and/or ESR) required, then score -
// morning stiffness > 45 min 2; hip pain or limited range 1; absence of RF and/or
// ACPA 2; absence of other joint involvement 1. Without ultrasound, >= 4 = PMR.
const PMR_NOTE = '2012 EULAR/ACR polymyalgia rheumatica criteria (Dasgupta B, et al, Ann Rheum Dis 2012;71(4):484-492): applied after the entry criteria (age >= 50, bilateral shoulder aching, abnormal CRP and/or ESR). Score: morning stiffness > 45 min 2; hip pain or limited range of motion 1; absence of RF and/or ACPA 2; absence of other joint involvement 1 (0-6 without ultrasound). >= 4 classifies as PMR. A classification, not a treatment order.';
export function pmrEularAcr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.stiffness)) { s += 2; p.push('morning stiffness > 45 min (+2)'); }
  if (bool(o.hip)) { s += 1; p.push('hip pain / limited range (+1)'); }
  if (bool(o.absentRfAcpa)) { s += 2; p.push('absence of RF/ACPA (+2)'); }
  if (bool(o.absentOtherJoints)) { s += 1; p.push('absence of other joint involvement (+1)'); }
  const score = Math.round(num('PMR', s, { min: 0, max: 6 }));
  const abnormal = score >= 4;
  return { valid: true, score, abnormal, bandLabel: `PMR ${score}`, band: `2012 PMR criteria score ${score} — ${abnormal ? 'classifies as polymyalgia rheumatica (>= 4)' : 'does not meet the PMR threshold (< 4)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No items.', note: PMR_NOTE };
}

// --- Bohan & Peter criteria --------------------------------------------------
// Bohan A, Peter JB, N Engl J Med 1975;292(7):344-347: five criteria - symmetric
// proximal weakness, elevated muscle enzymes, myopathic EMG, abnormal biopsy,
// dermatomyositis rash. Polymyositis (no rash): definite 4 of 1-4, probable 3,
// possible 2. Dermatomyositis (rash present): definite rash + 3, probable rash +
// 2, possible rash + 1.
const BOHAN_NOTE = 'Bohan & Peter criteria (Bohan A, Peter JB, N Engl J Med 1975;292(7):344-347): five criteria - symmetric proximal weakness, elevated muscle enzymes, myopathic EMG, abnormal muscle biopsy, and dermatomyositis rash. Without rash (polymyositis): definite = 4 of the first 4, probable = 3, possible = 2. With rash (dermatomyositis): definite = rash + 3, probable = rash + 2, possible = rash + 1. A classification, not a treatment order.';
export function bohanPeter(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let n = 0;
  if (bool(o.weakness)) n += 1;
  if (bool(o.enzymes)) n += 1;
  if (bool(o.emg)) n += 1;
  if (bool(o.biopsy)) n += 1;
  const rash = bool(o.rash);
  let verdict; let abnormal = true;
  if (rash) {
    if (n >= 3) verdict = 'definite dermatomyositis';
    else if (n >= 2) verdict = 'probable dermatomyositis';
    else if (n >= 1) verdict = 'possible dermatomyositis';
    else { verdict = 'rash alone — does not meet criteria'; abnormal = false; }
  } else if (n >= 4) verdict = 'definite polymyositis';
  else if (n >= 3) verdict = 'probable polymyositis';
  else if (n >= 2) verdict = 'possible polymyositis';
  else { verdict = 'does not meet criteria'; abnormal = false; }
  return { valid: true, count: n, rash, abnormal, bandLabel: verdict, band: `Bohan & Peter: ${verdict} (${n} of 4 core criteria${rash ? ' + rash' : ''}).`, detail: `${n} core criteria present.`, note: BOHAN_NOTE };
}

// --- 2013 ACR/EULAR systemic sclerosis criteria ------------------------------
// van den Hoogen F, et al, Arthritis Rheum 2013;65(11):2737-2747: sufficient
// criterion skin thickening proximal to MCP = 9; else sum the highest weight per
// category - skin fingers (puffy 2, sclerodactyly 4); fingertip lesions (ulcers
// 2, pitting scars 3); telangiectasia 2; abnormal nailfold capillaries 2; PAH
// and/or ILD 2; Raynaud 3; SSc autoantibodies 3. Total >= 9 = definite SSc.
const SSC_NOTE = '2013 ACR/EULAR systemic sclerosis criteria (van den Hoogen F, et al, Arthritis Rheum 2013;65(11):2737-2747): skin thickening proximal to the MCPs is sufficient (9). Otherwise sum the highest weight per category - skin of the fingers (puffy 2, sclerodactyly 4); fingertip lesions (ulcers 2, pitting scars 3); telangiectasia 2; abnormal nailfold capillaries 2; pulmonary arterial hypertension and/or ILD 2; Raynaud 3; SSc-related autoantibodies 3 (max 19). Total >= 9 classifies as systemic sclerosis. A classification, not a treatment order.';
export function ssc2013(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (bool(o.proximalMcp)) {
    return { valid: true, score: 9, abnormal: true, bandLabel: 'Definite SSc', band: 'Systemic sclerosis criteria met — skin thickening proximal to the MCPs is a sufficient criterion (9).', detail: 'Sufficient criterion present.', note: SSC_NOTE };
  }
  let s = 0;
  s += selN(o.skinFingers, 0, 4); // 0/2/4
  s += selN(o.fingertip, 0, 3); // 0/2/3
  if (bool(o.telangiectasia)) s += 2;
  if (bool(o.nailfold)) s += 2;
  if (bool(o.pahIld)) s += 2;
  if (bool(o.raynaud)) s += 3;
  if (bool(o.autoantibodies)) s += 3;
  const score = Math.round(num('SSc', s, { min: 0, max: 19 }));
  const abnormal = score >= 9;
  return { valid: true, score, abnormal, bandLabel: `SSc ${score}`, band: `2013 systemic sclerosis criteria score ${score} — ${abnormal ? 'classifies as systemic sclerosis (>= 9)' : 'does not meet the threshold (< 9)'}.`, detail: `weighted sum = ${score}.`, note: SSC_NOTE };
}

// --- Modified Rodnan skin score ----------------------------------------------
// Clements P, et al, J Rheumatol 1995;22(7):1281-1285: skin thickness graded 0-3
// at 17 body sites; total 0-51.
const MRSS_SITES = ['fingersR', 'fingersL', 'handsR', 'handsL', 'forearmsR', 'forearmsL', 'upperArmsR', 'upperArmsL', 'face', 'chest', 'abdomen', 'thighsR', 'thighsL', 'legsR', 'legsL', 'feetR', 'feetL'];
const MRSS_NOTE = 'Modified Rodnan skin score (Clements P, et al, J Rheumatol 1995;22(7):1281-1285): skin thickness graded 0 (normal) to 3 (severe) by palpation at 17 body sites (fingers, hands, forearms, upper arms, face, chest, abdomen, thighs, legs, feet); total 0-51. Higher scores indicate more extensive skin involvement in systemic sclerosis. A severity measure, not a treatment order.';
export function mrss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const site of MRSS_SITES) s += selN(o[site], 0, 3);
  const score = Math.round(num('mRSS', s, { min: 0, max: 51 }));
  return { valid: true, score, abnormal: score > 0, bandLabel: `mRSS ${score}`, band: `Modified Rodnan skin score ${score} / 51 — higher scores indicate more extensive skin involvement.`, detail: `sum across 17 sites = ${score}.`, note: MRSS_NOTE };
}

// --- 2016 ACR/EULAR Sjogren criteria -----------------------------------------
// Shiboski CH, et al, Arthritis Rheumatol 2017;69(1):35-45: labial-gland focus
// score >= 1 = 3; anti-SSA/Ro = 3; ocular staining score >= 5 = 1; Schirmer <= 5
// mm/5 min = 1; unstimulated whole-saliva flow <= 0.1 mL/min = 1. >= 4 classifies
// as primary Sjogren (after entry criteria and exclusions).
const SJOGREN_NOTE = '2016 ACR/EULAR Sjogren criteria (Shiboski CH, et al, Arthritis Rheumatol 2017;69(1):35-45): labial salivary gland focus score >= 1 = 3; anti-SSA/Ro positivity = 3; ocular staining score >= 5 = 1; Schirmer <= 5 mm/5 min = 1; unstimulated whole-saliva flow <= 0.1 mL/min = 1 (0-9). A total >= 4 classifies as primary Sjogren syndrome, applied after entry criteria and exclusions. A classification, not a treatment order.';
export function sjogren2016(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.focusScore)) { s += 3; p.push('focus score >= 1 (+3)'); }
  if (bool(o.antiSsa)) { s += 3; p.push('anti-SSA/Ro (+3)'); }
  if (bool(o.ocularStaining)) { s += 1; p.push('ocular staining >= 5'); }
  if (bool(o.schirmer)) { s += 1; p.push('Schirmer <= 5'); }
  if (bool(o.salivaFlow)) { s += 1; p.push('saliva flow <= 0.1'); }
  const score = Math.round(num('Sjogren', s, { min: 0, max: 9 }));
  const abnormal = score >= 4;
  return { valid: true, score, abnormal, bandLabel: `Sjogren ${score}`, band: `2016 Sjogren criteria score ${score} — ${abnormal ? 'classifies as primary Sjogren syndrome (>= 4)' : 'does not meet the threshold (< 4)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No items.', note: SJOGREN_NOTE };
}

// --- ESSPRI ------------------------------------------------------------------
// Seror R, et al, Ann Rheum Dis 2011;70(6):968-972: mean of three patient-reported
// 0-10 numeric scales - dryness, fatigue, and pain - over the past two weeks.
const ESSPRI_NOTE = 'ESSPRI (Seror R, et al, Ann Rheum Dis 2011;70(6):968-972): the EULAR Sjogren Syndrome Patient Reported Index is the arithmetic mean of three 0-10 numeric scales - dryness, fatigue, and limb/articular/muscular pain - over the past two weeks (0-10). A patient-reported symptom measure, not a treatment order.';
export function esspri(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const dry = pos(o.dryness, 10);
  const fatigue = pos(o.fatigue, 10);
  const pain = pos(o.pain, 10);
  if (dry === null || fatigue === null || pain === null) {
    return { valid: false, message: 'Enter the dryness, fatigue, and pain scores (each 0-10).' };
  }
  const score = r2(num('ESSPRI', (dry + fatigue + pain) / 3, { min: 0, max: 10 }));
  const abnormal = score >= 5;
  return { valid: true, score, abnormal, bandLabel: `ESSPRI ${score}`, band: `ESSPRI ${score} / 10 — ${abnormal ? 'above the patient-acceptable symptom state (>= 5)' : 'within the patient-acceptable symptom state (< 5)'}.`, detail: `(dryness ${dry} + fatigue ${fatigue} + pain ${pain}) / 3 = ${score}.`, note: ESSPRI_NOTE };
}
