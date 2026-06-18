// spec-v105 (closing spec of Wave 1 of the spec-v100 MDCalc Parity Completion
// program): four deterministic peripheral-artery and cardiac-surgery-risk
// instruments that fill confirmed gaps. None duplicates a live tile.
//
//   abi                - Ankle-Brachial Index (ankle / higher brachial) + PAD bands
//   rutherfordFontaine - Rutherford category 0-6 <-> Fontaine stage I-IV (PAD)
//   wifi               - SVS WIfI limb-threat clinical stage 1-4 (W/I/fI grades)
//   euroScore2         - EuroSCORE II in-hospital cardiac-surgery mortality (logistic)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v30.js wire these to the home grid.
//
// COEFFICIENTS / TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson; spec-v105 §3):
//   - EuroSCORE II betas are the Nashef 2012 EJCTS Table 6 multivariate
//     coefficients, transcribed verbatim and cross-verified against the mdapp.co
//     reproduction and euroscore.org. NOTE the age coefficient is 0.0285181 (the
//     EuroSCORE *II* multivariate value); the 0.0666354 figure is the legacy
//     EuroSCORE *I* age coefficient and is NOT used here. The model reproduces the
//     published worked example: a 70yo dialysis-dependent woman with insulin
//     diabetes, COPD, NYHA III, CCS-4, poor LV, and recent MI for isolated elective
//     CABG gives y = -2.126358 -> 10.66% predicted mortality.
//   - The WIfI clinical-stage grid is the Mills 2014 J Vasc Surg expert-panel
//     amputation-risk table (64 cells, 4 ischemia grades x 4 wound x 4 infection),
//     cross-verified across two independent reproductions (PMC8202158, J Vasc Bras
//     2020 Table 4). This is the AMPUTATION-RISK table, NOT the separate
//     revascularization-benefit table.
//
// Robustness (spec-v105 §3): abi guards its brachial divisor for > 0 (a zero/blank
// brachial returns a surfaced valid:false rather than dividing by zero) and reads
// the PAD band off the rounded ratio so the shown value matches its band. euroScore2
// clamps the logistic exponent to [-40, 40] before 1/(1+e^-x) so an extreme fuzzed
// input returns a probability in [0, 1] rather than Infinity, and returns a surfaced
// fallback on a blank/invalid age. rutherfordFontaine and wifi clamp/key their grade
// inputs and return a surfaced fallback on an unrecognized class rather than reading
// undefined. None authors a revascularization, amputation, or operative order in
// Sophie's voice (spec-v11 §5.3).

import { r2 } from './num.js';

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// --- 2.1 abi - Ankle-Brachial Index -------------------------------------------
// Per leg: ABI = (higher ankle systolic pressure for that leg) / (higher of the
// two brachial systolic pressures). The lower of the two leg indices governs the
// PAD diagnosis. Bands read off the 2-decimal rounded ratio (Aboyans 2012).
const ABI_NOTE = 'Ankle-Brachial Index (Aboyans V, Criqui MH, Abraham P, et al, Circulation 2012): for each leg, divide the higher ankle systolic pressure (dorsalis pedis or posterior tibial) by the higher of the two brachial systolic pressures. Bands: > 1.40 non-compressible (often calcified, medial arterial calcification -- ABI unreliable, use toe-brachial index), 1.00-1.40 normal, 0.91-0.99 borderline, 0.41-0.90 mild-to-moderate peripheral artery disease, <= 0.40 severe PAD. The lower of the two leg indices governs the diagnosis. A bedside index, not a revascularization order; non-compressible vessels need a toe-brachial index instead.';

function abiBand(v) {
  if (v > 1.40) return { key: 'non-compressible', text: 'non-compressible (> 1.40) -- often medial calcification; ABI unreliable, use toe-brachial index', abnormal: true };
  if (v >= 1.00) return { key: 'normal', text: 'normal (1.00-1.40)', abnormal: false };
  if (v >= 0.91) return { key: 'borderline', text: 'borderline (0.91-0.99)', abnormal: true };
  if (v >= 0.41) return { key: 'mild-to-moderate PAD', text: 'mild-to-moderate peripheral artery disease (0.41-0.90)', abnormal: true };
  return { key: 'severe PAD', text: 'severe peripheral artery disease (<= 0.40)', abnormal: true };
}

