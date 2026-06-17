// spec-v97 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// five deterministic perioperative risk instruments that sit one rung above the
// screening indices already in the catalog (rcri, ariscat, lemon, apfel, asa-ps,
// surgical-apgar). Two are published logistic-regression PROBABILITY models, two
// are validated weighted INDICES, and one is a preoperative point-score mortality
// model:
//
//   guptaMica               - Gupta Perioperative Cardiac Risk (MI or cardiac arrest;
//                             Gupta PK et al, Circulation 2011) -- fixed logistic equation
//   guptaRespiratoryFailure - Gupta Postoperative Respiratory Failure
//                             (Gupta H et al, Chest 2011) -- fixed logistic equation
//   arozullahPneumonia      - Arozullah Postoperative Pneumonia Risk Index
//                             (Ann Intern Med 2001) -- weighted point total -> class 1-5
//   elGanzouri              - El-Ganzouri Risk Index for difficult intubation
//                             (Anesth Analg 1996) -- 7-factor weighted index, >= 4 threshold
//   pospom                  - Preoperative Score to Predict Postoperative Mortality
//                             (Le Manach et al, Anesthesiology 2016) -- point table -> mortality
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v23.js wire these to the home grid.
//
// Robustness (spec-v97 §3): the two Gupta logistic models clamp the linear
// predictor `x` to a sane range before exponentiation so a large-magnitude x can
// never produce Infinity/0 overflow or a non-finite probability -- the returned
// percentage is always finite and in [0, 100]. Every categorical input (ASA class,
// functional status, surgery type, sepsis, emergency, BUN band, Mallampati, ...) is
// validated against its fixed enum and maps to a known coefficient/weight; an
// out-of-enum value surfaces valid:false rather than a silent NaN. The weighted
// indices sum fixed integer point weights bounded by the sum of their maxima and map
// the total to the published class/threshold, naming the band that fired. None
// authors a clearance, cancellation, or treatment order in Sophie's voice
// (spec-v11 §5.3) -- each reports the model's probability/score and the source's own
// interpretation, with the clinical posture note.

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is treated
// as "not provided" rather than throwing.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

// Look up a key in a coefficient/weight map; returns null when the key is absent
// (an out-of-enum categorical input), so the caller can surface valid:false.
function lookup(map, key) {
  if (key == null) return null;
  const k = String(key).toLowerCase();
  return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null;
}

// The logistic link, overflow-guarded (spec-v97 §3). x is clamped to [-40, 40]
// before exponentiation: e^40 ~ 2.4e17 and e^-40 ~ 4e-18 are both well within
// double range, so the probability is always finite and in (0, 1). Returns a
// percentage in [0, 100].
function logisticPct(x) {
  const clamped = Math.max(-40, Math.min(40, x));
  const p = 1 / (1 + Math.exp(-clamped));
  return Math.max(0, Math.min(100, p * 100));
}

// --- Shared surgery taxonomy ---------------------------------------------------
// Both Gupta models use the same 21-category ACS-NSQIP procedure grouping, with
// "Hernia" as the reference (coefficient 0) in each. Coefficients transcribed from
// the published models (Circulation 2011 / Chest 2011); see docs/audits/v12.
const SURGERY = [
  { key: 'anorectal',   label: 'Anorectal',                              mica: -0.16, resp: -1.3530 },
  { key: 'aortic',      label: 'Aortic',                                 mica: 1.60,  resp: 1.0781 },
  { key: 'bariatric',   label: 'Bariatric',                              mica: -0.25, resp: -1.0112 },
  { key: 'brain',       label: 'Brain',                                  mica: 1.40,  resp: 0.7336 },
  { key: 'breast',      label: 'Breast',                                 mica: -1.61, resp: -2.6462 },
  { key: 'cardiac',     label: 'Cardiac',                                mica: 1.01,  resp: 0.2744 },
  { key: 'ent',         label: 'ENT (not thyroid/parathyroid)',          mica: 0.71,  resp: 0.1060 },
  { key: 'foregut',     label: 'Foregut or hepatopancreatobiliary',      mica: 1.39,  resp: 0.9694 },
  { key: 'gallbladder', label: 'Gallbladder, appendix, adrenals, spleen', mica: 0.59,  resp: -0.5668 },
  { key: 'hernia',      label: 'Hernia (reference)',                     mica: 0,     resp: 0 },
  { key: 'intestinal',  label: 'Intestinal',                             mica: 1.14,  resp: 0.5737 },
  { key: 'neck',        label: 'Neck (thyroid/parathyroid)',             mica: 0.18,  resp: -0.5271 },
  { key: 'obgyn',       label: 'Obstetric or gynecologic',               mica: 0.76,  resp: -1.2431 },
  { key: 'orthopedic',  label: 'Orthopedic or extremity',                mica: 0.80,  resp: -0.8577 },
  { key: 'other-abd',   label: 'Other abdominal',                        mica: 1.13,  resp: 0.2416 },
  { key: 'vascular',    label: 'Peripheral vascular',                    mica: 0.86,  resp: -0.2389 },
  { key: 'skin',        label: 'Skin',                                   mica: 0.54,  resp: -0.3206 },
  { key: 'spine',       label: 'Spine',                                  mica: 0.21,  resp: -0.5220 },
  { key: 'thoracic',    label: 'Thoracic (non-esophageal)',              mica: 0.40,  resp: 0.6715 },
  { key: 'vein',        label: 'Vein',                                   mica: -1.09, resp: -2.0080 },
  { key: 'urology',     label: 'Urology',                                mica: -0.26, resp: 0.3093 },
];
const SURGERY_MICA = Object.fromEntries(SURGERY.map((s) => [s.key, s.mica]));
const SURGERY_RESP = Object.fromEntries(SURGERY.map((s) => [s.key, s.resp]));
export const SURGERY_OPTIONS = SURGERY.map((s) => ({ value: s.key, text: s.label }));

