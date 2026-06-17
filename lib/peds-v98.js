// spec-v98 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// four deterministic pediatric decision rules and prognostic scores that fill
// confirmed gaps after a full sweep of the existing Pediatrics & Neonatal group
// (N) and the pediatric scores already in Group G (pews, peds-gcs, alvarado-pas,
// nigrovic, rochester/philadelphia/boston/step-by-step, westley, pram-asthma,
// pelod2, psofa, sipa). None duplicates a live tile.
//
//   kawasakiCriteria - Kawasaki disease diagnostic criteria, classic + the AHA
//                      incomplete-Kawasaki algorithm (McCrindle/AHA Circulation 2017)
//   kocherCriteria   - Kocher criteria for septic arthritis vs transient synovitis
//                      of the pediatric hip (Kocher 1999) -- 0-4 predictors -> probability
//   pim3             - Paediatric Index of Mortality 3 (Straney 2013) -- fixed
//                      logistic equation -> predicted probability of death
//   catchHead        - CATCH rule for CT in childhood minor head injury
//                      (Osmond/PERC CMAJ 2010) -- high/medium-risk factors
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v24.js wire these to the home grid.
//
// Robustness (spec-v98 §3): the pim3 logistic clamps its linear predictor before
// exponentiation so a large-magnitude x can never overflow to Infinity/0 -- the
// returned percentage is always finite and in [0, 100]; a blank required term
// surfaces valid:false rather than a probability from NaN. The criteria tiles
// (kawasaki, kocher, catch) are boolean/threshold logic that name which features
// or factors fired so the determination is auditable. None authors a treatment,
// imaging, or aspiration order in Sophie's voice (spec-v11 §5.3) -- each reports
// the rule's verdict/probability and the source's own interpretation.

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is treated
// as "not provided" rather than throwing.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;

// Look up a key in a coefficient/weight map; returns null when the key is absent
// (an out-of-enum categorical input), so the caller can surface valid:false.
function lookup(map, key) {
  if (key == null) return null;
  const k = String(key).toLowerCase();
  return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null;
}

// Logistic link, overflow-guarded (spec-v98 §3). x is clamped to [-40, 40] before
// exponentiation: e^40 ~ 2.4e17 and e^-40 ~ 4e-18 are both well within double
// range, so the probability is always finite and in (0, 1). Returns a percentage.
function logisticPct(x) {
  const clamped = Math.max(-40, Math.min(40, x));
  const p = 1 / (1 + Math.exp(-clamped));
  return Math.max(0, Math.min(100, p * 100));
}