export function abi({ rightAnkle, leftAnkle, rightBrachial, leftBrachial } = {}) {
  const rb = pos(rightBrachial);
  const lb = pos(leftBrachial);
  const higherBrachial = rb != null || lb != null ? Math.max(rb || 0, lb || 0) : null;
  if (higherBrachial == null || higherBrachial <= 0) {
    return { valid: false, band: 'Enter at least one brachial systolic pressure (> 0) to compute the ABI.', note: ABI_NOTE };
  }
  const legs = [
    { side: 'Right', ankle: pos(rightAnkle) },
    { side: 'Left', ankle: pos(leftAnkle) },
  ].map((leg) => {
    if (leg.ankle == null) return { side: leg.side, value: null, band: null };
    const value = r2(leg.ankle / higherBrachial);
    return { side: leg.side, value, band: abiBand(value) };
  });
  const measured = legs.filter((l) => l.value != null);
  if (measured.length === 0) {
    return { valid: false, band: 'Enter at least one ankle systolic pressure (> 0) to compute the ABI.', note: ABI_NOTE };
  }
  // The lower index governs the PAD diagnosis.
  const governing = measured.reduce((a, b) => (b.value < a.value ? b : a));
  return {
    valid: true,
    higherBrachial,
    legs,
    governing: { side: governing.side, value: governing.value, band: governing.band.key },
    band: `${governing.side} leg ABI ${governing.value.toFixed(2)} (lower index governs): ${governing.band.text}.`,
    abnormal: governing.band.abnormal,
    note: ABI_NOTE,
  };
}

// --- 2.2 rutherford-fontaine - Rutherford category <-> Fontaine stage ---------
// One clinical picture maps to a Rutherford category (0-6) and the corresponding
// Fontaine stage (I-IV) (Rutherford 1997 reporting standards).
const RUTHERFORD = [
  { key: 'asymptomatic', rutherford: 0, fontaine: 'I', clinical: 'Asymptomatic -- no hemodynamically significant occlusive disease.' },
  { key: 'mild-claudication', rutherford: 1, fontaine: 'IIa', clinical: 'Mild claudication.' },
  { key: 'moderate-claudication', rutherford: 2, fontaine: 'IIb', clinical: 'Moderate claudication.' },
  { key: 'severe-claudication', rutherford: 3, fontaine: 'IIb', clinical: 'Severe claudication.' },
  { key: 'rest-pain', rutherford: 4, fontaine: 'III', clinical: 'Ischemic rest pain (chronic limb-threatening ischemia).' },
  { key: 'minor-tissue-loss', rutherford: 5, fontaine: 'IV', clinical: 'Minor tissue loss -- non-healing ulcer, focal gangrene with diffuse pedal ischemia.' },
  { key: 'major-tissue-loss', rutherford: 6, fontaine: 'IV', clinical: 'Major tissue loss -- extending above the transmetatarsal level, functional foot no longer salvageable.' },
];
const RUTHERFORD_BY_KEY = Object.fromEntries(RUTHERFORD.map((r) => [r.key, r]));
const RF_NOTE = 'Rutherford category and Fontaine stage (Rutherford RB, Baker JD, Ernst C, et al, J Vasc Surg 1997, revised reporting standards): two parallel chronic-limb-ischemia classifications. Rutherford 0 asymptomatic, 1 mild / 2 moderate / 3 severe claudication, 4 ischemic rest pain, 5 minor tissue loss, 6 major tissue loss. Fontaine I asymptomatic, IIa mild / IIb disabling claudication, III rest pain, IV ulceration or gangrene. Rutherford 4-6 (Fontaine III-IV) is chronic limb-threatening ischemia. A severity classification, not a revascularization order; cross-links the SVS WIfI staging.';

export function rutherfordFontaine({ picture } = {}) {
  const r = RUTHERFORD_BY_KEY[picture];
  if (!r) {
    return { valid: false, band: 'Select the clinical picture to map the Rutherford category and Fontaine stage.', note: RF_NOTE };
  }
  const cli = r.rutherford >= 4 ? 'chronic limb-threatening ischemia' : r.rutherford >= 1 ? 'intermittent claudication' : 'asymptomatic';
  return {
    valid: true,
    rutherford: r.rutherford,
    fontaine: r.fontaine,
    clinical: r.clinical,
    band: `Rutherford category ${r.rutherford} = Fontaine stage ${r.fontaine}: ${cli}.`,
    note: RF_NOTE,
  };
}

