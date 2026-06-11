// spec-v4 §5: Group G scoring extensions (utilities 136-160).
// Pure scoring formulas. Each accepts a typed answer object and returns
// { score, band, ...components } so the renderer can show the trace.
//
// Citations live in lib/meta.js. Numeric thresholds are taken from the
// published source for each instrument.
//
// spec-v59 §2.4: r1 comes from lib/num.js (single source of truth). The three
// local `round1` inlines (identical to r1) are deleted; behavior is unchanged.

import { r1 } from './num.js';

function band(score, bands) {
  for (const b of bands) {
    const lo = b.min ?? -Infinity;
    const hi = b.max ?? Infinity;
    if (score >= lo && score <= hi) return b.label;
  }
  return null;
}

// --- 136 TIMI risk score (UA/NSTEMI) ----------------------------------
// 7 binary criteria. Antman et al. JAMA 2000.
export function timi({ age65, threeRiskFactors, knownCad50pct,
  asaPast7Days, severeAngina, stDeviation, elevatedMarkers }) {
  const score = [age65, threeRiskFactors, knownCad50pct, asaPast7Days,
    severeAngina, stDeviation, elevatedMarkers].filter(Boolean).length;
  return {
    score,
    band: band(score, [
      { min: 0, max: 2, label: 'Low risk (~5% 14-day risk)' },
      { min: 3, max: 4, label: 'Intermediate risk (~13-20%)' },
      { min: 5, max: 7, label: 'High risk (~26-41%)' },
    ]),
  };
}

// --- 137 GRACE (simplified for in-hospital mortality) ------------------
// Uses the 2003 derivation point assignments from Granger et al. Arch Intern
// Med 2003. Returns total points and risk band.
export function grace({ age, heartRate, sbp, creatinineMgDl,
  killipClass, cardiacArrestAdmission, stDeviation, abnormalEnzymes }) {
  let pts = 0;
  // Age points (banded)
  if      (age < 30)  pts += 0;
  else if (age < 40)  pts += 8;
  else if (age < 50)  pts += 25;
  else if (age < 60)  pts += 41;
  else if (age < 70)  pts += 58;
  else if (age < 80)  pts += 75;
  else if (age < 90)  pts += 91;
  else                pts += 100;
  // Heart rate
  if      (heartRate < 50)  pts += 0;
  else if (heartRate < 70)  pts += 3;
  else if (heartRate < 90)  pts += 9;
  else if (heartRate < 110) pts += 15;
  else if (heartRate < 150) pts += 24;
  else if (heartRate < 200) pts += 38;
  else                      pts += 46;
  // SBP
  if      (sbp < 80)   pts += 58;
  else if (sbp < 100)  pts += 53;
  else if (sbp < 120)  pts += 43;
  else if (sbp < 140)  pts += 34;
  else if (sbp < 160)  pts += 24;
  else if (sbp < 200)  pts += 10;
  else                 pts += 0;
  // Creatinine (mg/dL)
  if      (creatinineMgDl < 0.40) pts += 1;
  else if (creatinineMgDl < 0.80) pts += 4;
  else if (creatinineMgDl < 1.20) pts += 7;
  else if (creatinineMgDl < 1.60) pts += 10;
  else if (creatinineMgDl < 2.00) pts += 13;
  else if (creatinineMgDl < 4.00) pts += 21;
  else                            pts += 28;
  // Killip class (1-4)
  pts += [0, 0, 20, 39, 59][killipClass] || 0;
  if (cardiacArrestAdmission) pts += 39;
  if (stDeviation)            pts += 28;
  if (abnormalEnzymes)        pts += 14;
  return {
    score: pts,
    band: band(pts, [
      { min: 0, max: 108, label: 'Low (in-hospital mortality < 1%)' },
      { min: 109, max: 140, label: 'Intermediate (1-3%)' },
      { min: 141, max: Infinity, label: 'High (>3%)' },
    ]),
  };
}

// --- 138 HEART score (chest pain) -------------------------------------
// 5 components, each 0/1/2.
export function heart({ history, ekg, age, riskFactors, troponin }) {
  const v = (n) => Math.max(0, Math.min(2, Number(n) || 0));
  const score = v(history) + v(ekg) + v(age) + v(riskFactors) + v(troponin);
  return {
    score,
    band: band(score, [
      { min: 0, max: 3, label: 'Low (1.7% 6-week MACE)' },
      { min: 4, max: 6, label: 'Moderate (16.6%)' },
      { min: 7, max: 10, label: 'High (50.1%)' },
    ]),
  };
}

// --- 139 PERC rule (PE rule-out) --------------------------------------
// 8 criteria; PE can be ruled out if ALL are negative AND clinician's pre-test
// probability is low. Returns the fail count and a categorical result.
export function perc({ age50, hr100, sao2lt95, hemoptysis, estrogen,
  priorVte, recentSurgery, unilateralLegSwelling }) {
  const failures = [age50, hr100, sao2lt95, hemoptysis, estrogen, priorVte,
    recentSurgery, unilateralLegSwelling].filter(Boolean).length;
  return {
    score: failures,
    band: failures === 0
      ? 'PERC negative: PE can be ruled out without further workup IF clinical pretest probability is low.'
      : 'PERC positive: cannot rule out PE by criteria alone.',
  };
}

// --- 140 Wells PE & revised Geneva ------------------------------------
// Wells PE (Wells 2000): clinical signs of DVT 3, alternative dx less likely 3,
// HR>100 1.5, immobilization/surgery 1.5, prior VTE 1.5, hemoptysis 1, malignancy 1.
export function wellsPe({ dvtSigns, alternativeDxLessLikely, hr100,
  immobilization, priorVte, hemoptysis, malignancy }) {
  let s = 0;
  if (dvtSigns) s += 3;
  if (alternativeDxLessLikely) s += 3;
  if (hr100) s += 1.5;
  if (immobilization) s += 1.5;
  if (priorVte) s += 1.5;
  if (hemoptysis) s += 1;
  if (malignancy) s += 1;
  return {
    score: s,
    band: band(s, [
      { min: 0, max: 1.5, label: 'Low (1.3%)' },
      { min: 2, max: 6, label: 'Moderate (16.2%)' },
      { min: 6.5, max: Infinity, label: 'High (40.6%)' },
    ]),
  };
}

// Revised Geneva (Le Gal 2006): age>65 1, prior VTE 3, surgery/fx 1mo 2,
// active malignancy 2, unilateral leg pain 3, hemoptysis 2, HR 75-94 3, HR>=95 5,
// pain on lower-limb deep palpation + unilateral edema 4.
export function geneva({ age65, priorVte, recentSurgery, activeMalignancy,
  unilateralLegPain, hemoptysis, hr, lowerLimbExam }) {
  let s = 0;
  if (age65) s += 1;
  if (priorVte) s += 3;
  if (recentSurgery) s += 2;
  if (activeMalignancy) s += 2;
  if (unilateralLegPain) s += 3;
  if (hemoptysis) s += 2;
  if (hr >= 95) s += 5;
  else if (hr >= 75) s += 3;
  if (lowerLimbExam) s += 4;
  return {
    score: s,
    band: band(s, [
      { min: 0, max: 3, label: 'Low (~8%)' },
      { min: 4, max: 10, label: 'Intermediate (~28%)' },
      { min: 11, max: Infinity, label: 'High (~74%)' },
    ]),
  };
}

// --- 141 CURB-65 -------------------------------------------------------
export function curb65({ confusion, bun20, rr30, sbp90OrDbp60, age65 }) {
  const s = [confusion, bun20, rr30, sbp90OrDbp60, age65].filter(Boolean).length;
  return {
    score: s,
    band: band(s, [
      { min: 0, max: 1, label: 'Low (outpatient candidate)' },
      { min: 2, max: 2, label: 'Moderate (consider hospitalization)' },
      { min: 3, max: 5, label: 'Severe (ICU consideration)' },
    ]),
  };
}

// --- 142 PSI / PORT (Fine et al. NEJM 1997) - condensed scoring ------
// Returns total points and risk class I-V. Many components; ship the key ones.
export function psi({ age, sex, nursingHome, neoplasm, liverDisease,
  chf, cerebrovascular, renalDisease, alteredMental, rr30, sbp90, temp,
  hr125, ph, bun, sodium, glucose, hct, pao2, pleuralEffusion }) {
  let pts = 0;
  pts += sex === 'F' ? Math.max(0, age - 10) : age;
  if (nursingHome) pts += 10;
  if (neoplasm) pts += 30;
  if (liverDisease) pts += 20;
  if (chf) pts += 10;
  if (cerebrovascular) pts += 10;
  if (renalDisease) pts += 10;
  if (alteredMental) pts += 20;
  if (rr30) pts += 20;
  if (sbp90) pts += 20;
  if (temp != null && (temp < 35 || temp >= 40)) pts += 15;
  if (hr125) pts += 10;
  if (ph != null && ph < 7.35) pts += 30;
  if (bun != null && bun >= 30) pts += 20;
  if (sodium != null && sodium < 130) pts += 20;
  if (glucose != null && glucose >= 250) pts += 10;
  if (hct != null && hct < 30) pts += 10;
  if (pao2 != null && pao2 < 60) pts += 10;
  if (pleuralEffusion) pts += 10;
  let cls;
  if (age <= 50 && pts === 0) cls = 'I';
  else if (pts <= 70) cls = 'II';
  else if (pts <= 90) cls = 'III';
  else if (pts <= 130) cls = 'IV';
  else cls = 'V';
  return {
    score: pts,
    band: `Class ${cls} (${cls === 'I' || cls === 'II' ? 'outpatient' : cls === 'III' ? 'observation/short admission' : 'admit'})`,
  };
}

// --- 143 qSOFA & SOFA --------------------------------------------------
export function qsofa({ rr22, alteredMental, sbp100 }) {
  const s = [rr22, alteredMental, sbp100].filter(Boolean).length;
  return {
    score: s,
    band: s >= 2 ? 'High mortality risk (sepsis screen positive)' : 'Low mortality risk by qSOFA',
  };
}

// SOFA: 6 organ systems, each 0-4. Caller supplies pre-graded values.
export function sofa({ respiration, coagulation, liver, cardiovascular, cns, renal }) {
  const v = (n) => Math.max(0, Math.min(4, Number(n) || 0));
  const s = v(respiration) + v(coagulation) + v(liver) + v(cardiovascular) + v(cns) + v(renal);
  return {
    score: s,
    band: band(s, [
      { min: 0, max: 6, label: 'Low (~10% mortality)' },
      { min: 7, max: 9, label: 'Moderate (~15-20%)' },
      { min: 10, max: 12, label: 'High (~40-50%)' },
      { min: 13, max: 24, label: 'Very high (>50%)' },
    ]),
  };
}

// --- 144 MELD-3.0 & Child-Pugh -----------------------------------------
function ln(x) { return Math.log(x); }
function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

// MELD-3.0 (Kim 2021): adds female sex (+1.33) and sodium adjustments to the
// 2016 MELD-Na. Inputs: bilirubin (mg/dL), INR, creatinine (mg/dL),
// sodium (mEq/L), albumin (g/dL), sex 'M'|'F'. Each lab clamped to its
// approved range.
export function meld30({ bilirubin, inr, creatinine, sodium, albumin, sex,
  hadDialysisTwiceLastWeek }) {
  const cr = clamp(hadDialysisTwiceLastWeek ? 3.0 : creatinine, 1.0, 3.0);
  const bili = clamp(bilirubin, 1.0, Infinity);
  const inrC = clamp(inr, 1.0, Infinity);
  const naC = clamp(sodium, 125, 137);
  const albC = clamp(albumin, 1.5, 3.5);
  const female = sex === 'F' ? 1 : 0;
  let m = 1.33 * female
        + 4.56 * ln(bili)
        + 0.82 * (137 - naC)
        - 0.24 * (137 - naC) * ln(bili)
        + 9.09 * ln(inrC)
        + 11.14 * ln(cr)
        + 1.85 * (3.5 - albC)
        - 1.83 * (3.5 - albC) * ln(cr)
        + 6;
  m = Math.round(m);
  return { score: m, band: m >= 30 ? 'Very high mortality' : m >= 20 ? 'High' : m >= 10 ? 'Moderate' : 'Low' };
}

// Child-Pugh: 5 components scored 1/2/3.
//   bilirubin: <2 / 2-3 / >3 mg/dL
//   albumin:   >3.5 / 2.8-3.5 / <2.8 g/dL
//   inr:       <1.7 / 1.7-2.3 / >2.3
//   ascites:   none / mild / moderate-severe
//   enceph:    none / grade 1-2 / grade 3-4
export function childPugh({ bilirubin, albumin, inr, ascites, encephalopathy }) {
  const biliPts = bilirubin < 2 ? 1 : bilirubin <= 3 ? 2 : 3;
  const albPts  = albumin > 3.5 ? 1 : albumin >= 2.8 ? 2 : 3;
  const inrPts  = inr < 1.7 ? 1 : inr <= 2.3 ? 2 : 3;
  const ascPts  = ascites === 'none' ? 1 : ascites === 'mild' ? 2 : 3;
  const encPts  = encephalopathy === 'none' ? 1 : encephalopathy === 'grade1-2' ? 2 : 3;
  const score = biliPts + albPts + inrPts + ascPts + encPts;
  const cls = score <= 6 ? 'A' : score <= 9 ? 'B' : 'C';
  return { score, band: `Class ${cls}` };
}

// --- 145 Ranson & BISAP -----------------------------------------------
// Ranson (non-gallstone): 5 admission + 6 at-48h. Caller passes booleans.
export function ranson({ admission, fortyEightHour }) {
  const a = Object.values(admission || {}).filter(Boolean).length;
  const b = Object.values(fortyEightHour || {}).filter(Boolean).length;
  const total = a + b;
  return {
    score: total,
    band: band(total, [
      { min: 0, max: 2, label: '<1% mortality' },
      { min: 3, max: 4, label: '~15% mortality' },
      { min: 5, max: 6, label: '~40% mortality' },
      { min: 7, max: 11, label: '~100% mortality' },
    ]),
  };
}

// BISAP: 5 binary criteria.
export function bisap({ bun25, alteredMental, sirs, age60, pleuralEffusion }) {
  const s = [bun25, alteredMental, sirs, age60, pleuralEffusion].filter(Boolean).length;
  return {
    score: s,
    band: s >= 3 ? 'High risk (mortality >5-10%)' : 'Low risk',
  };
}

// --- 146 Centor & McIsaac (strep pharyngitis) -------------------------
// Centor (Centor 1981): 4 criteria, 1 pt each. McIsaac adds age modifier:
// age 3-14 +1, age 15-44 +0, age >=45 -1.
export function centor({ tonsillarExudate, tenderAnteriorAdenopathy,
  feverHistory, absenceOfCough }) {
  const s = [tonsillarExudate, tenderAnteriorAdenopathy, feverHistory,
    absenceOfCough].filter(Boolean).length;
  return { score: s, band: band(s, [
    { min: 0, max: 1, label: 'Low (<10% strep): no testing/abx' },
    { min: 2, max: 3, label: 'Moderate (~15-32%): consider rapid antigen' },
    { min: 4, max: 4, label: 'High (~56%): consider empiric or test' },
  ]) };
}

export function mcisaac({ tonsillarExudate, tenderAnteriorAdenopathy,
  feverHistory, absenceOfCough, ageYears }) {
  const c = centor({ tonsillarExudate, tenderAnteriorAdenopathy,
    feverHistory, absenceOfCough }).score;
  let mod = 0;
  if (ageYears >= 3 && ageYears <= 14) mod = 1;
  else if (ageYears >= 45) mod = -1;
  const s = c + mod;
  return { score: s, ageModifier: mod, band: band(s, [
    { min: -1, max: 1, label: 'Low: no testing/abx' },
    { min: 2, max: 3, label: 'Moderate: rapid antigen' },
    { min: 4, max: 5, label: 'High: empiric vs test/treat' },
  ]) };
}

// --- 147 Caprini VTE risk (simplified weighted) -----------------------
// Each component a points value. Caller picks the relevant items.
export function caprini({ items }) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array of {label, points}');
  const score = items.reduce((a, x) => a + (Number(x.points) || 0), 0);
  return { score, band: band(score, [
    { min: 0, max: 0, label: 'Very low' },
    { min: 1, max: 2, label: 'Low' },
    { min: 3, max: 4, label: 'Moderate' },
    { min: 5, max: Infinity, label: 'High' },
  ]) };
}

// --- 148 Bishop score (cervical favorability) -------------------------
// 5 components. Position scored 0/1/2; the rest 0-3.
export function bishop({ dilation, effacement, station, consistency, position }) {
  const dPts = dilation === 0 ? 0 : dilation <= 2 ? 1 : dilation <= 4 ? 2 : 3;
  const ePts = effacement < 30 ? 0 : effacement <= 50 ? 1 : effacement <= 70 ? 2 : 3;
  // station: -3, -2, -1/0, +1/+2 -> 0,1,2,3
  const sPts = station <= -3 ? 0 : station <= -2 ? 1 : station <= 0 ? 2 : 3;
  const cPts = { firm: 0, medium: 1, soft: 2 }[consistency] ?? 0;
  const pPts = { posterior: 0, mid: 1, anterior: 2 }[position] ?? 0;
  const score = dPts + ePts + sPts + cPts + pPts;
  return { score, band: band(score, [
    { min: 0, max: 5, label: 'Unfavorable (induction less likely to succeed)' },
    { min: 6, max: 8, label: 'Intermediate' },
    { min: 9, max: 13, label: 'Favorable' },
  ]) };
}

// --- 149 Alvarado & Pediatric Appendicitis Score ----------------------
// Alvarado (MANTRELS): 8 features, total 0-10. M/A/N/T/R/E/L/S each 1 pt
// except tenderness 2 and leukocytosis 2.
export function alvarado({ migration, anorexia, nausea, rlqTenderness,
  reboundTenderness, elevatedTemp, leukocytosis, leftShift }) {
  let s = 0;
  if (migration) s += 1;
  if (anorexia) s += 1;
  if (nausea) s += 1;
  if (rlqTenderness) s += 2;
  if (reboundTenderness) s += 1;
  if (elevatedTemp) s += 1;
  if (leukocytosis) s += 2;
  if (leftShift) s += 1;
  return { score: s, band: band(s, [
    { min: 0, max: 4, label: 'Low (appendicitis unlikely)' },
    { min: 5, max: 6, label: 'Equivocal (consider observation/imaging)' },
    { min: 7, max: 10, label: 'High (probable appendicitis)' },
  ]) };
}

// Pediatric Appendicitis Score (Samuel 2002): 8 features, total 0-10.
// Coughing/jumping/percussion tenderness 2; RLQ tenderness 2; the rest 1.
export function pediatricAppendicitis({ coughHopTenderness, rlqTenderness,
  migration, anorexia, fever, nausea, leukocytosis, leftShift }) {
  let s = 0;
  if (coughHopTenderness) s += 2;
  if (rlqTenderness) s += 2;
  if (migration) s += 1;
  if (anorexia) s += 1;
  if (fever) s += 1;
  if (nausea) s += 1;
  if (leukocytosis) s += 1;
  if (leftShift) s += 1;
  return { score: s, band: band(s, [
    { min: 0, max: 3, label: 'Low' },
    { min: 4, max: 6, label: 'Equivocal' },
    { min: 7, max: 10, label: 'High' },
  ]) };
}

// 150 Modified Rankin Scale (reference) removed in spec-v29 wave 29-2 (Group G non-scores).

// --- 151-156 Psych screeners (configs for lib/screener.js) ------------

const phq9Opts = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];
export const PHQ9_CONFIG = {
  id: 'phq9',
  items: [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself - or that you are a failure',
    'Trouble concentrating on things',
    'Moving or speaking so slowly that other people noticed; or the opposite',
    'Thoughts that you would be better off dead, or of hurting yourself',
  ].map((p) => ({ prompt: p, options: phq9Opts })),
  severityBands: [
    { min: 0, max: 4,  label: 'Minimal depression' },
    { min: 5, max: 9,  label: 'Mild depression' },
    { min: 10, max: 14, label: 'Moderate depression' },
    { min: 15, max: 19, label: 'Moderately severe depression' },
    { min: 20, max: 27, label: 'Severe depression' },
  ],
  citation: 'Kroenke K, Spitzer RL, Williams JBW. PHQ-9. J Gen Intern Med. 2001;16(9):606-613.',
  // spec-v9 §3.3: pre-fill on first paint so the empty state is never empty.
  exampleAnswers: [1, 1, 1, 2, 1, 0, 1, 0, 0],
};

const gad7Opts = phq9Opts;
export const GAD7_CONFIG = {
  id: 'gad7',
  items: [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid as if something awful might happen',
  ].map((p) => ({ prompt: p, options: gad7Opts })),
  severityBands: [
    { min: 0, max: 4,  label: 'Minimal anxiety' },
    { min: 5, max: 9,  label: 'Mild anxiety' },
    { min: 10, max: 14, label: 'Moderate anxiety' },
    { min: 15, max: 21, label: 'Severe anxiety' },
  ],
  citation: 'Spitzer RL, et al. GAD-7. Arch Intern Med. 2006;166(10):1092-1097.',
  exampleAnswers: [1, 1, 1, 2, 0, 1, 1],
};

const auditOpts5 = [
  { label: 'Never', value: 0 },
  { label: 'Monthly or less', value: 1 },
  { label: '2-4 times a month', value: 2 },
  { label: '2-3 times a week', value: 3 },
  { label: '4 or more times a week', value: 4 },
];
const auditDrinks = [
  { label: '1 or 2', value: 0 },
  { label: '3 or 4', value: 1 },
  { label: '5 or 6', value: 2 },
  { label: '7 to 9', value: 3 },
  { label: '10 or more', value: 4 },
];
const auditFreq = [
  { label: 'Never', value: 0 },
  { label: 'Less than monthly', value: 1 },
  { label: 'Monthly', value: 2 },
  { label: 'Weekly', value: 3 },
  { label: 'Daily or almost daily', value: 4 },
];
export const AUDITC_CONFIG = {
  id: 'auditc',
  items: [
    { prompt: 'How often did you have a drink containing alcohol in the past year?', options: auditOpts5 },
    { prompt: 'How many standard drinks containing alcohol did you have on a typical day when drinking?', options: auditDrinks },
    { prompt: 'How often did you have 6 or more drinks on one occasion?', options: auditFreq },
  ],
  severityBands: [
    { min: 0, max: 2, label: 'Negative (women); use cutoff 4 for men' },
    { min: 3, max: 7, label: 'Positive: indicates risky drinking' },
    { min: 8, max: 12, label: 'Positive: high risk for alcohol use disorder' },
  ],
  citation: 'Bush K, et al. AUDIT-C. Arch Intern Med. 1998;158(16):1789-1795.',
  exampleAnswers: [2, 1, 1],
};

export const CAGE_CONFIG = {
  id: 'cage',
  items: [
    'Have you ever felt the need to Cut down on your drinking?',
    'Have people Annoyed you by criticizing your drinking?',
    'Have you ever felt Guilty about your drinking?',
    'Eye-opener: have you ever had a drink first thing in the morning?',
  ].map((p) => ({ prompt: p, options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }] })),
  severityBands: [
    { min: 0, max: 1, label: 'Negative' },
    { min: 2, max: 4, label: 'Positive: clinically significant suspicion of alcohol use disorder' },
  ],
  citation: 'Ewing JA. CAGE Questionnaire. JAMA. 1984;252(14):1905-1907.',
  exampleAnswers: [0, 0, 0, 0],
};