// --- 2.1 guptaMica - Gupta Perioperative Cardiac Risk (MI / cardiac arrest) ----
// risk = 1 / (1 + e^-x);  x = -5.25 + 0.02*age + ASA + functional + creatinine + surgery
const MICA_INTERCEPT = -5.25;
const MICA_ASA = { '1': -5.17, '2': -3.29, '3': -1.92, '4': -0.95, '5': 0 };
const MICA_FUNCTIONAL = { independent: 0, partial: 0.65, total: 1.03 };
const MICA_CREATININE = { normal: 0, elevated: 0.61, unknown: -0.10 };
const MICA_NOTE = 'Gupta Perioperative Cardiac Risk (MICA; Gupta PK et al, Circulation 2011): predicted probability of intraoperative or postoperative myocardial infarction or cardiac arrest within 30 days, from a fixed logistic equation -- risk = 1 / (1 + e^-x), x = -5.25 + 0.02*age + ASA class + functional status + creatinine + procedure type. Reference categories (coefficient 0): ASA V, independent functional status, normal creatinine (<= 1.5 mg/dL), hernia repair. The number is a model estimate for the entered inputs, not a clearance or a guarantee.';
export function guptaMica({ age, asa, functional, creatinine, surgery } = {}) {
  const a = fin(age);
  const asaC = lookup(MICA_ASA, asa);
  const funcC = lookup(MICA_FUNCTIONAL, functional);
  const creatC = lookup(MICA_CREATININE, creatinine);
  const surgC = lookup(SURGERY_MICA, surgery);
  if (a == null || asaC == null || funcC == null || creatC == null || surgC == null) {
    return { valid: false, band: '(enter age, ASA class, functional status, creatinine, and procedure type)', note: MICA_NOTE };
  }
  const ageClamped = Math.max(0, Math.min(120, a));
  const ageTerm = ageClamped * 0.02;
  const x = MICA_INTERCEPT + ageTerm + asaC + funcC + creatC + surgC;
  const risk = logisticPct(x);
  const terms = [
    { label: 'Intercept', value: MICA_INTERCEPT },
    { label: `Age (${ageClamped} × 0.02)`, value: r3(ageTerm) },
    { label: `ASA class ${asa}`, value: asaC },
    { label: `Functional: ${functional}`, value: funcC },
    { label: `Creatinine: ${creatinine}`, value: creatC },
    { label: 'Procedure type', value: surgC },
  ];
  return {
    valid: true,
    x: r3(x),
    risk: r2(risk),
    terms,
    band: `Predicted 30-day risk of perioperative MI or cardiac arrest: ${r2(risk)}% (linear predictor x = ${r3(x)}).`,
    note: MICA_NOTE,
  };
}

