// spec-v108 (third spec of Wave 2 of the spec-v100 MDCalc Parity Completion
// program): six deterministic trauma severity scores and decision rules that
// fill confirmed gaps. None duplicates a live tile.
//
//   triss         - TRISS probability of survival (logistic, blunt/penetrating)
//   niss          - New Injury Severity Score (sum of squares of 3 worst AIS)
//   tashScore     - TASH mass-transfusion probability (logistic)
//   rabtScore     - RABT massive-transfusion 0-4 rule
//   gcsPupils     - GCS-Pupils index (GCS minus pupil-reactivity penalty)
//   nexusChestCt  - NEXUS Chest CT any-positive rule-out
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v33.js wire these to the home grid.
//
// COEFFICIENTS / TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson; spec-v108 §3),
// each cross-verified across >= 2 independent sources (original paper + MDCalc /
// clinical reference):
//   - TRISS (Boyd CR, et al, J Trauma 1987 method; the MTOS-1995 revision
//     coefficient set, Champion et al, the widely-used values MDCalc serves):
//     Ps = 1/(1 + e^-b), b = b0 + b1*RTS + b2*ISS + b3*AgeIndex, with AgeIndex 0
//     if age < 55 else 1. RTS is the coded Revised Trauma Score (0 to 7.8408).
//       Blunt:       b0 -1.2470, RTS  0.9544, ISS -0.0768, Age -1.9052
//       Penetrating: b0 -0.6029, RTS  1.1430, ISS -0.1516, Age -2.6676
//   - NISS (Osler T, et al, J Trauma 1997): sum of squares of the three highest
//     AIS severities (1-6) regardless of body region; any AIS 6 forces 75 (the
//     AIS-6 -> maximal-score convention ISS also uses). Range up to 75.
//   - TASH (Yucel N, et al, J Trauma 2006): Hb <7/<9/<10/<11/<12 g/dL = 8/6/4/3/2;
//     base excess <-10/<-6/<-2 mmol/L = 4/3/1; SBP <100/<120 mmHg = 4/1; heart
//     rate > 120 = 2; positive FAST +3; clinically unstable pelvic fracture +6;
//     open/dislocated femur fracture +3; male sex +1 (total 0-31). Probability of
//     mass transfusion P = 1/(1 + e^-x), x = -4.9 + 0.3*TASH.
//   - RABT (Joseph B, et al, World J Surg 2018): shock index > 1, pelvic
//     fracture, penetrating mechanism, positive FAST, each +1 (total 0-4); >= 2
//     predicts massive transfusion (sens 84%, spec 77%).
//   - GCS-Pupils (Brennan PM, Murray GD, Teasdale GM, J Neurosurg 2018):
//     GCS-P = GCS total - Pupil Reactivity Score, PRS = number of pupils
//     unreactive to light (0/1/2); range 1-15 (the penalty cannot drive the
//     index below 1).
//   - NEXUS Chest CT (Rodriguez RM, et al, PLoS Med 2015): 7 criteria -- abnormal
//     chest x-ray, distracting injury, chest-wall/sternum/thoracic-spine/scapular
//     tenderness, rapid-deceleration mechanism, age > 60, intoxication, abnormal
//     alertness/mental status. ALL negative -> chest CT can be deferred; ANY
//     positive -> CT may be indicated.
//
// Robustness (spec-v108 §3): triss and tashScore guard their logistic exponent
// with an overflow-safe 1/(1+e^-x) clamped to a finite range, so a fuzz-extreme
// ISS or TASH total returns a surfaced result rather than a probability from
// Infinity; triss selects and names the blunt vs penetrating set; niss clamps
// each AIS to 1-6 and applies the AIS-6 convention; gcsPupils bounds the index to
// 1-15. None authors a transfusion, CT, or trauma-bay order in Sophie's voice
// (spec-v11 §5.3); the order stays with the clinician and local protocol.

import { r1, r2 } from './num.js';

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// Overflow-safe logistic: clamp the exponent to a finite range so a fuzz-extreme
// argument resolves to 0/1 rather than producing NaN from Infinity arithmetic.
const logistic = (x) => 1 / (1 + Math.exp(-clamp(x, -40, 40)));