const epdsOpts3 = [
  { label: '0', value: 0 }, { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 },
];
export const EPDS_CONFIG = {
  id: 'epds',
  items: [
    'I have been able to laugh and see the funny side of things',
    'I have looked forward with enjoyment to things',
    'I have blamed myself unnecessarily when things went wrong',
    'I have been anxious or worried for no good reason',
    'I have felt scared or panicky for no very good reason',
    'Things have been getting on top of me',
    'I have been so unhappy that I have had difficulty sleeping',
    'I have felt sad or miserable',
    'I have been so unhappy that I have been crying',
    'The thought of harming myself has occurred to me',
  ].map((p) => ({ prompt: p, options: epdsOpts3 })),
  severityBands: [
    { min: 0, max: 9, label: 'Low likelihood' },
    { min: 10, max: 12, label: 'Possible depression - consider follow-up' },
    { min: 13, max: 30, label: 'Likely depression - clinical evaluation indicated' },
  ],
  citation: 'Cox JL, Holden JM, Sagovsky R. EPDS. Br J Psychiatry. 1987;150:782-786.',
  exampleAnswers: [1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
};

// --- 156 Mini-Cog -----------------------------------------------------
// 3-word recall (0-3) + clock draw (0 or 2). Total 0-5; >=3 not impaired.
export function miniCog({ wordsRecalled, clockNormal }) {
  const w = Math.max(0, Math.min(3, Number(wordsRecalled) || 0));
  const c = clockNormal ? 2 : 0;
  const score = w + c;
  return { score, band: score >= 3 ? 'Negative for cognitive impairment screen' : 'Positive screen - further evaluation indicated' };
}

// --- 157 CIWA-Ar (Sullivan 1989) --------------------------------------
// 9 items 0-7 + orientation 0-4. Max 67. Bands per CIWA-Ar standard.
export function ciwaAr({
  nausea = 0, tremor = 0, sweats = 0, anxiety = 0, agitation = 0,
  tactile = 0, auditory = 0, visual = 0, headache = 0, orientation = 0,
}) {
  const v7 = (n) => Math.max(0, Math.min(7, Number(n) || 0));
  const v4 = (n) => Math.max(0, Math.min(4, Number(n) || 0));
  const score = v7(nausea) + v7(tremor) + v7(sweats) + v7(anxiety) +
    v7(agitation) + v7(tactile) + v7(auditory) + v7(visual) + v7(headache) +
    v4(orientation);
  return {
    score,
    band: band(score, [
      { min: 0, max: 7, label: 'Mild withdrawal (<8): supportive care' },
      { min: 8, max: 15, label: 'Moderate (8-15)' },
      { min: 16, max: 20, label: 'Severe (16-20)' },
      { min: 21, max: 67, label: 'Very severe (>20): high seizure / DT risk' },
    ]),
  };
}

// --- 158 COWS (Wesson & Ling 2003) ------------------------------------
// 11 items with mixed ranges. Caller passes pre-graded values per the COWS
// scoring sheet.
export function cows({
  pulse = 0, sweating = 0, restlessness = 0, pupil = 0, jointAches = 0,
  runnyNose = 0, gi = 0, tremor = 0, yawning = 0, anxiety = 0, gooseflesh = 0,
}) {
  const n = (x) => Math.max(0, Number(x) || 0);
  const score = n(pulse) + n(sweating) + n(restlessness) + n(pupil) +
    n(jointAches) + n(runnyNose) + n(gi) + n(tremor) + n(yawning) +
    n(anxiety) + n(gooseflesh);
  return {
    score,
    band: band(score, [
      { min: 0, max: 4, label: 'No active withdrawal' },
      { min: 5, max: 12, label: 'Mild withdrawal' },
      { min: 13, max: 24, label: 'Moderate withdrawal' },
      { min: 25, max: 36, label: 'Moderately severe withdrawal' },
      { min: 37, max: 99, label: 'Severe withdrawal' },
    ]),
  };
}

// --- 159 ASCVD PCE (Goff 2013) ----------------------------------------
// Pooled Cohort Equations. Race-stratified (white vs African-American).
// Returns the 10-year ASCVD risk as a fraction (0-1).
const PCE_COEFFS = {
  WF: { // white (or "other") female
    lnAge: -29.799, lnAge2: 4.884,
    lnTC: 13.540, lnAgeXLnTC: -3.114,
    lnHDL: -13.578, lnAgeXLnHDL: 3.149,
    lnSbpTreated: 2.019, lnSbpUntreated: 1.957,
    smoker: 7.574, lnAgeXSmoker: -1.665,
    diabetes: 0.661,
    mean: -29.18, s0: 0.9665,
  },
  AAF: { // African-American female
    lnAge: 17.114, lnAge2: 0,
    lnTC: 0.940, lnAgeXLnTC: 0,
    lnHDL: -18.920, lnAgeXLnHDL: 4.475,
    lnSbpTreated: 29.291, lnAgeXLnSbpTreated: -6.432,
    lnSbpUntreated: 27.820, lnAgeXLnSbpUntreated: -6.087,
    smoker: 0.691, lnAgeXSmoker: 0,
    diabetes: 0.874,
    mean: 86.61, s0: 0.9533,
  },
  WM: { // white (or "other") male
    lnAge: 12.344, lnAge2: 0,
    lnTC: 11.853, lnAgeXLnTC: -2.664,
    lnHDL: -7.990, lnAgeXLnHDL: 1.769,
    lnSbpTreated: 1.797, lnSbpUntreated: 1.764,
    smoker: 7.837, lnAgeXSmoker: -1.795,
    diabetes: 0.658,
    mean: 61.18, s0: 0.9144,
  },
  AAM: { // African-American male
    lnAge: 2.469, lnAge2: 0,
    lnTC: 0.302, lnAgeXLnTC: 0,
    lnHDL: -0.307, lnAgeXLnHDL: 0,
    lnSbpTreated: 1.916, lnSbpUntreated: 1.809,
    smoker: 0.549, lnAgeXSmoker: 0,
    diabetes: 0.645,
    mean: 19.54, s0: 0.8954,
  },
};

export function ascvdPce({ age, sex, race, totalChol, hdl, sbp, treatedSbp,
  smoker, diabetes }) {
  if (age < 40 || age > 79) {
    return { score: null, band: 'PCE valid for ages 40-79 only.' };
  }
  if (sex !== 'M' && sex !== 'F') throw new RangeError('sex must be "M" or "F"');
  const isAA = race === 'AA' || race === 'african-american' || race === 'black';
  const key = (isAA ? 'AA' : 'W') + (sex === 'F' ? 'F' : 'M');
  const c = PCE_COEFFS[key];
  const lnAge = Math.log(age);
  const lnTC = Math.log(totalChol);
  const lnHDL = Math.log(hdl);
  const lnSBP = Math.log(sbp);
  let sum = c.lnAge * lnAge
          + (c.lnAge2 || 0) * lnAge * lnAge
          + c.lnTC * lnTC
          + (c.lnAgeXLnTC || 0) * lnAge * lnTC
          + c.lnHDL * lnHDL
          + (c.lnAgeXLnHDL || 0) * lnAge * lnHDL
          + (treatedSbp ? c.lnSbpTreated : c.lnSbpUntreated) * lnSBP
          + ((treatedSbp ? c.lnAgeXLnSbpTreated : c.lnAgeXLnSbpUntreated) || 0) * lnAge * lnSBP
          + (smoker ? c.smoker : 0)
          + ((smoker ? (c.lnAgeXSmoker || 0) : 0)) * lnAge
          + (diabetes ? c.diabetes : 0);
  const risk = 1 - Math.pow(c.s0, Math.exp(sum - c.mean));
  return {
    score: risk,
    pct: risk * 100,
    equation: key,
    band: risk < 0.05 ? 'Low (<5%)'
        : risk < 0.075 ? 'Borderline (5-7.5%)'
        : risk < 0.20 ? 'Intermediate (7.5-20%)'
        : 'High (>=20%)',
  };
}

// --- 160 PREVENT 2023 (race-free) -------------------------------------
// AHA PREVENT 10-yr total CVD risk equations. Coefficients per Khan SS et al.
// Circulation. 2023. Race-FREE; sex-stratified (separate eqs for women/men).
// Inputs: age, sex 'M'|'F', totalChol, hdl, sbp, treatedSbp, diabetes, smoker,
// bmi, eGFR. Returns 10-yr total CVD risk as a fraction.
//
// Implementation note: We embed only the "base" 10-yr total CVD equations
// (no statin / antihypertensive use term, no UACR, no HbA1c, no SDI). The
// Khan 2023 supplement publishes those terms; the base equation is the
// reference implementation here.
const PREVENT10_COEFFS = {
  F: {
    intercept: -3.307728,
    age: 0.7939329,        // (age-55)/10
    nonHdl: 0.0305239,     // (TC-HDL)/(38.67 mg/dL per mmol/L) - 3.5 mmol/L
    hdl: -0.1606857,       // (HDL/(38.67) - 1.3)/0.3
    sbpLow: -0.2394003,    // ((min(SBP,110)-110)/20)
    sbpHigh: 0.3600781,    // ((max(SBP,110)-130)/20)
    diabetes: 0.8667604,
    smoker: 0.5360739,
    egfrLow: 0.6045917,    // ((min(eGFR,60)-60)/-15)
    egfrHigh: 0.0433769,   // ((max(eGFR,60)-90)/-15)
    bmiLow: -0.0725011,    // ((min(BMI,30)-25)/5)
    bmiHigh: 0.1851515,    // ((max(BMI,30)-30)/5)
    sbpTrt: 0.1932924,     // antihypertensive use (omitted unless caller supplies)
  },
  M: {
    intercept: -3.031168,
    age: 0.7688528,
    nonHdl: 0.0736174,
    hdl: -0.0954431,
    sbpLow: -0.4347345,
    sbpHigh: 0.3362658,
    diabetes: 0.7692857,
    smoker: 0.4386871,
    egfrLow: 0.5378979,
    egfrHigh: 0.0164827,
    bmiLow: -0.0517874,
    bmiHigh: 0.1898084,
    sbpTrt: 0.1750239,
  },
};

export function prevent10yr({ age, sex, totalChol, hdl, sbp, treatedSbp,
  diabetes, smoker, bmi, egfr }) {
  if (age < 30 || age > 79) {
    return { score: null, band: 'PREVENT valid for ages 30-79 only.' };
  }
  if (sex !== 'M' && sex !== 'F') throw new RangeError('sex must be "M" or "F"');
  const c = PREVENT10_COEFFS[sex];
  // Convert mg/dL to mmol/L (TC, HDL): /38.67.
  const nonHdlMmol = (totalChol - hdl) / 38.67 - 3.5;
  const hdlTerm = (hdl / 38.67 - 1.3) / 0.3;
  const sbpLow = (Math.min(sbp, 110) - 110) / 20;
  const sbpHigh = (Math.max(sbp, 110) - 130) / 20;
  const egfrLow = (Math.min(egfr, 60) - 60) / -15;
  const egfrHigh = (Math.max(egfr, 60) - 90) / -15;
  const bmiLow = (Math.min(bmi, 30) - 25) / 5;
  const bmiHigh = (Math.max(bmi, 30) - 30) / 5;
  const ageTerm = (age - 55) / 10;
  let logit = c.intercept
            + c.age * ageTerm
            + c.nonHdl * nonHdlMmol
            + c.hdl * hdlTerm
            + c.sbpLow * sbpLow
            + c.sbpHigh * sbpHigh
            + (diabetes ? c.diabetes : 0)
            + (smoker ? c.smoker : 0)
            + c.egfrLow * egfrLow
            + c.egfrHigh * egfrHigh
            + c.bmiLow * bmiLow
            + c.bmiHigh * bmiHigh
            + (treatedSbp ? c.sbpTrt : 0);
  const risk = 1 / (1 + Math.exp(-logit));
  return {
    score: risk,
    pct: risk * 100,
    band: risk < 0.05 ? 'Low (<5%)'
        : risk < 0.075 ? 'Borderline (5-7.5%)'
        : risk < 0.20 ? 'Intermediate (7.5-20%)'
        : 'High (>=20%)',
  };
}

// --- spec-v12 wave 12-1: NEWS2 (Royal College of Physicians, 2017) ----
// Aggregate parameter scores per RCP 2017 Table 1; clinical-response
// trigger band per RCP 2017 Table 2.
function news2RespScore(rr) {
  if (rr <= 8) return 3;
  if (rr <= 11) return 1;
  if (rr <= 20) return 0;
  if (rr <= 24) return 2;
  return 3;
}
function news2Spo2Scale1(spo2) {
  if (spo2 <= 91) return 3;
  if (spo2 <= 93) return 2;
  if (spo2 <= 95) return 1;
  return 0;
}
// Scale 2 (hypercapnic / chronic Type II respiratory failure) - target
// 88-92% on air, with the on-supplemental-O2 columns of RCP 2017 Table 1.
function news2Spo2Scale2(spo2, onO2) {
  if (spo2 <= 83) return 3;
  if (spo2 <= 85) return 2;
  if (spo2 <= 87) return 1;
  if (spo2 <= 92) return 0;
  // 93-94, 95-96, >=97 differ by oxygen-supplementation status per RCP Table 1.
  if (!onO2) return 0;
  if (spo2 <= 94) return 1;
  if (spo2 <= 96) return 2;
  return 3;
}
function news2SbpScore(sbp) {
  if (sbp <= 90) return 3;
  if (sbp <= 100) return 2;
  if (sbp <= 110) return 1;
  if (sbp <= 219) return 0;
  return 3;
}
function news2PulseScore(p) {
  if (p <= 40) return 3;
  if (p <= 50) return 1;
  if (p <= 90) return 0;
  if (p <= 110) return 1;
  if (p <= 130) return 2;
  return 3;
}
function news2TempScore(t) {
  if (t <= 35.0) return 3;
  if (t <= 36.0) return 1;
  if (t <= 38.0) return 0;
  if (t <= 39.0) return 1;
  return 2;
}
export function news2({ rr, spo2, scale2, onO2, sbp, pulse, acvpu, temp }) {
  const r = news2RespScore(Number(rr));
  const o = scale2 ? news2Spo2Scale2(Number(spo2), !!onO2) : news2Spo2Scale1(Number(spo2));
  const air = onO2 ? 2 : 0;
  const b = news2SbpScore(Number(sbp));
  const p = news2PulseScore(Number(pulse));
  const c = (acvpu && acvpu !== 'A') ? 3 : 0;
  const tt = news2TempScore(Number(temp));
  const total = r + o + air + b + p + c + tt;
  const anyThree = [r, o, b, p, c, tt].some((x) => x === 3);
  let band;
  if (total >= 7) band = 'High (>=7): continuous monitoring; emergency assessment by critical-care team per RCP 2017 Table 2.';
  else if (total >= 5 || anyThree) band = 'Medium (aggregate 5-6, OR a single parameter scoring 3): urgent review per RCP 2017 Table 2.';
  else if (total >= 1) band = 'Low-medium (aggregate 1-4): registered nurse assesses need to escalate per RCP 2017 Table 2.';
  else band = 'Low (0): continue routine monitoring per RCP 2017 Table 2.';
  return {
    score: total,
    band,
    parts: { rr: r, spo2: o, supplementalO2: air, sbp: b, pulse: p, consciousness: c, temp: tt },
    anyParameterScoresThree: anyThree,
  };
}

// --- spec-v12 wave 12-1: MEWS (Subbe et al. QJM 2001) ----------------
// Modified Early Warning Score; aggregate per Subbe 2001 Table 1.
function mewsSbp(sbp) {
  if (sbp <= 70) return 3;
  if (sbp <= 80) return 2;
  if (sbp <= 100) return 1;
  if (sbp <= 199) return 0;
  return 2;
}
function mewsPulse(p) {
  if (p < 40) return 2;
  if (p <= 50) return 1;
  if (p <= 100) return 0;
  if (p <= 110) return 1;
  if (p <= 129) return 2;
  return 3;
}
function mewsRr(rr) {
  if (rr < 9) return 2;
  if (rr <= 14) return 0;
  if (rr <= 20) return 1;
  if (rr <= 29) return 2;
  return 3;
}
function mewsTemp(t) {
  if (t < 35) return 2;
  if (t <= 38.4) return 0;
  return 2;
}
function mewsAvpu(a) {
  return { A: 0, V: 1, P: 2, U: 3 }[a] ?? 0;
}
export function mews({ sbp, pulse, rr, temp, avpu }) {
  const b = mewsSbp(Number(sbp));
  const p = mewsPulse(Number(pulse));
  const r = mewsRr(Number(rr));
  const tt = mewsTemp(Number(temp));
  const c = mewsAvpu(avpu);
  const total = b + p + r + tt + c;
  let band;
  if (total >= 5) band = '>=5: increased risk of death, ICU admission, and HDU admission per Subbe 2001 Table 2.';
  else if (total === 4) band = '4: intermediate risk band per Subbe 2001 Table 2.';
  else if (total === 3) band = '3: low-intermediate risk band per Subbe 2001 Table 2.';
  else band = '0-2: low risk band per Subbe 2001 Table 2.';
  return {
    score: total,
    band,
    parts: { sbp: b, pulse: p, rr: r, temp: tt, avpu: c },
  };
}

// --- spec-v12 wave 12-2: PESI (Aujesky et al. AJRCCM 2005) -----------
// Original 11-variable model. Age in years is the dominant contributor;
// other variables add fixed weights per Aujesky 2005 Table 2. Class
// I-V mortality per Aujesky 2005 Table 4.
export function pesi({ age, sex, cancer, heartFailure, chronicLungDisease,
  hr110, sbp100, rr30, tempLt36, alteredMental, sao2Lt90 }) {
  let s = Number(age) || 0;
  if (sex === 'M') s += 10;
  if (cancer) s += 30;
  if (heartFailure) s += 10;
  if (chronicLungDisease) s += 10;
  if (hr110) s += 20;
  if (sbp100) s += 30;
  if (rr30) s += 20;
  if (tempLt36) s += 20;
  if (alteredMental) s += 60;
  if (sao2Lt90) s += 20;
  let cls, band;
  if      (s <= 65)  { cls = 'I';   band = 'Class I (very low risk; 30-day mortality 0.0-1.6% per Aujesky 2005 Table 4).'; }
  else if (s <= 85)  { cls = 'II';  band = 'Class II (low risk; 30-day mortality 1.7-3.5% per Aujesky 2005 Table 4).'; }
  else if (s <= 105) { cls = 'III'; band = 'Class III (intermediate risk; 30-day mortality 3.2-7.1% per Aujesky 2005 Table 4).'; }
  else if (s <= 125) { cls = 'IV';  band = 'Class IV (high risk; 30-day mortality 4.0-11.4% per Aujesky 2005 Table 4).'; }
  else               { cls = 'V';   band = 'Class V (very high risk; 30-day mortality 10.0-24.5% per Aujesky 2005 Table 4).'; }
  return { score: s, class: cls, band };
}

// --- spec-v12 wave 12-2: sPESI (Jimenez et al. Arch Intern Med 2010) ---
// Six binary criteria; one point each. 0 -> low risk, >=1 -> not-low.
export function spesi({ ageOver80, cancer, chronicCardiopulmonary,
  hr110, sbp100, sao2Lt90 }) {
  const s = [ageOver80, cancer, chronicCardiopulmonary, hr110, sbp100, sao2Lt90]
    .filter(Boolean).length;
  return {
    score: s,
    band: s === 0
      ? 'sPESI 0: low risk; 30-day all-cause mortality 1.0% per Jimenez 2010 Table 3.'
      : 'sPESI >=1: not-low risk; 30-day all-cause mortality 10.9% per Jimenez 2010 Table 3.',
  };
}

// --- spec-v12 wave 12-2: Padua Prediction Score (Barbar JTH 2010) -----
// Weighted 11-item model; >=4 is the high-risk threshold per Barbar
// 2010 §Results.
export function padua({ activeCancer, priorVte, reducedMobility, thrombophilia,
  recentTrauma, ageOver70, heartOrRespFailure, miOrStroke,
  acuteInfectionOrRheum, bmi30, hormonalTreatment }) {
  let s = 0;
  if (activeCancer) s += 3;
  if (priorVte) s += 3;
  if (reducedMobility) s += 3;
  if (thrombophilia) s += 3;
  if (recentTrauma) s += 2;
  if (ageOver70) s += 1;
  if (heartOrRespFailure) s += 1;
  if (miOrStroke) s += 1;
  if (acuteInfectionOrRheum) s += 1;
  if (bmi30) s += 1;
  if (hormonalTreatment) s += 1;
  return {
    score: s,
    band: s >= 4
      ? 'Padua >=4: high risk; 90-day VTE 11.0% if untreated per Barbar 2010 Table 4. Prophylaxis-eligible per Barbar 2010 Results.'
      : 'Padua <4: low risk; 90-day VTE 0.3% without prophylaxis per Barbar 2010 Table 4.',
  };
}

// --- spec-v12 wave 12-3: Glasgow-Blatchford Score (Blatchford 2000) ---
// Per Blatchford 2000 Table 1. BUN is in mg/dL (SI conversion done by
// the renderer if needed; 1 mmol/L urea = 2.8 mg/dL urea nitrogen).
function gbsBunPoints(bunMgDl) {
  // Blatchford 2000 Table 1 BUN bands (converted from SI mmol/L urea):
  // 6.5-7.9 mmol/L = 18.2-22.4 mg/dL BUN: 2
  // 8.0-9.9             22.4-28      : 3
  // 10.0-25.0           28-70        : 4
  // >=25.0              >=70         : 6
  if (bunMgDl >= 70) return 6;
  if (bunMgDl >= 28) return 4;
  if (bunMgDl >= 22.4) return 3;
  if (bunMgDl >= 18.2) return 2;
  return 0;
}
function gbsHgbPoints(hgbGdl, sex) {
  if (sex === 'M') {
    if (hgbGdl < 10) return 6;
    if (hgbGdl < 12) return 3;
    if (hgbGdl < 13) return 1;
    return 0;
  }
  // Female (Blatchford 2000 Table 1 has only two bands for women).
  if (hgbGdl < 10) return 6;
  if (hgbGdl < 12) return 1;
  return 0;
}
function gbsSbpPoints(sbp) {
  if (sbp < 90) return 3;
  if (sbp < 100) return 2;
  if (sbp < 110) return 1;
  return 0;
}
export function gbs({ bunMgDl, hgbGdl, sex, sbp, pulse100, melena,
  syncope, hepaticDisease, cardiacFailure }) {
  const parts = {
    bun: gbsBunPoints(Number(bunMgDl)),
    hgb: gbsHgbPoints(Number(hgbGdl), sex),
    sbp: gbsSbpPoints(Number(sbp)),
    pulse: pulse100 ? 1 : 0,
    melena: melena ? 1 : 0,
    syncope: syncope ? 2 : 0,
    hepaticDisease: hepaticDisease ? 2 : 0,
    cardiacFailure: cardiacFailure ? 2 : 0,
  };
  const score = parts.bun + parts.hgb + parts.sbp + parts.pulse
    + parts.melena + parts.syncope + parts.hepaticDisease + parts.cardiacFailure;
  return {
    score,
    band: score === 0
      ? 'GBS 0: low risk; can be considered for outpatient management per Blatchford 2000 §Results (cutoff endorsed by NICE CG141 2012).'
      : 'GBS >=1: not in the Blatchford 2000 low-risk group; inpatient assessment per source.',
    parts,
  };
}

// --- spec-v12 wave 12-3: Rockall Score (Rockall 1996) -----------------
// Complete (post-endoscopy) Rockall is the primary published model. A
// `preEndoscopy` flag exposes the Vreeburg 1999 / NICE CG141 pre-
// endoscopy variant (omits endoscopic diagnosis and stigmata; range 0-7).
export function rockall({ ageBand, shock, comorbidity, endoscopicDx,
  stigmata, preEndoscopy = false }) {
  // ageBand: 0 (<60), 1 (60-79), 2 (>=80)
  // shock: 0 (none), 1 (tachy HR>=100, SBP>=100), 2 (hypoT SBP<100)
  // comorbidity: 0 (none), 2 (CHF/IHD/major morbidity), 3 (renal/hepatic failure or metastatic CA)
  // endoscopicDx: 0 (Mallory-Weiss or no lesion), 1 (all other), 2 (upper GI malignancy)
  // stigmata: 0 (clean base or dark spot), 2 (blood, adherent clot, visible/spurting vessel)
  const a = Math.max(0, Math.min(2, Number(ageBand) || 0));
  const s = Math.max(0, Math.min(2, Number(shock) || 0));
  const co = Math.max(0, Math.min(3, Number(comorbidity) || 0));
  const score = preEndoscopy
    ? a + s + co
    : a + s + co + Math.max(0, Math.min(2, Number(endoscopicDx) || 0))
      + Math.max(0, Math.min(2, Number(stigmata) || 0));
  let band;
  if (preEndoscopy) {
    band = score === 0
      ? 'Pre-endoscopy Rockall 0: very low risk; outpatient management often appropriate per Vreeburg 1999 / NICE CG141 endorsement.'
      : `Pre-endoscopy Rockall ${score}: see Vreeburg 1999 / NICE CG141 for endoscopic-triage guidance.`;
  } else {
    // Complete (post-endoscopy) Rockall mortality bands per Rockall 1996 Figure 2.
    if (score <= 2) band = 'Complete Rockall 0-2: low risk; mortality 0.1-0.4% per Rockall 1996 Figure 2.';
    else if (score <= 4) band = 'Complete Rockall 3-4: intermediate risk; mortality 5.3-11.2% per Rockall 1996 Figure 2.';
    else if (score <= 7) band = 'Complete Rockall 5-7: high risk; mortality 24.6-39.6% per Rockall 1996 Figure 2.';
    else band = 'Complete Rockall 8+: very high risk; mortality >=40% per Rockall 1996 Figure 2.';
  }
  return { score, band, preEndoscopy };
}

// --- spec-v12 wave 12-3: AIMS65 (Saltzman 2011) -----------------------
export function aims65({ albuminLt3, inrGt15, alteredMental,
  sbpLe90, ageGt65 }) {
  const score = [albuminLt3, inrGt15, alteredMental, sbpLe90, ageGt65]
    .filter(Boolean).length;
  // In-hospital mortality per Saltzman 2011 Table 4.
  let band;
  if (score === 0) band = 'AIMS65 0: in-hospital mortality 0.3% per Saltzman 2011 Table 4.';
  else if (score === 1) band = 'AIMS65 1: in-hospital mortality 1.2% per Saltzman 2011 Table 4.';
  else if (score === 2) band = 'AIMS65 2: in-hospital mortality 5.3% per Saltzman 2011 Table 4.';
  else if (score === 3) band = 'AIMS65 3: in-hospital mortality 10.3% per Saltzman 2011 Table 4.';
  else if (score === 4) band = 'AIMS65 4: in-hospital mortality 16.5% per Saltzman 2011 Table 4.';
  else band = 'AIMS65 5: in-hospital mortality 24.5% per Saltzman 2011 Table 4.';
  return { score, band };
}

// --- spec-v12 wave 12-3: Oakland Score (Oakland 2017) -----------------
// Lower-GI bleed safe-discharge model. Weights per Oakland 2017 Table 2.
// Hemoglobin is given in g/dL (SI conversion to g/L by the renderer if
// needed; 1 g/dL = 10 g/L).
function oaklandAge(age) {
  if (age < 40) return 0;
  if (age < 70) return 1;
  return 2;
}
function oaklandHr(hr) {
  if (hr < 70) return 0;
  if (hr < 90) return 1;
  if (hr < 110) return 2;
  return 3;
}
function oaklandSbp(sbp) {
  // Oakland 2017 Table 2: 50-89 = 5; 90-119 = 4; 120-129 = 3; 130-159 = 2; >=160 = 0.
  if (sbp < 90) return 5;
  if (sbp < 120) return 4;
  if (sbp < 130) return 3;
  if (sbp < 160) return 2;
  return 0;
}
function oaklandHgb(hgbGdl) {
  // Bands in g/L per Oakland 2017 Table 2; convert hgb to g/L.
  const hgbGL = hgbGdl * 10;
  if (hgbGL < 70) return 22;
  if (hgbGL < 90) return 17;
  if (hgbGL < 110) return 13;
  if (hgbGL < 130) return 8;
  if (hgbGL < 160) return 4;
  return 0;
}
export function oakland({ age, sex, priorLgibAdmission, dreBlood,
  hr, sbp, hgbGdl }) {
  const parts = {
    age: oaklandAge(Number(age)),
    sex: sex === 'M' ? 1 : 0,
    priorLgibAdmission: priorLgibAdmission ? 1 : 0,
    dreBlood: dreBlood ? 1 : 0,
    hr: oaklandHr(Number(hr)),
    sbp: oaklandSbp(Number(sbp)),
    hgb: oaklandHgb(Number(hgbGdl)),
  };
  const score = parts.age + parts.sex + parts.priorLgibAdmission
    + parts.dreBlood + parts.hr + parts.sbp + parts.hgb;
  return {
    score,
    band: score <= 8
      ? 'Oakland <=8: safe for outpatient management (95% probability of safe discharge per Oakland 2017; cutoff endorsed by BSG 2019).'
      : 'Oakland >8: not in the safe-discharge band; inpatient assessment per Oakland 2017.',
    parts,
  };
}

// --- spec-v12 wave 12-4: Maddrey Discriminant Function (Maddrey 1978) ---
// DF = 4.6 * (patient PT - control PT) + bilirubin (mg/dL).
// Cutoff DF >= 32 = severe alcoholic hepatitis (Maddrey 1978 §Results).
export function maddreyDf({ patientPtSec, controlPtSec, bilirubinMgDl }) {
  const pt = Number(patientPtSec);
  const ctrl = Number(controlPtSec);
  const bili = Number(bilirubinMgDl);
  if (!(pt > 0)) throw new RangeError('patientPtSec must be positive');
  if (!(ctrl > 0)) throw new RangeError('controlPtSec must be positive');
  if (!(bili >= 0)) throw new RangeError('bilirubinMgDl must be non-negative');
  const df = 4.6 * (pt - ctrl) + bili;
  const severe = df >= 32;
  return {
    df,
    severe,
    band: severe
      ? 'Maddrey DF >=32: severe alcoholic hepatitis per Maddrey 1978 §Results; corticosteroid therapy commonly considered.'
      : 'Maddrey DF <32: not in the severe alcoholic hepatitis band per Maddrey 1978 §Results.',
  };
}

// --- spec-v12 wave 12-4: Lille Model (Louvet 2007) --------------------
// Louvet A, et al. Hepatology. 2007;45(6):1348-1354. Lille =
// exp(-R) / (1 + exp(-R)) where
// R = 3.19 - 0.101*age + 0.147*albumin(g/L) + 0.0165*(bili0 - bili7)(umol/L)
//     - 0.206*renalInsufficiency - 0.0065*bili0(umol/L) - 0.0096*PT(sec).
// renalInsufficiency = 1 if creatinine > 1.3 mg/dL (~115 umol/L) else 0.
// Cutoff >= 0.45 predicts non-response (6-mo survival ~25% vs ~85%).
// Inputs accepted in US units (bilirubin mg/dL, creatinine mg/dL,
// albumin g/dL); converted internally.
export function lille({ ageYears, albuminGDl, creatinineMgDl,
  bilirubinDay0MgDl, bilirubinDay7MgDl, ptSec }) {
  const age = Number(ageYears);
  const albGDl = Number(albuminGDl);
  const cr = Number(creatinineMgDl);
  const b0 = Number(bilirubinDay0MgDl);
  const b7 = Number(bilirubinDay7MgDl);
  const pt = Number(ptSec);
  if (!(age > 0)) throw new RangeError('ageYears must be positive');
  if (!(albGDl > 0)) throw new RangeError('albuminGDl must be positive');
  if (!(cr > 0)) throw new RangeError('creatinineMgDl must be positive');
  if (!(b0 >= 0)) throw new RangeError('bilirubinDay0MgDl must be non-negative');
  if (!(b7 >= 0)) throw new RangeError('bilirubinDay7MgDl must be non-negative');
  if (!(pt > 0)) throw new RangeError('ptSec must be positive');
  const albGL = albGDl * 10;
  // Bilirubin: 1 mg/dL = 17.1 umol/L (Louvet 2007 uses SI units).
  const b0Umol = b0 * 17.1;
  const b7Umol = b7 * 17.1;
  const renalInsuf = cr > 1.3 ? 1 : 0;
  const R = 3.19 - 0.101 * age + 0.147 * albGL
    + 0.0165 * (b0Umol - b7Umol) - 0.206 * renalInsuf
    - 0.0065 * b0Umol - 0.0096 * pt;
  const score = Math.exp(-R) / (1 + Math.exp(-R));
  const nonResponder = score >= 0.45;
  return {
    score,
    nonResponder,
    band: nonResponder
      ? 'Lille >=0.45: predicts non-response to steroids (6-month survival ~25% per Louvet 2007).'
      : 'Lille <0.45: predicts response to steroids (6-month survival ~85% per Louvet 2007).',
  };
}

// --- spec-v12 wave 12-5 §3.5.1: Canadian CT Head Rule (Stiell 2001) ---
// Inputs are GCS 13-15 blunt head injury with witnessed LOC, definite
// amnesia, or witnessed disorientation. Returns CT recommended yes/no
// per Stiell 2001 §Results.
export function cthr({ highRisk, mediumRisk }) {
  // highRisk = any of: GCS<15 at 2h, suspected open/depressed skull fx,
  //   sign of basal skull fx, >=2 vomiting episodes, age>=65.
  // mediumRisk = any of: retrograde amnesia >=30 min, dangerous mechanism.
  const anyHigh = !!highRisk;
  const anyMedium = !!mediumRisk;
  const ctRecommended = anyHigh || anyMedium;
  return {
    ctRecommended,
    band: anyHigh
      ? 'CT recommended: high-risk criterion present (need for neurosurgical intervention concern) per Stiell 2001.'
      : anyMedium
        ? 'CT recommended: medium-risk criterion present (clinically important brain injury concern) per Stiell 2001.'
        : 'CT not required by Canadian CT Head Rule per Stiell 2001 (rule applies to GCS 13-15 blunt head injury with witnessed LOC, definite amnesia, or witnessed disorientation).',
  };
}

// --- spec-v12 wave 12-5 §3.5.2: Canadian C-Spine Rule (Stiell 2001) ---
// Three-step algorithm per Stiell 2001 §Methods.
export function ccsr({ highRisk, lowRisk, canRotate45 }) {
  // highRisk: any of age>=65, dangerous mechanism, paresthesias in extremities.
  // lowRisk: any of simple rear-end MVC, sitting position in ED, ambulatory at
  //   any time, delayed onset of neck pain, absent midline c-spine tenderness.
  // canRotate45: actively rotate neck 45 degrees left and right.
  if (highRisk) return {
    imagingRecommended: true,
    band: 'Imaging recommended: high-risk factor present (age >= 65, dangerous mechanism, or paresthesias) per Stiell 2001 step 1.',
  };
  if (!lowRisk) return {
    imagingRecommended: true,
    band: 'Imaging recommended: no low-risk factor permits safe range-of-motion assessment per Stiell 2001 step 2.',
  };
  if (!canRotate45) return {
    imagingRecommended: true,
    band: 'Imaging recommended: unable to rotate neck 45 degrees left and right per Stiell 2001 step 3.',
  };
  return {
    imagingRecommended: false,
    band: 'Imaging not required: low-risk factor present and able to rotate neck 45 degrees actively per Stiell 2001.',
  };
}

// --- spec-v12 wave 12-5 §3.5.3: PECARN Pediatric Head Injury Rule ---
// Kuppermann 2009. Two age branches (<2 and >=2). Returns one of three
// risk tiers with the Kuppermann 2009 ciTBI rate per tier.
export function pecarnHead({ ageYears, gcs15, palpableSkullFx, basalSkullFxSigns,
  ams, locSec, vomiting, severeMechanism, occipitalParietalTemporalHematoma,
  notActingNormally, severeHeadache }) {
  const isUnder2 = Number(ageYears) < 2;
  // High-risk: any of GCS<15, signs of basal skull fx (>=2) or palpable skull fx (<2), or AMS.
  // PECARN AMS includes agitation, somnolence, repetitive questioning, slow response.
  const highRiskUnder2 = !gcs15 || palpableSkullFx || ams;
  const highRiskOver2 = !gcs15 || basalSkullFxSigns || ams;
  const highRisk = isUnder2 ? highRiskUnder2 : highRiskOver2;
  if (highRisk) return {
    tier: 'high',
    ciTbiRiskPct: 4.4,
    band: 'High risk: ciTBI ~4.4% (age <2) / ~4.3% (age >=2) per Kuppermann 2009. CT recommended.',
  };
  // Intermediate-risk: any of the secondary predictors per age branch.
  const intermediateUnder2 = (Number(locSec) >= 5) || severeMechanism
    || occipitalParietalTemporalHematoma || notActingNormally;
  const intermediateOver2 = !!locSec || vomiting || severeMechanism || severeHeadache;
  const intermediate = isUnder2 ? intermediateUnder2 : intermediateOver2;
  if (intermediate) return {
    tier: 'intermediate',
    ciTbiRiskPct: 0.9,
    band: 'Intermediate risk: ciTBI ~0.9% per Kuppermann 2009. Observation versus CT based on physician experience, multiple findings, parent preference, age <3 months, and worsening symptoms.',
  };
  return {
    tier: 'very-low',
    ciTbiRiskPct: isUnder2 ? 0.02 : 0.05,
    band: isUnder2
      ? 'Very low risk: ciTBI <0.02% per Kuppermann 2009. CT not recommended.'
      : 'Very low risk: ciTBI <0.05% per Kuppermann 2009. CT not recommended.',
  };
}

// --- spec-v12 wave 12-5 §3.5.4: Ottawa Ankle Rules (Stiell 1992) -----
export function ottawaAnkle({ malleolarPain, lateralMalleolusTender,
  medialMalleolusTender, ankleCannotBearWeight,
  midfootPain, fifthMetatarsalTender, navicularTender,
  footCannotBearWeight }) {
  // Ankle x-ray: pain in malleolar zone AND any of (lateral malleolus
  // tenderness, medial malleolus tenderness, inability to bear weight).
  const ankleXray = !!malleolarPain && (lateralMalleolusTender
    || medialMalleolusTender || ankleCannotBearWeight);
  // Foot x-ray: pain in midfoot zone AND any of (5th MT tenderness,
  // navicular tenderness, inability to bear weight).
  const footXray = !!midfootPain && (fifthMetatarsalTender
    || navicularTender || footCannotBearWeight);
  let band;
  if (ankleXray && footXray) band = 'Ankle AND foot x-ray indicated per Stiell 1992.';
  else if (ankleXray) band = 'Ankle x-ray indicated per Stiell 1992.';
  else if (footXray) band = 'Foot x-ray indicated per Stiell 1992.';
  else band = 'No imaging indicated by Ottawa Ankle Rules per Stiell 1992 (rule for patients >=18; pediatric variant Plint 1999 deferred to a future spec).';
  return { ankleXray, footXray, band };
}

// --- spec-v12 wave 12-5 §3.5.5: Ottawa SAH Rule (Perry 2013) ---------
// Apply only to alert patients >=15 with new severe non-traumatic
// headache peaking within 1 hour; exclude new neurologic deficit, prior
// aneurysm/SAH/brain tumor, or recurrent identical-pattern headaches.
export function ottawaSah({ ageGe40, neckPainOrStiffness, witnessedLoc,
  onsetDuringExertion, thunderclapHeadache, limitedNeckFlexion,
  exclusionCriteriaPresent = false }) {
  if (exclusionCriteriaPresent) return {
    applicable: false,
    cannotRuleOut: null,
    band: 'Ottawa SAH Rule does not apply: an exclusion criterion is present (new neurologic deficit, prior aneurysm/SAH/brain tumor, recurrent identical headaches, or age <15) per Perry 2013.',
  };
  const anyPositive = !!ageGe40 || !!neckPainOrStiffness || !!witnessedLoc
    || !!onsetDuringExertion || !!thunderclapHeadache || !!limitedNeckFlexion;
  return {
    applicable: true,
    cannotRuleOut: anyPositive,
    band: anyPositive
      ? 'Cannot rule out SAH by Ottawa SAH Rule: further workup indicated per Perry 2013 (100% sensitivity in the derivation cohort).'
      : 'Rule out SAH by Ottawa SAH Rule: all six criteria negative per Perry 2013 (100% sensitivity in the derivation cohort).',
  };
}

// --- spec-v12 wave 12-6 §3.6.1: HOSPITAL Score (Donze 2013) -----------
// Weighted sum per Donze 2013 Table 2; risk bands per Donze 2013 Table 4.
function hospitalAdmissionsPoints(prior) {
  // 0 / 1 / 2 / 3-4 / >=5 -> 0 / 0 / 0 / 2 / 5
  if (prior >= 5) return 5;
  if (prior >= 3) return 2;
  return 0;
}
export function hospitalScore({ hgbLt12, oncologyDischarge, sodiumLt135,
  anyProcedure, urgentAdmission, priorAdmissions12mo, losGe5 }) {
  const parts = {
    hgbLt12: hgbLt12 ? 1 : 0,
    oncologyDischarge: oncologyDischarge ? 2 : 0,
    sodiumLt135: sodiumLt135 ? 1 : 0,
    anyProcedure: anyProcedure ? 1 : 0,
    urgentAdmission: urgentAdmission ? 1 : 0,
    priorAdmissions: hospitalAdmissionsPoints(Number(priorAdmissions12mo) || 0),
    losGe5: losGe5 ? 2 : 0,
  };
  const score = parts.hgbLt12 + parts.oncologyDischarge + parts.sodiumLt135
    + parts.anyProcedure + parts.urgentAdmission + parts.priorAdmissions
    + parts.losGe5;
  let band;
  if (score <= 4) band = 'HOSPITAL 0-4: low risk; 30-day potentially-avoidable readmission ~5.8% per Donze 2013 Table 4.';
  else if (score <= 6) band = 'HOSPITAL 5-6: intermediate risk; 30-day potentially-avoidable readmission ~11.9% per Donze 2013 Table 4.';
  else band = 'HOSPITAL >=7: high risk; 30-day potentially-avoidable readmission ~22.8% per Donze 2013 Table 4.';
  return { score, band, parts };
}

// --- spec-v12 wave 12-6 §3.6.2: LACE Index (van Walraven 2010) --------
// Length of stay, Acute admission, Charlson, Emergency visits in 6 mo.
function lacePointsLos(days) {
  // Per van Walraven 2010 Table 3: 1=1, 2=2, 3=3, 4-6=4, 7-13=5, 14+=7.
  if (days < 1) return 0;
  if (days === 1) return 1;
  if (days === 2) return 2;
  if (days === 3) return 3;
  if (days <= 6) return 4;
  if (days <= 13) return 5;
  return 7;
}
function lacePointsCharlson(c) {
  // 0=0, 1=1, 2=2, 3=3, >=4=5 per van Walraven 2010 Table 3.
  if (c <= 0) return 0;
  if (c === 1) return 1;
  if (c === 2) return 2;
  if (c === 3) return 3;
  return 5;
}
function lacePointsEd(visits) {
  // 0=0, 1=1, 2=2, 3=3, >=4=4 per van Walraven 2010 Table 3.
  if (visits <= 0) return 0;
  if (visits >= 4) return 4;
  return visits;
}
export function lace({ losDays, acuteAdmission, charlsonScore, edVisits6mo }) {
  const parts = {
    los: lacePointsLos(Number(losDays) || 0),
    acute: acuteAdmission ? 3 : 0,
    charlson: lacePointsCharlson(Number(charlsonScore) || 0),
    ed: lacePointsEd(Number(edVisits6mo) || 0),
  };
  const score = parts.los + parts.acute + parts.charlson + parts.ed;
  let band;
  if (score <= 4) band = 'LACE 0-4: low risk of 30-day death or unplanned readmission per van Walraven 2010 Figure 2.';
  else if (score <= 9) band = 'LACE 5-9: moderate risk of 30-day death or unplanned readmission per van Walraven 2010 Figure 2.';
  else band = 'LACE >=10: high risk of 30-day death or unplanned readmission per van Walraven 2010 Figure 2.';
  return { score, band, parts };
}

// --- spec-v12 wave 12-7 §3.7.1: Charlson Comorbidity Index ------------
// Weights per Charlson 1987 Table 3 plus age adjustment per Charlson
// 1994 (1 point per decade >=50, max 4 at >=80).
// 1-pt: MI, CHF, PVD, CVD, dementia, COPD, connective tissue dz,
//        peptic ulcer dz, mild liver dz, diabetes uncomplicated.
// 2-pt: hemiplegia, moderate/severe renal dz, diabetes w/ end-organ
//        damage, any tumor (within 5 yr), leukemia, lymphoma.
// 3-pt: moderate or severe liver disease.
// 6-pt: metastatic solid tumor, AIDS.
export function charlson({ items = {}, ageYears = 0 } = {}) {
  const W = {
    mi: 1, chf: 1, pvd: 1, cvd: 1, dementia: 1, copd: 1,
    connectiveTissue: 1, pud: 1, mildLiver: 1, diabetesUncomplicated: 1,
    hemiplegia: 2, modSevereRenal: 2, diabetesEndOrgan: 2,
    anyTumor: 2, leukemia: 2, lymphoma: 2,
    modSevereLiver: 3,
    metastaticSolidTumor: 6, aids: 6,
  };
  // Severity dominance: if diabetes-end-organ is checked, ignore the
  // 1-pt uncomplicated-diabetes weight (Charlson 1987 §Methods uses the
  // more severe class only). Same for mild vs moderate/severe liver.
  const adj = { ...items };
  if (adj.diabetesEndOrgan) adj.diabetesUncomplicated = false;
  if (adj.modSevereLiver) adj.mildLiver = false;
  if (adj.metastaticSolidTumor) adj.anyTumor = false;
  let comorbidity = 0;
  for (const [k, w] of Object.entries(W)) if (adj[k]) comorbidity += w;
  let ageAdj = 0;
  const age = Number(ageYears) || 0;
  if (age >= 50) ageAdj = Math.min(4, Math.floor((age - 40) / 10));
  const score = comorbidity + ageAdj;
  let band;
  if (score === 0) band = 'Charlson 0: estimated 10-year survival ~98% (12% mortality) per Charlson 1987 Table 4.';
  else if (score <= 2) band = 'Charlson 1-2: estimated 10-year mortality ~26% per Charlson 1987 Table 4.';
  else if (score <= 4) band = 'Charlson 3-4: estimated 10-year mortality ~52% per Charlson 1987 Table 4.';
  else band = 'Charlson >=5: estimated 10-year mortality ~85% per Charlson 1987 Table 4.';
  return { score, comorbidity, ageAdj, band };
}

// --- spec-v12 wave 12-7 §3.7.2: Clinical Frailty Scale (Rockwood 2005) ---
// 9-level picker; the renderer ships the canonical Rockwood 2005 /
// Dalhousie 2020 v2 descriptors.
export function cfs({ level }) {
  const descriptors = {
    1: 'Very fit',
    2: 'Well',
    3: 'Managing well',
    4: 'Living with very mild frailty',
    5: 'Living with mild frailty',
    6: 'Living with moderate frailty',
    7: 'Living with severe frailty',
    8: 'Living with very severe frailty',
    9: 'Terminally ill',
  };
  // spec-v53 §3.1/§3.2: a non-finite level (empty/garbage input) used to clamp to
  // NaN and leak "CFS 9 (undefined)" into the rendered band. Reject it cleanly.
  const n = Math.round(Number(level));
  if (!Number.isFinite(n)) return { level: null, descriptor: null, band: 'Enter a Clinical Frailty Scale level (1-9).' };
  const lv = Math.max(1, Math.min(9, n));
  let band;
  if (lv <= 3) band = `CFS ${lv} (${descriptors[lv]}): not frail per Rockwood 2005.`;
  else if (lv === 4) band = `CFS 4 (${descriptors[lv]}): vulnerable / pre-frail per Rockwood 2005.`;
  else if (lv <= 6) band = `CFS ${lv} (${descriptors[lv]}): mild-to-moderate frailty per Rockwood 2005; increased risk of adverse outcomes.`;
  else if (lv <= 8) band = `CFS ${lv} (${descriptors[lv]}): severe frailty per Rockwood 2005; high risk of adverse outcomes.`;
  else band = `CFS 9 (${descriptors[lv]}): approaching end of life (life expectancy <6 months) per Rockwood 2005.`;
  return { level: lv, descriptor: descriptors[lv], band };
}

// --- spec-v12 wave 12-7 §3.7.3: ECOG + Karnofsky Performance Status ----
// Two coupled pickers (ECOG 0-5 and KPS 100-0 in steps of 10) with the
// Buccheri 1996 crosswalk. Picking one auto-suggests the other; the
// renderer lets the user override.
export function ecogKarnofsky({ ecog, kps }) {
  const ecogDesc = {
    0: 'Fully active; able to carry on all pre-disease performance without restriction.',
    1: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature.',
    2: 'Ambulatory and capable of all self-care but unable to carry out any work activities. Up and about >50% of waking hours.',
    3: 'Capable of only limited self-care; confined to bed or chair >50% of waking hours.',
    4: 'Completely disabled. Cannot carry on any self-care. Totally confined to bed or chair.',
    5: 'Dead.',
  };
  const kpsDesc = {
    100: 'Normal; no complaints; no evidence of disease.',
    90: 'Able to carry on normal activity; minor signs or symptoms of disease.',
    80: 'Normal activity with effort; some signs or symptoms of disease.',
    70: 'Cares for self; unable to carry on normal activity or do active work.',
    60: 'Requires occasional assistance but able to care for most personal needs.',
    50: 'Requires considerable assistance and frequent medical care.',
    40: 'Disabled; requires special care and assistance.',
    30: 'Severely disabled; hospital admission indicated although death not imminent.',
    20: 'Very sick; hospital admission necessary; active supportive treatment necessary.',
    10: 'Moribund; fatal processes progressing rapidly.',
    0: 'Dead.',
  };
  // Buccheri 1996 ECOG <-> KPS crosswalk:
  // ECOG 0 = KPS 100/90; 1 = 80/70; 2 = 60/50; 3 = 40/30; 4 = 20/10; 5 = 0.
  const crosswalk = { 0: 90, 1: 80, 2: 60, 3: 40, 4: 20, 5: 0 };
  const e = (ecog == null || ecog === '') ? null : Math.max(0, Math.min(5, Math.round(Number(ecog))));
  const k = (kps == null || kps === '') ? null : Math.max(0, Math.min(100, Math.round(Number(kps) / 10) * 10));
  return {
    ecog: e,
    kps: k,
    ecogDescriptor: e == null ? null : ecogDesc[e],
    kpsDescriptor: k == null ? null : kpsDesc[k],
    suggestedKps: e == null ? null : crosswalk[e],
  };
}

// --- spec-v12 wave 12-8 §3.8.1: Killip Classification (Killip 1967) ---
// Four-row picker; bands per Killip & Kimball 1967 original cohort
// in-hospital mortality (I 6%, II 17%, III 38%, IV 81%). The GUSTO-I
// 1995 contemporary cohort (Lee 1995) is referenced as a secondary
// citation in the META interpretation block.
export function killip({ klass }) {
  const k = Math.max(1, Math.min(4, Math.round(Number(klass)) || 1));
  const descriptors = {
    1: 'I - No signs of heart failure.',
    2: 'II - Rales / S3 gallop / elevated jugular venous pressure.',
    3: 'III - Acute pulmonary edema.',
    4: 'IV - Cardiogenic shock (hypotension, oliguria, cold extremities).',
  };
  const mortality = { 1: 6, 2: 17, 3: 38, 4: 81 };
  return {
    klass: k,
    descriptor: descriptors[k],
    inHospitalMortalityPct: mortality[k],
    band: `Killip ${descriptors[k].split(' - ')[0]}: in-hospital mortality ${mortality[k]}% in the Killip 1967 original cohort.`,
  };
}

// --- spec-v12 wave 12-8 §3.9.1: SIRS Criteria (Bone 1992) -------------
// Count of four SIRS criteria. >=2 = SIRS per Bone 1992. Sepsis-3
// (Singer 2016, JAMA) is referenced inline: SIRS is no longer the
// preferred sepsis-screen criterion.
export function sirs({ tempAbnormal, hrGt90, rrOrPaco2, wbcOrBands }) {
  const parts = {
    temp: tempAbnormal ? 1 : 0,
    hr: hrGt90 ? 1 : 0,
    resp: rrOrPaco2 ? 1 : 0,
    wbc: wbcOrBands ? 1 : 0,
  };
  const count = parts.temp + parts.hr + parts.resp + parts.wbc;
  return {
    count,
    sirsPositive: count >= 2,
    parts,
    band: count >= 2
      ? `SIRS-positive (${count} of 4 criteria) per Bone 1992. Sepsis-3 (Singer 2016) deprecated SIRS for sepsis screening in favor of qSOFA / SOFA; this tile is provided so a clinician auditing a CDS trigger can compute SIRS exactly as the local protocol does.`
      : `SIRS-negative (${count} of 4 criteria) per Bone 1992. Sepsis-3 (Singer 2016) deprecated SIRS for sepsis screening in favor of qSOFA / SOFA.`,
  };
}

// --- spec-v13 wave 13-2 §3.2.1: RASS (Sessler 2002) -------------------
// 10-row picker -5 (unarousable) to +4 (combative).
export function rass({ level }) {
  // spec-v53 §3.1/§3.2: a non-finite level used to clamp to NaN and leak
  // "RASS NaN" into the rendered band. Reject it cleanly.
  const n = Math.round(Number(level));
  if (!Number.isFinite(n)) return { level: null, descriptor: null, band: 'Enter a RASS level (-5 to +4).' };
  const lv = Math.max(-5, Math.min(4, n));
  const descriptors = {
    4: 'Combative; overtly combative, violent, immediate danger to staff.',
    3: 'Very agitated; pulls or removes tube(s) or catheter(s); aggressive.',
    2: 'Agitated; frequent non-purposeful movement; fights ventilator.',
    1: 'Restless; anxious but movements not aggressive or vigorous.',
    0: 'Alert and calm.',
    '-1': 'Drowsy; not fully alert but sustained awakening (eye-opening / contact >10 s).',
    '-2': 'Light sedation; briefly awakens with eye contact to voice (<10 s).',
    '-3': 'Moderate sedation; movement or eye opening to voice (no eye contact).',
    '-4': 'Deep sedation; no response to voice but movement or eye opening to physical stimulation.',
    '-5': 'Unarousable; no response to voice or physical stimulation.',
  };
  const key = lv >= 0 ? String(lv) : String(lv);
  const desc = descriptors[lv] || descriptors[key];
  let band;
  if (lv >= 2) band = `RASS ${lv}: agitated. SCCM PADIS 2018 target band -2 to 0; consider sedation review per Devlin 2018.`;
  else if (lv >= -2) band = `RASS ${lv}: in the SCCM PADIS 2018 light-sedation target band (-2 to 0).`;
  else band = `RASS ${lv}: deeper than SCCM PADIS 2018 target (-2 to 0); consider lightening sedation per Devlin 2018.`;
  return { level: lv, descriptor: desc, band };
}

// --- spec-v13 wave 13-2 §3.2.2: SAS / Riker (Riker 1999) --------------
export function sasRiker({ level }) {
  const n = Number(level);
  const lv = Math.max(1, Math.min(7, Number.isFinite(n) ? Math.round(n) : 4));
  const descriptors = {
    1: 'Unarousable.',
    2: 'Very sedated; arouses to physical stimuli but does not communicate.',
    3: 'Sedated; difficult to arouse; awakens to verbal stimuli or gentle shaking.',
    4: 'Calm and cooperative.',
    5: 'Agitated; calmed by verbal instructions.',
    6: 'Very agitated; requires restraint and frequent reorientation.',
    7: 'Dangerous agitation; pulling at ET tube, climbing out of bed.',
  };
  // spec-v70: the light-sedation goal this function prints is "SAS 3-4", and
  // the paired rass() likewise accepts its whole -2 to 0 band (lower edge
  // included). SAS 3 ("awakens to verbal stimuli or gentle shaking") is the
  // lower edge of that goal, not below it -- so it must read as in-goal, not
  // "deeper than goal; lighten sedation". Only SAS <=2 is deeper than the band.
  // The SAS 4 / >=5 / <=2 strings are byte-for-byte unchanged.
  let band;
  if (lv === 4) band = 'SAS 4: calm and cooperative; goal sedation per Riker 1999 / SCCM PADIS 2018.';
  else if (lv === 3) band = 'SAS 3: sedated but within the Riker 1999 / SCCM PADIS 2018 light-sedation goal of SAS 3-4.';
  else if (lv >= 5) band = `SAS ${lv}: agitated; review sedation, analgesia, and delirium per SCCM PADIS 2018.`;
  else band = `SAS ${lv}: deeper than the Riker 1999 / SCCM PADIS 2018 goal of SAS 3-4; consider lightening sedation.`;
  return { level: lv, descriptor: descriptors[lv], band };
}

// --- spec-v13 wave 13-2 §3.2.3: CAM-ICU (Ely 2001) --------------------
// Positive when: feature 1 (acute onset or fluctuating course) AND
// feature 2 (inattention, >=2 errors) AND (feature 3 RASS != 0 OR
// feature 4 disorganized thinking).
export function camIcu({ acuteOnsetOrFluctuating, inattention,
  alteredLoc, disorganizedThinking }) {
  const f1 = !!acuteOnsetOrFluctuating;
  const f2 = !!inattention;
  const f3 = !!alteredLoc;
  const f4 = !!disorganizedThinking;
  const positive = f1 && f2 && (f3 || f4);
  return {
    positive,
    features: { f1, f2, f3, f4 },
    band: positive
      ? 'CAM-ICU positive: feature 1 + feature 2 + (feature 3 or feature 4) per Ely 2001. Delirium present; review precipitants per SCCM PADIS 2018.'
      : 'CAM-ICU negative per Ely 2001 (requires features 1 and 2 plus at least one of 3 or 4).',
  };
}

// --- spec-v13 wave 13-2 §3.2.4: ICDSC (Bergeron 2001) ----------------
// 8 binary items; >=4 = delirium.
export function icdsc({ alteredLoc, inattention, disorientation,
  hallucination, psychomotor, inappropriateSpeechOrMood,
  sleepWakeDisturbance, symptomFluctuation }) {
  const items = [alteredLoc, inattention, disorientation, hallucination,
    psychomotor, inappropriateSpeechOrMood, sleepWakeDisturbance,
    symptomFluctuation];
  const score = items.filter(Boolean).length;
  return {
    score,
    delirium: score >= 4,
    band: score >= 4
      ? `ICDSC ${score} of 8: delirium per Bergeron 2001 (cutoff >=4).`
      : `ICDSC ${score} of 8: below the Bergeron 2001 delirium cutoff (>=4).`,
  };
}

// --- spec-v13 wave 13-2 §3.2.5: 4AT (MacLullich 2019) -----------------
// Alertness (0 or 4), AMT4 (0/1/2), Attention months backwards (0/1/2),
// Acute change / fluctuating (0 or 4). Range 0-12.
export function fourAt({ alertnessAbnormal, amt4Errors, attentionScore,
  acuteChange }) {
  const alert = alertnessAbnormal ? 4 : 0;
  const amt = Math.max(0, Math.min(2, Math.round(Number(amt4Errors) || 0)));
  const att = Math.max(0, Math.min(2, Math.round(Number(attentionScore) || 0)));
  const acute = acuteChange ? 4 : 0;
  const score = alert + amt + att + acute;
  let band;
  if (score >= 4) band = `4AT ${score} of 12: possible delirium +/- cognitive impairment per MacLullich 2019.`;
  else if (score >= 1) band = `4AT ${score} of 12: possible cognitive impairment without delirium per MacLullich 2019.`;
  else band = `4AT 0 of 12: delirium or significant cognitive impairment unlikely per MacLullich 2019.`;
  return { score, band, parts: { alert, amt, att, acute } };
}

// --- spec-v13 wave 13-3 §3.3.1: CPOT (Gelinas 2006) ------------------
// Four behaviors, each 0-2; range 0-8. >=3 = unacceptable pain.
export function cpot({ facial, body, muscleTension, complianceOrVocalization }) {
  const f = Math.max(0, Math.min(2, Math.round(Number(facial) || 0)));
  const b = Math.max(0, Math.min(2, Math.round(Number(body) || 0)));
  const m = Math.max(0, Math.min(2, Math.round(Number(muscleTension) || 0)));
  const c = Math.max(0, Math.min(2, Math.round(Number(complianceOrVocalization) || 0)));
  const score = f + b + m + c;
  return {
    score,
    unacceptablePain: score >= 3,
    band: score >= 3
      ? `CPOT ${score} of 8: unacceptable pain per Gelinas 2006 (cutoff >=3).`
      : `CPOT ${score} of 8: acceptable pain per Gelinas 2006 (cutoff <3).`,
    parts: { facial: f, body: b, muscleTension: m, complianceOrVocalization: c },
  };
}

// --- spec-v13 wave 13-4 §3.4.1: NUTRIC Score (Heyland 2011) ----------
// Age (<50=0; 50-<75=1; >=75=2), APACHE II (<15=0; 15-<20=1; 20-28=2;
// >=28=3), SOFA (<6=0; 6-<10=1; >=10=2), comorbidities (0-1=0; >=2=1),
// days from hospital to ICU (<1=0; >=1=1), IL-6 (<400=0; >=400=1).
// Range 0-10; >=6 = high risk.
function nutricAgePts(a) { if (a < 50) return 0; if (a < 75) return 1; return 2; }
function nutricApachePts(s) { if (s < 15) return 0; if (s < 20) return 1; if (s <= 28) return 2; return 3; }
function nutricSofaPts(s) { if (s < 6) return 0; if (s < 10) return 1; return 2; }
export function nutric({ ageYears, apache2, sofa, comorbidities,
  daysHospitalToIcu, il6Pg }) {
  const parts = {
    age: nutricAgePts(Number(ageYears) || 0),
    apache: nutricApachePts(Number(apache2) || 0),
    sofa: nutricSofaPts(Number(sofa) || 0),
    comorbidities: (Number(comorbidities) || 0) >= 2 ? 1 : 0,
    daysToIcu: (Number(daysHospitalToIcu) || 0) >= 1 ? 1 : 0,
    il6: (Number(il6Pg) || 0) >= 400 ? 1 : 0,
  };
  const score = parts.age + parts.apache + parts.sofa
    + parts.comorbidities + parts.daysToIcu + parts.il6;
  return {
    score,
    highRisk: score >= 6,
    band: score >= 6
      ? `NUTRIC ${score} of 10: high nutritional risk per Heyland 2011 (cutoff >=6); benefits most from aggressive nutrition therapy.`
      : `NUTRIC ${score} of 10: low nutritional risk per Heyland 2011 (cutoff >=6).`,
    parts,
  };
}

// --- spec-v13 wave 13-4 §3.4.2: mNUTRIC (Rahman 2016) -----------------
// Same as NUTRIC but IL-6 omitted; range 0-9; cutoff >=5 for high risk.
export function mnutric({ ageYears, apache2, sofa, comorbidities,
  daysHospitalToIcu }) {
  const parts = {
    age: nutricAgePts(Number(ageYears) || 0),
    apache: nutricApachePts(Number(apache2) || 0),
    sofa: nutricSofaPts(Number(sofa) || 0),
    comorbidities: (Number(comorbidities) || 0) >= 2 ? 1 : 0,
    daysToIcu: (Number(daysHospitalToIcu) || 0) >= 1 ? 1 : 0,
  };
  const score = parts.age + parts.apache + parts.sofa
    + parts.comorbidities + parts.daysToIcu;
  return {
    score,
    highRisk: score >= 5,
    band: score >= 5
      ? `mNUTRIC ${score} of 9: high nutritional risk per Rahman 2016 (cutoff >=5).`
      : `mNUTRIC ${score} of 9: low nutritional risk per Rahman 2016 (cutoff >=5).`,
    parts,
  };
}

// --- spec-v13 wave 13-4 §3.4.3: NRS-2002 (Kondrup 2003) ---------------
// Severity of disease (0-3), nutritional status (0-3), age >=70 (+1).
// Total >=3 = at risk for malnutrition (ESPEN endorsement).
export function nrs2002({ severityOfDisease, nutritionalStatus, ageGe70 }) {
  const s = Math.max(0, Math.min(3, Math.round(Number(severityOfDisease) || 0)));
  const n = Math.max(0, Math.min(3, Math.round(Number(nutritionalStatus) || 0)));
  const a = ageGe70 ? 1 : 0;
  const score = s + n + a;
  return {
    score,
    atRisk: score >= 3,
    band: score >= 3
      ? `NRS-2002 ${score}: at risk for malnutrition per Kondrup 2003 (ESPEN-endorsed cutoff >=3); nutritional support indicated.`
      : `NRS-2002 ${score}: not at risk for malnutrition per Kondrup 2003 (ESPEN-endorsed cutoff >=3).`,
    parts: { severity: s, nutritionalStatus: n, ageAdj: a },
  };
}

// --- spec-v13 wave 13-4 §3.4.4: MUST (BAPEN 2003) --------------------
// Inputs: BMI score (BMI >20 = 0; 18.5-20 = 1; <18.5 = 2),
// unplanned weight loss in past 3-6 months (<5% = 0; 5-10% = 1; >10% = 2),
// acute disease (no oral intake for >5 days = 2 else 0).
// 0 low / 1 medium / >=2 high.
export function mustNutrition({ bmi, weightLossPct, acuteDiseaseNoIntakeGt5d }) {
  const b = Number(bmi);
  const w = Number(weightLossPct);
  let bScore = 0; if (Number.isFinite(b)) {
    if (b < 18.5) bScore = 2;
    else if (b <= 20) bScore = 1;
    else bScore = 0;
  }
  let wScore = 0; if (Number.isFinite(w)) {
    if (w > 10) wScore = 2;
    else if (w >= 5) wScore = 1;
  }
  const acute = acuteDiseaseNoIntakeGt5d ? 2 : 0;
  const score = bScore + wScore + acute;
  let band;
  if (score === 0) band = 'MUST 0: low malnutrition risk per BAPEN 2003.';
  else if (score === 1) band = 'MUST 1: medium malnutrition risk per BAPEN 2003; observe and document intake.';
  else band = `MUST ${score}: high malnutrition risk per BAPEN 2003 (cutoff >=2); refer to dietitian / nutritional support team.`;
  return { score, band, parts: { bmi: bScore, weightLoss: wScore, acute } };
}

// --- spec-v13 wave 13-5 §3.5.2: HACOR (Duan 2017) --------------------
// HR, pH, GCS, PaO2/FiO2, RR each scored per Duan 2017 Table 1.
function hacorHrPts(hr) { return hr >= 121 ? 1 : 0; }
function hacorPhPts(ph) {
  if (ph < 7.25) return 4;
  if (ph < 7.30) return 3;
  if (ph < 7.35) return 2;
  return 0;
}
function hacorGcsPts(gcs) {
  if (gcs >= 15) return 0;
  if (gcs >= 13) return 2;
  if (gcs >= 11) return 5;
  return 10;
}
function hacorPfRatioPts(pf) {
  // Duan 2017 Table 1: >=201=0; 176-200=2; 151-175=3; 126-150=4;
  // 101-125=5; <=100=6.
  if (pf >= 201) return 0;
  if (pf >= 176) return 2;
  if (pf >= 151) return 3;
  if (pf >= 126) return 4;
  if (pf >= 101) return 5;
  return 6;
}
function hacorRrPts(rr) {
  // Duan 2017 Table 1: <=30=0; 31-35=1; 36-40=2; 41-45=3; >=46=4.
  if (rr <= 30) return 0;
  if (rr <= 35) return 1;
  if (rr <= 40) return 2;
  if (rr <= 45) return 3;
  return 4;
}
export function hacor({ hr, ph, gcs, pao2, fio2, rr }) {
  // spec-v59 §2.1/§2.2: refuse to score from an empty or impossible instrument
  // rather than substitute a clinically-loaded default (Number(ph)||7.4 etc.)
  // or render a magic P/F of 0. A blank field reaches here as null/NaN; FiO2<=0
  // makes the P/F undefined. In either case the score is incomputable.
  const vals = { hr: Number(hr), ph: Number(ph), gcs: Number(gcs), pao2: Number(pao2), fio2: Number(fio2), rr: Number(rr) };
  const missing = Object.values(vals).some((v) => !Number.isFinite(v));
  if (missing || vals.fio2 <= 0) {
    return { score: null, pfRatio: null, parts: null,
      band: 'Enter all six HACOR inputs (HR, pH, GCS, PaO2, FiO2, RR) to score.' };
  }
  const pf = vals.pao2 / vals.fio2;
  const parts = {
    hr: hacorHrPts(vals.hr),
    ph: hacorPhPts(vals.ph),
    gcs: hacorGcsPts(vals.gcs),
    pf: hacorPfRatioPts(pf),
    rr: hacorRrPts(vals.rr),
  };
  const score = parts.hr + parts.ph + parts.gcs + parts.pf + parts.rr;
  return {
    score,
    pfRatio: pf,
    parts,
    band: score > 5
      ? `HACOR ${score}: high risk of NIV failure at 1 hour per Duan 2017 (cutoff >5; specificity ~90%).`
      : `HACOR ${score}: not in the Duan 2017 high-risk band (cutoff >5).`,
  };
}

// --- spec-v13 wave 13-5 §3.5.3: Berlin ARDS criteria (Ranieri 2012) --
// All four required for ARDS; severity by PaO2/FiO2 on PEEP >=5.
export function berlinArds({ timingLe1wk, bilateralOpacities,
  notExplainedByCardiacOrOverload, peepGe5cmH2O, pao2, fio2 }) {
  const allFour = !!timingLe1wk && !!bilateralOpacities
    && !!notExplainedByCardiacOrOverload && !!peepGe5cmH2O;
  const fio = Number(fio2);
  const pao = Number(pao2);
  // spec-v59 §2.6: pf is null (not NaN) when either gas is absent/non-finite,
  // so the "enter PaO2 and FiO2" branch handles it instead of interpolating NaN.
  const pf = (fio > 0 && Number.isFinite(pao)) ? (pao / fio) : null;
  if (!allFour) return {
    ards: false,
    severity: null,
    pfRatio: pf,
    band: 'ARDS criteria not met per Berlin definition (Ranieri 2012): all four (timing <=1 wk, bilateral opacities, not explained by cardiac failure / overload, PEEP >=5 cmH2O) are required.',
  };
  if (pf == null) return {
    ards: true,
    severity: null,
    pfRatio: null,
    band: 'ARDS by Berlin definition criteria; enter PaO2 and FiO2 to determine severity.',
  };
  let severity;
  if (pf <= 100) severity = 'severe';
  else if (pf <= 200) severity = 'moderate';
  else if (pf <= 300) severity = 'mild';
  else severity = null;
  if (severity == null) return {
    ards: false,
    severity: null,
    pfRatio: pf,
    band: `PaO2/FiO2 ${pf.toFixed(0)} > 300: criteria not met (Berlin 2012 requires <=300 on PEEP >=5).`,
  };
  return {
    ards: true,
    severity,
    pfRatio: pf,
    band: `ARDS, ${severity} (PaO2/FiO2 ${pf.toFixed(0)} on PEEP >=5) per Berlin 2012 (mild 200-300; moderate 100-200; severe <=100).`,
  };
}

// --- spec-v13 wave 13-5 §3.5.4: Murray Lung Injury Score (1988) -------
// Average of four 0-4 components.
function lisQuadrantPts(q) {
  const n = Math.max(0, Math.min(4, Math.round(Number(q) || 0)));
  return n;
}
function lisPfPts(pf) {
  if (pf >= 300) return 0;
  if (pf >= 225) return 1;
  if (pf >= 175) return 2;
  if (pf >= 100) return 3;
  return 4;
}
function lisPeepPts(peep) {
  if (peep <= 5) return 0;
  if (peep <= 8) return 1;
  if (peep <= 11) return 2;
  if (peep <= 14) return 3;
  return 4;
}
function lisCompliancePts(c) {
  if (c >= 80) return 0;
  if (c >= 60) return 1;
  if (c >= 40) return 2;
  if (c >= 20) return 3;
  return 4;
}
export function lisMurray({ quadrants, pao2, fio2, peep, complianceMlPerCmH2O }) {
  // spec-v59 §2.1/§2.2: refuse from an empty or impossible instrument rather
  // than substitute a magic P/F of 300 (FiO2<=0) or a near-normal compliance
  // of 80 for a blank field.
  const vals = { quadrants: Number(quadrants), pao2: Number(pao2), fio2: Number(fio2),
    peep: Number(peep), compliance: Number(complianceMlPerCmH2O) };
  const missing = Object.values(vals).some((v) => !Number.isFinite(v));
  if (missing || vals.fio2 <= 0) {
    return { score: null, pfRatio: null, parts: null,
      band: 'Enter all five Murray LIS inputs (quadrants, PaO2, FiO2, PEEP, compliance) to score.' };
  }
  const pf = vals.pao2 / vals.fio2;
  const parts = {
    quadrants: lisQuadrantPts(vals.quadrants),
    pf: lisPfPts(pf),
    peep: lisPeepPts(vals.peep),
    compliance: lisCompliancePts(vals.compliance),
  };
  const score = (parts.quadrants + parts.pf + parts.peep + parts.compliance) / 4;
  let band;
  if (score === 0) band = 'Murray LIS 0: no lung injury per Murray 1988.';
  else if (score <= 2.5) band = `Murray LIS ${score.toFixed(2)}: mild-to-moderate lung injury per Murray 1988.`;
  else band = `Murray LIS ${score.toFixed(2)}: severe lung injury per Murray 1988 (>2.5); ECMO referral per ELSO 2017 may be appropriate.`;
  return { score, band, pfRatio: pf, parts };
}

// --- spec-v13 wave 13-5 §3.5.5: LIPS (Gajic 2011) --------------------
// Predisposing conditions and modifiers with non-integer weights per
// Gajic 2011 Table 2.
export function lips({ shock, aspiration, sepsis, pneumonia, highRiskSurgery,
  highRiskTrauma, alcoholAbuse, obesityBmiGt30, hypoalbuminemia, chemotherapy,
  fio2Gt035or4L, tachypneaRrGt30, spo2Lt95, acidosisPhLt735, diabetes }) {
  const parts = {
    shock: shock ? 2 : 0,
    aspiration: aspiration ? 2 : 0,
    sepsis: sepsis ? 1 : 0,
    pneumonia: pneumonia ? 1.5 : 0,
    highRiskSurgery: highRiskSurgery ? 1.5 : 0,
    highRiskTrauma: highRiskTrauma ? 2 : 0,
    alcoholAbuse: alcoholAbuse ? 1 : 0,
    obesity: obesityBmiGt30 ? 1 : 0,
    hypoalbuminemia: hypoalbuminemia ? 1 : 0,
    chemotherapy: chemotherapy ? 1 : 0,
    fio2: fio2Gt035or4L ? 2 : 0,
    tachypnea: tachypneaRrGt30 ? 1.5 : 0,
    spo2: spo2Lt95 ? 1 : 0,
    acidosis: acidosisPhLt735 ? 1.5 : 0,
    diabetes: diabetes ? -1 : 0,
  };
  let score = 0; for (const v of Object.values(parts)) score += v;
  return {
    score,
    highRisk: score >= 4,
    band: score >= 4
      ? `LIPS ${score}: high risk for ALI/ARDS development per Gajic 2011 (cutoff >=4).`
      : `LIPS ${score}: below the Gajic 2011 ALI/ARDS high-risk cutoff (>=4).`,
    parts,
  };
}

// --- spec-v13 wave 13-7 §3.7.1: SMART-COP (Charles 2008) -------------
// Eight weighted criteria. Sophie applies the Charles 2008 age-adjusted
// RR threshold (RR >=25 if age <=50; >=30 if age >50) and age-adjusted
// oxygenation threshold (PaO2 <70 or SpO2 <94% or P/F <333 if age <=50;
// PaO2 <60 or SpO2 <90% or P/F <250 if age >50).
function smartCopRr(rr, age) {
  if (!(rr > 0)) return false;
  return age <= 50 ? rr >= 25 : rr >= 30;
}
function smartCopOxLow({ pao2, spo2, pfRatio, age }) {
  const p = Number(pao2);
  const s = Number(spo2);
  const pf = Number(pfRatio);
  if (age <= 50) {
    return (Number.isFinite(p) && p < 70)
      || (Number.isFinite(s) && s < 94)
      || (Number.isFinite(pf) && pf < 333);
  }
  return (Number.isFinite(p) && p < 60)
    || (Number.isFinite(s) && s < 90)
    || (Number.isFinite(pf) && pf < 250);
}
export function smartCop({ ageYears, sbpLt90, multilobar, albuminLt35,
  rr, pao2, spo2, pfRatio, hrGe125, confusion, phLt735 }) {
  const age = Number(ageYears) || 0;
  const parts = {
    sbp: sbpLt90 ? 2 : 0,
    multilobar: multilobar ? 1 : 0,
    albumin: albuminLt35 ? 1 : 0,
    rr: smartCopRr(Number(rr) || 0, age) ? 1 : 0,
    tachycardia: hrGe125 ? 1 : 0,
    confusion: confusion ? 1 : 0,
    oxygenation: smartCopOxLow({ pao2, spo2, pfRatio, age }) ? 2 : 0,
    acidosis: phLt735 ? 2 : 0,
  };
  const score = parts.sbp + parts.multilobar + parts.albumin + parts.rr
    + parts.tachycardia + parts.confusion + parts.oxygenation + parts.acidosis;
  let band;
  if (score >= 5) band = `SMART-COP ${score}: high risk of needing intensive respiratory or vasopressor support per Charles 2008 (cutoff >=5).`;
  else if (score >= 3) band = `SMART-COP ${score}: moderate risk; intensive respiratory or vasopressor support possible per Charles 2008 (cutoff >=3).`;
  else band = `SMART-COP ${score}: low risk per Charles 2008.`;
  return { score, band, parts };
}

// --- spec-v13 wave 13-7 §3.7.2: CRB-65 (Lim 2003) --------------------
export function crb65({ confusion, rrGe30, sbpLt90OrDbpLe60, ageGe65 }) {
  const parts = {
    confusion: confusion ? 1 : 0,
    rr: rrGe30 ? 1 : 0,
    bp: sbpLt90OrDbpLe60 ? 1 : 0,
    age: ageGe65 ? 1 : 0,
  };
  const score = parts.confusion + parts.rr + parts.bp + parts.age;
  let band;
  if (score <= 0) band = 'CRB-65 0: 30-day mortality ~1.2% per Lim 2003; outpatient management likely appropriate.';
  else if (score <= 2) band = `CRB-65 ${score}: 30-day mortality ~8.2% per Lim 2003; consider hospital management.`;
  else band = `CRB-65 ${score}: 30-day mortality ~31.4% per Lim 2003; urgent hospital management indicated.`;
  return { score, band, parts };
}

// --- spec-v13 wave 13-7 §3.7.3: ATS/IDSA Severe CAP criteria (2019) --
// >=1 major OR >=3 minor -> severe CAP / ICU admission per Metlay 2019.
export function atsIdsaCap({ majorVasopressors, majorMechanicalVentilation,
  minorRrGe30, minorPfLe250, minorMultilobar, minorConfusion,
  minorUremiaBunGe20, minorLeukopeniaWbcLt4, minorThrombocytopeniaPltLt100,
  minorHypothermiaLt36, minorHypotensionAggressiveFluids }) {
  const majorCount = (majorVasopressors ? 1 : 0) + (majorMechanicalVentilation ? 1 : 0);
  const minors = [minorRrGe30, minorPfLe250, minorMultilobar, minorConfusion,
    minorUremiaBunGe20, minorLeukopeniaWbcLt4, minorThrombocytopeniaPltLt100,
    minorHypothermiaLt36, minorHypotensionAggressiveFluids];
  const minorCount = minors.filter(Boolean).length;
  const severe = majorCount >= 1 || minorCount >= 3;
  return {
    majorCount,
    minorCount,
    severe,
    band: severe
      ? `Severe CAP per ATS/IDSA 2019 (${majorCount} major + ${minorCount} minor criteria; >=1 major or >=3 minor); ICU admission per Metlay 2019 Table 1.`
      : `Not severe per ATS/IDSA 2019 (${majorCount} major + ${minorCount} minor; requires >=1 major or >=3 minor).`,
  };
}

// --- spec-v13 wave 13-7 §3.7.4: DRIP score (Webb 2016) ---------------
// Major risk factors (2 each): antibiotic use last 60 days, long-term
// care residence, tube feeding, prior MDR isolate.
// Minor (1 each): hospitalization last 60 days, chronic pulmonary
// disease, poor functional status, gastric acid suppression, wound
// care, MRSA colonization.
// Cutoff >=4 = high risk for drug-resistant pneumonia.
export function drip({ antibioticsLast60d, longTermCareResidence,
  tubeFeeding, priorMdrIsolate, hospitalizationLast60d, chronicPulmonary,
  poorFunctionalStatus, gastricAcidSuppression, woundCare, mrsaColonization }) {
  const majors = (antibioticsLast60d ? 2 : 0) + (longTermCareResidence ? 2 : 0)
    + (tubeFeeding ? 2 : 0) + (priorMdrIsolate ? 2 : 0);
  const minors = (hospitalizationLast60d ? 1 : 0) + (chronicPulmonary ? 1 : 0)
    + (poorFunctionalStatus ? 1 : 0) + (gastricAcidSuppression ? 1 : 0)
    + (woundCare ? 1 : 0) + (mrsaColonization ? 1 : 0);
  const score = majors + minors;
  return {
    score,
    majors,
    minors,
    highRisk: score >= 4,
    band: score >= 4
      ? `DRIP ${score}: high risk for drug-resistant pneumonia per Webb 2016 (cutoff >=4); consider broader empiric coverage (2019 ATS/IDSA endorsement).`
      : `DRIP ${score}: low risk for drug-resistant pneumonia per Webb 2016 (cutoff >=4).`,
  };
}

// --- spec-v13 wave 13-1 §3.1.3: MODS (Marshall 1995) -----------------
// Six organ-system variables, each scored 0-4 per Marshall 1995 Table 1.
// Sum 0-24; ICU mortality bands per Marshall 1995 Table 4.
//
// Respiratory:    PaO2/FiO2 ratio (mmHg/decimal). >300=0; 226-300=1;
//                 151-225=2; 76-150=3; <=75=4.
// Renal:          serum creatinine (mg/dL). <=1.1=0; 1.2-2.3=1;
//                 2.4-4.0=2; 4.1-5.6=3; >5.6=4. (Marshall uses
//                 umol/L; mg/dL thresholds are the conventional
//                 conversion at 88.4 umol/L per mg/dL.)
// Hepatic:        total bilirubin (mg/dL). <=1.2=0; 1.3-3.5=1;
//                 3.6-7.0=2; 7.1-14.0=3; >14.0=4.
// Cardiovascular: pressure-adjusted heart rate, PAR = HR x CVP / MAP
//                 (Marshall used right atrial pressure / MAP). <=10=0;
//                 10.1-15=1; 15.1-20=2; 20.1-30=3; >30=4.
// Hematologic:    platelet count (x10^9/L). >120=0; 81-120=1; 51-80=2;
//                 21-50=3; <=20=4.
// Neurologic:     GCS. 15=0; 13-14=1; 10-12=2; 7-9=3; <=6=4.
function modsRespiratory(pf) {
  const v = Number(pf);
  if (!Number.isFinite(v)) return 0;
  if (v > 300) return 0;
  if (v >= 226) return 1;
  if (v >= 151) return 2;
  if (v >= 76) return 3;
  return 4;
}
function modsRenal(cr) {
  const v = Number(cr);
  if (!Number.isFinite(v)) return 0;
  if (v <= 1.1) return 0;
  if (v <= 2.3) return 1;
  if (v <= 4.0) return 2;
  if (v <= 5.6) return 3;
  return 4;
}
function modsHepatic(bili) {
  const v = Number(bili);
  if (!Number.isFinite(v)) return 0;
  if (v <= 1.2) return 0;
  if (v <= 3.5) return 1;
  if (v <= 7.0) return 2;
  if (v <= 14.0) return 3;
  return 4;
}
function modsCardiovascular(par) {
  const v = Number(par);
  if (!Number.isFinite(v)) return 0;
  if (v <= 10.0) return 0;
  if (v <= 15.0) return 1;
  if (v <= 20.0) return 2;
  if (v <= 30.0) return 3;
  return 4;
}
function modsHematologic(plt) {
  const v = Number(plt);
  if (!Number.isFinite(v)) return 0;
  if (v > 120) return 0;
  if (v >= 81) return 1;
  if (v >= 51) return 2;
  if (v >= 21) return 3;
  return 4;
}
function modsNeurologic(gcs) {
  const v = Number(gcs);
  if (!Number.isFinite(v)) return 0;
  if (v >= 15) return 0;
  if (v >= 13) return 1;
  if (v >= 10) return 2;
  if (v >= 7) return 3;
  return 4;
}
export function mods({ pfRatio, creatinineMgDl, bilirubinMgDl, par,
  plateletsK, gcs }) {
  const parts = {
    respiratory: modsRespiratory(pfRatio),
    renal: modsRenal(creatinineMgDl),
    hepatic: modsHepatic(bilirubinMgDl),
    cardiovascular: modsCardiovascular(par),
    hematologic: modsHematologic(plateletsK),
    neurologic: modsNeurologic(gcs),
  };
  const score = parts.respiratory + parts.renal + parts.hepatic
    + parts.cardiovascular + parts.hematologic + parts.neurologic;
  let mortality;
  if (score === 0) mortality = 'ICU mortality 0% per Marshall 1995 Table 4.';
  else if (score <= 4) mortality = 'ICU mortality ~1-2% per Marshall 1995 Table 4.';
  else if (score <= 8) mortality = 'ICU mortality ~3-5% per Marshall 1995 Table 4.';
  else if (score <= 12) mortality = 'ICU mortality ~25% per Marshall 1995 Table 4.';
  else if (score <= 16) mortality = 'ICU mortality ~50% per Marshall 1995 Table 4.';
  else if (score <= 20) mortality = 'ICU mortality ~75% per Marshall 1995 Table 4.';
  else mortality = 'ICU mortality ~100% per Marshall 1995 Table 4.';
  return {
    score,
    parts,
    band: `MODS ${score} of 24: ${mortality}`,
  };
}

// --- spec-v14 wave 14-2 §3.2.1: STOP-BANG (Chung 2008, 2012) ---------
// Eight binary criteria, sum 0-8. Cutoffs per Chung 2012 Table 3:
// 0-2 low, 3-4 intermediate, 5-8 high risk for moderate-to-severe OSA.
export function stopBang({ snore, tired, observedApnea, highBp, bmiGt35,
  ageGt50, neckGt40cm, male }) {
  const parts = {
    snore: snore ? 1 : 0,
    tired: tired ? 1 : 0,
    observedApnea: observedApnea ? 1 : 0,
    highBp: highBp ? 1 : 0,
    bmiGt35: bmiGt35 ? 1 : 0,
    ageGt50: ageGt50 ? 1 : 0,
    neckGt40cm: neckGt40cm ? 1 : 0,
    male: male ? 1 : 0,
  };
  const score = parts.snore + parts.tired + parts.observedApnea + parts.highBp
    + parts.bmiGt35 + parts.ageGt50 + parts.neckGt40cm + parts.male;
  let band;
  if (score >= 5) band = `STOP-BANG ${score} of 8: high risk for moderate-to-severe OSA per Chung 2012 (cutoff >=5).`;
  else if (score >= 3) band = `STOP-BANG ${score} of 8: intermediate risk for OSA per Chung 2012 (3-4 band).`;
  else band = `STOP-BANG ${score} of 8: low risk for OSA per Chung 2012 (0-2 band).`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-2 §3.2.3: Epworth Sleepiness Scale (Johns 1991)
// Eight scenarios each 0-3; sum 0-24. Bands per Johns 1991:
// 0-10 normal, 11-14 mild, 15-17 moderate, 18-24 severe daytime sleepiness.
function epworthClamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > 3) return 3;
  return v;
}
export function epworth({ reading, tv, publicPlace, carPassenger,
  lyingDown, sittingTalking, afterLunch, carTraffic }) {
  const parts = {
    reading: epworthClamp(reading),
    tv: epworthClamp(tv),
    publicPlace: epworthClamp(publicPlace),
    carPassenger: epworthClamp(carPassenger),
    lyingDown: epworthClamp(lyingDown),
    sittingTalking: epworthClamp(sittingTalking),
    afterLunch: epworthClamp(afterLunch),
    carTraffic: epworthClamp(carTraffic),
  };
  const score = parts.reading + parts.tv + parts.publicPlace + parts.carPassenger
    + parts.lyingDown + parts.sittingTalking + parts.afterLunch + parts.carTraffic;
  let band;
  if (score >= 18) band = `Epworth ${score} of 24: severe excessive daytime sleepiness per Johns 1991.`;
  else if (score >= 15) band = `Epworth ${score} of 24: moderate excessive daytime sleepiness per Johns 1991.`;
  else if (score >= 11) band = `Epworth ${score} of 24: mild excessive daytime sleepiness per Johns 1991.`;
  else band = `Epworth ${score} of 24: normal daytime sleepiness per Johns 1991 (0-10).`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-3 §3.3.2: Apfel PONV (Apfel 1999) --------------
// Four binary risk factors; sum 0-4. PONV risk per Apfel 1999 Table 4:
// 0 -> ~10%, 1 -> ~20%, 2 -> ~40%, 3 -> ~60%, 4 -> ~80%.
export function apfel({ female, nonsmoker, historyPonvOrMotionSickness,
  postopOpioids }) {
  const parts = {
    female: female ? 1 : 0,
    nonsmoker: nonsmoker ? 1 : 0,
    historyPonvOrMotionSickness: historyPonvOrMotionSickness ? 1 : 0,
    postopOpioids: postopOpioids ? 1 : 0,
  };
  const score = parts.female + parts.nonsmoker
    + parts.historyPonvOrMotionSickness + parts.postopOpioids;
  const riskByScore = { 0: '~10%', 1: '~20%', 2: '~40%', 3: '~60%', 4: '~80%' };
  return {
    score,
    parts,
    band: `Apfel ${score} of 4: predicted PONV risk ${riskByScore[score]} per Apfel 1999 Table 4.`,
  };
}

// --- spec-v14 wave 14-3 §3.3.3: modified Aldrete (Aldrete 1995) ------
// Five domains each scored 0-2; sum 0-10. >=9 = ready for PACU
// discharge per Aldrete 1995.
function aldreteClamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > 2) return 2;
  return v;
}
export function aldrete({ activity, respiration, circulation,
  consciousness, oxygenSaturation }) {
  const parts = {
    activity: aldreteClamp(activity),
    respiration: aldreteClamp(respiration),
    circulation: aldreteClamp(circulation),
    consciousness: aldreteClamp(consciousness),
    oxygenSaturation: aldreteClamp(oxygenSaturation),
  };
  const score = parts.activity + parts.respiration + parts.circulation
    + parts.consciousness + parts.oxygenSaturation;
  return {
    score,
    parts,
    readyForDischarge: score >= 9,
    band: score >= 9
      ? `modified Aldrete ${score} of 10: ready for PACU discharge per Aldrete 1995 (cutoff >=9).`
      : `modified Aldrete ${score} of 10: not yet ready for PACU discharge per Aldrete 1995 (cutoff >=9).`,
  };
}