// --- 2.2 guptaRespiratoryFailure - Gupta Postoperative Respiratory Failure -----
// risk = 1/(1+e^-x); x = -1.7397 + ASA + sepsis + functional + emergency + surgery
const RESP_INTERCEPT = -1.7397;
const RESP_ASA = { '1': -3.5265, '2': -2.0008, '3': -0.6201, '4': 0.2441, '5': 0 };
const RESP_SEPSIS = { none: -0.7840, sirs: 0, sepsis: 0.2752, 'septic-shock': 0.9035 };
const RESP_FUNCTIONAL = { independent: 0, partial: 0.7678, total: 1.4046 };
const RESP_EMERGENCY = { yes: 0, no: -0.5739 };
const RESP_NOTE = 'Gupta Postoperative Respiratory Failure (Gupta H et al, Chest 2011): predicted probability of postoperative respiratory failure -- mechanical ventilation > 48 h or unplanned reintubation -- from a fixed logistic equation: risk = 1 / (1 + e^-x), x = -1.7397 + ASA class + sepsis status + functional status + emergency + procedure type. Reference categories (coefficient 0): ASA V, SIRS, independent functional status, emergency = yes, hernia repair. A model estimate for the entered inputs, not a clearance.';
export function guptaRespiratoryFailure({ asa, sepsis, functional, emergency, surgery } = {}) {
  const asaC = lookup(RESP_ASA, asa);
  const sepC = lookup(RESP_SEPSIS, sepsis);
  const funcC = lookup(RESP_FUNCTIONAL, functional);
  const emC = lookup(RESP_EMERGENCY, emergency);
  const surgC = lookup(SURGERY_RESP, surgery);
  if (asaC == null || sepC == null || funcC == null || emC == null || surgC == null) {
    return { valid: false, band: '(enter ASA class, sepsis status, functional status, emergency, and procedure type)', note: RESP_NOTE };
  }
  const x = RESP_INTERCEPT + asaC + sepC + funcC + emC + surgC;
  const risk = logisticPct(x);
  const terms = [
    { label: 'Intercept', value: RESP_INTERCEPT },
    { label: `ASA class ${asa}`, value: asaC },
    { label: `Sepsis: ${sepsis}`, value: sepC },
    { label: `Functional: ${functional}`, value: funcC },
    { label: `Emergency: ${emergency}`, value: emC },
    { label: 'Procedure type', value: surgC },
  ];
  return {
    valid: true,
    x: r3(x),
    risk: r2(risk),
    terms,
    band: `Predicted risk of postoperative respiratory failure: ${r2(risk)}% (linear predictor x = ${r3(x)}).`,
    note: RESP_NOTE,
  };
}