// --- 2.1 triss - Trauma and Injury Severity Score ----------------------------
const TRISS_NOTE = 'TRISS (Boyd CR, Tolson MA, Copes WS, J Trauma 1987; MTOS-1995 coefficient set): the benchmark trauma-outcome model. Probability of survival Ps = 1/(1 + e^-b), where b = b0 + b1*RTS + b2*ISS + b3*AgeIndex (AgeIndex 0 if age < 55, 1 if age >= 55). RTS is the coded Revised Trauma Score (0 to 7.8408). Blunt coefficients b0 -1.2470, RTS 0.9544, ISS -0.0768, Age -1.9052; penetrating b0 -0.6029, RTS 1.1430, ISS -0.1516, Age -2.6676. A population-derived benchmark for audit and comparison, not an individual prognosis; the live iss-rts tile produces the ISS and coded RTS this calculation consumes.';
const TRISS_COEF = {
  blunt: { b0: -1.2470, rts: 0.9544, iss: -0.0768, age: -1.9052 },
  penetrating: { b0: -0.6029, rts: 1.1430, iss: -0.1516, age: -2.6676 },
};

export function triss({ rts, iss, age, mechanism } = {}) {
  const rtsV = fin(rts);
  const issV = fin(iss);
  const ageV = pos(age);
  if (rtsV == null || rtsV < 0 || rtsV > 7.8408) {
    return { valid: false, band: 'Enter the coded Revised Trauma Score (0 to 7.8408) -- the live iss-rts tile computes it.', note: TRISS_NOTE };
  }
  if (issV == null || issV < 0 || issV > 75) {
    return { valid: false, band: 'Enter the Injury Severity Score (0 to 75).', note: TRISS_NOTE };
  }
  if (ageV == null) {
    return { valid: false, band: 'Enter the patient age (years) to compute the TRISS probability of survival.', note: TRISS_NOTE };
  }
  const pen = mechanism === 'penetrating';
  const c = pen ? TRISS_COEF.penetrating : TRISS_COEF.blunt;
  const setName = pen ? 'penetrating' : 'blunt';
  const ageIndex = ageV >= 55 ? 1 : 0;
  const b = c.b0 + c.rts * rtsV + c.iss * issV + c.age * ageIndex;
  const ps = logistic(b);
  if (!Number.isFinite(ps)) {
    return { valid: false, band: 'Inputs out of range -- check the RTS and ISS values.', note: TRISS_NOTE };
  }
  const pct = r1(ps * 100);
  return {
    valid: true, ps, pct, mechanism: setName, ageIndex,
    terms: [
      { label: `Intercept b0 (${setName})`, value: c.b0 },
      { label: `RTS ${rtsV} x ${c.rts}`, value: r2(c.rts * rtsV) },
      { label: `ISS ${issV} x ${c.iss}`, value: r2(c.iss * issV) },
      { label: `Age ${ageIndex ? '>= 55' : '< 55'} x ${c.age}`, value: r2(c.age * ageIndex) },
    ],
    band: `TRISS probability of survival ${pct}% (${setName} mechanism; RTS ${rtsV}, ISS ${issV}, age ${ageIndex ? '>= 55' : '< 55'}).`,
    abnormal: ps < 0.5,
    note: TRISS_NOTE,
  };
}

// --- 2.2 niss - New Injury Severity Score ------------------------------------
const NISS_NOTE = 'NISS (Osler T, Baker SP, Long W, J Trauma 1997): the New Injury Severity Score sums the squares of the three highest AIS severities REGARDLESS of body region -- the departure from ISS, which requires the three worst injuries to be in three different regions. Each AIS is 1-6; any AIS of 6 (an unsurvivable injury by convention) forces the maximal score 75. Range up to 75; NISS >= 16 marks major trauma. NISS outperforms ISS in several cohorts because multiple severe injuries in one region all count. A severity index for triage and audit, not a prognosis.';

export function niss({ ais1, ais2, ais3 } = {}) {
  const entered = [ais1, ais2, ais3].map(fin).filter((v) => v != null);
  if (entered.length < 1) {
    return { valid: false, band: 'Enter at least one AIS severity (1-6) -- NISS uses the three highest, any region.', note: NISS_NOTE };
  }
  const vals = entered.map((v) => clamp(Math.round(v), 0, 6)).filter((v) => v >= 1);
  if (vals.length < 1) {
    return { valid: false, band: 'Enter AIS severities between 1 and 6.', note: NISS_NOTE };
  }
  const top3 = vals.slice().sort((a, b) => b - a).slice(0, 3);
  const force6 = top3.includes(6);
  let score = force6 ? 75 : top3.reduce((s, v) => s + v * v, 0);
  score = clamp(score, 0, 75);
  const major = score >= 16;
  return {
    valid: true, score, major, force6, used: top3,
    terms: top3.map((v) => ({ label: `AIS ${v} squared`, value: v * v })),
    band: force6
      ? `NISS 75: an AIS 6 (unsurvivable by convention) forces the maximal score; three worst AIS ${top3.join(', ')}.`
      : `NISS ${score}: sum of squares of the three worst AIS (${top3.join(', ')}), any body region.${major ? ' Major trauma (>= 16).' : ''}`,
    abnormal: major, note: NISS_NOTE,
  };
}