// --- 2.1 kawasakiCriteria - Kawasaki disease (classic + incomplete) ------------
// Classic KD: fever >= 5 days PLUS >= 4 of 5 principal clinical features. The AHA
// incomplete-KD algorithm (McCrindle 2017): prolonged fever (>= 5 days) with 2-3
// principal features -> CRP/ESR inflammatory gate -> >= 3 supplementary lab
// criteria OR a positive echocardiogram supports the diagnosis.
const KAWASAKI_NOTE = 'Kawasaki disease diagnostic criteria (McCrindle BW et al, AHA scientific statement, Circulation 2017). Classic KD: fever >= 5 days plus >= 4 of the 5 principal features (bilateral non-exudative conjunctivitis, oral mucosal changes, cervical lymphadenopathy >= 1.5 cm, extremity changes, polymorphous rash). Incomplete KD is evaluated by the AHA algorithm: prolonged fever with 2-3 features, then CRP >= 3.0 mg/dL and/or ESR >= 40 mm/hr, then >= 3 of 6 supplementary laboratory criteria or a positive echocardiogram. The algorithm supports a clinical diagnosis; it does not replace cardiology evaluation or the decision to treat.';
const KAWASAKI_PRINCIPAL = [
  { key: 'conjunctivitis', label: 'Bilateral non-exudative conjunctivitis' },
  { key: 'oral', label: 'Oral mucosal changes (lips/oropharynx)' },
  { key: 'lymphadenopathy', label: 'Cervical lymphadenopathy >= 1.5 cm' },
  { key: 'extremity', label: 'Extremity changes (erythema/edema/desquamation)' },
  { key: 'rash', label: 'Polymorphous rash' },
];
const KAWASAKI_SUPPLEMENTARY = [
  { key: 'anemia', label: 'Anemia for age' },
  { key: 'platelets', label: 'Platelets >= 450,000 after day 7' },
  { key: 'albumin', label: 'Albumin <= 3.0 g/dL' },
  { key: 'alt', label: 'Elevated ALT' },
  { key: 'wbc', label: 'WBC >= 15,000/uL' },
  { key: 'pyuria', label: 'Urine WBC >= 10/hpf' },
];
export const KAWASAKI_PRINCIPAL_FEATURES = KAWASAKI_PRINCIPAL;
export const KAWASAKI_SUPPLEMENTARY_CRITERIA = KAWASAKI_SUPPLEMENTARY;
export function kawasakiCriteria({ feverDays, principal, crp, esr, supplementary, echoPositive } = {}) {
  const days = fin(feverDays);
  const principalList = Array.isArray(principal) ? principal : [];
  const principalCount = KAWASAKI_PRINCIPAL.filter((f) => principalList.includes(f.key)).length;
  if (days == null) {
    return { valid: false, band: '(enter fever duration in days and select the principal features present)', note: KAWASAKI_NOTE };
  }
  const feverDaysClamped = Math.max(0, Math.min(60, days));
  // Classic Kawasaki: fever >= 5 days AND >= 4 principal features.
  if (feverDaysClamped >= 5 && principalCount >= 4) {
    return {
      valid: true, pathway: 'classic', principalCount, feverDays: feverDaysClamped,
      determination: 'meets classic Kawasaki disease criteria',
      band: `Fever ${feverDaysClamped} days + ${principalCount}/5 principal features: meets classic Kawasaki disease criteria.`,
      note: KAWASAKI_NOTE,
    };
  }
  // Incomplete-KD algorithm: prolonged fever (>= 5 days) with 2-3 principal features.
  if (feverDaysClamped >= 5 && principalCount >= 2 && principalCount <= 3) {
    const c = fin(crp);
    const e = fin(esr);
    if (c == null || e == null) {
      return {
        valid: true, pathway: 'incomplete-pending', principalCount, feverDays: feverDaysClamped,
        determination: 'incomplete pathway -- enter CRP and ESR',
        band: `Fever ${feverDaysClamped} days + ${principalCount}/5 features: incomplete-Kawasaki pathway -- enter CRP (mg/dL) and ESR (mm/hr) to evaluate the inflammatory gate.`,
        note: KAWASAKI_NOTE,
      };
    }
    const inflamed = c >= 3.0 || e >= 40;
    if (!inflamed) {
      return {
        valid: true, pathway: 'incomplete', principalCount, feverDays: feverDaysClamped,
        crp: c, esr: e, inflamed: false,
        determination: 'inflammatory markers below threshold -- serial clinical and laboratory evaluation',
        band: `Fever ${feverDaysClamped} days + ${principalCount}/5 features, CRP ${c} mg/dL and ESR ${e} mm/hr both below the gate (CRP >= 3.0 or ESR >= 40): incomplete-KD lab threshold not met -- serial evaluation per the AHA algorithm.`,
        note: KAWASAKI_NOTE,
      };
    }
    const suppList = Array.isArray(supplementary) ? supplementary : [];
    const suppCount = KAWASAKI_SUPPLEMENTARY.filter((s) => suppList.includes(s.key)).length;
    const echo = onFlag(echoPositive);
    const supports = suppCount >= 3 || echo;
    return {
      valid: true, pathway: 'incomplete', principalCount, feverDays: feverDaysClamped,
      crp: c, esr: e, inflamed: true, supplementaryCount: suppCount, echoPositive: echo, supports,
      determination: supports
        ? 'incomplete Kawasaki disease supported by the AHA algorithm'
        : 'incomplete-KD laboratory/echo threshold not met',
      band: supports
        ? `Fever ${feverDaysClamped} days + ${principalCount}/5 features, inflammatory markers elevated, ${suppCount}/6 supplementary criteria${echo ? ' + positive echo' : ''}: supports incomplete Kawasaki disease.`
        : `Fever ${feverDaysClamped} days + ${principalCount}/5 features, inflammatory markers elevated, only ${suppCount}/6 supplementary criteria and no positive echo: incomplete-KD threshold (>= 3 criteria or positive echo) not met.`,
      note: KAWASAKI_NOTE,
    };
  }
  return {
    valid: true, pathway: 'not-met', principalCount, feverDays: feverDaysClamped,
    determination: 'classic and incomplete Kawasaki criteria not met for the entered features',
    band: `Fever ${feverDaysClamped} days + ${principalCount}/5 principal features: classic (>= 5 days + >= 4 features) and incomplete (>= 5 days + 2-3 features) Kawasaki criteria not met.`,
    note: KAWASAKI_NOTE,
  };
}