// --- 2.3 wifi - SVS WIfI Limb-Threat Classification ---------------------------
// Wound (0-3), Ischemia (0-3), foot Infection (0-3) -> clinical stage 1-4 from the
// Mills 2014 expert-panel amputation-risk table. Indexed STAGE[ischemia][wound][fI].
const WIFI_STAGE = [
  // I0
  [[1, 1, 2, 3], [1, 1, 2, 3], [2, 2, 3, 4], [3, 3, 4, 4]],
  // I1
  [[1, 2, 3, 4], [1, 2, 3, 4], [3, 3, 4, 4], [4, 4, 4, 4]],
  // I2
  [[2, 2, 3, 4], [2, 3, 4, 4], [3, 4, 4, 4], [4, 4, 4, 4]],
  // I3
  [[2, 3, 3, 4], [3, 3, 4, 4], [4, 4, 4, 4], [4, 4, 4, 4]],
];
const WIFI_STAGE_TEXT = {
  1: 'very low 1-year amputation risk',
  2: 'low 1-year amputation risk',
  3: 'moderate 1-year amputation risk',
  4: 'high 1-year amputation risk',
};
const WIFI_NOTE = 'SVS WIfI limb-threat classification (Mills JL Sr, Conte MS, Armstrong DG, et al, J Vasc Surg 2014): grade Wound (0-3), Ischemia (0-3, by ABI / ankle pressure / toe pressure), and foot Infection (0-3), then read the clinical stage 1-4 from the expert-panel amputation-risk table. Stage 1 very low, 2 low, 3 moderate, 4 high estimated 1-year amputation risk (and rising revascularization benefit). A risk-stratification aid, not a revascularization or amputation order; cross-links the Rutherford / Fontaine staging and the ankle-brachial index.';

const wifiGrade = (v) => {
  const n = fin(typeof v === 'string' && v !== '' ? Number(v) : v);
  if (n == null) return null;
  const g = Math.round(n);
  return g >= 0 && g <= 3 ? g : null;
};

export function wifi({ wound, ischemia, infection } = {}) {
  const w = wifiGrade(wound);
  const i = wifiGrade(ischemia);
  const fI = wifiGrade(infection);
  if (w == null || i == null || fI == null) {
    return { valid: false, band: 'Select a Wound, Ischemia, and foot Infection grade (each 0-3) to read the WIfI clinical stage.', note: WIFI_NOTE };
  }
  const stage = WIFI_STAGE[i][w][fI];
  return {
    valid: true,
    wound: w,
    ischemia: i,
    infection: fI,
    stage,
    band: `WIfI W${w} I${i} fI${fI} = clinical stage ${stage}: ${WIFI_STAGE_TEXT[stage]}.`,
    abnormal: stage >= 3,
    note: WIFI_NOTE,
  };
}

// --- 2.4 euroscore2 - EuroSCORE II --------------------------------------------
// Predicted in-hospital mortality = e^y / (1 + e^y), y = b0 + sum(bi*xi).
// Coefficients: Nashef 2012 EJCTS Table 6 (multivariate), verbatim.
const ES2 = {
  constant: -5.324537,
  age: 0.0285181, // applied to max(1, age - 59)
  female: 0.2196434,
  insulinDiabetes: 0.3542749,
  chronicPulmonary: 0.1886564,
  extracardiacArteriopathy: 0.5360268,
  poorMobility: 0.2407181,
  previousCardiacSurgery: 1.118599,
  activeEndocarditis: 0.6194522,
  criticalPreop: 1.086517,
  recentMi: 0.1528943,
  ccs4: 0.2226147,
  thoracicAorta: 0.6527205,
  nyha: { 1: 0, 2: 0.1070545, 3: 0.2958358, 4: 0.5597929 },
  lv: { good: 0, moderate: 0.3150652, poor: 0.8084096, 'very-poor': 0.9346919 },
  pa: { none: 0, moderate: 0.1788899, severe: 0.3491475 },
  urgency: { elective: 0, urgent: 0.3174673, emergency: 0.7039121, salvage: 1.362947 },
  weight: { cabg: 0, single: 0.0062118, two: 0.5521478, three: 0.9724533 },
  renal: { normal: 0, 'cc51-85': 0.303553, 'cc-le50': 0.8592256, dialysis: 0.6421508 },
};
const ES2_NOTE = 'EuroSCORE II (Nashef SAM, Roques F, Sharples LD, et al, Eur J Cardiothorac Surg 2012): predicted in-hospital mortality after cardiac surgery via the logistic model e^y / (1 + e^y), y = -5.324537 + sum of the published patient, cardiac, and operative coefficients. The age term applies 0.0285181 per year above 60 (1 at age <= 60). On-dialysis carries a lower coefficient than a creatinine clearance <= 50 without dialysis -- a published feature of the model, reproduced here verbatim. A preoperative mortality estimate, not an operability verdict; the operate / decline / heart-team decision stays with the surgical team.';

