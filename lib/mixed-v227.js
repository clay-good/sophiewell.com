// spec-v227: closing cross-domain slice — the ICBD 2014 and ISG 1990 Behcet
// criteria, the BATT trauma-hemorrhage score, the Denver ED Trauma Organ Failure
// score, the Emergency Transfusion Score, and the WHO 2009 dengue classification.
// Every id was verified absent by a direct scan of app.js first (spec-v85 §6.2).
// None duplicates a live tile; v227 runs no AI and makes no runtime network call.
// These classify / stratify — they are NOT a transfusion, TXA, or treatment order
// (spec-v11 §5.3). Closes the Bedside Decision & Physiology Instruments program at
// the +100 catalog milestone.
//
//   icbdBehcet  - International Criteria for Behcet's Disease (2014)
//   isgBehcet   - International Study Group criteria for Behcet's Disease (1990)
//   batt        - Bleeding Audit Triage Trauma score
//   denverEdTof - Denver Emergency Department Trauma Organ Failure score
//   ets         - Emergency Transfusion Score
//   whoDengue   - WHO 2009 dengue case classification
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- ICBD 2014 ---------------------------------------------------------------
// Davatchi F, et al, J Eur Acad Dermatol Venereol 2014;28(3):338-347: ocular
// lesions 2, oral aphthosis 2, genital aphthosis 2, skin lesions 1, neurological
// manifestations 1, vascular manifestations 1, positive pathergy 1. >= 4 = Behcet
// disease.
const ICBD_NOTE = "International Criteria for Behcet's Disease (Davatchi F, et al, J Eur Acad Dermatol Venereol 2014;28(3):338-347): ocular lesions 2, oral aphthosis 2, genital aphthosis 2, skin lesions 1, neurological manifestations 1, vascular manifestations 1, positive pathergy 1. A total >= 4 classifies Behcet disease. A classification, not a treatment order.";
export function icbdBehcet(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const add = (c, pts, l) => { if (bool(o[c])) { s += pts; p.push(`${l} (+${pts})`); } };
  add('ocular', 2, 'ocular'); add('oral', 2, 'oral aphthosis'); add('genital', 2, 'genital aphthosis');
  add('skin', 1, 'skin'); add('neuro', 1, 'neurological'); add('vascular', 1, 'vascular'); add('pathergy', 1, 'pathergy');
  const score = Math.round(num('ICBD', s, { min: 0, max: 10 }));
  const abnormal = score >= 4;
  return { valid: true, score, abnormal, bandLabel: `ICBD ${score}`, band: `ICBD 2014 score ${score} — ${abnormal ? "classifies Behcet disease (>= 4)" : 'does not meet the threshold (< 4)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No items.', note: ICBD_NOTE };
}

// --- ISG 1990 ----------------------------------------------------------------
// International Study Group for Behcet's Disease, Lancet 1990;335(8697):1078-1080:
// recurrent oral ulceration is mandatory, plus >= 2 of - recurrent genital
// ulceration, eye lesions, skin lesions, or a positive pathergy test.
const ISG_NOTE = "International Study Group criteria for Behcet's Disease (Lancet 1990;335(8697):1078-1080): recurrent oral ulceration (>= 3 times in 12 months) is mandatory, plus >= 2 of - recurrent genital ulceration, eye lesions, skin lesions, or a positive pathergy test. A classification, not a treatment order.";
export function isgBehcet(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const oral = bool(o.oralUlceration);
  let minor = 0; const p = [];
  const add = (c, l) => { if (bool(o[c])) { minor += 1; p.push(l); } };
  add('genital', 'genital ulceration'); add('eye', 'eye lesions'); add('skin', 'skin lesions'); add('pathergy', 'positive pathergy');
  const meets = oral && minor >= 2;
  return { valid: true, meets, abnormal: meets, bandLabel: meets ? "Meets ISG criteria" : 'Does not meet ISG criteria', band: meets ? `Meets ISG criteria for Behcet disease — recurrent oral ulceration plus ${minor} of 4 minor criteria.` : `Does not meet ISG criteria (oral ulceration ${oral ? 'present' : 'absent'}, ${minor} of 4 minor criteria).`, detail: p.length ? `Minor: ${p.join('; ')}.` : 'No minor criteria.', note: ISG_NOTE };
}

// --- BATT --------------------------------------------------------------------
// Ageron FX, et al, BMJ Open 2019;9(4):e026823 + Scand J Trauma Resusc Emerg Med
// 2021;29:6: age >= 65 +1, >= 75 +2; SBP < 60 +14, 60-99 +5; GCS <= 8 +4, 9-12
// +3; RR < 10 or >= 30 (or SpO2 < 90%) +2; HR > 100 +1; penetrating injury +2;
// high-energy trauma +2 (0-27). TXA threshold >= 2.
const BATT_NOTE = 'BATT score (Ageron FX, et al, BMJ Open 2019;9(4):e026823): age >= 65 +1 / >= 75 +2; systolic BP < 60 +14 / 60-99 +5; GCS <= 8 +4 / 9-12 +3; respiratory rate < 10 or >= 30 (or SpO2 < 90%) +2; heart rate > 100 +1; penetrating injury +2; high-energy trauma +2 (0-27). A prognostic model for traumatic death due to bleeding; a threshold of >= 2 has been used to guide tranexamic acid. A risk score, not a TXA order.';
export function batt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const sbp = pos(o.sbp, 400);
  const gcs = pos(o.gcs, 15);
  if (age === null || sbp === null || gcs === null) {
    return { valid: false, message: 'Enter age (years), systolic BP (mmHg), and GCS (3-15), and mark the remaining findings.' };
  }
  let s = 0; const p = [];
  const agePts = age >= 75 ? 2 : age >= 65 ? 1 : 0; s += agePts; if (agePts) p.push(`age (+${agePts})`);
  const sbpPts = sbp < 60 ? 14 : sbp <= 99 ? 5 : 0; s += sbpPts; if (sbpPts) p.push(`SBP (+${sbpPts})`);
  const gcsPts = gcs <= 8 ? 4 : gcs <= 12 ? 3 : 0; s += gcsPts; if (gcsPts) p.push(`GCS (+${gcsPts})`);
  if (bool(o.rrAbnormal)) { s += 2; p.push('RR/SpO2 (+2)'); }
  if (bool(o.hrHigh)) { s += 1; p.push('HR > 100'); }
  if (bool(o.penetrating)) { s += 2; p.push('penetrating (+2)'); }
  if (bool(o.highEnergy)) { s += 2; p.push('high-energy (+2)'); }
  const score = Math.round(num('BATT', s, { min: 0, max: 27 }));
  const abnormal = score >= 2;
  return { valid: true, score, abnormal, bandLabel: `BATT ${score}`, band: `BATT score ${score} — ${abnormal ? 'at or above the TXA-consideration threshold (>= 2)' : 'below the threshold (< 2)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: BATT_NOTE };
}

// --- Denver ED Trauma Organ Failure ------------------------------------------
// Vogel JA, et al, J Trauma Acute Care Surg 2014;76(1):140-145: age >= 65 +1,
// emergent intubation +3, hematocrit < 20% +2 / 20-<35% +1, ED SBP < 90 +1, BUN
// >= 30 +1, WBC >= 20,000 +1. Bands: 0-1 low, 2-3 moderate, >= 4 high risk of
// multiple organ failure.
const DENVER_NOTE = 'Denver ED Trauma Organ Failure score (Vogel JA, et al, J Trauma Acute Care Surg 2014;76(1):140-145): age >= 65 +1, emergent intubation +3, hematocrit < 20% +2 / 20-<35% +1, ED systolic BP < 90 +1, BUN >= 30 mg/dL +1, WBC >= 20,000/uL +1. 0-1 low, 2-3 moderate, >= 4 high risk of multiple organ failure. A risk score, not a treatment order.';
export function denverEdTof(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hct = pos(o.hematocrit, 100);
  if (hct === null) {
    return { valid: false, message: 'Enter hematocrit (%) and mark age >= 65 / emergent intubation / SBP < 90 / BUN >= 30 / WBC >= 20,000.' };
  }
  let s = 0; const p = [];
  if (bool(o.ageOver65)) { s += 1; p.push('age >= 65'); }
  if (bool(o.intubation)) { s += 3; p.push('emergent intubation (+3)'); }
  const hctPts = hct < 20 ? 2 : hct < 35 ? 1 : 0; s += hctPts; if (hctPts) p.push(`hematocrit (+${hctPts})`);
  if (bool(o.sbpLow)) { s += 1; p.push('SBP < 90'); }
  if (bool(o.bunHigh)) { s += 1; p.push('BUN >= 30'); }
  if (bool(o.wbcHigh)) { s += 1; p.push('WBC >= 20,000'); }
  const score = Math.round(num('Denver ED TOF', s, { min: 0, max: 9 }));
  let tier; let abnormal = true;
  if (score >= 4) tier = 'high multiple-organ-failure risk (>= 4)';
  else if (score >= 2) tier = 'moderate risk (2-3)';
  else { tier = 'low risk (0-1)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `Denver ED TOF ${score}`, band: `Denver ED Trauma Organ Failure score ${score} — ${tier}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: DENVER_NOTE };
}

// --- Emergency Transfusion Score ---------------------------------------------
// Ruchholtz S, et al, Transfus Med 2006;16(1):49-56 + Kuhne CA, et al, World J
// Surg 2008;32(6):1183-1188: SBP < 90 = 2.5, 90-120 = 1.5; free intra-abdominal
// fluid on ultrasound = 2.0; unstable pelvic ring = 1.5; age 20-60 = 0.5, > 60 =
// 1.5; admission from scene = 1.0; traffic accident = 1.0; fall > 3 m = 1.0.
// A total >= 3 flags likely need for blood products.
const ETS_NOTE = 'Emergency Transfusion Score (Ruchholtz S, et al, Transfus Med 2006;16(1):49-56): systolic BP < 90 = 2.5 / 90-120 = 1.5; free intra-abdominal fluid on ultrasound = 2.0; unstable pelvic ring = 1.5; age 20-60 = 0.5 / > 60 = 1.5; admission from scene = 1.0; traffic accident = 1.0; fall > 3 m = 1.0. A total >= 3 flags likely need for early blood products. A risk score, not a transfusion order.';
export function ets(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sbp = pos(o.sbp, 400);
  const age = pos(o.age, 130);
  if (sbp === null || age === null) {
    return { valid: false, message: 'Enter systolic BP (mmHg) and age (years), and mark free fluid / unstable pelvis / from scene / traffic accident / fall > 3 m.' };
  }
  let s = 0; const p = [];
  const sbpPts = sbp < 90 ? 2.5 : sbp <= 120 ? 1.5 : 0; s += sbpPts; if (sbpPts) p.push(`SBP (+${sbpPts})`);
  const agePts = age > 60 ? 1.5 : age >= 20 ? 0.5 : 0; s += agePts; if (agePts) p.push(`age (+${agePts})`);
  if (bool(o.freeFluid)) { s += 2.0; p.push('free fluid (+2)'); }
  if (bool(o.unstablePelvis)) { s += 1.5; p.push('unstable pelvis (+1.5)'); }
  if (bool(o.fromScene)) { s += 1.0; p.push('from scene'); }
  if (bool(o.traffic)) { s += 1.0; p.push('traffic accident'); }
  if (bool(o.fall)) { s += 1.0; p.push('fall > 3 m'); }
  const score = r1(num('ETS', s, { min: 0, max: 12 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `ETS ${score}`, band: `Emergency Transfusion Score ${score} — ${abnormal ? 'likely need for blood products (>= 3)' : 'below the threshold (< 3)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: ETS_NOTE };
}

// --- WHO 2009 dengue classification ------------------------------------------
// World Health Organization. Dengue: Guidelines for Diagnosis, Treatment,
// Prevention and Control. Geneva; 2009: severe dengue (severe plasma leakage /
// shock / respiratory distress, severe bleeding, or severe organ impairment) ->
// severe; otherwise dengue with warning signs if >= 1 of 7 warning signs;
// otherwise dengue without warning signs.
const DENGUE_NOTE = 'WHO 2009 dengue case classification (World Health Organization, Dengue: Guidelines for Diagnosis, Treatment, Prevention and Control, Geneva 2009): severe dengue if any of severe plasma leakage (shock or respiratory distress), severe bleeding, or severe organ impairment (AST/ALT >= 1000, impaired consciousness, or organ involvement); otherwise dengue with warning signs if >= 1 of abdominal pain, persistent vomiting, clinical fluid accumulation, mucosal bleeding, lethargy/restlessness, liver enlargement > 2 cm, or a rise in hematocrit with a rapid platelet drop; otherwise dengue without warning signs. A case classification, not a treatment order.';
export function whoDengue(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const severe = bool(o.plasmaLeakage) || bool(o.severeBleeding) || bool(o.organImpairment);
  const warningKeys = ['abdominalPain', 'vomiting', 'fluidAccumulation', 'mucosalBleeding', 'lethargy', 'liverEnlargement', 'hctPlatelet'];
  const warnings = warningKeys.filter((k) => bool(o[k]));
  let tier; let abnormal = true;
  if (severe) tier = 'severe dengue';
  else if (warnings.length >= 1) tier = 'dengue with warning signs';
  else { tier = 'dengue without warning signs'; abnormal = false; }
  return { valid: true, tier, abnormal, bandLabel: tier, band: `WHO 2009 dengue classification: ${tier}.`, detail: severe ? 'A severity criterion is present.' : warnings.length ? `${warnings.length} warning sign(s) present.` : 'No warning signs or severity criteria.', note: DENGUE_NOTE };
}