// --- spec-v14 wave 14-2 §3.2.1: STOP-BANG (Chung 2008, 2012) ---------
// Three behaviors each scored 1-4; range 3-12. >5 = unacceptable pain.
export function bps({ facial, upperLimb, ventilatorCompliance }) {
  // spec-v59 §2.2: refuse from an unobserved instrument rather than default a
  // blank item to 1 ("relaxed/no expression") and emit a band from no data. A
  // present value (including a literal 0) is still clamped to the 1-4 scale.
  const nf = Number(facial); const nu = Number(upperLimb); const nv = Number(ventilatorCompliance);
  if (![nf, nu, nv].every(Number.isFinite)) {
    return { score: null, unacceptablePain: null, parts: null,
      band: 'Score all three BPS items (facial expression, upper-limb movement, ventilator compliance) to compute.' };
  }
  const f = Math.max(1, Math.min(4, Math.round(nf)));
  const u = Math.max(1, Math.min(4, Math.round(nu)));
  const v = Math.max(1, Math.min(4, Math.round(nv)));
  const score = f + u + v;
  return {
    score,
    unacceptablePain: score > 5,
    band: score > 5
      ? `BPS ${score} of 12: unacceptable pain per Payen 2001 (cutoff >5).`
      : `BPS ${score} of 12: acceptable pain per Payen 2001 (cutoff <=5).`,
    parts: { facial: f, upperLimb: u, ventilatorCompliance: v },
  };
}

