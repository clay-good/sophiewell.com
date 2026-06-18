// spec-v104 (Wave 1 of the spec-v100 MDCalc Parity Completion program): six
// deterministic wide-complex-tachycardia, aortic-dissection, and syncope-risk
// decision rules that fill confirmed gaps beside the existing ecg-axis / lvh
// tiles. None duplicates a live tile.
//
//   brugadaVt    - Brugada Criteria (VT vs SVT), 4 sequential steps (Brugada 1991)
//   vereckeiAvr  - Vereckei aVR algorithm, 4 sequential steps (Vereckei 2008)
//   addRs        - Aortic Dissection Detection Risk Score 0-3 (Rogers 2011) + D-dimer note
//   roseSyncope  - ROSE rule (BRACES + bradycardia), any-positive -> high risk (Reed 2010)
//   egsys        - EGSYS cardiac-syncope-probability score -2..+12 (Del Rosso 2008)
//   oesil        - OESIL 12-month-mortality risk score 0-4 (Colivicchi 2003)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v29.js wire these to the home grid.
//
// SOURCE GOVERNS OVER SPEC WORDING (spec-v97 lesson). Two corrections to the
// spec-v104 §2.5 prose, verified against the primary Del Rosso 2008 paper AND
// MDCalc (calc/3948), implemented here:
//   1. "Syncope during effort OR supine" is TWO separate items with DIFFERENT
//      weights -- effort +3, supine +2.
//   2. The two -1 items score when the feature is PRESENT (precipitating /
//      predisposing factors present -1; autonomic prodromes present -1) -- they
//      argue toward reflex (non-cardiac) syncope. The spec's "absence of ..."
//      phrasing is inverted. The true EGSYS range is -2 to +12 (not -2 to +10).
// Both are MDCalc-parity exact (positive weights sum to the universally-cited
// maximum of 12).
//
// Robustness (spec-v104 §3): brugadaVt / vereckeiAvr are sequential boolean step
// logic -- each returns the verdict at the FIRST positive step and names it; a
// fully-negative input returns the SVT/SV verdict, never an undefined state.
// addRs / oesil are bounded category/point counts clamped to their published
// maxima. egsys sums signed weights (the two -1 terms explicitly fuzzed) and the
// result is bounded to [-2, +12]. None authors an imaging, admission, or
// antiarrhythmic order in Sophie's voice (spec-v11 §5.3).

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// --- 2.1 brugada-vt - Brugada Criteria (VT vs SVT) ----------------------------
// Four sequential steps; the first positive step diagnoses VT, all-negative is
// SVT with aberrancy.
const BRUGADA_STEPS = [
  { key: 'absentRs', label: 'Step 1: absence of an RS complex in all precordial leads (V1-V6)' },
  { key: 'rsInterval', label: 'Step 2: R-to-S interval > 100 ms in any one precordial lead' },
  { key: 'avDissociation', label: 'Step 3: AV dissociation' },
  { key: 'morphology', label: 'Step 4: morphologic criteria for VT met in both V1-V2 and V6' },
];
const BRUGADA_NOTE = 'Brugada Criteria for VT vs SVT (Brugada P, Brugada J, Mont L, et al, Circulation 1991): the four-step wide-complex-tachycardia algorithm. Step 1 absence of RS in all precordial leads, Step 2 R-to-S interval > 100 ms in any precordial lead, Step 3 AV dissociation, Step 4 morphologic VT criteria in both V1-V2 and V6. A "yes" at any step diagnoses ventricular tachycardia and the algorithm stops; if all four are negative the rhythm is supraventricular tachycardia with aberrant conduction. Takes the clinician-read morphologic findings, not a raw tracing. A differential-diagnosis aid, not an antiarrhythmic or cardioversion order.';