// --- 2.3 arozullahPneumonia - Arozullah Postoperative Pneumonia Risk Index -----
// Weighted point total mapped to risk class 1-5 with the development-cohort
// pneumonia probability for that class. Points transcribed from Arozullah 2001.
const AROZ_SURGERY = { aaa: 15, thoracic: 14, 'upper-abdominal': 10, neck: 8, neurosurgery: 8, vascular: 3, other: 0 };
const AROZ_AGE = { '80+': 17, '70-79': 13, '60-69': 9, '50-59': 4, 'under-50': 0 };
const AROZ_FUNCTIONAL = { total: 10, partial: 6, independent: 0 };
const AROZ_BUN = { 'under-8': 4, '8-21': 0, '22-30': 2, 'over-30': 3 };
const AROZ_CLASSES = [
  { cls: 1, lo: 0,  hi: 15,       prob: '0.2%' },
  { cls: 2, lo: 16, hi: 25,       prob: '1.2%' },
  { cls: 3, lo: 26, hi: 40,       prob: '4.0%' },
  { cls: 4, lo: 41, hi: 55,       prob: '9.4%' },
  { cls: 5, lo: 56, hi: Infinity, prob: '15.3%' },
];
const AROZ_NOTE = 'Arozullah Postoperative Pneumonia Risk Index (Ann Intern Med 2001): a weighted multifactorial index for pneumonia after major noncardiac surgery. The point total maps to one of five risk classes with the development-cohort pneumonia rate: class 1 (0-15) 0.2%, class 2 (16-25) 1.2%, class 3 (26-40) 4.0%, class 4 (41-55) 9.4%, class 5 (> 55) 15.3%. The BUN contribution is U-shaped: < 8 mg/dL and >= 30 mg/dL both add points, the 8-21 normal band adds none. A required item left unselected withholds the class.';
export function arozullahPneumonia({ surgery, age, functional, bun, weightLoss, copd, generalAnesthesia, sensorium, cva, transfusion, emergency, steroids, smoker, alcohol } = {}) {
  const surgP = lookup(AROZ_SURGERY, surgery);
  const ageP = lookup(AROZ_AGE, age);
  const funcP = lookup(AROZ_FUNCTIONAL, functional);
  const bunP = lookup(AROZ_BUN, bun);
  if (surgP == null || ageP == null || funcP == null || bunP == null) {
    return { valid: false, band: '(select surgery type, age band, functional status, and BUN band)', note: AROZ_NOTE };
  }
  const items = [
    { label: 'Type of surgery', value: surgP },
    { label: 'Age band', value: ageP },
    { label: 'Functional status', value: funcP },
    { label: 'Weight loss > 10% (6 mo)', value: onFlag(weightLoss) ? 7 : 0 },
    { label: 'History of COPD', value: onFlag(copd) ? 5 : 0 },
    { label: 'General anesthesia', value: onFlag(generalAnesthesia) ? 4 : 0 },
    { label: 'Impaired sensorium', value: onFlag(sensorium) ? 4 : 0 },
    { label: 'History of CVA', value: onFlag(cva) ? 4 : 0 },
    { label: 'BUN band', value: bunP },
    { label: 'Transfusion > 4 units', value: onFlag(transfusion) ? 3 : 0 },
    { label: 'Emergency surgery', value: onFlag(emergency) ? 3 : 0 },
    { label: 'Chronic steroid use', value: onFlag(steroids) ? 3 : 0 },
    { label: 'Current smoker (within 1 yr)', value: onFlag(smoker) ? 3 : 0 },
    { label: 'Alcohol > 2 drinks/day', value: onFlag(alcohol) ? 2 : 0 },
  ];
  const total = items.reduce((a, it) => a + it.value, 0);
  const band = AROZ_CLASSES.find((c) => total >= c.lo && total <= c.hi);
  return {
    valid: true,
    total,
    riskClass: band.cls,
    probability: band.prob,
    items,
    band: `Arozullah ${total} points: class ${band.cls} — predicted postoperative pneumonia risk ${band.prob}.`,
    note: AROZ_NOTE,
  };
}

// --- 2.4 elGanzouri - El-Ganzouri Risk Index for difficult intubation ----------
// Seven factors, each 0/1/2 (mouth opening and prognathism cap at 1). Total 0-12;
// a score >= 4 is the commonly cited threshold for difficult laryngoscopy.
const EG_MOUTH = { 'ge-4': 0, 'lt-4': 1 };
const EG_THYROMENTAL = { 'gt-6.5': 0, '6-6.5': 1, 'lt-6': 2 };
const EG_MALLAMPATI = { '1': 0, '2': 0, '3': 1, '4': 2 };
const EG_NECK = { 'gt-90': 0, '80-90': 1, 'lt-80': 2 };
const EG_PROGNATH = { yes: 0, no: 1 };
const EG_WEIGHT = { 'under-90': 0, '90-110': 1, 'over-110': 2 };
const EG_HISTORY = { none: 0, questionable: 1, definite: 2 };
const EG_THRESHOLD = 4;
const EG_NOTE = 'El-Ganzouri Risk Index (EGRI / Simplified Airway Risk Index; el-Ganzouri 1996): a seven-factor weighted index validated against difficult laryngoscopy -- mouth opening, thyromental distance, Mallampati class, neck movement, ability to prognath, body weight, and prior difficult intubation. Total 0-12; a score >= 4 is the commonly used threshold predicting difficult intubation. It quantifies a bedside airway exam; it does not replace the airway plan or a backup strategy.';
export function elGanzouri({ mouth, thyromental, mallampati, neck, prognath, weight, history } = {}) {
  const mP = lookup(EG_MOUTH, mouth);
  const tP = lookup(EG_THYROMENTAL, thyromental);
  const maP = lookup(EG_MALLAMPATI, mallampati);
  const nP = lookup(EG_NECK, neck);
  const pP = lookup(EG_PROGNATH, prognath);
  const wP = lookup(EG_WEIGHT, weight);
  const hP = lookup(EG_HISTORY, history);
  if ([mP, tP, maP, nP, pP, wP, hP].some((v) => v == null)) {
    return { valid: false, band: '(select all seven airway factors)', note: EG_NOTE };
  }
  const items = [
    { label: 'Mouth opening', value: mP },
    { label: 'Thyromental distance', value: tP },
    { label: 'Mallampati class', value: maP },
    { label: 'Neck movement', value: nP },
    { label: 'Ability to prognath', value: pP },
    { label: 'Body weight', value: wP },
    { label: 'Prior difficult intubation', value: hP },
  ];
  const total = items.reduce((a, it) => a + it.value, 0);
  const difficult = total >= EG_THRESHOLD;
  return {
    valid: true,
    total,
    difficult,
    threshold: EG_THRESHOLD,
    items,
    band: `El-Ganzouri ${total}/12: ${difficult ? 'at or above' : 'below'} the >= 4 difficult-laryngoscopy threshold.`,
    note: EG_NOTE,
  };
}

