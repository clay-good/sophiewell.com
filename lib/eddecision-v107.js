// spec-v107 (second spec of Wave 2 of the spec-v100 MDCalc Parity Completion
// program): four deterministic emergency-department decision rules and
// resuscitation-risk scores that fill confirmed gaps. None duplicates a live tile.
//
//   hear            - HEAR score (HEART minus troponin), very-low-risk ACS gate
//   newOrleansHead  - New Orleans Head Trauma Criteria (any-positive -> CT)
//   goFar           - GO-FAR score (good-neurologic-outcome survival after IHCA)
//   macocha         - MACOCHA score (ICU difficult-intubation risk)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v32.js wire these to the home grid.
//
// COEFFICIENTS / TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson; spec-v107 §3),
// each cross-verified across >= 2 independent sources (original paper + MDCalc /
// clinical reference):
//   - HEAR (Moumneh T, et al, Eur J Emerg Med 2021; HEART subset, Six 2008): the
//     four HEART domains minus troponin, each 0/1/2 -- History (slightly /
//     moderately / highly suspicious), ECG (normal / non-specific repolarization /
//     significant ST deviation), Age (< 45 / 45-64 / >= 65), Risk factors (none /
//     1-2 / >= 3 or known atherosclerotic disease). Total 0-8. HEAR <= 1 (i.e.
//     < 2) is the very-low-risk troponin-free rule-out band (~0.4% MACE).
//   - New Orleans (Haydel MJ, et al, NEJM 2000): 7 yes/no criteria in GCS-15
//     blunt minor head injury -- headache, vomiting, age > 60, drug/alcohol
//     intoxication, persistent anterograde amnesia (short-term memory deficit),
//     physical evidence of trauma above the clavicles, seizure. ANY positive -> CT.
//   - GO-FAR (Ebell MH, et al, JAMA Intern Med 2013): neurologically intact /
//     minimal deficit at admission -15 (the only negative term); major trauma +10,
//     acute stroke +8, metastatic/hematologic cancer +7, septicemia +7, medical
//     noncardiac diagnosis +7, hepatic insufficiency +6, admitted from SNF +6,
//     hypotension/hypoperfusion +5, renal insufficiency/dialysis +4, respiratory
//     insufficiency +4, pneumonia +1; age < 70 0 / 70-74 +2 / 75-79 +5 / 80-84 +6
//     / >= 85 +11. Total -15..+76. Category (probability of survival to discharge
//     with CPC 1): <= -6 above average (> 15%), -5..13 average (3-15%), 14..23 low
//     (1-3%), >= 24 very low (< 1%). Items are independent additive rows (MDCalc
//     does not enforce diagnosis mutual exclusivity).
//   - MACOCHA (De Jong A, et al, AJRCCM 2013): Mallampati III/IV +5, obstructive
//     sleep apnea +2, reduced cervical-spine mobility +1, mouth opening < 3 cm +1,
//     coma +1, severe hypoxemia (SpO2 < 80%) +1, non-anesthesiologist operator +1.
//     Total 0-12. >= 3 flags elevated difficult-intubation risk (sens 73%, NPV 98%).
//
// Robustness (spec-v107 §3): hear, goFar, and macocha sum weighted items and clamp
// the total to the published range with the band read off the clamped value so the
// shown number matches its band; newOrleansHead applies an any-positive rule. hear
// and goFar require the numeric age (a missing age renders a complete-the-fields
// fallback rather than a band from a partial total). None authors a CT order, an
// intubation plan, or a code-status recommendation in Sophie's voice (spec-v11
// §5.3); the image / airway / goals-of-care decision stays with the clinician.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// --- 2.1 hear - HEAR score (HEART minus troponin) -----------------------------
const HEAR_NOTE = 'HEAR score (Moumneh T, Sun BC, Baecker A, et al, Eur J Emerg Med 2021): the troponin-free subset of the HEART score (Six 2008) -- History + ECG + Age + Risk factors, each scored 0, 1, or 2 (total 0-8). History slightly / moderately / highly suspicious = 0 / 1 / 2; ECG normal / non-specific repolarization / significant ST deviation = 0 / 1 / 2; Age < 45 / 45-64 / >= 65 = 0 / 1 / 2; Risk factors none / 1-2 / >= 3 or known atherosclerotic disease = 0 / 1 / 2. HEAR <= 1 marks the very-low-risk band (~0.4% 30-day MACE in validation) used as a pre-troponin gate. A risk-stratification aid, not an ACS rule-out on its own; the troponin-inclusive HEART score (live tile) adds the biomarker.';
const HEAR_HISTORY = { h0: { v: 0, label: 'History slightly suspicious' }, h1: { v: 1, label: 'History moderately suspicious' }, h2: { v: 2, label: 'History highly suspicious' } };
const HEAR_ECG = { e0: { v: 0, label: 'ECG normal' }, e1: { v: 1, label: 'ECG non-specific repolarization disturbance' }, e2: { v: 2, label: 'ECG significant ST deviation' } };
const HEAR_RISK = { r0: { v: 0, label: 'No known risk factors' }, r1: { v: 1, label: '1-2 risk factors' }, r2: { v: 2, label: '>= 3 risk factors or known atherosclerotic disease' } };
const pick = (table, key, fallback) => (Object.prototype.hasOwnProperty.call(table, key) ? table[key] : table[fallback]);