export function brugadaVt(input = {}) {
  const steps = BRUGADA_STEPS.map((s) => ({ label: s.label, positive: onFlag(input[s.key]) }));
  const firstPositive = steps.find((s) => s.positive);
  const vt = Boolean(firstPositive);
  return {
    valid: true,
    vt,
    verdict: vt ? 'VT' : 'SVT with aberrancy',
    firedStep: firstPositive ? firstPositive.label : null,
    steps,
    band: vt
      ? `Ventricular tachycardia -- ${firstPositive.label} is positive (first positive step ends the algorithm).`
      : 'All four steps negative -- supraventricular tachycardia with aberrant conduction.',
    note: BRUGADA_NOTE,
  };
}

// --- 2.2 vereckei-avr - Vereckei aVR Algorithm --------------------------------
const VERECKEI_STEPS = [
  { key: 'initialR', label: 'Step 1: initial dominant R wave in lead aVR' },
  { key: 'initialWidth', label: 'Step 2: width of an initial r or q wave > 40 ms in aVR' },
  { key: 'notch', label: 'Step 3: notch on the descending limb of a predominantly negative-onset QRS in aVR' },
  { key: 'viVt', label: 'Step 4: ventricular activation-velocity ratio vi/vt <= 1' },
];
const VERECKEI_NOTE = 'Vereckei aVR algorithm for VT vs SVT (Vereckei A, Duray G, Szenasi G, et al, Heart Rhythm 2008): the four-step wide-complex-tachycardia rule using lead aVR only. Step 1 initial dominant R wave in aVR, Step 2 initial r or q wave > 40 ms, Step 3 notch on the descending limb of a negative-onset QRS, Step 4 ventricular activation-velocity ratio vi/vt <= 1 (vi and vt are the QRS voltage excursions over the initial and terminal 40 ms). A "yes" at any step diagnoses ventricular tachycardia and stops; all-negative is supraventricular. Takes the clinician-read findings, not a raw tracing. Cross-links the Brugada criteria. A differential-diagnosis aid, not an antiarrhythmic or cardioversion order.';

export function vereckeiAvr(input = {}) {
  const steps = VERECKEI_STEPS.map((s) => ({ label: s.label, positive: onFlag(input[s.key]) }));
  const firstPositive = steps.find((s) => s.positive);
  const vt = Boolean(firstPositive);
  return {
    valid: true,
    vt,
    verdict: vt ? 'VT' : 'supraventricular',
    firedStep: firstPositive ? firstPositive.label : null,
    steps,
    band: vt
      ? `Ventricular tachycardia -- ${firstPositive.label} is positive (first positive step ends the algorithm).`
      : 'All four aVR steps negative -- supraventricular tachycardia.',
    note: VERECKEI_NOTE,
  };
}

// --- 2.3 add-rs - Aortic Dissection Detection Risk Score ----------------------
// Three categories (predisposing conditions / pain features / exam findings);
// each category scores 1 if ANY feature within it is present. Total 0-3. The
// optional D-dimer is a pathway note only, never a score input.
const ADDRS_CATS = [
  { key: 'predisposing', label: 'High-risk predisposing conditions (Marfan/connective-tissue disease, family history of aortic disease, known aortic valve disease, recent aortic manipulation, known thoracic aortic aneurysm)' },
  { key: 'pain', label: 'High-risk pain features (chest/back/abdominal pain of abrupt onset, severe intensity, or ripping/tearing quality)' },
  { key: 'exam', label: 'High-risk exam features (pulse deficit or BP differential, focal neurologic deficit with pain, new aortic-insufficiency murmur, hypotension/shock)' },
];
const ADDRS_NOTE = 'Aortic Dissection Detection Risk Score (Rogers AM, Hermann LK, Booher AM, et al, Circulation 2011; from the 2010 AHA/ACC aortic-dissection guideline): three categories -- high-risk predisposing conditions, high-risk pain features, high-risk exam findings. Each category scores 1 point if any feature within it is present; total 0-3. ADD-RS 0 = low risk, 1 = intermediate, >= 2 = high risk of acute aortic syndrome. The optional D-dimer is a pathway note only, not a score input: in the ADD-RS <= 1 population a D-dimer < 500 ng/mL is the published rule-out adjunct (ADD-RS-D); ADD-RS >= 2 goes directly to imaging and D-dimer does not rule it out. A pretest-risk aid, not a CT-angiography order; the rule-out adjunct is incompletely externally validated.';