// --- 2.5 pospom - Preoperative Score to Predict Postoperative Mortality --------
// Sum of age-band points + comorbidity points + procedure points, mapped to the
// published predicted in-hospital mortality table (Le Manach, Anesthesiology 2016,
// Supplemental Digital Content 3 -- transcribed verbatim).
const POSPOM_AGE = [
  { lo: 18, hi: 20, pts: 0 }, { lo: 21, hi: 25, pts: 1 }, { lo: 26, hi: 30, pts: 2 },
  { lo: 31, hi: 35, pts: 3 }, { lo: 36, hi: 40, pts: 4 }, { lo: 41, hi: 45, pts: 5 },
  { lo: 46, hi: 50, pts: 6 }, { lo: 51, hi: 55, pts: 7 }, { lo: 56, hi: 60, pts: 8 },
  { lo: 61, hi: 65, pts: 9 }, { lo: 66, hi: 70, pts: 10 }, { lo: 71, hi: 75, pts: 11 },
  { lo: 76, hi: 80, pts: 12 }, { lo: 81, hi: 85, pts: 13 }, { lo: 86, hi: 90, pts: 14 },
  { lo: 91, hi: 95, pts: 15 }, { lo: 96, hi: Infinity, pts: 16 },
];
// 15 named comorbidities with their assigned points (SDC 3).
export const POSPOM_COMORBIDITIES = [
  { key: 'ischemic-heart', label: 'Ischemic heart disease', pts: 1 },
  { key: 'arrhythmia', label: 'Cardiac arrhythmia or heart blocks', pts: 1 },
  { key: 'chf', label: 'Chronic heart failure or cardiomyopathy', pts: 4 },
  { key: 'pvd', label: 'Peripheral vascular disease', pts: 1 },
  { key: 'dementia', label: 'Dementia', pts: 2 },
  { key: 'cerebrovascular', label: 'Cerebrovascular disease', pts: 1 },
  { key: 'hemiplegia', label: 'Hemiplegia', pts: 4 },
  { key: 'copd', label: 'Chronic obstructive pulmonary disease', pts: 1 },
  { key: 'resp-failure', label: 'Chronic respiratory failure', pts: 3 },
  { key: 'alcohol', label: 'Chronic alcohol abuse', pts: 4 },
  { key: 'cancer', label: 'Cancer', pts: 4 },
  { key: 'diabetes', label: 'Diabetes', pts: 1 },
  { key: 'transplant', label: 'Transplanted organ(s)', pts: 2 },
  { key: 'dialysis', label: 'Preoperative chronic hemodialysis', pts: 1 },
  { key: 'renal-failure', label: 'Chronic renal failure', pts: 2 },
];
const POSPOM_COMORB_PTS = Object.fromEntries(POSPOM_COMORBIDITIES.map((c) => [c.key, c.pts]));
const POSPOM_SURGERY = [
  { key: 'endoscopic-digestive', label: 'Endoscopic digestive', pts: 0 },
  { key: 'ophthalmologic', label: 'Ophthalmologic', pts: 0 },
  { key: 'gynecologic', label: 'Gynecologic', pts: 6 },
  { key: 'other-orthopedic', label: 'Other orthopedic', pts: 6 },
  { key: 'interventional-cardiorhythmology', label: 'Interventional cardiorhythmology', pts: 8 },
  { key: 'arthroplasty-spine', label: 'Arthroplasty and spine', pts: 9 },
  { key: 'ent', label: 'Ear, nose and throat (ENT)', pts: 9 },
  { key: 'minor-urologic', label: 'Minor urologic', pts: 9 },
  { key: 'plastic', label: 'Plastic', pts: 9 },
  { key: 'major-urologic', label: 'Major urologic', pts: 12 },
  { key: 'others-surgery', label: 'Other surgery', pts: 12 },
  { key: 'minor-hepatic', label: 'Minor hepatic', pts: 12 },
  { key: 'minor-gi', label: 'Minor gastrointestinal', pts: 13 },
  { key: 'renal-transplant', label: 'Renal transplant', pts: 13 },
  { key: 'minor-vascular', label: 'Minor vascular', pts: 13 },
  { key: 'orthopedic-trauma', label: 'Orthopedic trauma', pts: 14 },
  { key: 'major-hepatic', label: 'Major hepatic', pts: 15 },
  { key: 'thoracic', label: 'Thoracic', pts: 15 },
  { key: 'neuro', label: 'Neuro', pts: 15 },
  { key: 'major-vascular', label: 'Major vascular', pts: 16 },
  { key: 'major-gi', label: 'Major gastrointestinal', pts: 16 },
  { key: 'interventional-neuroradiology', label: 'Interventional neuroradiology', pts: 17 },
  { key: 'cardiac', label: 'Cardiac', pts: 17 },
  { key: 'transplant', label: 'Transplant', pts: 22 },
  { key: 'multiple-trauma', label: 'Multiple trauma related', pts: 22 },
];
const POSPOM_SURGERY_PTS = Object.fromEntries(POSPOM_SURGERY.map((s) => [s.key, s.pts]));
export const POSPOM_SURGERY_OPTIONS = POSPOM_SURGERY.map((s) => ({ value: s.key, text: s.label }));
// Predicted in-hospital mortality (%) by total points, SDC 3. The array is keyed
// so POSPOM_MORTALITY[total - 1] is the value for `total` (total 1..50); total 0 is
// "< 0.001%" and total >= 51 is "> 97.865%", handled by the caller.
const POSPOM_MORTALITY = [
  0.001, 0.002, 0.002, 0.003, 0.004, 0.006, 0.008, 0.010, 0.014, 0.019,
  0.026, 0.035, 0.047, 0.063, 0.086, 0.116, 0.157, 0.212, 0.286, 0.387,
  0.523, 0.706, 0.953, 1.286, 1.732, 2.329, 3.126, 4.184, 5.579, 7.403,
  9.763, 12.771, 16.535, 21.140, 26.619, 32.925, 39.912, 47.336, 54.879, 62.205,
  69.012, 75.085, 80.307, 84.659, 88.190, 90.995, 93.185, 94.872, 96.159, 97.133,
];
const POSPOM_NOTE = 'POSPOM (Preoperative Score to Predict Postoperative Mortality; Le Manach et al, Anesthesiology 2016): a preoperative point score derived from > 5.5 million procedures (c-statistic 0.944 derivation, 0.929 validation). Total = age-band points + comorbidity points + procedure-category points, mapped to a published predicted in-hospital mortality (Supplemental Digital Content 3). The percentage is a model estimate from preoperative data; it is not a guarantee and does not replace clinical judgment or local protocol.';
export function pospom({ age, comorbidities, surgery } = {}) {
  const a = fin(age);
  const surgP = lookup(POSPOM_SURGERY_PTS, surgery);
  if (a == null || surgP == null) {
    return { valid: false, band: '(enter age and select a procedure category)', note: POSPOM_NOTE };
  }
  const ageClamped = Math.max(18, Math.min(120, a));
  const ageBand = POSPOM_AGE.find((b) => ageClamped >= b.lo && ageClamped <= b.hi);
  const agePts = ageBand ? ageBand.pts : 0;
  const list = Array.isArray(comorbidities) ? comorbidities : [];
  const comorbPts = list.reduce((sum, key) => {
    const p = lookup(POSPOM_COMORB_PTS, key);
    return sum + (p == null ? 0 : p);
  }, 0);
  const total = agePts + comorbPts + surgP;
  let mortality;
  if (total <= 0) mortality = '< 0.001%';
  else if (total >= 51) mortality = '> 97.865%';
  else mortality = `${POSPOM_MORTALITY[total - 1]}%`;
  const terms = [
    { label: `Age band (${ageBand ? `${ageBand.lo}-${ageBand.hi === Infinity ? '+' : ageBand.hi}` : 'n/a'})`, value: agePts },
    { label: `Comorbidities (${list.length} selected)`, value: comorbPts },
    { label: 'Procedure category', value: surgP },
  ];
  return {
    valid: true,
    total,
    agePts,
    comorbPts,
    surgeryPts: surgP,
    mortality,
    terms,
    band: `POSPOM ${total} points: predicted in-hospital mortality ${mortality}.`,
    note: POSPOM_NOTE,
  };
}