// --- spec-v14 wave 14-4 §3.4.1: ATRIA Bleeding (Fang 2011) -----------
// Five weighted criteria; sum 0-10. Bands per Fang 2011 Table 3:
// 0-3 low (0.8%/yr), 4 intermediate (2.6%/yr), 5-10 high (5.8%/yr).
export function atriaBleeding({ anemia, severeRenalDisease, ageGte75,
  priorBleeding, hypertension }) {
  const parts = {
    anemia: anemia ? 3 : 0,
    severeRenalDisease: severeRenalDisease ? 3 : 0,
    ageGte75: ageGte75 ? 2 : 0,
    priorBleeding: priorBleeding ? 1 : 0,
    hypertension: hypertension ? 1 : 0,
  };
  const score = parts.anemia + parts.severeRenalDisease + parts.ageGte75
    + parts.priorBleeding + parts.hypertension;
  let band;
  if (score >= 5) band = `ATRIA ${score} of 10: high annual major-bleed risk 5.8% per Fang 2011 Table 3 (5-10 band).`;
  else if (score === 4) band = `ATRIA ${score} of 10: intermediate annual major-bleed risk 2.6% per Fang 2011 Table 3 (score 4).`;
  else band = `ATRIA ${score} of 10: low annual major-bleed risk 0.8% per Fang 2011 Table 3 (0-3 band).`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-4 §3.4.2: ORBIT Bleeding (O'Brien 2015) --------
// Five weighted criteria; sum 0-7. Bands per O'Brien 2015 Table 3:
// 0-2 low (2.4%/yr), 3 intermediate (4.7%/yr), 4-7 high (8.1%/yr).
export function orbitBleeding({ lowHbOrHct, ageGt74, bleedingHistory,
  renalInsufficiency, antiplatelet }) {
  const parts = {
    lowHbOrHct: lowHbOrHct ? 2 : 0,
    ageGt74: ageGt74 ? 1 : 0,
    bleedingHistory: bleedingHistory ? 2 : 0,
    renalInsufficiency: renalInsufficiency ? 1 : 0,
    antiplatelet: antiplatelet ? 1 : 0,
  };
  const score = parts.lowHbOrHct + parts.ageGt74 + parts.bleedingHistory
    + parts.renalInsufficiency + parts.antiplatelet;
  let band;
  if (score >= 4) band = `ORBIT ${score} of 7: high annual major-bleed risk 8.1% per O'Brien 2015 Table 3 (4-7 band).`;
  else if (score === 3) band = `ORBIT ${score} of 7: intermediate annual major-bleed risk 4.7% per O'Brien 2015 Table 3 (score 3).`;
  else band = `ORBIT ${score} of 7: low annual major-bleed risk 2.4% per O'Brien 2015 Table 3 (0-2 band).`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-4 §3.4.3: HEMORR2HAGES (Gage 2006) -------------
// Eleven criteria with rebleeding weighted 2; all others 1. Range 0-12.
// Bleeds per 100 patient-years per Gage 2006 Table 3:
// 0: 1.9, 1: 2.5, 2: 5.3, 3: 8.4, 4: 10.4, >=5: 12.3.
export function hemorr2hages({ hepaticOrRenal, ethanolAbuse, malignancy,
  olderGt75, reducedPlatelets, rebleeding, uncontrolledHtn, anemia,
  geneticFactors, fallRisk, stroke }) {
  const parts = {
    hepaticOrRenal: hepaticOrRenal ? 1 : 0,
    ethanolAbuse: ethanolAbuse ? 1 : 0,
    malignancy: malignancy ? 1 : 0,
    olderGt75: olderGt75 ? 1 : 0,
    reducedPlatelets: reducedPlatelets ? 1 : 0,
    rebleeding: rebleeding ? 2 : 0,
    uncontrolledHtn: uncontrolledHtn ? 1 : 0,
    anemia: anemia ? 1 : 0,
    geneticFactors: geneticFactors ? 1 : 0,
    fallRisk: fallRisk ? 1 : 0,
    stroke: stroke ? 1 : 0,
  };
  const score = parts.hepaticOrRenal + parts.ethanolAbuse + parts.malignancy
    + parts.olderGt75 + parts.reducedPlatelets + parts.rebleeding
    + parts.uncontrolledHtn + parts.anemia + parts.geneticFactors
    + parts.fallRisk + parts.stroke;
  const ratePer100PyByScore = { 0: '1.9', 1: '2.5', 2: '5.3', 3: '8.4', 4: '10.4' };
  const rate = score >= 5 ? '12.3' : ratePer100PyByScore[score];
  return {
    score,
    parts,
    band: `HEMORR2HAGES ${score} of 12: ${rate} bleeds per 100 patient-years per Gage 2006 Table 3.`,
  };
}

// --- spec-v14 wave 14-5 §3.5.1: IMPROVE Bleeding (Decousus 2011) -----
// Weighted criteria; sum 0-30.5. Cutoff >=7 = high bleeding risk per
// Decousus 2011 (consider mechanical prophylaxis over pharmacologic).
// Age and renal failure are mutually-exclusive category sets:
// age = '<40' (0) / '40-84' (1.5) / '>=85' (3.5);
// renalFailure = 'none' (0) / 'moderate' (1) / 'severe' (2.5).
function improveBleedingAgeWeight(age) {
  if (age === '>=85') return 3.5;
  if (age === '40-84') return 1.5;
  return 0;
}
function improveBleedingRenalWeight(renal) {
  if (renal === 'severe') return 2.5;
  if (renal === 'moderate') return 1;
  return 0;
}
export function improveBleeding({ activeUlcer, bleeding3moPrior,
  plateletLt50, age, hepaticFailure, renalFailure, icuAdmission,
  centralVenousCatheter, rheumaticDisease, currentCancer, male }) {
  const parts = {
    activeUlcer: activeUlcer ? 4.5 : 0,
    bleeding3moPrior: bleeding3moPrior ? 4 : 0,
    plateletLt50: plateletLt50 ? 4 : 0,
    age: improveBleedingAgeWeight(age),
    hepaticFailure: hepaticFailure ? 2.5 : 0,
    renalFailure: improveBleedingRenalWeight(renalFailure),
    icuAdmission: icuAdmission ? 2.5 : 0,
    centralVenousCatheter: centralVenousCatheter ? 2 : 0,
    rheumaticDisease: rheumaticDisease ? 2 : 0,
    currentCancer: currentCancer ? 2 : 0,
    male: male ? 1 : 0,
  };
  const score = parts.activeUlcer + parts.bleeding3moPrior + parts.plateletLt50
    + parts.age + parts.hepaticFailure + parts.renalFailure + parts.icuAdmission
    + parts.centralVenousCatheter + parts.rheumaticDisease + parts.currentCancer
    + parts.male;
  const scoreText = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return {
    score,
    parts,
    highBleedingRisk: score >= 7,
    band: score >= 7
      ? `IMPROVE-Bleeding ${scoreText}: high bleeding risk per Decousus 2011 (cutoff >=7); consider mechanical over pharmacologic prophylaxis.`
      : `IMPROVE-Bleeding ${scoreText}: not high bleeding risk per Decousus 2011 (cutoff >=7).`,
  };
}

// --- spec-v14 wave 14-5 §3.5.2: IMPROVE VTE (Spyropoulos 2011) -------
// Seven weighted criteria; sum 0-12. Cutoffs per Spyropoulos 2011:
// >=2 = candidate for inpatient prophylaxis; >=4 = candidate for
// extended-duration post-discharge prophylaxis.
export function improveVte({ priorVte, thrombophilia, lowerLimbParalysis,
  currentCancer, immobilized7d, icuCcuStay, ageGt60 }) {
  const parts = {
    priorVte: priorVte ? 3 : 0,
    thrombophilia: thrombophilia ? 2 : 0,
    lowerLimbParalysis: lowerLimbParalysis ? 2 : 0,
    currentCancer: currentCancer ? 2 : 0,
    immobilized7d: immobilized7d ? 1 : 0,
    icuCcuStay: icuCcuStay ? 1 : 0,
    ageGt60: ageGt60 ? 1 : 0,
  };
  const score = parts.priorVte + parts.thrombophilia + parts.lowerLimbParalysis
    + parts.currentCancer + parts.immobilized7d + parts.icuCcuStay + parts.ageGt60;
  let band;
  if (score >= 4) band = `IMPROVE-VTE ${score} of 12: candidate for extended-duration post-discharge VTE prophylaxis per Spyropoulos 2011 (cutoff >=4).`;
  else if (score >= 2) band = `IMPROVE-VTE ${score} of 12: candidate for inpatient VTE prophylaxis per Spyropoulos 2011 (cutoff >=2).`;
  else band = `IMPROVE-VTE ${score} of 12: low VTE risk per Spyropoulos 2011 (<2); prophylaxis not routinely indicated.`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-6 §3.6.1: Khorana Cancer-VTE (Khorana 2008) ----
// Five criteria; sum 0-6. Bands per Khorana 2008 Table 3 (2.5-mo VTE):
// 0 low (0.3%), 1-2 intermediate (2.0%), >=3 high (6.7%).
// cancerSiteRisk: 'very-high' (+2: stomach, pancreas) / 'high' (+1:
// lung, lymphoma, gynecologic, bladder, testicular) / 'other' (0).
function khoranaCancerWeight(site) {
  if (site === 'very-high') return 2;
  if (site === 'high') return 1;
  return 0;
}
export function khorana({ cancerSiteRisk, plateletGte350, hbLt10OrEsa,
  wbcGt11, bmiGte35 }) {
  const parts = {
    cancerSiteRisk: khoranaCancerWeight(cancerSiteRisk),
    plateletGte350: plateletGte350 ? 1 : 0,
    hbLt10OrEsa: hbLt10OrEsa ? 1 : 0,
    wbcGt11: wbcGt11 ? 1 : 0,
    bmiGte35: bmiGte35 ? 1 : 0,
  };
  const score = parts.cancerSiteRisk + parts.plateletGte350 + parts.hbLt10OrEsa
    + parts.wbcGt11 + parts.bmiGte35;
  let band;
  if (score >= 3) band = `Khorana ${score} of 6: high 2.5-month VTE risk 6.7% per Khorana 2008 Table 3 (>=3 band).`;
  else if (score >= 1) band = `Khorana ${score} of 6: intermediate 2.5-month VTE risk 2.0% per Khorana 2008 Table 3 (1-2 band).`;
  else band = `Khorana ${score} of 6: low 2.5-month VTE risk 0.3% per Khorana 2008 Table 3 (score 0).`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-6 §3.6.2: DASH VTE recurrence (Tosetto 2012) ---
// Four criteria with hormone-use-in-women weighted -2; sum -2 to +4.
// Bands per Tosetto 2012 Table 4: <=1 low (3.1%/yr), 2 intermediate
// (6.4%/yr), >=3 high (12.3%/yr).
export function dashVte({ dDimerAbnormal, ageLt50, male,
  hormoneUseAtInitialVteInWoman }) {
  const parts = {
    dDimerAbnormal: dDimerAbnormal ? 2 : 0,
    ageLt50: ageLt50 ? 1 : 0,
    male: male ? 1 : 0,
    hormoneUseAtInitialVteInWoman: hormoneUseAtInitialVteInWoman ? -2 : 0,
  };
  const score = parts.dDimerAbnormal + parts.ageLt50 + parts.male
    + parts.hormoneUseAtInitialVteInWoman;
  let band;
  if (score >= 3) band = `DASH ${score}: high annual VTE-recurrence risk 12.3% per Tosetto 2012 Table 4 (>=3 band).`;
  else if (score === 2) band = `DASH ${score}: intermediate annual VTE-recurrence risk 6.4% per Tosetto 2012 Table 4 (score 2).`;
  else band = `DASH ${score}: low annual VTE-recurrence risk 3.1% per Tosetto 2012 Table 4 (<=1 band).`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-6 §3.6.3: HERDOO2 (Rodger 2017) ----------------
// Women only; 4 criteria each +1; sum 0-4. Cutoff: 0-1 low (safe to
// discontinue anticoagulation), >=2 continue per Rodger 2017.
export function herdoo2({ legSignsPostThrombotic, dDimerGte250OnAnticoag,
  bmiGte30, ageGte65 }) {
  const parts = {
    legSignsPostThrombotic: legSignsPostThrombotic ? 1 : 0,
    dDimerGte250OnAnticoag: dDimerGte250OnAnticoag ? 1 : 0,
    bmiGte30: bmiGte30 ? 1 : 0,
    ageGte65: ageGte65 ? 1 : 0,
  };
  const score = parts.legSignsPostThrombotic + parts.dDimerGte250OnAnticoag
    + parts.bmiGte30 + parts.ageGte65;
  return {
    score,
    parts,
    canDiscontinue: score <= 1,
    band: score <= 1
      ? `HERDOO2 ${score} of 4 (women): low risk; safe to discontinue anticoagulation per Rodger 2017 (0-1 band).`
      : `HERDOO2 ${score} of 4 (women): continue anticoagulation per Rodger 2017 (>=2 band).`,
  };
}

// --- spec-v14 wave 14-7 §3.7.1: 4Ts Score for HIT (Lo 2006) ----------
// Four domains each scored 0-2; sum 0-8. Bands per Lo 2006 Table 2:
// 0-3 low, 4-5 intermediate, 6-8 high pretest probability of HIT.
function fourTsClamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > 2) return 2;
  return v;
}
export function fourTs({ thrombocytopenia, timingOfFall, thrombosis,
  otherCauses }) {
  const parts = {
    thrombocytopenia: fourTsClamp(thrombocytopenia),
    timingOfFall: fourTsClamp(timingOfFall),
    thrombosis: fourTsClamp(thrombosis),
    otherCauses: fourTsClamp(otherCauses),
  };
  const score = parts.thrombocytopenia + parts.timingOfFall + parts.thrombosis
    + parts.otherCauses;
  let band;
  if (score >= 6) band = `4Ts ${score} of 8: high pretest probability of HIT per Lo 2006 Table 2 (6-8 band).`;
  else if (score >= 4) band = `4Ts ${score} of 8: intermediate pretest probability of HIT per Lo 2006 Table 2 (4-5 band).`;
  else band = `4Ts ${score} of 8: low pretest probability of HIT per Lo 2006 Table 2 (0-3 band).`;
  return { score, parts, band };
}

// --- spec-v14 wave 14-7 §3.7.3: ISTH Overt DIC (Taylor 2001) ---------
// Four laboratory components; sum 0-8. Cutoff >=5 = overt DIC per
// Taylor 2001. Underlying-disorder gate (must be present) surfaced
// before scoring per the published rubric.
// platelet: '>100' (0) / '50-100' (1) / '<50' (2)
// fibrinMarker: 'none' (0) / 'moderate' (2) / 'strong' (3)
// ptProlonged: '<3s' (0) / '3-6s' (1) / '>6s' (2)
// fibrinogen: '>1' (0) / '<=1' (1)
function isthDicPlateletWeight(v) {
  if (v === '<50') return 2;
  if (v === '50-100') return 1;
  return 0;
}
function isthDicFibrinMarkerWeight(v) {
  if (v === 'strong') return 3;
  if (v === 'moderate') return 2;
  return 0;
}
function isthDicPtWeight(v) {
  if (v === '>6s') return 2;
  if (v === '3-6s') return 1;
  return 0;
}
function isthDicFibrinogenWeight(v) {
  if (v === '<=1') return 1;
  return 0;
}
export function isthDic({ underlyingDisorderPresent, platelet, fibrinMarker,
  ptProlonged, fibrinogen }) {
  const parts = {
    platelet: isthDicPlateletWeight(platelet),
    fibrinMarker: isthDicFibrinMarkerWeight(fibrinMarker),
    ptProlonged: isthDicPtWeight(ptProlonged),
    fibrinogen: isthDicFibrinogenWeight(fibrinogen),
  };
  const score = parts.platelet + parts.fibrinMarker + parts.ptProlonged
    + parts.fibrinogen;
  if (!underlyingDisorderPresent) {
    return {
      score,
      parts,
      overtDic: false,
      gateNotMet: true,
      band: 'ISTH DIC scoring not applicable: an underlying disorder known to be associated with DIC must be present per Taylor 2001.',
    };
  }
  return {
    score,
    parts,
    overtDic: score >= 5,
    gateNotMet: false,
    band: score >= 5
      ? `ISTH DIC ${score} of 8: compatible with overt DIC per Taylor 2001 (cutoff >=5).`
      : `ISTH DIC ${score} of 8: not compatible with overt DIC per Taylor 2001 (cutoff >=5); repeat scoring 1-2 days as clinically indicated.`,
  };
}

// --- spec-v14 wave 14-8 §3.8.1: DAPT Score (Yeh 2016) ----------------
// Nine criteria; sum -2 to +10. Cutoff >=2 favors continuing DAPT
// beyond 12 months after PCI per Yeh 2016 (JAMA 2016;315(16)).
// ageBand: '<65' (0) / '65-74' (-1) / '>=75' (-2).
function daptAgeWeight(band) {
  if (band === '>=75') return -2;
  if (band === '65-74') return -1;
  return 0;
}
export function daptScore({ ageBand, chfOrLvefLt30, veinGraftPci,
  miAtPresentation, priorMiOrPci, diabetes, stentDiameterLt3mm,
  paclitaxelStent, currentSmoker }) {
  const parts = {
    ageBand: daptAgeWeight(ageBand),
    chfOrLvefLt30: chfOrLvefLt30 ? 2 : 0,
    veinGraftPci: veinGraftPci ? 2 : 0,
    miAtPresentation: miAtPresentation ? 1 : 0,
    priorMiOrPci: priorMiOrPci ? 1 : 0,
    diabetes: diabetes ? 1 : 0,
    stentDiameterLt3mm: stentDiameterLt3mm ? 1 : 0,
    paclitaxelStent: paclitaxelStent ? 1 : 0,
    currentSmoker: currentSmoker ? 1 : 0,
  };
  const score = parts.ageBand + parts.chfOrLvefLt30 + parts.veinGraftPci
    + parts.miAtPresentation + parts.priorMiOrPci + parts.diabetes
    + parts.stentDiameterLt3mm + parts.paclitaxelStent + parts.currentSmoker;
  return {
    score,
    parts,
    favorsExtendedDapt: score >= 2,
    band: score >= 2
      ? `DAPT Score ${score}: favors continuing DAPT beyond 12 months after PCI per Yeh 2016 (cutoff >=2).`
      : `DAPT Score ${score}: does not favor extended DAPT beyond 12 months per Yeh 2016 (cutoff >=2).`,
  };
}

// --- spec-v14 wave 14-2 §3.2.2: Berlin Questionnaire (Netzer 1999) ---
// Three categories scored by criteria-specific rules. A category is
// "positive" / high-risk when its threshold is met; overall high risk
// for OSA when >=2 categories are positive per Netzer 1999.
//
// Category 1 (snoring): positive if >=2 of these answers are met:
//   - q1Snore: yes
//   - q2LouderThanTalking: yes (louder than talking)
//   - q3FreqAtLeast3to4PerWeek: yes (snore >=3-4 times/week)
//   - q4BotheredOthers: yes
//   - q5ObservedApneaAtLeast3to4PerWeek: yes (observed apnea >=3-4/wk)
//
// Category 2 (daytime sleepiness): positive if >=2 of:
//   - q6TiredAfterSleepAtLeast3to4PerWeek: yes
//   - q7TiredDuringDayAtLeast3to4PerWeek: yes
//   - q8NoddedOffWhileDriving: yes
//
// Category 3 (HTN/BMI): positive if hasHypertension OR bmiGt30.
export function berlinOsa({
  q1Snore, q2LouderThanTalking, q3FreqAtLeast3to4PerWeek,
  q4BotheredOthers, q5ObservedApneaAtLeast3to4PerWeek,
  q6TiredAfterSleepAtLeast3to4PerWeek,
  q7TiredDuringDayAtLeast3to4PerWeek, q8NoddedOffWhileDriving,
  hasHypertension, bmiGt30,
}) {
  const cat1Yes = (q1Snore ? 1 : 0) + (q2LouderThanTalking ? 1 : 0)
    + (q3FreqAtLeast3to4PerWeek ? 1 : 0) + (q4BotheredOthers ? 1 : 0)
    + (q5ObservedApneaAtLeast3to4PerWeek ? 1 : 0);
  const cat2Yes = (q6TiredAfterSleepAtLeast3to4PerWeek ? 1 : 0)
    + (q7TiredDuringDayAtLeast3to4PerWeek ? 1 : 0)
    + (q8NoddedOffWhileDriving ? 1 : 0);
  const cat1Positive = cat1Yes >= 2;
  const cat2Positive = cat2Yes >= 2;
  const cat3Positive = Boolean(hasHypertension) || Boolean(bmiGt30);
  const positiveCount = (cat1Positive ? 1 : 0) + (cat2Positive ? 1 : 0)
    + (cat3Positive ? 1 : 0);
  const highRisk = positiveCount >= 2;
  return {
    cat1Yes, cat2Yes,
    cat1Positive, cat2Positive, cat3Positive,
    positiveCount,
    highRisk,
    band: highRisk
      ? `Berlin Questionnaire: ${positiveCount} of 3 categories positive -> HIGH risk for obstructive sleep apnea per Netzer 1999 (>=2 positive categories).`
      : `Berlin Questionnaire: ${positiveCount} of 3 categories positive -> LOW risk for obstructive sleep apnea per Netzer 1999 (<2 positive categories).`,
  };
}

// --- spec-v14 wave 14-3 §3.3.1: LEMON Difficult Airway (Reed 2005) ---
// Six factors; sum 0-7 (spec-v14 §3.3.1 prose says 0-8 but the
// mathematics produces 0-7: Look 1 + 3-3-2 max 3 + Mallampati 1 +
// Obstruction 1 + Neck 1 = 7). The 3-3-2 rule is the only sub-grouped factor,
// scoring +1 per failed measurement (incisor opening <3 fingerbreadths,
// hyoid-mental <3 fingerbreadths, thyroid-to-floor-of-mouth <2 fb).
// Higher score = greater difficulty. Reed 2005 reports a stepwise rise
// in difficult-intubation rate with score.
export function lemon({ lookExternal, incisorLt3fb, hyoidMentalLt3fb,
  thyroidFloorLt2fb, mallampatiGte3, obstruction, neckMobilityLimited }) {
  const parts = {
    lookExternal: lookExternal ? 1 : 0,
    incisorLt3fb: incisorLt3fb ? 1 : 0,
    hyoidMentalLt3fb: hyoidMentalLt3fb ? 1 : 0,
    thyroidFloorLt2fb: thyroidFloorLt2fb ? 1 : 0,
    mallampatiGte3: mallampatiGte3 ? 1 : 0,
    obstruction: obstruction ? 1 : 0,
    neckMobilityLimited: neckMobilityLimited ? 1 : 0,
  };
  const threeThreeTwo = parts.incisorLt3fb + parts.hyoidMentalLt3fb
    + parts.thyroidFloorLt2fb;
  const score = parts.lookExternal + threeThreeTwo + parts.mallampatiGte3
    + parts.obstruction + parts.neckMobilityLimited;
  return {
    score,
    threeThreeTwo,
    parts,
    band: score === 0
      ? `LEMON 0 of 7: no predictors of difficult intubation per Reed 2005.`
      : `LEMON ${score} of 7: ${score} predictor${score === 1 ? '' : 's'} of difficult intubation per Reed 2005 (higher = greater difficulty).`,
  };
}

// --- spec-v14 wave 14-3 §3.3.4: White-Song Fast-Track (White 1999) ---
// Seven domains each scored 0-2 per White 1999 Anesth Analg; sum 0-14.
// Fast-track-eligible iff score >=12 AND no individual domain <1.
// (Spec §3.3.4 mentions six domains in prose but enumerates seven; the
// published score in White PF, Song D. Anesth Analg 1999;88:1069-72
// scores seven domains: LOC, physical activity, hemodynamic stability,
// respiratory stability, oxygen saturation, postoperative pain,
// postoperative emetic symptoms.)
function whiteSongClamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > 2) return 2;
  return v;
}
export function whiteSong({ loc, physicalActivity, hemodynamicStability,
  respiratoryStability, oxygenSaturation, postoperativePain,
  postoperativeEmesis }) {
  const parts = {
    loc: whiteSongClamp(loc),
    physicalActivity: whiteSongClamp(physicalActivity),
    hemodynamicStability: whiteSongClamp(hemodynamicStability),
    respiratoryStability: whiteSongClamp(respiratoryStability),
    oxygenSaturation: whiteSongClamp(oxygenSaturation),
    postoperativePain: whiteSongClamp(postoperativePain),
    postoperativeEmesis: whiteSongClamp(postoperativeEmesis),
  };
  const score = parts.loc + parts.physicalActivity + parts.hemodynamicStability
    + parts.respiratoryStability + parts.oxygenSaturation
    + parts.postoperativePain + parts.postoperativeEmesis;
  const anyDomainLt1 = Object.values(parts).some((v) => v < 1);
  const fastTrackEligible = score >= 12 && !anyDomainLt1;
  let band;
  if (fastTrackEligible) {
    band = `White-Song ${score} of 14: fast-track eligible per White 1999 (>=12 with no individual domain <1).`;
  } else if (score >= 12 && anyDomainLt1) {
    band = `White-Song ${score} of 14: not fast-track eligible per White 1999 (score >=12 but at least one domain <1).`;
  } else {
    band = `White-Song ${score} of 14: not fast-track eligible per White 1999 (cutoff >=12 with no individual domain <1).`;
  }
  return { score, parts, fastTrackEligible, anyDomainLt1, band };
}

// --- spec-v15 wave 15-1 §3.1.1: Biophysical Profile (Manning 1980) ---
// Five components each 0 or 2 per Manning 1980; sum 0-10. Bands per
// Manning 1980 + ACOG Practice Bulletin 145 (2014):
// 8-10 normal, 6 equivocal, <=4 abnormal.
function bppClamp(n) {
  const v = Number(n) ? 2 : 0;
  return v;
}
export function bpp({ fetalBreathing, fetalMovements, fetalTone,
  amnioticFluid, reactiveNst }) {
  const parts = {
    fetalBreathing: bppClamp(fetalBreathing),
    fetalMovements: bppClamp(fetalMovements),
    fetalTone: bppClamp(fetalTone),
    amnioticFluid: bppClamp(amnioticFluid),
    reactiveNst: bppClamp(reactiveNst),
  };
  const score = parts.fetalBreathing + parts.fetalMovements + parts.fetalTone
    + parts.amnioticFluid + parts.reactiveNst;
  let band;
  if (score >= 8) band = `BPP ${score} of 10: normal per Manning 1980 (8-10 band).`;
  else if (score === 6) band = `BPP ${score} of 10: equivocal per Manning 1980 (score 6).`;
  else band = `BPP ${score} of 10: abnormal per Manning 1980 (<=4 band).`;
  return { score, parts, band };
}

// --- spec-v15 wave 15-1 §3.1.3: ACOG Severe-feature Preeclampsia ----
// Any single feature -> severe preeclampsia per ACOG Task Force 2013
// (re-affirmed Practice Bulletin 222, 2020). The clinician determines
// whether each criterion is met (two-occasion BP rule, transaminase
// threshold, etc.) per the published rubric.
export function acogSeverePre({ sbpGte160OrDbpGte110, thrombocytopeniaLt100,
  impairedHepaticFunction, creatinineGt11OrDoubled, pulmonaryEdema,
  cerebralOrVisualDisturbances }) {
  const parts = {
    sbpGte160OrDbpGte110: sbpGte160OrDbpGte110 ? 1 : 0,
    thrombocytopeniaLt100: thrombocytopeniaLt100 ? 1 : 0,
    impairedHepaticFunction: impairedHepaticFunction ? 1 : 0,
    creatinineGt11OrDoubled: creatinineGt11OrDoubled ? 1 : 0,
    pulmonaryEdema: pulmonaryEdema ? 1 : 0,
    cerebralOrVisualDisturbances: cerebralOrVisualDisturbances ? 1 : 0,
  };
  const featuresPresent = Object.values(parts).reduce((a, b) => a + b, 0);
  const severe = featuresPresent >= 1;
  return {
    featuresPresent,
    parts,
    severe,
    band: severe
      ? `ACOG Severe-feature Preeclampsia: ${featuresPresent} of 6 feature(s) present -> SEVERE preeclampsia per ACOG 2013 (any single feature qualifies).`
      : `ACOG Severe-feature Preeclampsia: 0 of 6 severe features present per ACOG 2013.`,
  };
}

// --- spec-v15 wave 15-1 §3.1.4: HELLP Criteria (Sibai 1990) ---------
// Three criteria: hemolysis (abnormal smear AND/OR total bili >=1.2
// AND/OR LDH >=600), elevated AST >=70, low platelets <100 x10^9/L.
// Complete (all 3) or partial HELLP. Mississippi class by nadir
// platelet count: class 1 <=50, class 2 50-100, class 3 100-150.
function mississippiClass(plateletNadir) {
  const p = Number(plateletNadir);
  if (!Number.isFinite(p)) return null;
  if (p <= 50) return 1;
  if (p <= 100) return 2;
  if (p <= 150) return 3;
  return null;
}
export function hellp({ hemolysis, astGte70, plateletsLt100,
  plateletNadirThousands }) {
  const parts = {
    hemolysis: hemolysis ? 1 : 0,
    astGte70: astGte70 ? 1 : 0,
    plateletsLt100: plateletsLt100 ? 1 : 0,
  };
  const criteriaMet = parts.hemolysis + parts.astGte70 + parts.plateletsLt100;
  const complete = criteriaMet === 3;
  const partial = criteriaMet > 0 && criteriaMet < 3;
  const msClass = plateletNadirThousands === undefined || plateletNadirThousands === null || plateletNadirThousands === ''
    ? null
    : mississippiClass(plateletNadirThousands);
  let label;
  if (complete) label = 'complete HELLP';
  else if (partial) label = `partial HELLP (${criteriaMet} of 3 criteria)`;
  else label = 'no HELLP criteria met';
  let band = `HELLP: ${label} per Sibai 1990.`;
  if (msClass !== null) {
    band += ` Mississippi class ${msClass} (platelet nadir ${plateletNadirThousands} x10^9/L).`;
  }
  return { criteriaMet, parts, complete, partial, mississippiClass: msClass, band };
}

// --- spec-v15 wave 15-1 §3.1.5: Carpenter-Coustan (Carpenter 1982) --
// 100-g 3-h OGTT; GDM if >=2 values exceed: fasting 95 / 1-h 180 /
// 2-h 155 / 3-h 140 mg/dL. Single abnormal = impaired glucose
// tolerance.
const CARPENTER_COUSTAN_CUTOFFS = { fasting: 95, oneHour: 180, twoHour: 155, threeHour: 140 };
export function carpenterCoustan({ fasting, oneHour, twoHour, threeHour }) {
  const flags = {
    fasting: Number(fasting) >= CARPENTER_COUSTAN_CUTOFFS.fasting,
    oneHour: Number(oneHour) >= CARPENTER_COUSTAN_CUTOFFS.oneHour,
    twoHour: Number(twoHour) >= CARPENTER_COUSTAN_CUTOFFS.twoHour,
    threeHour: Number(threeHour) >= CARPENTER_COUSTAN_CUTOFFS.threeHour,
  };
  const exceeded = Object.values(flags).filter(Boolean).length;
  const gdm = exceeded >= 2;
  const igt = exceeded === 1;
  let band;
  if (gdm) band = `Carpenter-Coustan: ${exceeded} of 4 values exceed cutoffs -> GDM diagnosed per Carpenter 1982 (>=2 abnormal).`;
  else if (igt) band = `Carpenter-Coustan: 1 of 4 values exceeds cutoff -> impaired glucose tolerance per Carpenter 1982 (single abnormal value).`;
  else band = `Carpenter-Coustan: 0 of 4 values exceed cutoffs -> not diagnostic of GDM per Carpenter 1982.`;
  return {
    exceeded, gdm, igt, flags,
    cutoffs: CARPENTER_COUSTAN_CUTOFFS,
    band,
  };
}

// --- spec-v15 wave 15-1 §3.1.6: IADPSG GDM (IADPSG 2010) ------------
// 75-g 2-h OGTT; GDM if >=1 value exceeds: fasting 92 / 1-h 180 /
// 2-h 153 mg/dL per IADPSG 2010 (Diabetes Care).
const IADPSG_CUTOFFS = { fasting: 92, oneHour: 180, twoHour: 153 };
export function iadpsg({ fasting, oneHour, twoHour }) {
  const flags = {
    fasting: Number(fasting) >= IADPSG_CUTOFFS.fasting,
    oneHour: Number(oneHour) >= IADPSG_CUTOFFS.oneHour,
    twoHour: Number(twoHour) >= IADPSG_CUTOFFS.twoHour,
  };
  const exceeded = Object.values(flags).filter(Boolean).length;
  const gdm = exceeded >= 1;
  return {
    exceeded, gdm, flags,
    cutoffs: IADPSG_CUTOFFS,
    band: gdm
      ? `IADPSG: ${exceeded} of 3 values exceed cutoffs -> GDM diagnosed per IADPSG 2010 (>=1 abnormal).`
      : `IADPSG: 0 of 3 values exceed cutoffs -> not diagnostic of GDM per IADPSG 2010.`,
  };
}

// --- spec-v15 wave 15-2 §3.2.1: Rochester (Jaskiewicz 1994) ----------
// Low-risk febrile infant if ALL criteria met. Criteria are inclusive
// of demographic + clinical + laboratory. Failure of ANY criterion =>
// not low risk. The score surfaces both the boolean and the failing
// criteria so a clinician can see which item disqualified the patient.
const ROCHESTER_CRITERIA = [
  'ageLte60Days',
  'termAndPreviouslyHealthy',
  'noFocalInfection',
  'wbc5to15',
  'bandsLte1Point5',
  'urineWbcLte10PerHpf',
  'stoolWbcLte5PerHpf',
];
export function rochester(inputs) {
  const met = {};
  const failing = [];
  for (const k of ROCHESTER_CRITERIA) {
    met[k] = Boolean(inputs[k]);
    if (!met[k]) failing.push(k);
  }
  const lowRisk = failing.length === 0;
  return {
    lowRisk,
    failing,
    metCount: ROCHESTER_CRITERIA.length - failing.length,
    totalCount: ROCHESTER_CRITERIA.length,
    met,
    band: lowRisk
      ? `Rochester: all 7 criteria met -> LOW risk for SBI per Jaskiewicz 1994.`
      : `Rochester: ${ROCHESTER_CRITERIA.length - failing.length} of 7 criteria met -> NOT low risk for SBI per Jaskiewicz 1994 (any failed criterion disqualifies).`,
  };
}

// --- spec-v15 wave 15-2 §3.2.2: Philadelphia (Baker 1993) ------------
// All low-risk criteria must be met for safe outpatient management
// without empiric antibiotics. CXR + stool are conditional on whether
// obtained / diarrhea present.
const PHILADELPHIA_CRITERIA = [
  'age29To60Days',
  'wellAppearing',
  'wbcLt15',
  'bandToNeutrophilRatioLt0Point2',
  'uaLt10WbcAndFewBacteria',
  'csfLt8WbcAndGramStainNeg',
  'cxrClearOrNotObtained',
  'stoolNormalOrNoDiarrhea',
];
export function philadelphia(inputs) {
  const met = {};
  const failing = [];
  for (const k of PHILADELPHIA_CRITERIA) {
    met[k] = Boolean(inputs[k]);
    if (!met[k]) failing.push(k);
  }
  const lowRisk = failing.length === 0;
  return {
    lowRisk,
    failing,
    metCount: PHILADELPHIA_CRITERIA.length - failing.length,
    totalCount: PHILADELPHIA_CRITERIA.length,
    met,
    band: lowRisk
      ? `Philadelphia: all 8 criteria met -> LOW risk; safe outpatient management without empiric antibiotic per Baker 1993.`
      : `Philadelphia: ${PHILADELPHIA_CRITERIA.length - failing.length} of 8 criteria met -> NOT low risk per Baker 1993 (any failed criterion disqualifies).`,
  };
}

// --- spec-v15 wave 15-2 §3.2.3: Boston (Baskin 1992) -----------------
// All criteria met -> eligible for outpatient ceftriaxone management.
const BOSTON_CRITERIA = [
  'age28To89Days',
  'wellAppearing',
  'noFocalSourceOnExam',
  'wbcLt20',
  'uaLt10WbcPerHpf',
  'csfLt10WbcPerMm3',
  'cxrClearOrNotObtained',
];
export function bostonFebrile(inputs) {
  const met = {};
  const failing = [];
  for (const k of BOSTON_CRITERIA) {
    met[k] = Boolean(inputs[k]);
    if (!met[k]) failing.push(k);
  }
  const lowRisk = failing.length === 0;
  return {
    lowRisk,
    failing,
    metCount: BOSTON_CRITERIA.length - failing.length,
    totalCount: BOSTON_CRITERIA.length,
    met,
    band: lowRisk
      ? `Boston: all 7 criteria met -> eligible for outpatient ceftriaxone management per Baskin 1992.`
      : `Boston: ${BOSTON_CRITERIA.length - failing.length} of 7 criteria met -> NOT eligible for outpatient ceftriaxone management per Baskin 1992.`,
  };
}

// --- spec-v15 wave 15-2 §3.2.4: Step-by-Step (Gomez 2016) ------------
// Sequential decision tree per Gomez 2016 Figure 1:
//   1. Unwell appearance -> HIGH risk.
//   2. Age <=21 days -> HIGH risk.
//   3. Leukocyturia (UA abnormal) -> HIGH risk.
//   4. Procalcitonin >=0.5 ng/mL -> HIGH risk.
//   5. CRP >20 mg/L or ANC >10 x10^9/L -> INTERMEDIATE risk.
//   6. Otherwise -> LOW risk.
export function stepByStep({ unwellAppearance, ageLte21Days,
  urinalysisAbnormal, procalcitoninGte0Point5, crpGt20OrAncGt10 }) {
  let risk;
  let reason;
  if (unwellAppearance) {
    risk = 'high';
    reason = 'unwell appearance';
  } else if (ageLte21Days) {
    risk = 'high';
    reason = 'age <=21 days';
  } else if (urinalysisAbnormal) {
    risk = 'high';
    reason = 'abnormal urinalysis (leukocyturia)';
  } else if (procalcitoninGte0Point5) {
    risk = 'high';
    reason = 'procalcitonin >=0.5 ng/mL';
  } else if (crpGt20OrAncGt10) {
    risk = 'intermediate';
    reason = 'CRP >20 mg/L or ANC >10 x10^9/L';
  } else {
    risk = 'low';
    reason = 'all preceding steps negative';
  }
  return {
    risk,
    reason,
    band: `Step-by-Step: ${risk.toUpperCase()} risk per Gomez 2016 (${reason}).`,
  };
}

// --- spec-v15 wave 15-2 §3.2.5: Yale Observation Scale (McCarthy 1982)
// Six observation items each scored 1 (normal) / 3 (moderate
// impairment) / 5 (severe impairment). Sum 6-30. Bands per
// McCarthy 1982 §Results: <=10 not impressive; 11-15 mild risk;
// >=16 high probability of SBI.
const YOS_ALLOWED = new Set([1, 3, 5]);
function yosClamp(n) {
  const v = Math.round(Number(n));
  if (YOS_ALLOWED.has(v)) return v;
  if (!Number.isFinite(v) || v <= 1) return 1;
  if (v <= 3) return 3;
  return 5;
}
export function yos({ qualityOfCry, reactionToParents, stateVariation,
  color, hydration, responseToSocialOvertures }) {
  const parts = {
    qualityOfCry: yosClamp(qualityOfCry),
    reactionToParents: yosClamp(reactionToParents),
    stateVariation: yosClamp(stateVariation),
    color: yosClamp(color),
    hydration: yosClamp(hydration),
    responseToSocialOvertures: yosClamp(responseToSocialOvertures),
  };
  const score = parts.qualityOfCry + parts.reactionToParents
    + parts.stateVariation + parts.color + parts.hydration
    + parts.responseToSocialOvertures;
  let band;
  if (score >= 16) band = `YOS ${score} of 30: HIGH probability of serious bacterial infection per McCarthy 1982 (>=16 band).`;
  else if (score >= 11) band = `YOS ${score} of 30: increased SBI risk per McCarthy 1982 (11-15 band).`;
  else band = `YOS ${score} of 30: low SBI risk per McCarthy 1982 (<=10 band).`;
  return { score, parts, band };
}

// --- spec-v15 wave 15-3 §3.3.1: Westley Croup Score (Westley 1978) ---
// Five items with non-uniform per-item maxima:
//   level of consciousness: 0 / 5 (normal / disoriented)
//   cyanosis: 0 / 4 / 5 (none / with agitation / at rest)
//   stridor: 0 / 1 / 2 (none / with agitation / at rest)
//   air entry: 0 / 1 / 2 (normal / decreased / markedly decreased)
//   retractions: 0 / 1 / 2 / 3 (none / mild / moderate / severe)
// Sum 0-17. Bands per Westley 1978 §Methods: <3 mild, 3-7 moderate,
// 8-11 severe, >=12 impending respiratory failure.
function pickFrom(value, allowed) {
  const v = Math.round(Number(value));
  if (allowed.includes(v)) return v;
  // round to nearest allowed token
  let best = allowed[0];
  let bestDist = Math.abs(v - best);
  for (const a of allowed) {
    const d = Math.abs(v - a);
    if (d < bestDist) { best = a; bestDist = d; }
  }
  return Number.isFinite(v) ? best : allowed[0];
}
export function westley({ loc, cyanosis, stridor, airEntry, retractions }) {
  const parts = {
    loc: pickFrom(loc, [0, 5]),
    cyanosis: pickFrom(cyanosis, [0, 4, 5]),
    stridor: pickFrom(stridor, [0, 1, 2]),
    airEntry: pickFrom(airEntry, [0, 1, 2]),
    retractions: pickFrom(retractions, [0, 1, 2, 3]),
  };
  const score = parts.loc + parts.cyanosis + parts.stridor
    + parts.airEntry + parts.retractions;
  let band;
  if (score >= 12) band = `Westley ${score} of 17: impending respiratory failure per Westley 1978 (>=12 band).`;
  else if (score >= 8) band = `Westley ${score} of 17: severe croup per Westley 1978 (8-11 band).`;
  else if (score >= 3) band = `Westley ${score} of 17: moderate croup per Westley 1978 (3-7 band).`;
  else band = `Westley ${score} of 17: mild croup per Westley 1978 (<3 band).`;
  return { score, parts, band };
}

// --- spec-v15 wave 15-3 §3.3.2: PRAM (Chalut 2000) ------------------
// Five items with non-uniform per-item maxima:
//   suprasternal retractions: 0 / 2
//   scalene muscle use: 0 / 2
//   air entry: 0 / 1 / 2 / 3
//   wheezing: 0 / 1 / 2 / 3
//   SpO2 on room air: 0 / 1 / 2
// Sum 0-12. Bands per Chalut 2000: 0-3 mild, 4-7 moderate, 8-12 severe.
export function pramAsthma({ suprasternal, scalene, airEntry, wheezing, spo2 }) {
  const parts = {
    suprasternal: pickFrom(suprasternal, [0, 2]),
    scalene: pickFrom(scalene, [0, 2]),
    airEntry: pickFrom(airEntry, [0, 1, 2, 3]),
    wheezing: pickFrom(wheezing, [0, 1, 2, 3]),
    spo2: pickFrom(spo2, [0, 1, 2]),
  };
  const score = parts.suprasternal + parts.scalene + parts.airEntry
    + parts.wheezing + parts.spo2;
  let band;
  if (score >= 8) band = `PRAM ${score} of 12: severe asthma per Chalut 2000 (8-12 band).`;
  else if (score >= 4) band = `PRAM ${score} of 12: moderate asthma per Chalut 2000 (4-7 band).`;
  else band = `PRAM ${score} of 12: mild asthma per Chalut 2000 (0-3 band).`;
  return { score, parts, band };
}

// --- spec-v15 wave 15-3 §3.3.3: PASS (Gorelick 2004) ----------------
// Three items each 0-2; sum 0-6. Bands per Gorelick 2004:
// 0-1 mild, 2-3 moderate, 4-6 severe.
function pass02Clamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > 2) return 2;
  return v;
}
export function passAsthma({ wheezing, workOfBreathing, prolongedExpiration }) {
  const parts = {
    wheezing: pass02Clamp(wheezing),
    workOfBreathing: pass02Clamp(workOfBreathing),
    prolongedExpiration: pass02Clamp(prolongedExpiration),
  };
  const score = parts.wheezing + parts.workOfBreathing + parts.prolongedExpiration;
  let band;
  if (score >= 4) band = `PASS ${score} of 6: severe asthma per Gorelick 2004 (4-6 band).`;
  else if (score >= 2) band = `PASS ${score} of 6: moderate asthma per Gorelick 2004 (2-3 band).`;
  else band = `PASS ${score} of 6: mild asthma per Gorelick 2004 (0-1 band).`;
  return { score, parts, band };
}