// --- 2.3 tash-score - Trauma-Associated Severe Hemorrhage Score ---------------
const TASH_NOTE = 'TASH score (Yucel N, Lefering R, Maegele M, et al, J Trauma 2006): the logistic probability of mass transfusion as a surrogate for life-threatening hemorrhage after multiple trauma -- the continuous companion to the binary ABC rule. Points: hemoglobin < 7 / < 9 / < 10 / < 11 / < 12 g/dL = 8 / 6 / 4 / 3 / 2; base excess < -10 / < -6 / < -2 mmol/L = 4 / 3 / 1; systolic BP < 100 / < 120 mmHg = 4 / 1; heart rate > 120 = 2; positive FAST +3; clinically unstable pelvic fracture +6; open or dislocated femur fracture +3; male sex +1 (total 0-31). Probability of mass transfusion P = 1 / (1 + e^-x), x = -4.9 + 0.3 * TASH (~50% near a score of 16). A risk estimate, not a transfusion order; the MTP-activation decision stays with the clinician.';

export function tashScore(input = {}) {
  const terms = [];
  let total = 0;
  const hbV = fin(input.hb);
  if (hbV != null) {
    const p = hbV < 7 ? 8 : hbV < 9 ? 6 : hbV < 10 ? 4 : hbV < 11 ? 3 : hbV < 12 ? 2 : 0;
    total += p; terms.push({ label: `Hemoglobin ${hbV} g/dL`, value: p });
  }
  const beV = fin(input.baseExcess);
  if (beV != null) {
    const p = beV < -10 ? 4 : beV < -6 ? 3 : beV < -2 ? 1 : 0;
    total += p; terms.push({ label: `Base excess ${beV} mmol/L`, value: p });
  }
  const sbpV = fin(input.sbp);
  if (sbpV != null) {
    const p = sbpV < 100 ? 4 : sbpV < 120 ? 1 : 0;
    total += p; terms.push({ label: `Systolic BP ${sbpV} mmHg`, value: p });
  }
  const hrV = fin(input.hr);
  if (hrV != null) {
    const p = hrV > 120 ? 2 : 0;
    total += p; terms.push({ label: `Heart rate ${hrV} bpm`, value: p });
  }
  const flags = [
    { key: 'fast', text: 'Positive FAST (free intraabdominal fluid)', value: 3 },
    { key: 'pelvis', text: 'Clinically unstable pelvic fracture', value: 6 },
    { key: 'femur', text: 'Open or dislocated femur fracture', value: 3 },
    { key: 'male', text: 'Male sex', value: 1 },
  ];
  for (const f of flags) if (onFlag(input[f.key])) { total += f.value; terms.push({ label: f.text, value: f.value }); }
  total = clamp(total, 0, 31);
  const ps = logistic(-4.9 + 0.3 * total);
  const pct = r1(ps * 100);
  const high = ps >= 0.5;
  return {
    valid: true, total, ps, pct, high, terms,
    band: `TASH score ${total}: ~${pct}% probability of mass transfusion${high ? ' (>= 50%)' : ''}.`,
    abnormal: high, note: TASH_NOTE,
  };
}

// --- 2.4 rabt-score - Revised Assessment of Bleeding and Transfusion ---------
const RABT_NOTE = 'RABT score (Joseph B, Khan M, Truitt M, et al, World J Surg 2018): a simpler 0-4 massive-transfusion prediction rule. Shock index (HR / SBP) > 1, pelvic fracture, penetrating mechanism, and positive FAST each score +1. A total >= 2 predicts massive transfusion (sensitivity 84%, specificity 77%; AUROC 0.83), outperforming the ABC score in validation. A trigger-threshold aid, not an MTP-activation order; the decision stays with the trauma team and local protocol.';