const lk = (table, key) => (Object.prototype.hasOwnProperty.call(table, key) ? table[key] : 0);

export function euroScore2({
  age, female, insulinDiabetes, chronicPulmonary, extracardiacArteriopathy,
  poorMobility, previousCardiacSurgery, activeEndocarditis, criticalPreop,
  nyha, ccs4, lvFunction, recentMi, pulmonaryHypertension, urgency,
  weightOfIntervention, renal, thoracicAorta,
} = {}) {
  const a = pos(age);
  if (a == null) {
    return { valid: false, band: 'Enter the patient age (years) to compute EuroSCORE II.', note: ES2_NOTE };
  }
  const ageX = Math.max(1, a - 59);
  let y = ES2.constant + ES2.age * ageX;
  const terms = [{ label: `Age ${r2(a)} (x = ${ageX})`, value: r2(ES2.age * ageX) }];
  const addFlag = (label, key) => {
    if (onFlag({ female, insulinDiabetes, chronicPulmonary, extracardiacArteriopathy, poorMobility, previousCardiacSurgery, activeEndocarditis, criticalPreop, recentMi, ccs4, thoracicAorta }[key])) {
      y += ES2[key];
      terms.push({ label, value: ES2[key] });
    }
  };
  addFlag('Female sex', 'female');
  addFlag('Insulin-dependent diabetes', 'insulinDiabetes');
  addFlag('Chronic pulmonary dysfunction', 'chronicPulmonary');
  addFlag('Extracardiac arteriopathy', 'extracardiacArteriopathy');
  addFlag('Poor mobility', 'poorMobility');
  addFlag('Previous cardiac surgery', 'previousCardiacSurgery');
  addFlag('Active endocarditis', 'activeEndocarditis');
  addFlag('Critical preoperative state', 'criticalPreop');
  addFlag('Recent MI (<= 90 days)', 'recentMi');
  addFlag('CCS class 4 angina', 'ccs4');
  addFlag('Surgery on thoracic aorta', 'thoracicAorta');
  const addCat = (label, table, key) => {
    const v = lk(table, key);
    if (v !== 0) { y += v; terms.push({ label, value: v }); }
  };
  addCat(`NYHA ${nyha}`, ES2.nyha, nyha);
  addCat('LV function', ES2.lv, lvFunction);
  addCat('Pulmonary hypertension', ES2.pa, pulmonaryHypertension);
  addCat('Urgency', ES2.urgency, urgency);
  addCat('Weight of intervention', ES2.weight, weightOfIntervention);
  addCat('Renal impairment', ES2.renal, renal);

  const yc = clamp(y, -40, 40);
  const risk = clamp(Math.exp(yc) / (1 + Math.exp(yc)), 0, 1);
  const pct = r2(risk * 100);
  const tier = pct < 2 ? 'low' : pct < 5 ? 'intermediate' : pct < 10 ? 'high' : 'very high';
  return {
    valid: true,
    mortality: pct,
    y: r2(y),
    tier,
    terms,
    band: `EuroSCORE II predicted in-hospital mortality ${pct.toFixed(2)}% (${tier} predicted operative risk).`,
    abnormal: pct >= 10,
    note: ES2_NOTE,
  };
}