// --- spec-v15 wave 15-3 §3.3.4: Pediatric GCS (Reilly 1988) ---------
// Eye opening 1-4, verbal 1-5 (age-adjusted), motor 1-6. Sum 3-15.
// Same severity bands as adult GCS: <=8 severe, 9-12 moderate,
// 13-15 mild.
function eyeClamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 1) return 1;
  if (v > 4) return 4;
  return v;
}
function verbalClamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 1) return 1;
  if (v > 5) return 5;
  return v;
}
function motorClamp(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 1) return 1;
  if (v > 6) return 6;
  return v;
}
export function pedsGcs({ eye, verbal, motor, ageBand }) {
  const parts = {
    eye: eyeClamp(eye),
    verbal: verbalClamp(verbal),
    motor: motorClamp(motor),
  };
  const score = parts.eye + parts.verbal + parts.motor;
  let severity;
  if (score <= 8) severity = 'severe';
  else if (score <= 12) severity = 'moderate';
  else severity = 'mild';
  const ageLabel = ageBand === 'under-2' ? 'under 2 years' : (ageBand === '2-5' ? '2-5 years' : 'older child');
  return {
    score, parts, severity, ageBand: ageBand || 'older',
    band: `Pediatric GCS ${score} of 15 (${ageLabel} verbal scale): ${severity} per adult GCS bands (<=8 severe, 9-12 moderate, 13-15 mild).`,
  };
}

// --- spec-v15 wave 15-3 §3.3.5: Bacterial Meningitis (Nigrovic 2007)
// Five weighted criteria; cutoff: 0 = very low risk for bacterial
// meningitis (NPV ~99.9%); >=1 = not low risk, do not discharge per
// Nigrovic 2007. Note: positive CSF Gram stain is weighted +2 per the
// published rubric; all other criteria +1.
export function nigrovic({ csfGramStainPositive, csfAncGte1000,
  csfProteinGte80, peripheralAncGte10000, seizureAtOrBeforePresentation }) {
  const parts = {
    csfGramStainPositive: csfGramStainPositive ? 2 : 0,
    csfAncGte1000: csfAncGte1000 ? 1 : 0,
    csfProteinGte80: csfProteinGte80 ? 1 : 0,
    peripheralAncGte10000: peripheralAncGte10000 ? 1 : 0,
    seizureAtOrBeforePresentation: seizureAtOrBeforePresentation ? 1 : 0,
  };
  const score = parts.csfGramStainPositive + parts.csfAncGte1000
    + parts.csfProteinGte80 + parts.peripheralAncGte10000
    + parts.seizureAtOrBeforePresentation;
  const veryLowRisk = score === 0;
  return {
    score,
    parts,
    veryLowRisk,
    band: veryLowRisk
      ? `Nigrovic: 0 -> very low risk for bacterial meningitis per Nigrovic 2007 (NPV ~99.9%).`
      : `Nigrovic ${score}: NOT low risk for bacterial meningitis per Nigrovic 2007 (>=1); do not discharge.`,
  };
}

// --- spec-v15 wave 15-4 §3.4.1: PECARN IAI (Holmes 2013) ------------
// Seven NEGATIVE findings. ALL must be absent (i.e., all seven inputs
// are "no" / not present) -> very low risk of clinically important
// intra-abdominal injury (NPV 99.9% per Holmes 2013). ANY present ->
// not very low risk; consider imaging.
const PECARN_IAI_FINDINGS = [
  'abdominalWallTraumaOrSeatBeltSign',
  'gcsLt14',
  'abdominalTenderness',
  'vomiting',
  'thoracicWallTrauma',
  'abdominalPain',
  'decreasedBreathSounds',
];
export function pecarnIai(inputs) {
  const present = {};
  const presentList = [];
  for (const k of PECARN_IAI_FINDINGS) {
    present[k] = Boolean(inputs[k]);
    if (present[k]) presentList.push(k);
  }
  const veryLowRisk = presentList.length === 0;
  return {
    veryLowRisk,
    findingsPresent: presentList,
    presentCount: presentList.length,
    totalCount: PECARN_IAI_FINDINGS.length,
    present,
    band: veryLowRisk
      ? `PECARN IAI: 0 of 7 risk findings present -> very low risk of clinically important IAI per Holmes 2013 (NPV 99.9%).`
      : `PECARN IAI: ${presentList.length} of 7 risk findings present -> NOT very low risk per Holmes 2013; consider imaging.`,
  };
}

// --- spec-v15 wave 15-4 §3.4.2: PECARN C-Spine (Leonard 2019) -------
// Eight risk factors. ANY present -> not low-risk. NONE present ->
// low-risk; cervical-spine imaging not indicated per Leonard 2019.
const PECARN_CSPINE_FACTORS = [
  'alteredMentalStatus',
  'abnormalAirwayBreathingCirculation',
  'focalNeurologicDeficit',
  'neckPain',
  'torticollis',
  'substantialTorsoInjury',
  'predisposingCondition',
  'highRiskMvc',
];
export function pecarnCspine(inputs) {
  const present = {};
  const presentList = [];
  for (const k of PECARN_CSPINE_FACTORS) {
    present[k] = Boolean(inputs[k]);
    if (present[k]) presentList.push(k);
  }
  const lowRisk = presentList.length === 0;
  return {
    lowRisk,
    factorsPresent: presentList,
    presentCount: presentList.length,
    totalCount: PECARN_CSPINE_FACTORS.length,
    present,
    band: lowRisk
      ? `PECARN C-Spine: 0 of 8 risk factors present -> LOW risk per Leonard 2019; cervical-spine imaging not indicated.`
      : `PECARN C-Spine: ${presentList.length} of 8 risk factors present -> NOT low risk per Leonard 2019; cervical-spine imaging warranted.`,
  };
}

// --- spec-v15 wave 15-5 §3.5.8: ABC Score for Massive Transfusion ----
// Nunez 2009. Four binary criteria; >=2 -> activate MTP
// (sensitivity 75%, specificity 86% per Nunez 2009 §Results).
const ABC_MTP_CRITERIA = [
  'penetratingMechanism',
  'sbpLe90',
  'hrGe120',
  'positiveFast',
];
export function abcMtp(inputs) {
  const present = {};
  const presentList = [];
  for (const k of ABC_MTP_CRITERIA) {
    present[k] = Boolean(inputs[k]);
    if (present[k]) presentList.push(k);
  }
  const score = presentList.length;
  const activateMtp = score >= 2;
  return {
    score,
    present,
    criteriaPresent: presentList,
    activateMtp,
    band: activateMtp
      ? `ABC ${score} of 4: activate massive transfusion protocol per Nunez 2009 (>=2 threshold; sensitivity 75%, specificity 86%).`
      : `ABC ${score} of 4: MTP activation not indicated by ABC alone per Nunez 2009 (>=2 threshold).`,
  };
}