export function hear({ history, ecg, age, risk } = {}) {
  const a = pos(age);
  if (a == null) {
    return { valid: false, band: 'Enter the patient age (years) to compute the HEAR score.', note: HEAR_NOTE };
  }
  const terms = [];
  let total = 0;
  const h = pick(HEAR_HISTORY, history, 'h0');
  total += h.v; terms.push({ label: h.label, value: h.v });
  const e = pick(HEAR_ECG, ecg, 'e0');
  total += e.v; terms.push({ label: e.label, value: e.v });
  const ageV = a >= 65 ? 2 : a >= 45 ? 1 : 0;
  terms.push({ label: a >= 65 ? 'Age >= 65 years' : a >= 45 ? 'Age 45-64 years' : 'Age < 45 years', value: ageV });
  total += ageV;
  const r = pick(HEAR_RISK, risk, 'r0');
  total += r.v; terms.push({ label: r.label, value: r.v });
  total = clamp(total, 0, 8);
  const veryLow = total <= 1;
  return {
    valid: true, total, veryLow, terms,
    band: veryLow
      ? `HEAR score ${total}: very low risk (<= 1) -- the troponin-free band associated with ~0.4% 30-day MACE.`
      : `HEAR score ${total}: not in the very-low-risk band (> 1) -- HEART scoring with troponin is indicated.`,
    abnormal: !veryLow, note: HEAR_NOTE,
  };
}

// --- 2.2 new-orleans-head - New Orleans Head Trauma Criteria ------------------
const NOC_NOTE = 'New Orleans Head Trauma Criteria (Haydel MJ, Preston CA, Mills TJ, et al, N Engl J Med 2000): applies to minor blunt head injury with GCS 15 and a normal brief neurologic exam. Seven criteria -- headache, vomiting, age > 60, drug/alcohol intoxication, persistent anterograde amnesia (short-term memory deficit), physical evidence of trauma above the clavicles, seizure. ANY single positive criterion indicates a head CT. 100% sensitive for intracranial injury on CT in the derivation/validation cohorts, but low specificity -- it flags ANY CT finding, not only clinically important injury (the Canadian CT Head rule is the higher-specificity companion). A rule-out aid for the GCS-15 patient, not a substitute for clinical judgment.';
const NOC_ITEMS = [
  { key: 'headache', text: 'Headache' },
  { key: 'vomiting', text: 'Vomiting' },
  { key: 'ageOver60', text: 'Age > 60 years' },
  { key: 'intoxication', text: 'Drug or alcohol intoxication' },
  { key: 'amnesia', text: 'Persistent anterograde amnesia (short-term memory deficit)' },
  { key: 'traumaAboveClavicle', text: 'Physical evidence of trauma above the clavicles' },
  { key: 'seizure', text: 'Seizure' },
];

export function newOrleansHead(input = {}) {
  const flagged = NOC_ITEMS.filter((it) => onFlag(input[it.key]));
  const ctIndicated = flagged.length > 0;
  return {
    valid: true,
    positive: flagged.length,
    ctIndicated,
    flagged: flagged.map((f) => f.text),
    band: ctIndicated
      ? `${flagged.length} positive criteri${flagged.length > 1 ? 'a' : 'on'} (${flagged.map((f) => f.text).join('; ')}): head CT indicated by the New Orleans Criteria.`
      : 'All 7 New Orleans Criteria negative: CT not indicated by the rule in this GCS-15 minor head injury.',
    abnormal: ctIndicated, note: NOC_NOTE,
  };
}

