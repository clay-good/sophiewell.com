// spec-v4 §5: Group G scoring extensions (utilities 136-160).
// Pure scoring formulas. Each accepts a typed answer object and returns
// { score, band, ...components } so the renderer can show the trace.
//
// Citations live in lib/meta.js. Numeric thresholds are taken from the
// published source for each instrument.

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

// --- 150 Modified Rankin Scale (reference) ----------------------------
export const MRS_DESCRIPTIONS = [
  { score: 0, label: 'No symptoms at all.' },
  { score: 1, label: 'No significant disability despite symptoms; able to carry out usual duties and activities.' },
  { score: 2, label: 'Slight disability; unable to carry out all previous activities, but able to look after own affairs without assistance.' },
  { score: 3, label: 'Moderate disability; requires some help, but able to walk without assistance.' },
  { score: 4, label: 'Moderately severe disability; unable to walk without assistance and unable to attend to own bodily needs without assistance.' },
  { score: 5, label: 'Severe disability; bedridden, incontinent, requiring constant nursing care and attention.' },
  { score: 6, label: 'Dead.' },
];

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