// --- spec-v15 wave 15-5 §3.5.6: MGAP Trauma Score ---------------------
// Sartorius 2010. Mechanism (blunt 4 / penetrating 0) + GCS (3-15) +
// Age <60 (5) + SBP bands (>120 = 5; 60-120 = 3; <60 = 0). Bands per
// Sartorius 2010 Table 3: <18 high, 18-22 moderate, 23-29 low risk.
export function mgap({ mechanismBlunt, gcs, ageLt60, sbp }) {
  const g = Number(gcs);
  const s = Number(sbp);
  if (!Number.isFinite(g) || g < 3 || g > 15) throw new RangeError('mgap: GCS must be 3-15');
  if (!Number.isFinite(s) || s < 0) throw new RangeError('mgap: SBP must be a non-negative number');
  const mechanismPts = mechanismBlunt ? 4 : 0;
  const agePts = ageLt60 ? 5 : 0;
  let sbpPts = 0;
  if (s > 120) sbpPts = 5;
  else if (s >= 60) sbpPts = 3;
  else sbpPts = 0;
  const score = mechanismPts + g + agePts + sbpPts;
  let risk;
  if (score < 18) risk = 'high';
  else if (score <= 22) risk = 'moderate';
  else risk = 'low';
  return {
    score,
    parts: { mechanism: mechanismPts, gcs: g, age: agePts, sbp: sbpPts },
    risk,
    band: `MGAP ${score}: ${risk} risk per Sartorius 2010 (<18 high; 18-22 moderate; 23-29 low).`,
  };
}

// --- spec-v15 wave 15-5 §3.5.7: GAP Trauma Score ----------------------
// Kondo 2011. GCS (3-15) + Age <60 (3) + SBP bands (>120 = 6; 60-120
// = 4; <60 = 0). Bands per Kondo 2011: <=10 high, 11-18 moderate,
// 19-24 low risk.
export function gap({ gcs, ageLt60, sbp }) {
  const g = Number(gcs);
  const s = Number(sbp);
  if (!Number.isFinite(g) || g < 3 || g > 15) throw new RangeError('gap: GCS must be 3-15');
  if (!Number.isFinite(s) || s < 0) throw new RangeError('gap: SBP must be a non-negative number');
  const agePts = ageLt60 ? 3 : 0;
  let sbpPts = 0;
  if (s > 120) sbpPts = 6;
  else if (s >= 60) sbpPts = 4;
  else sbpPts = 0;
  const score = g + agePts + sbpPts;
  let risk;
  if (score <= 10) risk = 'high';
  else if (score <= 18) risk = 'moderate';
  else risk = 'low';
  return {
    score,
    parts: { gcs: g, age: agePts, sbp: sbpPts },
    risk,
    band: `GAP ${score}: ${risk} risk per Kondo 2011 (<=10 high; 11-18 moderate; 19-24 low).`,
  };
}

// --- spec-v15 wave 15-5 §3.5.5: BIG Score (pediatric trauma) ---------
// Borgman 2011. BIG = base deficit + 2.5 * INR + (15 - GCS). >=16
// predicts mortality with high sensitivity per Borgman 2011 §Results.
export function big({ baseDeficit, inr, gcs }) {
  const bd = Number(baseDeficit);
  const i = Number(inr);
  const g = Number(gcs);
  if (!Number.isFinite(bd)) throw new TypeError('big: base deficit must be a number');
  if (!Number.isFinite(i) || i < 0) throw new RangeError('big: INR must be a non-negative number');
  if (!Number.isFinite(g) || g < 3 || g > 15) throw new RangeError('big: GCS must be 3-15');
  const score = bd + 2.5 * i + (15 - g);
  const highMortalityRisk = score >= 16;
  return {
    score,
    parts: { baseDeficit: bd, inrComponent: 2.5 * i, gcsComponent: 15 - g },
    highMortalityRisk,
    band: highMortalityRisk
      ? `BIG ${score.toFixed(1)}: >=16 -> high predicted mortality per Borgman 2011.`
      : `BIG ${score.toFixed(1)}: <16 -> below the Borgman 2011 high-mortality threshold.`,
  };
}

// --- spec-v29 §4.1.2 wave 29-3a: Braden Scale ------------------------
// Bergstrom 1987. Sum of six ordinal items; bands per Bergstrom
// validation: >=19 not at risk, 15-18 mild, 13-14 moderate, 10-12 high,
// <=9 very high.
export function braden({ sensory, moisture, activity, mobility, nutrition, friction }) {
  const v = {
    sensory: Number(sensory),
    moisture: Number(moisture),
    activity: Number(activity),
    mobility: Number(mobility),
    nutrition: Number(nutrition),
    friction: Number(friction),
  };
  for (const [k, x] of Object.entries(v)) {
    if (!Number.isFinite(x)) throw new TypeError(`braden: ${k} must be a number`);
    const max = k === 'friction' ? 3 : 4;
    if (x < 1 || x > max) throw new TypeError(`braden: ${k} must be 1-${max}`);
  }
  const score = v.sensory + v.moisture + v.activity + v.mobility + v.nutrition + v.friction;
  let band;
  if (score >= 19) band = 'not at risk';
  else if (score >= 15) band = 'mild risk';
  else if (score >= 13) band = 'moderate risk';
  else if (score >= 10) band = 'high risk';
  else band = 'very high risk';
  return {
    score,
    parts: v,
    band,
    text: `Braden ${score}: ${band} per Bergstrom 1987 (>=19 none; 15-18 mild; 13-14 moderate; 10-12 high; <=9 very high).`,
  };
}

// --- spec-v29 §4.2.1 wave 29-3a: Morse Fall Scale ---------------------
// Morse 1989. Six weighted items; bands 0-24 low, 25-50 moderate, >=51
// high fall risk.
export function morseFalls({
  history, secondaryDx, ambulatoryAid, ivOrLock, gait, mentalStatus,
}) {
  const h = history ? 25 : 0;
  const sd = secondaryDx ? 15 : 0;
  let aid = 0;
  if (ambulatoryAid === 'furniture') aid = 30;
  else if (ambulatoryAid === 'crutches-cane-walker') aid = 15;
  else aid = 0;
  const iv = ivOrLock ? 20 : 0;
  let g = 0;
  if (gait === 'impaired') g = 20;
  else if (gait === 'weak') g = 10;
  else g = 0;
  const ms = mentalStatus === 'forgets-limitations' ? 15 : 0;
  const score = h + sd + aid + iv + g + ms;
  let band;
  if (score >= 51) band = 'high';
  else if (score >= 25) band = 'moderate';
  else band = 'low';
  return {
    score,
    parts: { history: h, secondaryDx: sd, ambulatoryAid: aid, ivOrLock: iv, gait: g, mentalStatus: ms },
    band,
    text: `Morse ${score}: ${band} fall risk per Morse 1989 (0-24 low; 25-50 moderate; >=51 high).`,
  };
}

// --- spec-v29 §4.2.2 wave 29-3a: Hendrich II Fall Risk Model ----------
// Hendrich 2003. Validated >=5 high fall risk.
export function hendrichII({
  confusion, depression, alteredElim, dizziness, male,
  antiepileptic, benzodiazepine, getUpAndGo,
}) {
  const c = confusion ? 4 : 0;
  const d = depression ? 2 : 0;
  const ae = alteredElim ? 1 : 0;
  const dz = dizziness ? 1 : 0;
  const m = male ? 1 : 0;
  const aed = antiepileptic ? 2 : 0;
  const bz = benzodiazepine ? 1 : 0;
  let gug = 0;
  if (getUpAndGo === 'unable') gug = 4;
  else if (getUpAndGo === 'needs-help') gug = 3;
  else if (getUpAndGo === 'pushes-up') gug = 1;
  else gug = 0;
  const score = c + d + ae + dz + m + aed + bz + gug;
  const highRisk = score >= 5;
  return {
    score,
    parts: { confusion: c, depression: d, alteredElim: ae, dizziness: dz, male: m, antiepileptic: aed, benzodiazepine: bz, getUpAndGo: gug },
    highRisk,
    band: highRisk ? 'high fall risk' : 'not high fall risk',
    text: highRisk
      ? `Hendrich II ${score}: high fall risk per Hendrich 2003 (>=5 cutoff).`
      : `Hendrich II ${score}: below the Hendrich 2003 high-risk cutoff (>=5).`,
  };
}

// --- spec-v29 §4.4.1 wave 29-3a: Confusion Assessment Method (CAM) ---
// Inouye 1990. CAM-positive when feature 1 + feature 2 AND
// (feature 3 OR feature 4).
export function cam({ acuteFluctuating, inattention, disorganizedThinking, alteredLoc }) {
  const f1 = Boolean(acuteFluctuating);
  const f2 = Boolean(inattention);
  const f3 = Boolean(disorganizedThinking);
  const f4 = Boolean(alteredLoc);
  const positive = f1 && f2 && (f3 || f4);
  const features = { acuteFluctuating: f1, inattention: f2, disorganizedThinking: f3, alteredLoc: f4 };
  return {
    positive,
    features,
    band: positive ? 'CAM positive (delirium suggested)' : 'CAM negative',
    text: positive
      ? 'CAM positive per Inouye 1990 (features 1 + 2 and (3 or 4)): delirium suggested.'
      : 'CAM negative per Inouye 1990: features 1 + 2 and (3 or 4) not all met.',
  };
}

// --- spec-v29 §4.7.2 wave 29-3a: ICH Score (Hemphill 2001) -----------
// 5 inputs; sum 0-6; 30-day mortality per Hemphill 2001 Table 4:
// 0 -> 0%, 1 -> 13%, 2 -> 26%, 3 -> 72%, 4 -> 97%, 5/6 -> 100%.
export function ichScore({ gcs, age, ichVolumeMl, infratentorial, ivh }) {
  const g = Number(gcs);
  const a = Number(age);
  const v = Number(ichVolumeMl);
  if (!Number.isFinite(g) || g < 3 || g > 15) throw new RangeError('ich-score: GCS must be 3-15');
  if (!Number.isFinite(a) || a < 0) throw new RangeError('ich-score: age must be a non-negative number');
  if (!Number.isFinite(v) || v < 0) throw new RangeError('ich-score: ICH volume must be a non-negative number');
  let gcsPts = 0;
  if (g >= 3 && g <= 4) gcsPts = 2;
  else if (g >= 5 && g <= 12) gcsPts = 1;
  else gcsPts = 0;
  const agePts = a >= 80 ? 1 : 0;
  const volPts = v >= 30 ? 1 : 0;
  const infraPts = infratentorial ? 1 : 0;
  const ivhPts = ivh ? 1 : 0;
  const score = gcsPts + agePts + volPts + infraPts + ivhPts;
  const MORTALITY = ['0%', '13%', '26%', '72%', '97%', '100%', '100%'];
  return {
    score,
    parts: { gcs: gcsPts, age: agePts, volume: volPts, infratentorial: infraPts, ivh: ivhPts },
    mortality30d: MORTALITY[score],
    band: `ICH Score ${score}: 30-day mortality ${MORTALITY[score]} per Hemphill 2001 Table 4.`,
  };
}

// --- spec-v29 §4.7.3 wave 29-3a: Hunt-Hess + WFNS aSAH grading -------
// Hunt-Hess: Hunt 1968 I-V picker. WFNS: Drake 1988 -> grade from GCS
// band + focal motor deficit.
const HUNT_HESS_LABELS = {
  1: 'I: asymptomatic or minimal headache',
  2: 'II: moderate-to-severe headache, nuchal rigidity, no neuro deficit other than CN palsy',
  3: 'III: drowsy, mild focal deficit',
  4: 'IV: stupor, moderate-to-severe hemiparesis',
  5: 'V: deep coma, decerebrate posturing, moribund',
};
export function huntHessWfns({ huntHess, gcs, focalMotorDeficit }) {
  const hh = Number(huntHess);
  const g = Number(gcs);
  if (!Number.isInteger(hh) || hh < 1 || hh > 5) throw new RangeError('hunt-hess-wfns: Hunt-Hess must be 1-5');
  if (!Number.isFinite(g) || g < 3 || g > 15) throw new RangeError('hunt-hess-wfns: GCS must be 3-15');
  let wfns;
  if (g === 15) wfns = 1;
  else if (g >= 13) wfns = focalMotorDeficit ? 3 : 2;
  else if (g >= 7) wfns = focalMotorDeficit ? 4 : 4;
  else wfns = 5;
  return {
    huntHess: hh,
    wfns,
    huntHessLabel: HUNT_HESS_LABELS[hh],
    text: `Hunt-Hess ${hh} / WFNS ${wfns} per Hunt 1968 + Drake 1988. Surgical timing and outcome per the corresponding grade band.`,
  };
}

// --- spec-v29 §4.7.1 wave 29-3a: modified NIHSS (Meyer 2002) ---------
// 11 items per Meyer 2002 (LOC questions, LOC commands, gaze, visual
// fields, motor arm L, motor arm R, motor leg L, motor leg R, sensory
// dichotomized 0-1, language, extinction). Total 0-31. Severity bands
// per NIHSS convention (mNIHSS validates against the same bands per
// Meyer 2002 sec Results): 0 no symptoms; 1-4 minor; 5-15 moderate;
// 16-20 moderate-severe; >=21 severe.
const MNIHSS_ITEMS = [
  { id: 'locQuestions', max: 2 },
  { id: 'locCommands',  max: 2 },
  { id: 'gaze',         max: 2 },
  { id: 'visualFields', max: 3 },
  { id: 'motorArmL',    max: 4 },
  { id: 'motorArmR',    max: 4 },
  { id: 'motorLegL',    max: 4 },
  { id: 'motorLegR',    max: 4 },
  { id: 'sensory',      max: 1 },
  { id: 'language',     max: 3 },
  { id: 'extinction',   max: 2 },
];
export function mnihss(answers) {
  let total = 0;
  for (const it of MNIHSS_ITEMS) {
    const v = Number(answers[it.id] || 0);
    if (!Number.isFinite(v) || v < 0 || v > it.max) {
      throw new TypeError(`mnihss: ${it.id} must be 0-${it.max}`);
    }
    total += v;
  }
  let severity;
  if (total === 0) severity = 'no stroke symptoms';
  else if (total <= 4) severity = 'minor stroke';
  else if (total <= 15) severity = 'moderate stroke';
  else if (total <= 20) severity = 'moderate-severe stroke';
  else severity = 'severe stroke';
  return {
    total,
    severity,
    band: `mNIHSS ${total} of 31: ${severity} per Meyer 2002.`,
  };
}

// --- spec-v29 §4.10.1 wave 29-3a: PADSS (Chung 1995) -----------------
// Five domains each 0/1/2; total 0-10; >=9 ready for home discharge.
function padssClamp(n) {
  const v = Math.trunc(Number(n));
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > 2) return 2;
  return v;
}
export function padss({ vitalSigns, ambulation, nauseaVomiting, pain, surgicalBleeding }) {
  const parts = {
    vitalSigns:        padssClamp(vitalSigns),
    ambulation:        padssClamp(ambulation),
    nauseaVomiting:    padssClamp(nauseaVomiting),
    pain:              padssClamp(pain),
    surgicalBleeding:  padssClamp(surgicalBleeding),
  };
  const score = parts.vitalSigns + parts.ambulation + parts.nauseaVomiting + parts.pain + parts.surgicalBleeding;
  const readyForDischarge = score >= 9;
  return {
    score,
    parts,
    readyForDischarge,
    band: readyForDischarge
      ? `PADSS ${score} of 10: ready for home discharge per Chung 1995 (cutoff >=9).`
      : `PADSS ${score} of 10: not yet ready for home discharge per Chung 1995 (cutoff >=9).`,
  };
}

// --- spec-v29 §4.1.1 wave 29-3b: NPIAP Pressure Injury Staging -------
// Edsberg 2016 / NPIAP 2019. Decision-tree over six structured pickers.
export function npiapStaging({
  mucosal, skinIntact, blanching, obscured, depth,
}) {
  if (mucosal) {
    return {
      stage: 'Mucosal Membrane PI',
      text: 'Mucosal Membrane Pressure Injury per NPIAP 2016 (staging system does not apply; document location and tissue type).',
    };
  }
  if (skinIntact) {
    if (blanching === 'blanchable') {
      return {
        stage: 'No pressure injury',
        text: 'Blanchable erythema does not meet NPIAP 2016 criteria for a pressure injury. Reassess per unit protocol.',
      };
    }
    if (blanching === 'non-blanchable-deep-discoloration') {
      return {
        stage: 'Deep Tissue Pressure Injury',
        text: 'Deep Tissue Pressure Injury per NPIAP 2016 (persistent non-blanchable deep red, maroon, or purple discoloration; recategorise if eschar or deeper damage emerges).',
      };
    }
    return {
      stage: 'Stage 1',
      text: 'Stage 1 Pressure Injury per NPIAP 2016: intact skin with localised non-blanchable erythema.',
    };
  }
  // Skin not intact.
  if (obscured) {
    return {
      stage: 'Unstageable',
      text: 'Unstageable Pressure Injury per NPIAP 2016 (full-thickness loss obscured by slough or eschar; recategorise after debridement).',
    };
  }
  if (depth === 'bone-tendon-muscle') {
    return {
      stage: 'Stage 4',
      text: 'Stage 4 Pressure Injury per NPIAP 2016: full-thickness skin and tissue loss with exposed or directly palpable bone, tendon, or muscle.',
    };
  }
  if (depth === 'subq-visible') {
    return {
      stage: 'Stage 3',
      text: 'Stage 3 Pressure Injury per NPIAP 2016: full-thickness skin loss; subcutaneous fat may be visible but bone, tendon, and muscle are not exposed.',
    };
  }
  return {
    stage: 'Stage 2',
    text: 'Stage 2 Pressure Injury per NPIAP 2016: partial-thickness skin loss with exposed dermis; may present as a serum-filled blister.',
  };
}

// --- spec-v29 §4.1.3 wave 29-3b: Norton Scale + PUSH Tool ------------
// Norton 1962: five 1-4 items; total 5-20; <=14 at risk (Norton 1962
// derivation cohort). PUSH Tool 3.0 (NPIAP 2005): length-by-width band
// 0-10, exudate 0-3, tissue type 0-4; total 0-17; declining total
// indicates healing.
function nortonClamp(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 1) return 1;
  if (v > 4) return 4;
  return Math.trunc(v);
}
export function nortonPush({
  physicalCondition, mentalCondition, activity, mobility, incontinence,
  lengthWidthBand, exudate, tissueType,
}) {
  const norton = {
    physicalCondition: nortonClamp(physicalCondition),
    mentalCondition:   nortonClamp(mentalCondition),
    activity:          nortonClamp(activity),
    mobility:          nortonClamp(mobility),
    incontinence:      nortonClamp(incontinence),
  };
  const nortonTotal = norton.physicalCondition + norton.mentalCondition + norton.activity + norton.mobility + norton.incontinence;
  let nortonBand;
  if (nortonTotal >= 19) nortonBand = 'low risk';
  else if (nortonTotal >= 15) nortonBand = 'medium risk';
  else nortonBand = 'at risk';
  // PUSH clamps: lengthWidthBand 0-10; exudate 0-3; tissue 0-4.
  const lw = Math.max(0, Math.min(10, Math.trunc(Number(lengthWidthBand) || 0)));
  const ex = Math.max(0, Math.min(3,  Math.trunc(Number(exudate) || 0)));
  const tt = Math.max(0, Math.min(4,  Math.trunc(Number(tissueType) || 0)));
  const push = { lengthWidthBand: lw, exudate: ex, tissueType: tt };
  const pushTotal = lw + ex + tt;
  return {
    norton,
    nortonTotal,
    nortonBand,
    push,
    pushTotal,
    text: `Norton ${nortonTotal} of 20 (${nortonBand}; <=14 at risk per Norton 1962); PUSH ${pushTotal} of 17 per NPIAP 2005 (declining total indicates healing).`,
  };
}

// --- spec-v29 §4.6.1 wave 29-3b: VIP + INS infiltration --------------
// Jackson 1998 VIP score (0-5) plus INS 2021 Standards of Practice
// sec 38 infiltration / extravasation grade (0-4).
const VIP_LABELS = {
  0: 'No signs of phlebitis',
  1: 'One of: slight pain, slight redness near IV site',
  2: 'Two of: pain, erythema, swelling',
  3: 'All of: pain along path, erythema, induration; suggests early phlebitis',
  4: 'Extensive pain, erythema, induration, palpable venous cord; advanced phlebitis',
  5: 'All of stage 4 plus pyrexia; advanced thrombophlebitis',
};
const INS_LABELS = {
  0: 'No symptoms',
  1: 'Skin blanched, edema <1 inch (2.5 cm), cool, with or without pain',
  2: 'Skin blanched, edema 1-6 inches (2.5-15 cm), cool, with or without pain',
  3: 'Skin blanched, translucent, edema >6 inches, cool, mild-moderate pain, possible numbness',
  4: 'Skin blanched, translucent, tight, leaking; skin discoloration, bruising, swelling; edema >6 inches; deep pitting; circulatory impairment; moderate-severe pain; infiltration of any amount of blood product, irritant, or vesicant',
};
export function vipExtravasation({ vip, insGrade, vesicant }) {
  const v = Math.max(0, Math.min(5, Math.trunc(Number(vip) || 0)));
  const i = Math.max(0, Math.min(4, Math.trunc(Number(insGrade) || 0)));
  const vesicantFlag = Boolean(vesicant);
  const banners = [];
  if (v >= 3) banners.push('VIP >=3: remove cannula and resite per Jackson 1998 / INS 2021.');
  if (i >= 3) banners.push('INS grade >=3: stop infusion, remove cannula immediately, photograph, escalate per INS 2021 sec 38.');
  if (i === 4 && vesicantFlag) banners.push('Grade 4 vesicant extravasation: antidote decision per INS 2021 Table 38-3.');
  return {
    vip: v,
    insGrade: i,
    vesicant: vesicantFlag,
    vipLabel: VIP_LABELS[v],
    insLabel: INS_LABELS[i],
    banners,
    text: `VIP ${v} of 5; INS infiltration / extravasation grade ${i} of 4${vesicantFlag ? ' (vesicant flagged)' : ''}.`,
  };
}