// --- 2.3 go-far - GO-FAR score (good-outcome survival after IHCA) -------------
const GOFAR_NOTE = 'GO-FAR score (Ebell MH, Jang W, Shen Y, Geocadin RG, for the AHA Get With The Guidelines-Resuscitation Investigators, JAMA Intern Med 2013): the pre-arrest probability of survival to discharge with good neurologic outcome (Cerebral Performance Category 1) after in-hospital cardiac arrest. Neurologically intact / minimal deficit at admission -15 (the only negative term); major trauma +10, acute stroke +8, metastatic or hematologic cancer +7, septicemia +7, medical noncardiac diagnosis +7, hepatic insufficiency +6, admitted from a skilled-nursing facility +6, hypotension/hypoperfusion +5, renal insufficiency/dialysis +4, respiratory insufficiency +4, pneumonia +1; age < 70 0 / 70-74 +2 / 75-79 +5 / 80-84 +6 / >= 85 +11. Category: <= -6 above average (> 15%), -5 to 13 average (3-15%), 14-23 low (1-3%), >= 24 very low (< 1%). The score informs, never decides, a goals-of-care discussion -- it estimates a probability, not an individual outcome.';
const GOFAR_ITEMS = [
  { key: 'majorTrauma', text: 'Major trauma', value: 10 },
  { key: 'acuteStroke', text: 'Acute stroke', value: 8 },
  { key: 'cancer', text: 'Metastatic or hematologic cancer', value: 7 },
  { key: 'septicemia', text: 'Septicemia', value: 7 },
  { key: 'medicalNoncardiac', text: 'Medical noncardiac diagnosis', value: 7 },
  { key: 'hepatic', text: 'Hepatic insufficiency', value: 6 },
  { key: 'snf', text: 'Admitted from skilled-nursing facility', value: 6 },
  { key: 'hypotension', text: 'Hypotension or hypoperfusion', value: 5 },
  { key: 'renal', text: 'Renal insufficiency or dialysis', value: 4 },
  { key: 'respiratory', text: 'Respiratory insufficiency', value: 4 },
  { key: 'pneumonia', text: 'Pneumonia', value: 1 },
];

export function goFar({ age, neuroIntact, ...items } = {}) {
  const a = pos(age);
  if (a == null) {
    return { valid: false, band: 'Enter the patient age (years) to compute the GO-FAR score.', note: GOFAR_NOTE };
  }
  const terms = [];
  let total = 0;
  const add = (label, value) => { total += value; terms.push({ label, value }); };
  const ageV = a >= 85 ? 11 : a >= 80 ? 6 : a >= 75 ? 5 : a >= 70 ? 2 : 0;
  terms.push({ label: a >= 85 ? 'Age >= 85 years' : a >= 80 ? 'Age 80-84 years' : a >= 75 ? 'Age 75-79 years' : a >= 70 ? 'Age 70-74 years' : 'Age < 70 years', value: ageV });
  total += ageV;
  if (onFlag(neuroIntact)) add('Neurologically intact or minimal deficit at admission', -15);
  for (const it of GOFAR_ITEMS) if (onFlag(items[it.key])) add(it.text, it.value);
  total = clamp(total, -15, 76);
  const cat = total <= -6
    ? { key: 'above average', prob: '> 15%' }
    : total <= 13
      ? { key: 'average', prob: '3-15%' }
      : total <= 23
        ? { key: 'low', prob: '1-3%' }
        : { key: 'very low', prob: '< 1%' };
  return {
    valid: true, total, category: cat.key, probability: cat.prob, terms,
    band: `GO-FAR score ${total >= 0 ? '+' : ''}${total}: ${cat.key} probability of good neurologic survival (${cat.prob}) after in-hospital arrest.`,
    abnormal: cat.key === 'low' || cat.key === 'very low', note: GOFAR_NOTE,
  };
}

// --- 2.4 macocha - MACOCHA score (ICU difficult intubation) -------------------
const MACOCHA_NOTE = 'MACOCHA score (De Jong A, Molinari N, Terzi N, et al, Am J Respir Crit Care Med 2013): predicts difficult intubation in the ICU. Patient factors -- Mallampati III or IV +5, obstructive sleep-apnea syndrome +2, reduced cervical-spine mobility +1, limited mouth opening < 3 cm +1; pathology factors -- coma +1, severe hypoxemia (SpO2 < 80%) +1; operator factor -- non-anesthesiologist +1. Total 0-12. Higher = greater risk; >= 3 flags elevated risk (sensitivity 73%, negative predictive value 98% in validation). A risk-stratification aid, not an intubation plan; the airway decision stays with the clinician.';
const MACOCHA_ITEMS = [
  { key: 'mallampati', text: 'Mallampati III or IV', value: 5 },
  { key: 'osa', text: 'Obstructive sleep apnea syndrome', value: 2 },
  { key: 'cervical', text: 'Reduced cervical-spine mobility', value: 1 },
  { key: 'mouthOpening', text: 'Limited mouth opening < 3 cm', value: 1 },
  { key: 'coma', text: 'Coma', value: 1 },
  { key: 'hypoxemia', text: 'Severe hypoxemia (SpO2 < 80%)', value: 1 },
  { key: 'nonAnesthesiologist', text: 'Non-anesthesiologist operator', value: 1 },
];

export function macocha(input = {}) {
  const terms = [];
  let total = 0;
  for (const it of MACOCHA_ITEMS) if (onFlag(input[it.key])) { total += it.value; terms.push({ label: it.text, value: it.value }); }
  total = clamp(total, 0, 12);
  const elevated = total >= 3;
  return {
    valid: true, total, elevated, terms,
    band: elevated
      ? `MACOCHA score ${total}: elevated difficult-intubation risk (>= 3) -- prepare for a difficult airway.`
      : `MACOCHA score ${total}: lower difficult-intubation risk (< 3) by the rule.`,
    abnormal: elevated, note: MACOCHA_NOTE,
  };
}