export function addRs({ predisposing, pain, exam, dDimer } = {}) {
  const items = ADDRS_CATS.map((c) => ({ label: c.label, value: onFlag({ predisposing, pain, exam }[c.key]) ? 1 : 0 }));
  const total = items.reduce((a, it) => a + it.value, 0);
  const risk = total === 0 ? 'low' : total === 1 ? 'intermediate' : 'high';
  const riskText = { low: 'low risk', intermediate: 'intermediate risk', high: 'high risk' };
  const dd = fin(dDimer);
  let dDimerNote = null;
  if (total >= 2) {
    dDimerNote = 'ADD-RS >= 2 (high risk): proceed directly to aortic imaging -- D-dimer does not rule out acute aortic syndrome in this group.';
  } else if (dd != null) {
    dDimerNote = dd < 500
      ? `D-dimer ${dd} ng/mL < 500 with ADD-RS <= 1: acute aortic syndrome can be considered ruled out per the published ADD-RS-D pathway (an adjunct, not an absolute exclusion).`
      : `D-dimer ${dd} ng/mL >= 500 with ADD-RS <= 1: the rule-out threshold is not met -- proceed to aortic imaging.`;
  }
  return {
    valid: true,
    total,
    risk,
    items,
    dDimerNote,
    band: `ADD-RS ${total}/3: ${riskText[risk]} of acute aortic syndrome.`,
    note: ADDRS_NOTE,
  };
}

// --- 2.4 rose-syncope - ROSE Rule ---------------------------------------------
// BRACES + bradycardia: any single positive criterion -> high risk (1-month
// serious outcome / death).
const ROSE_CRITERIA = [
  { key: 'bnp', label: 'BNP >= 300 pg/mL' },
  { key: 'bradycardia', label: 'Bradycardia <= 50 bpm (ED or pre-hospital)' },
  { key: 'rectal', label: 'Rectal exam positive for fecal occult blood' },
  { key: 'anemia', label: 'Anemia: hemoglobin <= 90 g/L (9.0 g/dL)' },
  { key: 'chestPain', label: 'Chest pain associated with syncope' },
  { key: 'qWave', label: 'ECG Q wave (not in lead III)' },
  { key: 'saturation', label: 'Oxygen saturation <= 94% on room air' },
];
const ROSE_NOTE = 'ROSE rule (Reed MJ, Newby DE, Coull AJ, et al, J Am Coll Cardiol 2010; Risk stratification Of Syncope in the Emergency department): admit / treat as high risk if ANY of the BRACES criteria plus bradycardia are present -- BNP >= 300 pg/mL, Bradycardia <= 50 bpm, Rectal exam fecal-occult-blood positive, Anemia (Hgb <= 90 g/L), Chest pain with syncope, ECG Q wave (not lead III), Saturation <= 94%. Any single positive criterion predicts a 1-month serious outcome or all-cause death; all-negative is low risk (negative predictive value ~98.5%). A risk-stratification aid, not an admission order.';

export function roseSyncope(input = {}) {
  const items = ROSE_CRITERIA.map((c) => ({ label: c.label, positive: onFlag(input[c.key]) }));
  const positives = items.filter((it) => it.positive);
  const highRisk = positives.length > 0;
  return {
    valid: true,
    highRisk,
    count: positives.length,
    items,
    positives: positives.map((p) => p.label),
    band: highRisk
      ? `High risk (${positives.length} positive criteri${positives.length === 1 ? 'on' : 'a'}): 1-month serious outcome or death possible -- consider admission.`
      : 'Low risk: no ROSE criterion positive.',
    note: ROSE_NOTE,
  };
}