// --- 2.2 kocherCriteria - septic arthritis vs transient synovitis of the hip ---
// Four predictors; the count maps to the cited predicted probability of septic
// arthritis (Kocher 1999 development cohort).
const KOCHER_PROB = ['< 0.2%', '3.0%', '40.0%', '93.1%', '99.6%'];
const KOCHER_NOTE = 'Kocher criteria (Kocher MS, Zurakowski D, Kasser JR, J Bone Joint Surg Am 1999): an evidence-based prediction rule that separates septic arthritis from transient synovitis of the pediatric hip using four predictors -- non-weight-bearing on the affected side, oral temperature > 38.5 C, ESR > 40 mm/hr, and serum WBC > 12,000 cells/uL. The count of predictors present maps to the development-cohort predicted probability of septic arthritis (0 -> < 0.2%, 1 -> 3.0%, 2 -> 40.0%, 3 -> 93.1%, 4 -> 99.6%). It is joint-aspiration decision support; the decision to aspirate stays with the clinician.';
export function kocherCriteria({ nonWeightBearing, fever, esr, wbc } = {}) {
  const predictors = [
    { label: 'Non-weight-bearing on affected side', present: onFlag(nonWeightBearing) },
    { label: 'Oral temperature > 38.5 C', present: onFlag(fever) },
    { label: 'ESR > 40 mm/hr', present: onFlag(esr) },
    { label: 'Serum WBC > 12,000 cells/uL', present: onFlag(wbc) },
  ];
  const count = predictors.filter((p) => p.present).length;
  return {
    valid: true,
    count,
    probability: KOCHER_PROB[count],
    predictors,
    band: `Kocher ${count}/4 predictors present: predicted probability of septic arthritis ${KOCHER_PROB[count]}.`,
    note: KOCHER_NOTE,
  };
}

// --- 2.3 pim3 - Paediatric Index of Mortality 3 --------------------------------
// Fixed logistic equation (Straney L et al, Pediatr Crit Care Med 2013). The
// published Straney 2013 coefficients (NOT the PIM3-anz13 recalibration) are used,
// cross-verified against two independent reproductions (JKMS validation paper +
// the applylogits/andespediatrica reproduction). See docs/audits/v12/pim3.md.
// logit = sum(coeff * term) + constant; p(death) = e^logit / (1 + e^logit).
const PIM3 = {
  constant: -1.7928,
  pupils: 3.8233,            // both pupils > 3 mm AND fixed = 1, else 0
  elective: -0.5378,         // elective admission = 1
  mechVent: 0.9763,          // ventilated at any time in the first hour = 1
  absBaseExcess: 0.0671,     // x |base excess| (mmol/L)
  sbp: -0.0431,              // x SBP (mmHg)
  sbpSq: 0.1716,             // x (SBP * SBP / 1000)
  fio2PaO2: 0.4214,          // x (FiO2 * 100 / PaO2), PaO2 in mmHg
};
const PIM3_RECOVERY = {
  none: 0,
  'bypass-cardiac': -1.2246,
  'nonbypass-cardiac': -0.8762,
  'noncardiac': -1.5164,
};
const PIM3_RISK = {
  none: 0,
  low: -2.1766,
  high: 1.0725,
  'very-high': 1.6225,
};
const PIM3_NOTE = 'Paediatric Index of Mortality 3 (PIM3; Straney L et al, Pediatr Crit Care Med 2013): an admission mortality model for pediatric intensive care. logit = -1.7928 + 3.8233*pupils-fixed + -0.5378*elective + 0.9763*mechanical-ventilation + 0.0671*|base excess| + -0.0431*SBP + 0.1716*(SBP^2/1000) + 0.4214*(FiO2*100/PaO2) + recovery term + diagnosis-risk term; predicted death = e^logit / (1 + e^logit). Companion to the pelod2 and psofa organ-dysfunction scores -- PIM3 is the admission mortality model used for benchmarking and risk adjustment, not an individual prognosis.';
export function pim3({ sbp, pupilsFixed, fio2, paO2, baseExcess, mechVent, elective, recovery, riskCategory } = {}) {
  const s = fin(sbp);
  const recoveryC = lookup(PIM3_RECOVERY, recovery == null || recovery === '' ? 'none' : recovery);
  const riskC = lookup(PIM3_RISK, riskCategory == null || riskCategory === '' ? 'none' : riskCategory);
  if (s == null || recoveryC == null || riskC == null) {
    return { valid: false, band: '(enter systolic blood pressure and select the recovery and diagnosis-risk categories)', note: PIM3_NOTE };
  }
  const sbpClamped = Math.max(0, Math.min(300, s));
  // FiO2*100/PaO2 only contributes when both are provided (ventilated gas exchange);
  // otherwise the term is 0 per the model's "not measured -> 0" convention.
  const f = fin(fio2);
  const pa = fin(paO2);
  const fio2Term = (f != null && pa != null && pa > 0) ? (f * 100 / pa) : 0;
  const be = fin(baseExcess);
  const beTerm = be != null ? Math.abs(be) : 0;
  const x = PIM3.constant
    + PIM3.pupils * (onFlag(pupilsFixed) ? 1 : 0)
    + PIM3.elective * (onFlag(elective) ? 1 : 0)
    + PIM3.mechVent * (onFlag(mechVent) ? 1 : 0)
    + PIM3.absBaseExcess * beTerm
    + PIM3.sbp * sbpClamped
    + PIM3.sbpSq * (sbpClamped * sbpClamped / 1000)
    + PIM3.fio2PaO2 * fio2Term
    + recoveryC
    + riskC;
  const risk = logisticPct(x);
  const terms = [
    { label: 'Constant', value: PIM3.constant },
    { label: 'Pupils fixed > 3 mm', value: onFlag(pupilsFixed) ? PIM3.pupils : 0 },
    { label: 'Elective admission', value: onFlag(elective) ? PIM3.elective : 0 },
    { label: 'Mechanical ventilation (first hour)', value: onFlag(mechVent) ? PIM3.mechVent : 0 },
    { label: `|Base excess| (${r2(beTerm)})`, value: r2(PIM3.absBaseExcess * beTerm) },
    { label: `SBP (${sbpClamped})`, value: r2(PIM3.sbp * sbpClamped) },
    { label: 'SBP^2 / 1000', value: r2(PIM3.sbpSq * (sbpClamped * sbpClamped / 1000)) },
    { label: `FiO2*100/PaO2 (${r2(fio2Term)})`, value: r2(PIM3.fio2PaO2 * fio2Term) },
    { label: 'Recovery category', value: recoveryC },
    { label: 'Diagnosis-risk category', value: riskC },
  ];
  return {
    valid: true,
    x: r2(x),
    risk: r2(risk),
    terms,
    band: `PIM3 predicted probability of death: ${r2(risk)}% (logit = ${r2(x)}).`,
    note: PIM3_NOTE,
  };
}