export function rabtScore(input = {}) {
  const terms = [];
  let total = 0;
  const hrV = pos(input.hr);
  const sbpV = pos(input.sbp);
  let si = null;
  if (hrV != null && sbpV != null) si = r2(hrV / sbpV);
  const siHigh = si != null && si > 1;
  if (si != null) { terms.push({ label: `Shock index ${si} (HR/SBP)`, value: siHigh ? 1 : 0 }); if (siHigh) total += 1; }
  const flags = [
    { key: 'pelvis', text: 'Pelvic fracture' },
    { key: 'penetrating', text: 'Penetrating mechanism' },
    { key: 'fast', text: 'Positive FAST' },
  ];
  for (const f of flags) if (onFlag(input[f.key])) { total += 1; terms.push({ label: f.text, value: 1 }); }
  total = clamp(total, 0, 4);
  const mt = total >= 2;
  return {
    valid: true, total, mt, shockIndex: si, terms,
    band: mt
      ? `RABT score ${total}: massive transfusion predicted (>= 2) -- consider activating the MTP.`
      : `RABT score ${total}: below the massive-transfusion threshold (< 2) by the rule.`,
    abnormal: mt, note: RABT_NOTE,
  };
}

// --- 2.5 gcs-pupils - Glasgow Coma Scale-Pupils Score (GCS-P) -----------------
const GCSP_NOTE = 'GCS-Pupils score (Brennan PM, Murray GD, Teasdale GM, J Neurosurg 2018): combines the Glasgow Coma Scale with pupil reactivity to extend the bottom of the scale where TBI prognosis differs most. GCS-P = GCS total - Pupil Reactivity Score, where the PRS is the number of pupils unreactive to light (both react 0, one unreactive 1, both unreactive 2). Range 1-15 (the penalty cannot drive the index below 1). A lower GCS-P maps to worse 6-month mortality and unfavorable outcome in the IMPACT/CRASH data. A prognostic index, not a treatment decision.';

export function gcsPupils({ gcs, pupils } = {}) {
  const g = fin(gcs);
  if (g == null || g < 3 || g > 15) {
    return { valid: false, band: 'Enter a Glasgow Coma Scale total between 3 and 15.', note: GCSP_NOTE };
  }
  const p = fin(pupils);
  const prs = p == null ? 0 : clamp(Math.round(p), 0, 2);
  const idx = clamp(Math.round(g) - prs, 1, 15);
  const severe = idx <= 8;
  return {
    valid: true, index: idx, gcs: Math.round(g), prs, severe,
    terms: [
      { label: 'GCS total', value: Math.round(g) },
      { label: `Pupil reactivity penalty (${prs} pupil${prs === 1 ? '' : 's'} unreactive)`, value: -prs },
    ],
    band: `GCS-P ${idx}: GCS ${Math.round(g)} minus a pupil-reactivity penalty of ${prs} (${prs} pupil${prs === 1 ? '' : 's'} unreactive).${severe ? ' Severe range (<= 8).' : ''}`,
    abnormal: severe, note: GCSP_NOTE,
  };
}

// --- 2.6 nexus-chest-ct - NEXUS Chest CT decision instrument -----------------
const NEXUS_NOTE = 'NEXUS Chest CT (Rodriguez RM, Langdorf MI, Nishijima D, et al, PLoS Med 2015): selects blunt-trauma patients in whom chest CT can be safely deferred. Seven criteria -- abnormal chest x-ray, distracting painful injury, chest-wall/sternum/thoracic-spine/scapular tenderness, rapid-deceleration mechanism (fall > 20 ft or MVC > 40 mph), age > 60, intoxication, and abnormal alertness/mental status. If ALL seven are negative, chest CT can be deferred (>= 99% sensitive for major injury); ANY positive means CT may be indicated. A rule-out aid, not an imaging order; the decision stays with the clinician.';
const NEXUS_ITEMS = [
  { key: 'abnormalCxr', text: 'Abnormal chest x-ray' },
  { key: 'distractingInjury', text: 'Distracting painful injury' },
  { key: 'chestTenderness', text: 'Chest wall, sternum, thoracic spine, or scapular tenderness' },
  { key: 'rapidDeceleration', text: 'Rapid-deceleration mechanism (fall > 20 ft or MVC > 40 mph)' },
  { key: 'ageOver60', text: 'Age > 60 years' },
  { key: 'intoxication', text: 'Intoxication' },
  { key: 'abnormalAlertness', text: 'Abnormal alertness or mental status' },
];

export function nexusChestCt(input = {}) {
  const flagged = NEXUS_ITEMS.filter((it) => onFlag(input[it.key]));
  const ctIndicated = flagged.length > 0;
  return {
    valid: true,
    positive: flagged.length,
    ctIndicated,
    flagged: flagged.map((f) => f.text),
    band: ctIndicated
      ? `${flagged.length} positive criteri${flagged.length > 1 ? 'a' : 'on'} (${flagged.map((f) => f.text).join('; ')}): chest CT may be indicated.`
      : 'All 7 NEXUS Chest CT criteria negative: chest CT can be deferred by the rule.',
    abnormal: ctIndicated, note: NEXUS_NOTE,
  };
}