// --- 2.5 egsys - EGSYS Score (cardiac-syncope probability) --------------------
// Signed weights. effort +3 and supine +2 are SEPARATE items; the two -1 items
// score when PRESENT (verified vs Del Rosso 2008 + MDCalc). Range -2 to +12;
// >= 3 suggests cardiac syncope.
const EGSYS_ITEMS = [
  { key: 'abnormalEcgOrHeartDisease', label: 'Abnormal ECG and/or heart disease', points: 3 },
  { key: 'palpitations', label: 'Palpitations before syncope', points: 4 },
  { key: 'effort', label: 'Syncope during effort', points: 3 },
  { key: 'supine', label: 'Syncope in supine position', points: 2 },
  { key: 'precipitating', label: 'Precipitating/predisposing factors present (warm/crowded place, prolonged standing, fear/pain/emotion)', points: -1 },
  { key: 'autonomicProdrome', label: 'Autonomic prodromes present (nausea/vomiting)', points: -1 },
];
const EGSYS_NOTE = 'EGSYS score (Del Rosso A, Ungar A, Maggi R, et al, Heart 2008; Evaluation of Guidelines in SYncope Study): abnormal ECG and/or heart disease (+3), palpitations before syncope (+4), syncope during effort (+3), syncope in the supine position (+2), and -- scored when PRESENT -- precipitating/predisposing factors (-1) and autonomic prodromes/nausea-vomiting (-1). Total -2 to +12; a score >= 3 suggests cardiac syncope (derivation sensitivity 92-95%) and carried ~17-21% 2-year mortality vs ~2-3% for a score < 3. A probability estimate, not an admission or device order.';

export function egsys(input = {}) {
  const items = EGSYS_ITEMS.map((it) => ({ label: it.label, value: onFlag(input[it.key]) ? it.points : 0 }));
  let total = items.reduce((a, it) => a + it.value, 0);
  total = Math.max(-2, Math.min(12, total));
  const cardiac = total >= 3;
  return {
    valid: true,
    total,
    cardiac,
    items,
    band: cardiac
      ? `EGSYS ${total} (range -2 to +12): score >= 3 suggests cardiac syncope.`
      : `EGSYS ${total} (range -2 to +12): score < 3, cardiac syncope less likely.`,
    note: EGSYS_NOTE,
  };
}

// --- 2.6 oesil - OESIL Risk Score ---------------------------------------------
// Four 1-point items; total 0-4 maps to the published 12-month total mortality.
const OESIL_ITEMS = [
  { key: 'age65', label: 'Age > 65 years' },
  { key: 'cvHistory', label: 'Cardiovascular disease in clinical history' },
  { key: 'noProdrome', label: 'Syncope without prodrome' },
  { key: 'abnormalEcg', label: 'Abnormal electrocardiogram' },
];
// 12-month total mortality by score (Colivicchi 2003 derivation cohort).
const OESIL_MORTALITY = ['0', '0.8', '19.6', '34.7', '57.1'];
const OESIL_NOTE = 'OESIL risk score (Colivicchi F, Ammirati F, Melina D, et al, Eur Heart J 2003; Osservatorio Epidemiologico sulla Sincope nel Lazio): one point each for age > 65, cardiovascular disease in clinical history, syncope without prodrome, and an abnormal ECG. Total 0-4; the published 12-month total mortality rises sharply at >= 2 (0 = 0%, 1 = 0.8%, 2 = 19.6%, 3 = 34.7%, 4 = 57.1%). Cross-links the ROSE rule and EGSYS. A mortality-risk estimate, not an admission order.';

export function oesil(input = {}) {
  const items = OESIL_ITEMS.map((it) => ({ label: it.label, value: onFlag(input[it.key]) ? 1 : 0 }));
  const total = items.reduce((a, it) => a + it.value, 0);
  const mortality = OESIL_MORTALITY[total];
  const risk = total >= 2 ? 'high' : 'low';
  return {
    valid: true,
    total,
    mortality,
    risk,
    items,
    band: `OESIL ${total}/4: 12-month total mortality ${mortality}% (${risk}-risk band; rises sharply at >= 2).`,
    note: OESIL_NOTE,
  };
}