// --- 2.4 catchHead - CATCH rule (CT for childhood minor head injury) -----------
// Any high- or medium-risk factor -> CT head indicated (Osmond MH et al, PERC,
// CMAJ 2010). High-risk factors predict need for neurosurgical intervention;
// medium-risk factors predict brain injury on CT.
const CATCH_HIGH = [
  { key: 'gcs', label: 'GCS < 15 at 2 hours after injury' },
  { key: 'skull-fracture', label: 'Suspected open or depressed skull fracture' },
  { key: 'headache', label: 'Worsening headache' },
  { key: 'irritability', label: 'Irritability on examination' },
];
const CATCH_MEDIUM = [
  { key: 'basal', label: 'Signs of basal skull fracture' },
  { key: 'hematoma', label: 'Large, boggy scalp hematoma' },
  { key: 'mechanism', label: 'Dangerous mechanism of injury' },
];
export const CATCH_HIGH_RISK = CATCH_HIGH;
export const CATCH_MEDIUM_RISK = CATCH_MEDIUM;
const CATCH_NOTE = 'CATCH rule (Osmond MH et al, Pediatric Emergency Research Canada, CMAJ 2010): a clinical decision rule for CT in children with minor head injury. CT of the head is indicated if any high-risk factor (GCS < 15 at 2 h, suspected open/depressed skull fracture, worsening headache, irritability on exam -- predicting need for neurosurgical intervention) or any medium-risk factor (basal-skull-fracture signs, large boggy scalp hematoma, dangerous mechanism -- predicting brain injury on CT) is present. It is the validated alternative to PECARN (different inclusion and factors); the imaging decision stays with the clinician.';
export function catchHead({ high, medium } = {}) {
  const highList = Array.isArray(high) ? high : [];
  const medList = Array.isArray(medium) ? medium : [];
  const highFired = CATCH_HIGH.filter((f) => highList.includes(f.key));
  const medFired = CATCH_MEDIUM.filter((f) => medList.includes(f.key));
  const indicated = highFired.length > 0 || medFired.length > 0;
  const firedLabels = [...highFired.map((f) => f.label), ...medFired.map((f) => f.label)];
  let band;
  if (!indicated) {
    band = 'No CATCH high- or medium-risk factor present: CT of the head may be deferred per the rule.';
  } else {
    const which = highFired.length > 0
      ? `high-risk factor present (${highFired.map((f) => f.label).join('; ')})`
      : `medium-risk factor present (${medFired.map((f) => f.label).join('; ')})`;
    band = `CT head indicated -- ${which}.`;
  }
  return {
    valid: true,
    indicated,
    highCount: highFired.length,
    mediumCount: medFired.length,
    fired: firedLabels,
    band,
    note: CATCH_NOTE,
  };
}