// --- spec-v29 §4.20.1 wave 29-3b: ABO/Rh compatibility ---------------
// AABB 33rd ed (2024) compatibility tables. Encodes PRBC and plasma
// (FFP) rules. Platelets and cryo are ABO-preferred; the renderer
// returns a non-strict note.
const ABO_RH = new Set(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']);
const PRBC_COMPAT = {
  'O-':  ['O-'],
  'O+':  ['O-', 'O+'],
  'A-':  ['O-', 'A-'],
  'A+':  ['O-', 'O+', 'A-', 'A+'],
  'B-':  ['O-', 'B-'],
  'B+':  ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};
// FFP / plasma compatibility ignores Rh per AABB; uses ABO only.
const PLASMA_COMPAT_ABO = {
  O:  ['O', 'A', 'B', 'AB'],
  A:  ['A', 'AB'],
  B:  ['B', 'AB'],
  AB: ['AB'],
};
function aboOnly(rh) {
  const ix = rh.indexOf('+') === -1 ? rh.indexOf('-') : rh.indexOf('+');
  return rh.slice(0, ix);
}
export function bloodCompat({ recipient, product }) {
  if (!ABO_RH.has(recipient)) throw new TypeError(`blood-compat: recipient must be one of ${[...ABO_RH].join(', ')}`);
  const productNorm = String(product || '').toLowerCase();
  if (productNorm === 'prbc') {
    const donors = PRBC_COMPAT[recipient];
    return {
      product: 'PRBC',
      recipient,
      compatibleDonors: donors,
      emergencyRelease: 'O-negative PRBC (universal emergency-release donor)',
      text: `PRBC compatibility for ${recipient} per AABB 33rd ed: ${donors.join(', ')}. Emergency release: O-negative.`,
    };
  }
  if (productNorm === 'ffp' || productNorm === 'plasma') {
    const abo = aboOnly(recipient);
    const donorAbos = PLASMA_COMPAT_ABO[abo];
    return {
      product: 'FFP',
      recipient,
      compatibleDonors: donorAbos,
      emergencyRelease: 'AB plasma (universal emergency-release plasma donor)',
      text: `FFP compatibility for ${recipient} (ABO ${abo}) per AABB 33rd ed: ${donorAbos.join(', ')}. Rh is not a plasma compatibility factor; emergency release is AB plasma.`,
    };
  }
  if (productNorm === 'platelets') {
    return {
      product: 'Platelets',
      recipient,
      compatibleDonors: ['ABO-identical preferred', 'ABO-compatible plasma if needed'],
      emergencyRelease: 'Any ABO acceptable in emergency; Rh-negative for Rh-negative women of child-bearing potential per AABB.',
      text: `Platelets for ${recipient}: ABO-identical preferred; ABO-compatible plasma acceptable; Rh matching for Rh-negative women of CBP per AABB 33rd ed.`,
    };
  }
  if (productNorm === 'cryo' || productNorm === 'cryoprecipitate') {
    return {
      product: 'Cryoprecipitate',
      recipient,
      compatibleDonors: ['Any ABO acceptable (small plasma volume)'],
      emergencyRelease: 'Any ABO acceptable per AABB 33rd ed.',
      text: `Cryoprecipitate for ${recipient}: any ABO acceptable per AABB 33rd ed (small residual plasma volume).`,
    };
  }
  throw new TypeError('blood-compat: product must be one of prbc / ffp / platelets / cryo');
}

// --- spec-v29 sec 4.8.1 wave 29-3c: Insulin correction (ADA 2024) ----
// ADA Standards of Care 2024, ch. 16 (Diabetes Care in the Hospital).
// Insulin Sensitivity Factor (ISF) uses the 1800-rule for rapid-acting
// analogues or the 1500-rule for regular insulin. Correction units =
// max(0, (currentBG - targetBG) / ISF). Meal coverage = carbs / ICR.
// Output is rounded to 0.1 U; this is a math verifier, not a protocol.
export function insulinCorrection({
  currentBG, targetBG, isf, totalDailyDose, isfRule, carbs, icr,
}) {
  const bg = Number(currentBG);
  const target = Number(targetBG);
  if (!Number.isFinite(bg) || bg < 0) throw new TypeError('insulin-correction: currentBG required (mg/dL)');
  if (!Number.isFinite(target) || target <= 0) throw new TypeError('insulin-correction: targetBG required (mg/dL)');
  let computedIsf = Number(isf);
  let derivedFromTdd = false;
  if (!Number.isFinite(computedIsf) || computedIsf <= 0) {
    const tdd = Number(totalDailyDose);
    if (!Number.isFinite(tdd) || tdd <= 0) {
      throw new TypeError('insulin-correction: provide isf or totalDailyDose');
    }
    const ruleN = (isfRule === 'regular' || Number(isfRule) === 1500) ? 1500 : 1800;
    computedIsf = ruleN / tdd;
    derivedFromTdd = true;
  }
  const correction = bg > target ? (bg - target) / computedIsf : 0;
  const c = Number(carbs);
  const r = Number(icr);
  const meal = (Number.isFinite(c) && c > 0 && Number.isFinite(r) && r > 0) ? c / r : 0;
  const total = correction + meal;
  return {
    isf: r1(computedIsf),
    isfDerivedFromTdd: derivedFromTdd,
    correctionUnits: r1(correction),
    mealUnits: r1(meal),
    totalUnits: r1(total),
    text: `Correction ${r1(correction)} U + meal ${r1(meal)} U = ${r1(total)} U total (ISF ${r1(computedIsf)} per ADA 2024).`,
  };
}

// --- spec-v29 sec 4.9.1 wave 29-3c: Electrolyte replacement ladder ---
// Potassium ladder per ASHP / Hammond 2019; Magnesium per Hebert 2008;
// Phosphate per Brown 2006 (JPEN 30(3):209-214). Renal-impairment flag
// halves doses and adds a recheck banner. Output is a deterministic
// band, not a prescription.
export function electrolyteReplacement({ electrolyte, level, route, renalImpaired }) {
  const e = String(electrolyte || '').toLowerCase();
  const l = Number(level);
  if (!Number.isFinite(l) || l < 0) throw new TypeError('electrolyte-replacement: level required');
  const r = String(route || 'iv').toLowerCase();
  if (r !== 'iv' && r !== 'po') throw new TypeError('electrolyte-replacement: route must be iv or po');
  const renal = Boolean(renalImpaired);
  const banners = [];
  if (renal) banners.push('Renal impairment flagged: halve the listed dose and recheck level before redosing.');
  if (e === 'k' || e === 'potassium') {
    if (l >= 3.5) {
      return { electrolyte: 'K', level: l, route: r, dose: '0 mEq (within range)', banners: ['Serum K within range (>= 3.5 mEq/L); no replacement per ASHP 2019.'] };
    }
    let dose;
    if (l >= 3.0) dose = '40 mEq';
    else if (l >= 2.5) dose = '60 mEq';
    else dose = '80 mEq';
    const rate = r === 'iv'
      ? 'IV cap 10 mEq/h peripheral or 20 mEq/h central with telemetry per ASHP 2019'
      : 'PO in divided 20-40 mEq doses with food per ASHP 2019';
    banners.push('Recheck K 2-4 h after replacement per ASHP 2019.');
    return { electrolyte: 'K', level: l, route: r, dose, rate, banners };
  }
  if (e === 'mg' || e === 'magnesium') {
    if (l >= 1.8) {
      return { electrolyte: 'Mg', level: l, route: r, dose: '0 g (within range)', banners: ['Serum Mg within range (>= 1.8 mg/dL); no replacement.'] };
    }
    const dose = l < 1.0 ? '4 g MgSO4' : '2 g MgSO4';
    const rate = r === 'iv' ? 'IV over 1 h (faster causes flushing / hypotension)' : 'PO MgOx 400-800 mg as alternative if asymptomatic';
    banners.push('Recheck Mg 6-12 h after replacement per Hebert 2008. Monitor DTRs during IV infusion.');
    return { electrolyte: 'Mg', level: l, route: r, dose, rate, banners };
  }
  if (e === 'phos' || e === 'phosphate' || e === 'phosphorus' || e === 'po4') {
    if (l >= 2.3) {
      return { electrolyte: 'Phos', level: l, route: r, dose: '0 mmol/kg (within range)', banners: ['Serum phosphate within range (>= 2.3 mg/dL); no replacement per Brown 2006.'] };
    }
    let mmolPerKg;
    if (l >= 1.6) mmolPerKg = 0.16;
    else if (l >= 1.0) mmolPerKg = 0.32;
    else mmolPerKg = 0.64;
    const dose = `${mmolPerKg} mmol/kg`;
    const rate = r === 'iv' ? 'IV over 4-6 h per Brown 2006 graduated protocol' : 'PO Na/K phosphate 250-500 mg q6h as alternative';
    banners.push('Recheck phos and ionised Ca 6 h after infusion per Brown 2006.');
    return { electrolyte: 'Phos', level: l, route: r, dose, rate, banners };
  }
  throw new TypeError('electrolyte-replacement: electrolyte must be one of k / mg / phos');
}

// --- spec-v29 sec 4.17.1 wave 29-3c: CRRT effluent dose ---------------
// KDIGO 2012 AKI guideline targets effluent dose 20-25 mL/kg/h delivered
// (Section 5.8). Citrate-anticoagulation ranges per Davenport 2009:
// post-filter ionised Ca 0.25-0.35 mmol/L; systemic ionised Ca
// 1.1-1.2 mmol/L; total/ionised Ca ratio >= 2.5 suggests citrate
// accumulation.
export function crrtDose({
  weightKg, effluentRateMlPerHr, modality, ultrafiltrationMlPerHr,
  systemicIonisedCa, postFilterIonisedCa, totalCa,
}) {
  const w = Number(weightKg);
  const r = Number(effluentRateMlPerHr);
  if (!Number.isFinite(w) || w <= 0) throw new TypeError('crrt-dose: weightKg required');
  if (!Number.isFinite(r) || r < 0) throw new TypeError('crrt-dose: effluentRateMlPerHr required');
  const dose = r / w;
  const banners = [];
  if (dose < 20) banners.push('Below KDIGO 2012 effluent-dose target 20-25 mL/kg/h: increase prescribed effluent rate.');
  else if (dose > 25) banners.push('Above KDIGO 2012 effluent-dose target 20-25 mL/kg/h: consider reducing prescribed effluent rate.');
  else banners.push('Within KDIGO 2012 effluent-dose target 20-25 mL/kg/h.');
  const sysCa = Number(systemicIonisedCa);
  if (Number.isFinite(sysCa) && sysCa > 0 && (sysCa < 1.1 || sysCa > 1.2)) {
    banners.push(`Systemic ionised Ca ${r1(sysCa)} mmol/L outside 1.1-1.2 mmol/L target per Davenport 2009: titrate Ca replacement.`);
  }
  const postCa = Number(postFilterIonisedCa);
  if (Number.isFinite(postCa) && postCa > 0 && (postCa < 0.25 || postCa > 0.35)) {
    banners.push(`Post-filter ionised Ca ${r1(postCa)} mmol/L outside 0.25-0.35 mmol/L target per Davenport 2009: titrate citrate flow.`);
  }
  const total = Number(totalCa);
  let ratio;
  if (Number.isFinite(total) && Number.isFinite(sysCa) && sysCa > 0) {
    ratio = total / sysCa;
    if (ratio >= 2.5) banners.push(`Total/ionised Ca ratio ${r1(ratio)} >= 2.5: citrate accumulation suspected per Davenport 2009.`);
  }
  const uf = Number(ultrafiltrationMlPerHr);
  return {
    effluentDoseMlPerKgPerHr: r1(dose),
    modality: modality || 'CVVH',
    ultrafiltrationMlPerHr: Number.isFinite(uf) ? uf : 0,
    totalIonisedRatio: ratio === undefined ? null : r1(ratio),
    banners,
    text: `Delivered effluent dose ${r1(dose)} mL/kg/h (KDIGO 2012 target 20-25 mL/kg/h).`,
  };
}

// --- spec-v29 sec 4.18.1 wave 29-3c: ECMO sweep / flow titration ------
// ELSO 2022 Adult and Paediatric Respiratory Failure Guidelines.
// Sweep titration uses the linear PaCO2 heuristic (suggested sweep =
// current sweep x current PaCO2 / target PaCO2). Oxygen delivery uses
// DO2 = pumpFlow(L/min) x 10 x 1.34 x Hb(g/dL) x SaO2(fraction); index
// = DO2 / weight; ELSO target DO2i >= 6 mL/kg/min.
export function ecmoTitration({
  modality, weightKg, currentSweepLpm, currentFlowLpm,
  currentPaCO2, targetPaCO2, hb, sao2,
}) {
  const w = Number(weightKg);
  const sweep = Number(currentSweepLpm);
  const flow = Number(currentFlowLpm);
  if (!Number.isFinite(w) || w <= 0) throw new TypeError('ecmo-titration: weightKg required');
  if (!Number.isFinite(sweep) || sweep < 0) throw new TypeError('ecmo-titration: currentSweepLpm required');
  if (!Number.isFinite(flow) || flow <= 0) throw new TypeError('ecmo-titration: currentFlowLpm required');
  const mod = String(modality || 'VV').toUpperCase();
  if (mod !== 'VV' && mod !== 'VA') throw new TypeError('ecmo-titration: modality must be VV or VA');
  const target = Number(targetPaCO2) > 0 ? Number(targetPaCO2) : 40;
  const paco2 = Number(currentPaCO2);
  let suggestedSweep = sweep;
  if (Number.isFinite(paco2) && paco2 > 0) {
    suggestedSweep = r1(sweep * (paco2 / target));
  }
  const hbN = Number(hb);
  const saO2 = Number(sao2);
  let do2i;
  let suggestedFlow = flow;
  if (Number.isFinite(hbN) && hbN > 0 && Number.isFinite(saO2) && saO2 > 0) {
    const sat = saO2 > 1 ? saO2 / 100 : saO2;
    const do2 = flow * 10 * 1.34 * hbN * sat;
    do2i = r1(do2 / w);
    const targetDo2i = 6;
    const required = (targetDo2i * w) / (10 * 1.34 * hbN * sat);
    suggestedFlow = r1(required);
  }
  const banners = [];
  if (mod === 'VV') banners.push('VV target: titrate to SatO2 >= 80% per ELSO 2022; do not titrate to perfect saturation.');
  if (mod === 'VA') banners.push('VA target: titrate to adequate end-organ perfusion and MAP; watch for recirculation if SvO2 falls.');
  if (do2i !== undefined && do2i < 6) banners.push(`DO2i ${do2i} mL/kg/min below ELSO 2022 target (>= 6): increase pump flow toward ${suggestedFlow} L/min.`);
  banners.push('ECMO titration is not a closed-loop controller; verify with attending and perfusionist before changing settings.');
  return {
    modality: mod,
    suggestedSweepLpm: suggestedSweep,
    do2iMlPerKgPerMin: do2i === undefined ? null : do2i,
    suggestedFlowLpm: suggestedFlow,
    banners,
    text: `Suggested sweep ${suggestedSweep} L/min; DO2i ${do2i === undefined ? 'n/a' : do2i} mL/kg/min (ELSO 2022 target >= 6).`,
  };
}

// --- spec-v29 sec 4.5.1 wave 29-3d: NEWS2 / MEWS escalation timer ----
// Royal College of Physicians, NEWS2 2017. Trigger table: aggregate 0
// -> min 12-hourly; 1-4 -> min 4-6 hourly (ward); single parameter 3
// -> min 1-hourly + urgent ward team review; aggregate 5-6 -> urgent,
// 1-hourly, consider critical-care outreach; aggregate >=7 -> emergency
// critical-care team activation, continuous monitoring.
export function ewsEscalation({ news2Total, vitalsTimestamp, singleParam3 }) {
  const total = Number(news2Total);
  if (!Number.isFinite(total) || total < 0) throw new TypeError('ews-escalation: news2Total required');
  let nextHours;
  let banner;
  if (total >= 7) {
    nextHours = 0;
    banner = 'Aggregate >=7: emergency critical-care team activation; continuous monitoring per RCP NEWS2 2017.';
  } else if (total >= 5) {
    nextHours = 1;
    banner = 'Aggregate 5-6: urgent response; min 1-hourly observations; consider critical-care outreach per RCP NEWS2 2017.';
  } else if (singleParam3) {
    nextHours = 1;
    banner = 'Single parameter score 3: min 1-hourly observations + urgent ward-team review per RCP NEWS2 2017.';
  } else if (total >= 1) {
    nextHours = 6;
    banner = 'Aggregate 1-4: min 4-6 hourly observations; ward-based response per RCP NEWS2 2017.';
  } else {
    nextHours = 12;
    banner = 'Aggregate 0: routine min 12-hourly observations per RCP NEWS2 2017.';
  }
  let nextDueIso = null;
  if (vitalsTimestamp) {
    const t = new Date(vitalsTimestamp).getTime();
    if (Number.isFinite(t)) nextDueIso = new Date(t + nextHours * 3600_000).toISOString();
  }
  return {
    news2Total: total,
    nextHours,
    nextDueIso,
    banner,
  };
}

// --- spec-v29 sec 4.13.1 wave 29-3d: Restraint reassessment timer -----
// CMS 42 CFR sec 482.13(e). Violent / self-destructive: physician-order
// renewal q4h adult / q2h age 9-17 / q1h <9; physician or LIP face-to-
// face within 1 h. Non-violent medical-surgical: order renewed each
// calendar day; institutional cadence typically q2h nursing.
export function restraintTimer({ type, ageYears, orderTimestamp }) {
  const t = String(type || '').toLowerCase();
  const age = Number(ageYears);
  if (!Number.isFinite(age) || age < 0) throw new TypeError('restraint-timer: ageYears required');
  const ts = orderTimestamp ? new Date(orderTimestamp).getTime() : NaN;
  if (!Number.isFinite(ts)) throw new TypeError('restraint-timer: valid orderTimestamp required');
  let renewalHours;
  let reassessMin;
  let faceToFaceMin;
  const banners = [];
  if (t === 'violent' || t === 'violent-self-destructive') {
    if (age >= 18) renewalHours = 4;
    else if (age >= 9) renewalHours = 2;
    else renewalHours = 1;
    reassessMin = 15;
    faceToFaceMin = 60;
    banners.push('Violent / self-destructive: physician or LIP face-to-face within 1 h per 42 CFR sec 482.13(e).');
    banners.push(`Order renewal cadence ${renewalHours} h (age band ${age >= 18 ? '>=18' : age >= 9 ? '9-17' : '<9'} per 42 CFR sec 482.13(e)).`);
  } else if (t === 'non-violent' || t === 'medical-surgical') {
    renewalHours = 24;
    reassessMin = 120;
    faceToFaceMin = null;
    banners.push('Non-violent medical-surgical: order renewed each calendar day per 42 CFR sec 482.13(e).');
  } else {
    throw new TypeError('restraint-timer: type must be violent or non-violent');
  }
  const isoAfterMin = (m) => new Date(ts + m * 60_000).toISOString();
  return {
    type: t === 'violent-self-destructive' ? 'violent' : (t === 'medical-surgical' ? 'non-violent' : t),
    ageYears: age,
    orderIso: new Date(ts).toISOString(),
    nextRenewalIso: isoAfterMin(renewalHours * 60),
    nextReassessIso: isoAfterMin(reassessMin),
    nextFaceToFaceIso: faceToFaceMin === null ? null : isoAfterMin(faceToFaceMin),
    banners,
  };
}

// --- spec-v29 sec 4.14.1 wave 29-3d: Surviving Sepsis bundle clock ----
// SSC 2021 (Evans 2021) + CMS SEP-1 2024. Hour-1 bundle: lactate,
// cultures before antibiotics, broad-spectrum antibiotics, 30 mL/kg
// crystalloid for hypotension or lactate >=4. Repeat lactate within 6 h
// if initial >=2 mmol/L (Nguyen 2004 clearance derivation).
export function sepsisBundleClock({
  t0, lactateValue, lactateTime, repeatLactateValue, repeatLactateTime,
  cultureTime, antibioticTime, fluidStartTime, vasoTime,
}) {
  const t0ms = new Date(t0).getTime();
  if (!Number.isFinite(t0ms)) throw new TypeError('sepsis-bundle-clock: t0 required (ISO timestamp)');
  function check(label, ts, dueMin) {
    const dueIso = new Date(t0ms + dueMin * 60_000).toISOString();
    if (!ts) return { label, status: 'pending', dueIso };
    const t = new Date(ts).getTime();
    if (!Number.isFinite(t)) return { label, status: 'pending', dueIso };
    const minutes = Math.round((t - t0ms) / 60_000);
    return { label, status: minutes <= dueMin ? 'on-time' : 'late', minutesFromT0: minutes, dueIso };
  }
  const items = [
    check('initial lactate', lactateTime, 60),
    check('blood cultures (before antibiotics)', cultureTime, 60),
    check('broad-spectrum antibiotics', antibioticTime, 60),
    check('crystalloid 30 mL/kg', fluidStartTime, 180),
    check('vasopressors (if hypotensive after fluids)', vasoTime, 360),
    check('repeat lactate (if initial >=2)', repeatLactateTime, 360),
  ];
  let lactateClearancePct = null;
  const a = Number(lactateValue);
  const b = Number(repeatLactateValue);
  if (Number.isFinite(a) && a > 0 && Number.isFinite(b)) {
    lactateClearancePct = Math.round(((a - b) / a) * 1000) / 10;
  }
  const banners = [];
  if (Number.isFinite(a) && a >= 4) banners.push('Initial lactate >=4 mmol/L: 30 mL/kg crystalloid indicated per SSC 2021.');
  if (lactateClearancePct !== null && lactateClearancePct < 10) banners.push(`Lactate clearance ${lactateClearancePct}% over 6 h is sub-target per Nguyen 2004; escalate resuscitation.`);
  return {
    t0Iso: new Date(t0ms).toISOString(),
    items,
    lactateClearancePct,
    banners,
  };
}

// --- spec-v29 sec 4.15.1 wave 29-3d: Code-blue documentation timer ---
// AHA 2020 Adult BLS / ACLS. Cycle structure: 2-min rhythm checks; epi
// 1 mg q3-5 min (give after second shock in shockable rhythms, else
// ASAP for non-shockable). ROSC capnography target ETCO2 sustained
// >10 mmHg, ideally >20.
export function codeBlueClock({
  codeStartTimestamp, lastRhythmCheck, lastEpi, lastShockJ, cycleCount, asOf,
}) {
  const start = new Date(codeStartTimestamp).getTime();
  if (!Number.isFinite(start)) throw new TypeError('code-blue-clock: codeStartTimestamp required');
  const nowMs = asOf ? new Date(asOf).getTime() : Date.now();
  const minutesFromStart = Math.max(0, Math.round((nowMs - start) / 6000) / 10);
  const lastRhythm = lastRhythmCheck ? new Date(lastRhythmCheck).getTime() : start;
  const nextRhythmIso = Number.isFinite(lastRhythm)
    ? new Date(lastRhythm + 2 * 60_000).toISOString()
    : null;
  const lastEpiMs = lastEpi ? new Date(lastEpi).getTime() : NaN;
  const nextEpiIso = Number.isFinite(lastEpiMs)
    ? new Date(lastEpiMs + 4 * 60_000).toISOString()
    : null;
  return {
    minutesFromStart,
    nextRhythmCheckIso: nextRhythmIso,
    nextEpiIso,
    lastShockJ: Number.isFinite(Number(lastShockJ)) ? Number(lastShockJ) : null,
    cycleCount: Math.max(0, Math.trunc(Number(cycleCount) || 0)),
    banner: 'AHA 2020: 2-min rhythm checks; epinephrine 1 mg q3-5 min; ROSC ETCO2 sustained >10 mmHg (ideally >20).',
  };
}

// --- spec-v29 sec 4.19.1 wave 29-3d: MTP 1:1:1 ratio tracker ---------
// Holcomb 2015 PROPPR: 1:1:1 PRBC:FFP:Platelets reduces 24-h
// hemorrhagic-death mortality vs 1:1:2. ATLS 2018: cryoprecipitate
// 1 pooled dose (5-10 units) every 6 PRBC. Initial cooler convention:
// 6 PRBC : 6 FFP : 1 plt apheresis.
export function mtpTracker({ prbcUnits, ffpUnits, plateletUnits, cryoUnits }) {
  // spec-v59 §2.6: a non-finite unit count coerces to 0 -- Math.trunc(Infinity)
  // stays Infinity and would otherwise leak into the ratio string.
  const u = (x) => { const n = Math.trunc(Number(x)); return Number.isFinite(n) ? Math.max(0, n) : 0; };
  const prbc = u(prbcUnits);
  const ffp = u(ffpUnits);
  const plt = u(plateletUnits);
  const cryo = u(cryoUnits);
  const banners = [];
  let nextProduct = null;
  if (prbc === 0 && ffp === 0 && plt === 0) {
    nextProduct = 'Initial MTP cooler';
    banners.push('Initial cooler: 6 PRBC : 6 FFP : 1 platelet apheresis per PROPPR 2015.');
  } else {
    if (ffp < prbc) nextProduct = 'FFP';
    else if (plt < prbc) nextProduct = 'Platelets';
    else nextProduct = 'PRBC';
    banners.push(`Next product to maintain 1:1:1: ${nextProduct} per PROPPR 2015.`);
  }
  const cryoDoseDue = Math.floor(prbc / 6);
  if (cryoDoseDue > cryo) {
    banners.push(`Cryoprecipitate due: ${cryoDoseDue - cryo} more dose(s) per ATLS 2018 (1 dose / 6 PRBC).`);
  }
  const total = prbc + ffp + plt + cryo;
  return {
    prbcUnits: prbc,
    ffpUnits: ffp,
    plateletUnits: plt,
    cryoUnits: cryo,
    ratio: `${prbc}:${ffp}:${plt}`,
    cryoDoseDue,
    nextProduct,
    cumulativeUnits: total,
    banners,
  };
}

// --- spec-v29 sec 4.12.1 wave 29-3d: Foley / central-line day-counter
// CDC NHSN 2024 (Ch 7 CAUTI, Ch 4 CLABSI). Lo 2014 SHEA CAUTI:
// indications for Foley (acute retention/obstruction; accurate I/O
// critically ill; peri-op surgical indication; end-of-life comfort;
// hourly UO required). If none checked daily -> remove.
export function deviceDayCounter({ device, insertionTimestamp, criteriaMet, asOf }) {
  const d = String(device || '').toLowerCase();
  if (d !== 'foley' && d !== 'central-line') {
    throw new TypeError('device-day-counter: device must be foley or central-line');
  }
  const ins = new Date(insertionTimestamp).getTime();
  if (!Number.isFinite(ins)) throw new TypeError('device-day-counter: insertionTimestamp required');
  const nowMs = asOf ? new Date(asOf).getTime() : Date.now();
  const ms = Math.max(0, nowMs - ins);
  const deviceDays = Math.floor(ms / 86_400_000);
  const deviceHours = Math.floor((ms % 86_400_000) / 3_600_000);
  const criteria = Array.isArray(criteriaMet) ? criteriaMet.slice() : [];
  const removeToday = criteria.length === 0;
  const banners = [];
  if (removeToday) {
    banners.push(d === 'foley'
      ? 'No CDC SHEA 2014 indication checked: remove Foley today.'
      : 'No CDC NHSN 2024 indication checked: remove central line today.');
  }
  if (deviceDays >= 2) banners.push(`Device-day ${deviceDays}: re-verify daily-removal criterion (CDC NHSN 2024 ${d === 'foley' ? 'CAUTI Ch 7' : 'CLABSI Ch 4'}).`);
  return {
    device: d,
    insertionIso: new Date(ins).toISOString(),
    deviceDays,
    deviceHours,
    criteriaMet: criteria,
    removeToday,
    banners,
  };
}

// --- spec-v29 sec 4.11.1 wave 29-3d: Bristol stool + abdominal girth -
// Lewis SJ, Heaton KW. Scand J Gastroenterol 1997;32(9):920-924. ANA
// Standards of Gastroenterology Nursing Practice 2013 for the girth-
// trend interpretation; SCCM 2013 ACS banner thresholds.
const BRISTOL_LABELS = {
  1: 'Separate hard lumps (severe constipation)',
  2: 'Lumpy sausage (constipation)',
  3: 'Sausage with surface cracks (normal-firm)',
  4: 'Smooth soft sausage (normal-ideal)',
  5: 'Soft blobs with clear edges (lacking fibre)',
  6: 'Fluffy mushy stool (mild diarrhoea)',
  7: 'Liquid with no solid pieces (severe diarrhoea)',
};
export function bristolGirth({
  bristolType, girthT0Cm, girthT1Cm, t0Timestamp, t1Timestamp,
}) {
  const b = Math.trunc(Number(bristolType));
  if (!Number.isInteger(b) || b < 1 || b > 7) throw new RangeError('bristol-girth: bristolType must be 1-7');
  const bristolLabel = BRISTOL_LABELS[b];
  let category;
  if (b <= 2) category = 'constipation';
  else if (b <= 4) category = 'normal';
  else if (b === 5) category = 'soft';
  else category = 'diarrhoea';
  let girthDeltaCm = null;
  let intervalHours = null;
  let deltaPerHourCm = null;
  const g0 = Number(girthT0Cm);
  const g1 = Number(girthT1Cm);
  if (Number.isFinite(g0) && Number.isFinite(g1) && t0Timestamp && t1Timestamp) {
    const dt = new Date(t1Timestamp).getTime() - new Date(t0Timestamp).getTime();
    if (Number.isFinite(dt) && dt > 0) {
      girthDeltaCm = Math.round((g1 - g0) * 10) / 10;
      intervalHours = Math.round((dt / 3_600_000) * 10) / 10;
      if (intervalHours > 0) deltaPerHourCm = Math.round((girthDeltaCm / intervalHours) * 100) / 100;
    }
  }
  const banners = [];
  if (deltaPerHourCm !== null && deltaPerHourCm >= 2) {
    banners.push('Girth increase >=2 cm/h: abdominal-compartment-syndrome concern per SCCM 2013; escalate and consider bladder pressure.');
  }
  if (girthDeltaCm !== null && Math.abs(girthDeltaCm) > 20 && intervalHours !== null && intervalHours <= 24) {
    banners.push('Absolute girth change >20 cm in <=24 h: ACS concern per SCCM 2013; escalate.');
  }
  return {
    bristolType: b,
    bristolLabel,
    category,
    girthDeltaCm,
    intervalHours,
    deltaPerHourCm,
    banners,
  };
}

// --- spec-v29 sec 4.16.1 wave 29-3e: SBT readiness + ARDSnet PEEP -----
// SBT readiness per Boles JM, et al. Eur Respir J 2007;29(5):1033-1056:
// PaO2/FiO2 >=150 (or SpO2 >=90% on FiO2 <=0.4 + PEEP <=8), PEEP <=8,
// FiO2 <=0.5, minimal or no vasopressors, awake / cooperative.
// ARDSnet PEEP/FiO2 tables per ARDS Network (Brower 2000 / ALVEOLI
// 2004). Encodes the canonical low- and high-PEEP arm look-ups.
const ARDSNET_LOW = [
  { fio2: 0.3, peep: '5' },
  { fio2: 0.4, peep: '5-8' },
  { fio2: 0.5, peep: '8-10' },
  { fio2: 0.6, peep: '10' },
  { fio2: 0.7, peep: '10-14' },
  { fio2: 0.8, peep: '14' },
  { fio2: 0.9, peep: '14-18' },
  { fio2: 1.0, peep: '18-24' },
];
const ARDSNET_HIGH = [
  { fio2: 0.3, peep: '12-14' },
  { fio2: 0.4, peep: '14-16' },
  { fio2: 0.5, peep: '16-20' },
  { fio2: 0.6, peep: '20' },
  { fio2: 0.7, peep: '20' },
  { fio2: 0.8, peep: '20-22' },
  { fio2: 0.9, peep: '22' },
  { fio2: 1.0, peep: '22-24' },
];
function ardsnetLookup(table, fio2) {
  for (const row of table) if (fio2 <= row.fio2 + 1e-9) return row;
  return table[table.length - 1];
}
export function ventSbtPeep({
  pao2FiO2, peep, fio2, vasopressors, awakeCooperative,
  ardsArm, lookupFiO2,
}) {
  const sbtChecks = {
    'PaO2/FiO2 >=150':              Number.isFinite(Number(pao2FiO2)) && Number(pao2FiO2) >= 150,
    'PEEP <=8':                     Number.isFinite(Number(peep)) && Number(peep) <= 8,
    'FiO2 <=0.5':                   Number.isFinite(Number(fio2)) && Number(fio2) <= 0.5,
    'No or minimal vasopressors':   !vasopressors,
    'Awake / cooperative':          Boolean(awakeCooperative),
  };
  const failed = Object.entries(sbtChecks).filter(([, ok]) => !ok).map(([k]) => k);
  const sbtReady = failed.length === 0;
  let suggestedPeep = null;
  let arm = null;
  const lookF = Number(lookupFiO2);
  if (Number.isFinite(lookF) && lookF > 0 && lookF <= 1.0) {
    const armNorm = String(ardsArm || 'low').toLowerCase();
    if (armNorm !== 'low' && armNorm !== 'high') throw new TypeError('vent-sbt-peep: ardsArm must be low or high');
    arm = armNorm;
    const row = ardsnetLookup(armNorm === 'high' ? ARDSNET_HIGH : ARDSNET_LOW, lookF);
    suggestedPeep = row.peep;
  } else if (lookupFiO2 !== undefined && lookupFiO2 !== '' && !Number.isFinite(lookF)) {
    throw new RangeError('vent-sbt-peep: lookupFiO2 must be a fraction 0-1');
  }
  const banners = [];
  if (sbtReady) banners.push('All five Boles 2007 readiness criteria met: proceed with SBT per institutional protocol; cross-link to RSBI calculator for f/Vt assessment.');
  else banners.push(`SBT not ready (Boles 2007): ${failed.join('; ')}.`);
  if (suggestedPeep !== null) banners.push(`ARDSnet ${arm}-PEEP arm at FiO2 ${lookF}: PEEP ${suggestedPeep} cm H2O.`);
  return {
    sbtReady,
    sbtChecks,
    failedCriteria: failed,
    ardsArm: arm,
    lookupFiO2: Number.isFinite(lookF) ? lookF : null,
    suggestedPeep,
    banners,
    text: sbtReady
      ? 'SBT ready per Boles 2007.'
      : `SBT not ready per Boles 2007 (failed: ${failed.join(', ')}).`,
  };
}

// --- spec-v30 §2.1: Swiss hypothermia staging -> rewarming algorithm ---
// Durrer B, Brugger H, Syme D. ICAR-MEDCOM hypothermia staging.
// High Alt Med Biol 2003;4(1):99-103. Modernised by Brown et al.
// N Engl J Med 2012;367(20):1930-8 and ERC 2021 §4 (Lott 2021).
// Stage by consciousness/shivering/vital-signs picker. The ERC K+
// > 12 mmol/L cut-off (Lott 2021 §4.7) and the lethal-injury /
// chest-non-compressible / known-asystole flag are the ECPR
// exclusion criteria for HT IV.
const HYPOTHERMIA_STATE = new Set(['alert-shivering', 'impaired', 'unconscious', 'arrest']);
export function hypothermiaRewarm({ coreTempC, state, ecprExclusion = false, potassium }) {
  const t = Number(coreTempC);
  if (!Number.isFinite(t)) throw new TypeError('hypothermia-rewarm: coreTempC must be a number');
  if (t < 0 || t > 38) throw new RangeError('hypothermia-rewarm: coreTempC must be 0-38');
  if (!HYPOTHERMIA_STATE.has(state)) {
    throw new TypeError(`hypothermia-rewarm: state must be one of ${[...HYPOTHERMIA_STATE].join(', ')}`);
  }
  let k = null;
  if (potassium !== undefined && potassium !== null && potassium !== '') {
    k = Number(potassium);
    if (!Number.isFinite(k)) throw new TypeError('hypothermia-rewarm: potassium must be a number when provided');
    if (k < 0 || k > 30) throw new RangeError('hypothermia-rewarm: potassium must be 0-30 mmol/L when provided');
  }
  let stage;
  if (state === 'arrest') stage = 'HT IV';
  else if (state === 'unconscious') stage = 'HT III';
  else if (state === 'impaired') stage = 'HT II';
  else stage = 'HT I';
  let pathway;
  const banners = [];
  if (stage === 'HT I') {
    pathway = 'Passive external rewarming; insulate, dry; warm sweet PO fluids if alert and protecting airway.';
  } else if (stage === 'HT II') {
    pathway = 'Active external + minimally invasive: forced-air warming blanket, warm IV crystalloid (38-42 C); avoid jostling.';
    banners.push('Avoid sudden movement: rough handling may precipitate ventricular fibrillation in HT II-III (Brown 2012).');
  } else if (stage === 'HT III') {
    pathway = 'Active internal rewarming: warm IV, body-cavity (peritoneal/pleural) lavage; consider ECMO/CPB if hemodynamically unstable.';
    banners.push('Avoid sudden movement (ERC 2021 §4.4).');
  } else {
    const ecprOK = !ecprExclusion && (k === null || k <= 12);
    if (ecprOK) {
      pathway = 'ECPR (VA-ECMO or cardiopulmonary bypass) is first-line per ERC 2021 §4.7. Continue CPR during transport to ECMO center.';
    } else {
      const reasons = [];
      if (ecprExclusion) reasons.push('lethal injury / chest non-compressible / known asystole pre-cooling');
      if (k !== null && k > 12) reasons.push(`serum K+ ${k} mmol/L (> 12 cut-off)`);
      pathway = `ECPR not indicated (${reasons.join('; ')}); resuscitation may be terminated per ERC 2021 §4.7.`;
    }
  }
  banners.push('Do not declare death until rewarmed to >=32 C (ERC 2021 §4.7).');
  if (t < 13.7) banners.push('Lowest reported survival is 13.7 C (Gilbert 2000); rewarming attempt is still warranted in the absence of lethal injury.');
  return {
    coreTempC: t,
    stage,
    state,
    pathway,
    potassium: k,
    ecprExclusion: !!ecprExclusion,
    banners,
    text: `${stage} per Durrer 2003: ${pathway}`,
  };
}

// --- spec-v30 §2.2: heat-illness -> cooling algorithm ------------------
// Bouchama A, Knochel JP. Heat stroke. N Engl J Med 2002;346:1978-88
// defines the stroke threshold as core >40 C or CNS dysfunction
// (any of confusion / altered LOC / seizure / coma). WMS 2019
// (Lipman 2019) gives the field algorithm: CWI to 38.9 C target,
// cool-first-transport-second, target rate >=0.15 C/min.
const HEAT_CNS = new Set(['none', 'mild-confusion', 'altered']);
const HEAT_SETTING = new Set(['field', 'hospital']);
export function heatstrokeDecision({ coreTempC, cns, sweating = true, setting = 'field' }) {
  const t = Number(coreTempC);
  if (!Number.isFinite(t)) throw new TypeError('heatstroke-decision: coreTempC must be a number');
  if (t < 35 || t > 47) throw new RangeError('heatstroke-decision: coreTempC must be 35-47');
  if (!HEAT_CNS.has(cns)) throw new TypeError(`heatstroke-decision: cns must be one of ${[...HEAT_CNS].join(', ')}`);
  if (!HEAT_SETTING.has(setting)) throw new TypeError(`heatstroke-decision: setting must be field or hospital`);
  const cnsDysfunction = cns !== 'none';
  // Bouchama 2002: heat stroke = core >40 C OR any CNS dysfunction.
  const heatStroke = t > 40 || cnsDysfunction;
  const stage = heatStroke ? 'heat stroke' : 'heat exhaustion';
  const subtype = heatStroke ? (sweating ? 'exertional' : 'classic') : null;
  let action;
  const banners = [];
  if (!heatStroke) {
    action = 'Rest in cool environment; oral or IV rehydration; passive cooling (remove restrictive clothing, fan, mist). Monitor core temperature; escalate if CNS signs appear or core >40 C.';
  } else if (setting === 'field') {
    action = 'Cold-water immersion (CWI) to target core 38.9 C (102 F). Cool first, transport second per WMS 2019 (Lipman 2019). Target cooling rate >=0.15 C/min.';
    banners.push('Exertional heat-stroke survival approaches 100% if core is lowered below 40 C within 30 minutes (Casa 2007).');
  } else {
    action = 'Cold-water immersion preferred. If CWI not available: evaporative cooling + ice packs to groin/axilla/neck. Stop active cooling at 38.9 C to avoid overshoot hypothermia.';
  }
  if (heatStroke) {
    banners.push('Surveillance for rhabdomyolysis, DIC, acute kidney injury, and hepatic dysfunction (Bouchama 2002).');
    banners.push(`${subtype === 'classic' ? 'Classic (anhidrotic)' : 'Exertional (sweating preserved)'} heat-stroke subtype noted; cooling algorithm is identical.`);
  }
  return {
    coreTempC: t,
    cns,
    cnsDysfunction,
    sweating: !!sweating,
    setting,
    stage,
    subtype,
    action,
    banners,
    text: `${stage}${subtype ? ' (' + subtype + ')' : ''} per Bouchama 2002: ${action}`,
  };
}

// --- spec-v32 §2.1: FLACC (Merkel 1997) ---------------------------------
// Five ordinal items (face, legs, activity, cry, consolability), each 0-2.
// Total 0-10. Bands: 0 relaxed; 1-3 mild discomfort; 4-6 moderate pain;
// 7-10 severe.
function checkOrdinal(name, key, value, max) {
  const v = Number(value);
  if (!Number.isInteger(v)) throw new TypeError(`${name}: ${key} must be an integer`);
  if (v < 0 || v > max) throw new TypeError(`${name}: ${key} must be 0-${max}`);
  return v;
}
function painBand(score) {
  if (score === 0) return 'no pain / relaxed';
  if (score <= 3) return 'mild discomfort';
  if (score <= 6) return 'moderate pain';
  return 'severe pain';
}
export function flacc({ face, legs, activity, cry, consolability }) {
  const f = checkOrdinal('flacc', 'face', face, 2);
  const l = checkOrdinal('flacc', 'legs', legs, 2);
  const a = checkOrdinal('flacc', 'activity', activity, 2);
  const c = checkOrdinal('flacc', 'cry', cry, 2);
  const co = checkOrdinal('flacc', 'consolability', consolability, 2);
  const score = f + l + a + c + co;
  const band = painBand(score);
  return {
    score,
    parts: { face: f, legs: l, activity: a, cry: c, consolability: co },
    band,
    text: `FLACC ${score}: ${band} per Merkel 1997 (0 relaxed; 1-3 mild discomfort; 4-6 moderate; 7-10 severe).`,
  };
}

// --- spec-v32 §2.2: PAINAD (Warden 2003) --------------------------------
// Five ordinal items (breathing, vocalization, facial expression,
// body language, consolability), each 0-2. Total 0-10. Bands identical
// to FLACC: 0 no pain; 1-3 mild; 4-6 moderate; 7-10 severe.
export function painad({ breathing, vocalization, facial, bodyLanguage, consolability }) {
  const b = checkOrdinal('painad', 'breathing', breathing, 2);
  const v = checkOrdinal('painad', 'vocalization', vocalization, 2);
  const fa = checkOrdinal('painad', 'facial', facial, 2);
  const bl = checkOrdinal('painad', 'bodyLanguage', bodyLanguage, 2);
  const co = checkOrdinal('painad', 'consolability', consolability, 2);
  const score = b + v + fa + bl + co;
  const bandRaw = painBand(score);
  // PAINAD uses "no pain" rather than "relaxed" at 0.
  const band = score === 0 ? 'no pain' : bandRaw;
  return {
    score,
    parts: { breathing: b, vocalization: v, facial: fa, bodyLanguage: bl, consolability: co },
    band,
    text: `PAINAD ${score}: ${band} per Warden 2003 (0 no pain; 1-3 mild; 4-6 moderate; 7-10 severe).`,
  };
}

// --- spec-v32 §2.3: NIPS (Lawrence 1993) --------------------------------
// Six ordinal items; cry is 0-2, the rest 0-1. Total 0-7. Bands per
// Lawrence 1993: 0-2 no/mild; 3-4 mild-to-moderate; >4 severe.
export function nips({ facialExpression, cry, breathingPatterns, arms, legs, stateOfArousal }) {
  const f = checkOrdinal('nips', 'facialExpression', facialExpression, 1);
  const c = checkOrdinal('nips', 'cry', cry, 2);
  const br = checkOrdinal('nips', 'breathingPatterns', breathingPatterns, 1);
  const a = checkOrdinal('nips', 'arms', arms, 1);
  const l = checkOrdinal('nips', 'legs', legs, 1);
  const s = checkOrdinal('nips', 'stateOfArousal', stateOfArousal, 1);
  const score = f + c + br + a + l + s;
  let band;
  if (score <= 2) band = 'no / mild pain';
  else if (score <= 4) band = 'mild-to-moderate pain';
  else band = 'severe pain';
  return {
    score,
    parts: { facialExpression: f, cry: c, breathingPatterns: br, arms: a, legs: l, stateOfArousal: s },
    band,
    text: `NIPS ${score} of 7: ${band} per Lawrence 1993 (0-2 no/mild; 3-4 mild-to-moderate; >4 severe).`,
  };
}

// --- spec-v33 §2.1: N-PASS (Hummel 2008) --------------------------------
// Five items each scored -2 to +2; negative values score sedation, positive
// values score pain/agitation. Pain side: sum positive item values; if the
// infant is preterm (<30 weeks gestational age), add one point per week
// below 30 (Hummel 2008 preterm-pain adjustment). Sedation side: sum
// negative item values (no preterm adjustment).
function checkSigned(name, key, value, max) {
  const v = Number(value);
  if (!Number.isInteger(v)) throw new TypeError(`${name}: ${key} must be an integer`);
  if (v < -max || v > max) throw new TypeError(`${name}: ${key} must be ${-max}..${max}`);
  return v;
}
export function npass({ crying, behavior, facial, extremities, vitals, gestationalAgeWeeks }) {
  const c = checkSigned('npass', 'crying', crying, 2);
  const b = checkSigned('npass', 'behavior', behavior, 2);
  const f = checkSigned('npass', 'facial', facial, 2);
  const e = checkSigned('npass', 'extremities', extremities, 2);
  const v = checkSigned('npass', 'vitals', vitals, 2);
  const ga = Number(gestationalAgeWeeks);
  if (!Number.isFinite(ga) || ga < 20 || ga > 44) {
    throw new RangeError('npass: gestationalAgeWeeks must be 20-44');
  }
  const items = [c, b, f, e, v];
  const rawPain = items.reduce((a, x) => a + Math.max(0, x), 0);
  const sedationScore = items.reduce((a, x) => a + Math.min(0, x), 0);
  const pretermAdjust = ga < 30 ? (30 - Math.floor(ga)) : 0;
  const painScore = rawPain + pretermAdjust;
  const painBand = painScore > 3 ? 'pain/agitation present' : 'no significant pain';
  let sedationBand;
  if (sedationScore <= -5) sedationBand = 'over-sedation';
  else if (sedationScore <= -3) sedationBand = 'deep sedation';
  else if (sedationScore <= -1) sedationBand = 'light sedation';
  else sedationBand = 'no sedation';
  return {
    painScore,
    sedationScore,
    pretermAdjust,
    parts: { crying: c, behavior: b, facial: f, extremities: e, vitals: v },
    painBand,
    sedationBand,
    text: `N-PASS pain ${painScore} (${painBand}); sedation ${sedationScore} (${sedationBand}) per Hummel 2008. Pain >3 indicates intervention; preterm +${pretermAdjust} adjustment for GA ${ga} weeks.`,
  };
}

// --- spec-v33 §2.2: CRIES (Krechel 1995) --------------------------------
// Five items (Crying, Requires O2, Increased vital signs, Expression,
// Sleeplessness), each 0-2. Total 0-10. Bands per Krechel 1995:
// <4 no significant pain; 4-6 moderate pain (analgesia indicated);
// >=7 severe pain.
export function cries({ crying, requiresO2, vitals, expression, sleeplessness }) {
  const c = checkOrdinal('cries', 'crying', crying, 2);
  const r = checkOrdinal('cries', 'requiresO2', requiresO2, 2);
  const v = checkOrdinal('cries', 'vitals', vitals, 2);
  const e = checkOrdinal('cries', 'expression', expression, 2);
  const s = checkOrdinal('cries', 'sleeplessness', sleeplessness, 2);
  const score = c + r + v + e + s;
  let band;
  if (score < 4) band = 'no significant pain';
  else if (score <= 6) band = 'moderate pain - analgesia indicated';
  else band = 'severe pain';
  return {
    score,
    parts: { crying: c, requiresO2: r, vitals: v, expression: e, sleeplessness: s },
    band,
    text: `CRIES ${score} of 10: ${band} per Krechel 1995 (>=4 indicates need for analgesia; >=7 severe).`,
  };
}

// --- spec-v33 §2.3: POSS (Pasero 2009) ----------------------------------
// Single-item ordinal: 0=S, 1, 2, 3, 4. S/1/2 acceptable; 3 and 4 are
// unacceptable and trigger named opioid-titration actions.
const POSS_BANDS = [
  { label: 'S', desc: 'sleep, easy to arouse', action: 'acceptable; opioid dosing may proceed.', acceptable: true },
  { label: '1', desc: 'awake and alert', action: 'acceptable; opioid dosing may proceed.', acceptable: true },
  { label: '2', desc: 'slightly drowsy, easily aroused', action: 'acceptable; opioid dosing may proceed.', acceptable: true },
  { label: '3', desc: 'frequently drowsy, drifts off mid-conversation', action: 'unacceptable; decrease opioid by 25-50%, add non-opioid, monitor closely.', acceptable: false },
  { label: '4', desc: 'somnolent, minimal or no response to physical stimulation', action: 'unacceptable; stop opioid, consider naloxone, call rapid response.', acceptable: false },
];
export function poss({ level }) {
  const v = checkOrdinal('poss', 'level', level, 4);
  const row = POSS_BANDS[v];
  return {
    score: v,
    label: row.label,
    band: `${row.label} - ${row.desc}`,
    action: row.action,
    acceptable: row.acceptable,
    text: `POSS ${row.label}: ${row.desc}. ${row.action} Per Pasero 2009.`,
  };
}

// --- spec-v34 §2.1: COMFORT-B (van Dijk 2005) ---------------------------
// Six behavioral items each scored 1-5; total 6-30. Bands: <11 over-
// sedation; 11-22 adequate; >22 inadequate / distress (van Dijk 2005).
function checkOrdinalRange(name, key, value, min, max) {
  const v = Number(value);
  if (!Number.isInteger(v)) throw new TypeError(`${name}: ${key} must be an integer`);
  if (v < min || v > max) throw new TypeError(`${name}: ${key} must be ${min}-${max}`);
  return v;
}
export function comfortB({ alertness, calmness, respiratoryOrCry, movement, muscleTone, facialTension }) {
  const a = checkOrdinalRange('comfort-b', 'alertness', alertness, 1, 5);
  const c = checkOrdinalRange('comfort-b', 'calmness', calmness, 1, 5);
  const r = checkOrdinalRange('comfort-b', 'respiratoryOrCry', respiratoryOrCry, 1, 5);
  const m = checkOrdinalRange('comfort-b', 'movement', movement, 1, 5);
  const mt = checkOrdinalRange('comfort-b', 'muscleTone', muscleTone, 1, 5);
  const f = checkOrdinalRange('comfort-b', 'facialTension', facialTension, 1, 5);
  const score = a + c + r + m + mt + f;
  let band;
  if (score < 11) band = 'over-sedation';
  else if (score <= 22) band = 'adequate sedation';
  else band = 'inadequate sedation / distress';
  return {
    score,
    parts: { alertness: a, calmness: c, respiratoryOrCry: r, movement: m, muscleTone: mt, facialTension: f },
    band,
    text: `COMFORT-B ${score} of 30: ${band} per van Dijk 2005 (target band 11-22).`,
  };
}

// --- spec-v34 §2.2: WAT-1 (Franck 2008) ---------------------------------
// Eleven items aggregate to 0-12. Three prior-12-h items + five 2-min
// pre-stimulus + two 1-min stimulus + one post-stimulus recovery (0/1/2).
// >=3 indicates iatrogenic withdrawal (Franck 2008).
export function wat1({
  looseStools, vomiting, fever,
  sbsStatePositive, tremor, sweating, uncoordinatedMovement, yawnSneeze,
  startleToTouch, increasedMuscleTone,
  recoveryMinutes,
}) {
  const ls = checkOrdinal('wat-1', 'looseStools', looseStools, 1);
  const v = checkOrdinal('wat-1', 'vomiting', vomiting, 1);
  const f = checkOrdinal('wat-1', 'fever', fever, 1);
  const sbsP = checkOrdinal('wat-1', 'sbsStatePositive', sbsStatePositive, 1);
  const tr = checkOrdinal('wat-1', 'tremor', tremor, 1);
  const sw = checkOrdinal('wat-1', 'sweating', sweating, 1);
  const um = checkOrdinal('wat-1', 'uncoordinatedMovement', uncoordinatedMovement, 1);
  const ys = checkOrdinal('wat-1', 'yawnSneeze', yawnSneeze, 1);
  const st = checkOrdinal('wat-1', 'startleToTouch', startleToTouch, 1);
  const mt = checkOrdinal('wat-1', 'increasedMuscleTone', increasedMuscleTone, 1);
  const rmRaw = Number(recoveryMinutes);
  if (!Number.isFinite(rmRaw) || rmRaw < 0) {
    throw new RangeError('wat-1: recoveryMinutes must be a non-negative number');
  }
  let recoveryPoints;
  if (rmRaw < 2) recoveryPoints = 0;
  else if (rmRaw <= 5) recoveryPoints = 1;
  else recoveryPoints = 2;
  const score = ls + v + f + sbsP + tr + sw + um + ys + st + mt + recoveryPoints;
  const withdrawal = score >= 3;
  const band = withdrawal ? 'iatrogenic withdrawal present' : 'no significant withdrawal';
  return {
    score,
    parts: {
      looseStools: ls, vomiting: v, fever: f,
      sbsStatePositive: sbsP, tremor: tr, sweating: sw,
      uncoordinatedMovement: um, yawnSneeze: ys,
      startleToTouch: st, increasedMuscleTone: mt,
      recoveryPoints,
    },
    withdrawal,
    band,
    text: `WAT-1 ${score} of 12: ${band} per Franck 2008 (>=3 indicates iatrogenic opioid/benzodiazepine withdrawal).`,
  };
}

// --- spec-v34 §2.3: SBS (Curley 2006) -----------------------------------
// Single 6-level ordinal: -3 unresponsive .. +2 agitated.
const SBS_BANDS = [
  { lv: -3, desc: 'unresponsive', target: false, deeper: true },
  { lv: -2, desc: 'responsive only to noxious stimuli', target: false, deeper: true },
  { lv: -1, desc: 'responsive to gentle touch or voice', target: true, deeper: false },
  { lv: 0, desc: 'awake and able to calm', target: true, deeper: false },
  { lv: 1, desc: 'restless and difficult to calm', target: false, deeper: false },
  { lv: 2, desc: 'agitated', target: false, deeper: false },
];
export function sbs({ level }) {
  const v = checkSigned('sbs', 'level', level, 3);
  if (v > 2) throw new TypeError('sbs: level must be -3..+2');
  const row = SBS_BANDS.find((r) => r.lv === v);
  let band;
  if (row.deeper) band = 'deeper than target sedation';
  else if (row.target) band = 'target sedation';
  else band = 'inadequate sedation / distress';
  return {
    score: v,
    label: v >= 0 ? `+${v}` : `${v}`,
    desc: row.desc,
    band,
    text: `SBS ${v >= 0 ? '+' : ''}${v} (${row.desc}): ${band} per Curley 2006.`,
  };
}

// --- spec-v35 §2.1: SOS (Ista 2009) -------------------------------------
// Sophia Observation withdrawal Symptoms scale: 15 binary items observed
// over the prior 4-hour window. Total 0-15. >=4 indicates clinically
// relevant iatrogenic withdrawal (Ista 2009 derivation cutoff).
const SOS_KEYS = [
  'tachycardia', 'tachypnea', 'fever', 'sweating', 'agitation',
  'anxiety', 'grimacing', 'sleeplessness', 'hallucinations',
  'motorDisturbance', 'hypertonia', 'tremor', 'vomiting', 'diarrhea',
  'inconsolableCrying',
];
export function sos(input) {
  const parts = {};
  let score = 0;
  for (const k of SOS_KEYS) {
    const v = checkOrdinal('sos', k, input[k], 1);
    parts[k] = v;
    score += v;
  }
  const withdrawal = score >= 4;
  const band = withdrawal ? 'iatrogenic withdrawal present' : 'no significant withdrawal';
  return {
    score,
    parts,
    withdrawal,
    band,
    text: `SOS ${score} of 15: ${band} per Ista 2009 (>=4 indicates clinically relevant iatrogenic withdrawal).`,
  };
}

// --- spec-v36 §2.1: MEOWS (Singh 2012) ----------------------------------
// Modified Early Obstetric Warning System. Track-and-trigger chart, not an
// aggregate-sum score: each vital sign is classified normal / yellow / red
// per Singh 2012 Table 1, and the trigger fires on any one red or two or
// more yellows.
function meowsCheckNumber(name, key, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name}: ${key} must be a finite number`);
  }
}
function meowsBand(rr, spo2, temp, sbp, dbp, hr, neuro, pain) {
  const flags = {};
  flags.rr = (rr < 10 || rr > 30) ? 'red' : (rr >= 21 ? 'yellow' : 'normal');
  flags.spo2 = (spo2 < 95) ? 'red' : 'normal';
  flags.temp = (temp < 35 || temp > 38) ? 'red' : (temp < 36 ? 'yellow' : 'normal');
  flags.sbp = (sbp < 90 || sbp > 160) ? 'red'
    : ((sbp >= 150 && sbp <= 160) || (sbp >= 90 && sbp <= 100)) ? 'yellow'
    : 'normal';
  flags.dbp = (dbp > 100) ? 'red' : (dbp >= 90 ? 'yellow' : 'normal');
  flags.hr = (hr < 40 || hr > 120) ? 'red'
    : ((hr >= 100 && hr <= 120) || (hr >= 40 && hr <= 50)) ? 'yellow'
    : 'normal';
  flags.neuro = (neuro === 'P' || neuro === 'U') ? 'red'
    : (neuro === 'V') ? 'yellow'
    : 'normal';
  flags.pain = (pain >= 2) ? 'yellow' : 'normal';
  return flags;
}
export function meows(input) {
  const { rr, spo2, temp, sbp, dbp, hr, neuro, pain } = input;
  meowsCheckNumber('meows', 'rr', rr);
  meowsCheckNumber('meows', 'spo2', spo2);
  meowsCheckNumber('meows', 'temp', temp);
  meowsCheckNumber('meows', 'sbp', sbp);
  meowsCheckNumber('meows', 'dbp', dbp);
  meowsCheckNumber('meows', 'hr', hr);
  if (rr < 0 || spo2 < 0 || spo2 > 100 || sbp < 0 || dbp < 0 || hr < 0) {
    throw new TypeError('meows: vitals out of plausible range');
  }
  if (neuro !== 'A' && neuro !== 'V' && neuro !== 'P' && neuro !== 'U') {
    throw new TypeError('meows: neuro must be one of A, V, P, U');
  }
  if (!Number.isInteger(pain) || pain < 0 || pain > 3) {
    throw new RangeError('meows: pain must be integer 0-3');
  }
  const flags = meowsBand(rr, spo2, temp, sbp, dbp, hr, neuro, pain);
  let redCount = 0;
  let yellowCount = 0;
  for (const v of Object.values(flags)) {
    if (v === 'red') redCount += 1;
    else if (v === 'yellow') yellowCount += 1;
  }
  const trigger = redCount >= 1 || yellowCount >= 2;
  const band = trigger ? 'trigger' : 'no trigger';
  const text = trigger
    ? `MEOWS: trigger (${redCount} red, ${yellowCount} yellow). Activate the obstetric MEOWS response per Singh 2012 (any one red or two or more yellows).`
    : `MEOWS: no trigger (${redCount} red, ${yellowCount} yellow). Continue routine monitoring per Singh 2012.`;
  return { flags, redCount, yellowCount, trigger, band, text };
}

// --- spec-v37 §2.1: CPSS (Kothari 1999) ---------------------------------
// Cincinnati Prehospital Stroke Scale. Three bedside items each binary
// (0 = normal, 1 = abnormal): facial droop, arm drift, abnormal speech.
// Positive screen if any single item is abnormal (sensitivity ~66% for
// any stroke; ~88% for anterior circulation per Kothari 1999).
function cpssCheckBinary(name, key, v) {
  if (!Number.isInteger(v) || (v !== 0 && v !== 1)) {
    throw new TypeError(`${name}: ${key} must be integer 0 or 1`);
  }
}
export function cpss({ facialDroop, armDrift, abnormalSpeech }) {
  cpssCheckBinary('cpss', 'facialDroop', facialDroop);
  cpssCheckBinary('cpss', 'armDrift', armDrift);
  cpssCheckBinary('cpss', 'abnormalSpeech', abnormalSpeech);
  const abnormalCount = facialDroop + armDrift + abnormalSpeech;
  const positive = abnormalCount >= 1;
  const band = positive ? 'positive screen' : 'negative screen';
  const text = positive
    ? `CPSS: positive screen (${abnormalCount} of 3 abnormal). Stroke is possible; activate the stroke pathway per Kothari 1999.`
    : 'CPSS: negative screen (0 of 3 abnormal). Stroke is less likely on the CPSS items; continue clinical judgment per Kothari 1999.';
  return { facialDroop, armDrift, abnormalSpeech, abnormalCount, positive, band, text };
}

// --- spec-v37 §2.2: LAMS (Llanes 2004; Nazliel 2008) --------------------
// Los Angeles Motor Scale. Three motor items: facial droop (0-1), arm
// drift (0-2), grip strength (0-2). Total 0-5. Score >=4 is the LVO
// (large-vessel occlusion) prediction threshold per Nazliel 2008
// (sensitivity 81%, specificity 89% for LVO in an acute stroke cohort).
function lamsCheck(name, key, v, max) {
  if (!Number.isInteger(v) || v < 0 || v > max) {
    throw new TypeError(`${name}: ${key} must be integer 0-${max}`);
  }
}
// --- spec-v45 §2.1: C-SSRS Screener (Posner 2011) -----------------------
// Columbia Suicide Severity Rating Scale - Screener / Recent / ED Triage.
// Seven boolean items: five ideation questions (Q1-Q5), one lifetime
// behavior question (Q6), and a past-3-months follow-up to Q6 (Q6a).
// Risk band per the Columbia Lighthouse Project ED Triage Screener.
function cssrsBool(name, key, v) {
  if (typeof v !== 'boolean') throw new TypeError(`${name}: ${key} must be boolean`);
}
export function cssrs({
  wishDead, thoughtsKilling, thoughtsMethods,
  someIntent, planIntent, behaviorLifetime, behaviorPast3Months,
}) {
  cssrsBool('cssrs', 'wishDead', wishDead);
  cssrsBool('cssrs', 'thoughtsKilling', thoughtsKilling);
  cssrsBool('cssrs', 'thoughtsMethods', thoughtsMethods);
  cssrsBool('cssrs', 'someIntent', someIntent);
  cssrsBool('cssrs', 'planIntent', planIntent);
  cssrsBool('cssrs', 'behaviorLifetime', behaviorLifetime);
  cssrsBool('cssrs', 'behaviorPast3Months', behaviorPast3Months);
  if (behaviorPast3Months && !behaviorLifetime) {
    throw new TypeError('cssrs: behaviorPast3Months cannot be true if behaviorLifetime is false');
  }
  const parts = {
    wishDead, thoughtsKilling, thoughtsMethods,
    someIntent, planIntent, behaviorLifetime, behaviorPast3Months,
  };
  let band;
  if (someIntent || planIntent || behaviorPast3Months) {
    band = 'high risk';
  } else if (thoughtsMethods || (behaviorLifetime && !behaviorPast3Months)) {
    band = 'moderate risk';
  } else if (wishDead || thoughtsKilling) {
    band = 'low risk';
  } else {
    band = 'no risk reported';
  }
  const action =
    band === 'high risk' ? 'Behavioral health / psychiatry evaluation now; consider 1:1 observation; restrict access to lethal means per local protocol.'
    : band === 'moderate risk' ? 'Behavioral health evaluation; safety planning before discharge; restrict access to lethal means.'
    : band === 'low risk' ? 'Behavioral health follow-up; provide safety-planning resources (988 Suicide & Crisis Lifeline).'
    : 'No suicide risk reported on the C-SSRS Screener at this contact; rescreen per local protocol if status changes.';
  const text = `C-SSRS Screener: ${band}. ${action} Banding per Columbia Lighthouse Project ED Triage Screener of Posner 2011.`;
  return { band, parts, text };
}

// --- spec-v44 §2.1: Barthel Index (Mahoney & Barthel 1965) --------------
// Rehab-nursing ADL with weighted 0/5/10/15-point increments across 10
// items. Total 0-100 (multiple of 5). Bands per Shah 1989: 100 indep,
// 91-99 slight, 61-90 moderate, 21-60 severe, 0-20 total dependency.
// Each item has a published allowed-value set; off-grid values reject.
const BARTHEL_ITEMS = {
  feeding:     [0, 5, 10],
  bathing:     [0, 5],
  grooming:    [0, 5],
  dressing:    [0, 5, 10],
  bowel:       [0, 5, 10],
  bladder:     [0, 5, 10],
  toilet:      [0, 5, 10],
  transfers:   [0, 5, 10, 15],
  mobility:    [0, 5, 10, 15],
  stairs:      [0, 5, 10],
};
export function barthel(input) {
  const parts = {};
  let score = 0;
  for (const [key, allowed] of Object.entries(BARTHEL_ITEMS)) {
    const v = input[key];
    if (!Number.isInteger(v) || !allowed.includes(v)) {
      throw new TypeError(`barthel: ${key} must be one of ${allowed.join(', ')}`);
    }
    parts[key] = v;
    score += v;
  }
  let band;
  if (score === 100) band = 'independent';
  else if (score >= 91) band = 'slight dependency';
  else if (score >= 61) band = 'moderate dependency';
  else if (score >= 21) band = 'severe dependency';
  else band = 'total dependency';
  const text = `Barthel Index ${score} of 100: ${band} per Mahoney 1965 (Shah 1989 banding).`;
  return { score, parts, band, text };
}

// --- spec-v43 §2.1: Lawton IADL (Lawton & Brody 1969) -------------------
// Instrumental ADL companion to Katz. Eight binary items each 0 needs
// help / 1 independent. Total 0-8. Bands: 8 = full independence, 6-7 =
// mild, 3-5 = moderate, 0-2 = severe IADL impairment.
const LAWTON_ITEMS = [
  'telephone', 'shopping', 'foodPrep', 'housekeeping',
  'laundry', 'transportation', 'medications', 'finances',
];
export function lawtonIadl(input) {
  const parts = {};
  let score = 0;
  for (const key of LAWTON_ITEMS) {
    const v = input[key];
    if (!Number.isInteger(v) || (v !== 0 && v !== 1)) {
      throw new TypeError(`lawtonIadl: ${key} must be integer 0 (needs help) or 1 (independent)`);
    }
    parts[key] = v;
    score += v;
  }
  let band;
  if (score === 8) band = 'full independence';
  else if (score >= 6) band = 'mild impairment';
  else if (score >= 3) band = 'moderate impairment';
  else band = 'severe impairment';
  const text = `Lawton IADL ${score} of 8: ${band} per Lawton 1969.`;
  return { score, parts, band, text };
}

// --- spec-v42 §2.1: Katz ADL (Katz 1963) --------------------------------
// Index of Independence in Activities of Daily Living. Six binary items
// (bathing, dressing, toileting, transferring, continence, feeding); each
// 0 dependent / 1 independent. Total 0-6. Bands per Katz 1963: 6 = full
// independence, 5 = mild impairment, 3-4 = moderate impairment, 0-2 =
// severe functional impairment.
const KATZ_ITEMS = ['bathing', 'dressing', 'toileting', 'transferring', 'continence', 'feeding'];
export function katzAdl(input) {
  const parts = {};
  let score = 0;
  for (const key of KATZ_ITEMS) {
    const v = input[key];
    if (!Number.isInteger(v) || (v !== 0 && v !== 1)) {
      throw new TypeError(`katzAdl: ${key} must be integer 0 (dependent) or 1 (independent)`);
    }
    parts[key] = v;
    score += v;
  }
  let band;
  if (score === 6) band = 'full independence';
  else if (score === 5) band = 'mild impairment';
  else if (score >= 3) band = 'moderate impairment';
  else band = 'severe functional impairment';
  const text = `Katz ADL ${score} of 6: ${band} per Katz 1963.`;
  return { score, parts, band, text };
}

// --- spec-v41 §2.1: FOUR Score (Wijdicks 2005) --------------------------
// Full Outline of UnResponsiveness. ICU coma scale designed for
// intubated patients. Four 0-4 ordinal components (eye, motor, brainstem,
// respiration); total 0-16. The FOUR is a measurement — no banded risk
// classification in Wijdicks 2005. score = 0 is the "all four absent"
// pattern that triggers brain-death workup per AAN 2010.
function fourScoreCheck(name, key, v) {
  if (!Number.isInteger(v) || v < 0 || v > 4) {
    throw new RangeError(`${name}: ${key} must be integer 0-4`);
  }
}
export function fourScore({ eye, motor, brainstem, respiration }) {
  fourScoreCheck('fourScore', 'eye', eye);
  fourScoreCheck('fourScore', 'motor', motor);
  fourScoreCheck('fourScore', 'brainstem', brainstem);
  fourScoreCheck('fourScore', 'respiration', respiration);
  const score = eye + motor + brainstem + respiration;
  const parts = { eye, motor, brainstem, respiration };
  let note;
  if (score === 16) {
    note = 'All four components maximal (E4 M4 B4 R4).';
  } else if (score === 0) {
    note = 'All four components absent (E0 M0 B0 R0) - consistent with very poor prognosis; this pattern is part of the AAN 2010 brain-death determination workup as a screen for confounders.';
  } else {
    note = `Intermediate pattern: E${eye} M${motor} B${brainstem} R${respiration}.`;
  }
  const text = `FOUR Score ${score} of 16 per Wijdicks 2005. ${note}`;
  return { score, parts, text };
}

// --- spec-v40 §2.1: GUSS (Trapl 2007) -----------------------------------
// Gugging Swallowing Screen. Two-stage bedside dysphagia screen for
// acute stroke. Stage 1 (5 items, max 5) gates stage 2; within stage 2,
// each consistency (semisolid -> liquid -> solid) must score 5 to advance
// to the next. Total 0-20 with gating per Trapl 2007. Bands: 20 slight/
// no, 15-19 slight, 10-14 moderate, 0-9 severe dysphagia.
function gussCheckBinary(name, key, v) {
  if (!Number.isInteger(v) || (v !== 0 && v !== 1)) {
    throw new TypeError(`${name}: ${key} must be integer 0 or 1`);
  }
}
function gussCheckDeglut(name, key, v) {
  if (!Number.isInteger(v) || v < 0 || v > 2) {
    throw new RangeError(`${name}: ${key} must be integer 0-2`);
  }
}
function gussSubtest(prefix, input) {
  const swallow = input[`${prefix}Swallow`];
  const cough = input[`${prefix}NoCough`];
  const drool = input[`${prefix}NoDrool`];
  const voice = input[`${prefix}NoVoiceChange`];
  gussCheckDeglut('guss', `${prefix}Swallow`, swallow);
  gussCheckBinary('guss', `${prefix}NoCough`, cough);
  gussCheckBinary('guss', `${prefix}NoDrool`, drool);
  gussCheckBinary('guss', `${prefix}NoVoiceChange`, voice);
  return swallow + cough + drool + voice;
}
export function guss(input) {
  gussCheckBinary('guss', 'vigilance', input.vigilance);
  gussCheckBinary('guss', 'coughClear', input.coughClear);
  gussCheckBinary('guss', 'salivaSwallow', input.salivaSwallow);
  gussCheckBinary('guss', 'salivaNoDrool', input.salivaNoDrool);
  gussCheckBinary('guss', 'salivaNoVoiceChange', input.salivaNoVoiceChange);
  const stage1 = input.vigilance + input.coughClear + input.salivaSwallow
    + input.salivaNoDrool + input.salivaNoVoiceChange;
  const semisolid = gussSubtest('semisolid', input);
  const liquid = gussSubtest('liquid', input);
  const solid = gussSubtest('solid', input);
  const gated = [];
  let total = stage1;
  let semisolidEff = 0;
  let liquidEff = 0;
  let solidEff = 0;
  if (stage1 >= 5) {
    semisolidEff = semisolid;
    total += semisolidEff;
    if (semisolid >= 5) {
      liquidEff = liquid;
      total += liquidEff;
      if (liquid >= 5) {
        solidEff = solid;
        total += solidEff;
      } else {
        gated.push('solid');
      }
    } else {
      gated.push('liquid', 'solid');
    }
  } else {
    gated.push('semisolid', 'liquid', 'solid');
  }
  let band;
  if (total === 20) band = 'slight / no dysphagia';
  else if (total >= 15) band = 'slight dysphagia';
  else if (total >= 10) band = 'moderate dysphagia';
  else band = 'severe dysphagia';
  const recommendation =
    total === 20 ? 'Normal diet, normal liquids; no further investigation per Trapl 2007.'
    : total >= 15 ? 'Dysphagia diet (purée + thickened liquids); SLP evaluation; consider FEES/VFSS per Trapl 2007.'
    : total >= 10 ? 'Semisolid diet only, NPO liquids; further SLP evaluation; FEES/VFSS per Trapl 2007.'
    : 'NPO; consider NG/PEG; urgent SLP evaluation; high aspiration risk per Trapl 2007.';
  const text = `GUSS ${total} of 20 (${band}). ${recommendation}`;
  return {
    score: total,
    stage1,
    semisolid: semisolidEff,
    liquid: liquidEff,
    solid: solidEff,
    gated,
    band,
    text,
  };
}

// --- spec-v39 §2.1: ROSIER (Nor 2005) -----------------------------------
// Recognition of Stroke in the Emergency Room. Seven binary items: two
// stroke-mimic items each subtract 1 (LOC/syncope, seizure), five focal-
// deficit items each add 1 (facial / arm / leg weakness, speech, visual
// field). Total -2..+5. Stroke likely when score > 0 per Nor 2005
// (sensitivity 93%, specificity 83% in the derivation cohort).
function rosierBool(name, key, v) {
  if (typeof v !== 'boolean') throw new TypeError(`${name}: ${key} must be boolean`);
}
export function rosier({
  locSyncope, seizure, facialWeakness, armWeakness, legWeakness,
  speechDisturbance, visualFieldDefect,
}) {
  rosierBool('rosier', 'locSyncope', locSyncope);
  rosierBool('rosier', 'seizure', seizure);
  rosierBool('rosier', 'facialWeakness', facialWeakness);
  rosierBool('rosier', 'armWeakness', armWeakness);
  rosierBool('rosier', 'legWeakness', legWeakness);
  rosierBool('rosier', 'speechDisturbance', speechDisturbance);
  rosierBool('rosier', 'visualFieldDefect', visualFieldDefect);
  const parts = {
    locSyncope: locSyncope ? -1 : 0,
    seizure: seizure ? -1 : 0,
    facialWeakness: facialWeakness ? 1 : 0,
    armWeakness: armWeakness ? 1 : 0,
    legWeakness: legWeakness ? 1 : 0,
    speechDisturbance: speechDisturbance ? 1 : 0,
    visualFieldDefect: visualFieldDefect ? 1 : 0,
  };
  const score = parts.locSyncope + parts.seizure + parts.facialWeakness
    + parts.armWeakness + parts.legWeakness + parts.speechDisturbance
    + parts.visualFieldDefect;
  const strokeLikely = score > 0;
  const band = strokeLikely ? 'stroke likely' : 'low probability of stroke';
  const text = strokeLikely
    ? `ROSIER ${score}: stroke is likely (score > 0 per Nor 2005, sensitivity 93% / specificity 83%). Activate the stroke pathway per local protocol.`
    : `ROSIER ${score}: low probability of stroke on the ROSIER threshold (score <= 0 per Nor 2005). Investigate stroke mimics (seizure, syncope) but stroke is not fully excluded; use clinical judgment.`;
  return { score, parts, strokeLikely, band, text };
}

// --- spec-v38 §2.1: RACE (Pérez de la Ossa 2014) ------------------------
// Rapid Arterial oCclusion Evaluation. Prehospital LVO predictor with
// five NIHSS-derived items: facial palsy 0-2, arm motor 0-2, leg motor
// 0-2, gaze 0-1, and aphasia (right hemiparesis) or agnosia (left
// hemiparesis) 0-2. Total 0-9. RACE >=5 predicts LVO with sensitivity
// 85% and specificity 68% per Pérez de la Ossa 2014.
function raceCheck(name, key, v, max) {
  if (!Number.isInteger(v) || v < 0 || v > max) {
    throw new TypeError(`${name}: ${key} must be integer 0-${max}`);
  }
}
export function race({ facialPalsy, armMotor, legMotor, gaze, languageAgnosia }) {
  raceCheck('race', 'facialPalsy', facialPalsy, 2);
  raceCheck('race', 'armMotor', armMotor, 2);
  raceCheck('race', 'legMotor', legMotor, 2);
  raceCheck('race', 'gaze', gaze, 1);
  raceCheck('race', 'languageAgnosia', languageAgnosia, 2);
  const score = facialPalsy + armMotor + legMotor + gaze + languageAgnosia;
  const lvoLikely = score >= 5;
  const band = lvoLikely ? 'LVO likely' : 'LVO less likely';
  const text = lvoLikely
    ? `RACE ${score} of 9: LVO is likely (>=5 per Pérez de la Ossa 2014, sensitivity 85% / specificity 68%). Consider transport to a comprehensive / thrombectomy-capable stroke center per local protocol.`
    : `RACE ${score} of 9: LVO is less likely on the RACE threshold (<5 per Pérez de la Ossa 2014). Continue stroke workup per local protocol.`;
  return { score, parts: { facialPalsy, armMotor, legMotor, gaze, languageAgnosia }, lvoLikely, band, text };
}

export function lams({ facialDroop, armDrift, gripStrength }) {
  lamsCheck('lams', 'facialDroop', facialDroop, 1);
  lamsCheck('lams', 'armDrift', armDrift, 2);
  lamsCheck('lams', 'gripStrength', gripStrength, 2);
  const score = facialDroop + armDrift + gripStrength;
  const lvoLikely = score >= 4;
  const band = lvoLikely ? 'LVO likely' : 'LVO less likely';
  const text = lvoLikely
    ? `LAMS ${score} of 5: LVO is likely (>=4 per Nazliel 2008). Consider transport to a comprehensive stroke center / thrombectomy-capable facility per local protocol.`
    : `LAMS ${score} of 5: LVO is less likely on the LAMS threshold (<4 per Nazliel 2008). Continue stroke workup per local protocol.`;
  return { score, parts: { facialDroop, armDrift, gripStrength }, lvoLikely, band, text };
}
