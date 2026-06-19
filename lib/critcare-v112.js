// spec-v112 (Wave 3 of the spec-v100 MDCalc Parity Completion program):
// five deterministic critical-care decision rules that fill confirmed gaps.
// None duplicates a live tile.
//
//   medsScore        - Mortality in Emergency Department Sepsis (MEDS) score
//   sicScore         - Sepsis-Induced Coagulopathy (ISTH SIC) score
//   cpisVap          - Clinical Pulmonary Infection Score (CPIS) for VAP
//   lactateClearance - lactate clearance between two draws (%)
//   mrcSumScore      - MRC sum score (ICU-acquired weakness)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v37.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. These are severity / mortality
// and diagnostic-likelihood instruments: none authors a treatment, anticoagulant,
// extubation, or sedation order in Sophie's voice (spec-v11 §5.3); the
// resuscitation, anticoagulation, ventilator, and weaning decisions stay with the
// clinician and local protocol.
//
// FORMULAS / POINT TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources (original paper + MDCalc /
// StatPearls / open-access reproduction):
//   - MEDS (Shapiro NI, et al, Crit Care Med 2003): nine weighted items summed
//     0-27 -- terminal illness 6; tachypnea/hypoxia 3; septic shock 3; platelets
//     < 150k 3; bands > 5% 3; age > 65 3; lower respiratory infection 2;
//     nursing-home resident 2; altered mental status 2. 28-day mortality bands
//     (derivation set): very low 0-4 (~0.9%), low 5-7 (~2.0%), moderate 8-12
//     (~7.8%), high 13-15 (~20%), very high >= 16 (~50%). Class A.
//   - SIC (Iba T, et al, J Thromb Haemost 2019; ISTH criteria): three items --
//     platelet (>= 150 = 0, 100 to < 150 = 1, < 100 = 2), PT-INR (<= 1.2 = 0,
//     > 1.2 to <= 1.4 = 1, > 1.4 = 2), and total SOFA capped at 2 (0 = 0, 1 = 1,
//     >= 2 = 2), total 0-6. SIC is met when the total is >= 4 AND the platelet +
//     PT-INR subscore is >= 3 (the SOFA item alone can never diagnose SIC). The
//     SOFA total here is the ISTH four-organ sum (respiratory, cardiovascular,
//     hepatic, renal). Class A.
//   - CPIS (Pugin J, et al, Am Rev Respir Dis 1991; modified culture-inclusive
//     form): six components 0/1/2 -- temperature, leukocytes (+1 if band forms
//     >= 50%), tracheal secretions, oxygenation by PaO2/FiO2 with the ARDS
//     exclusion, chest radiograph, and culture (+1 if the same organism on Gram
//     stain), total 0-12; > 6 suggests ventilator-associated pneumonia. Class A.
//   - Lactate clearance (Nguyen HB, et al, Crit Care Med 2004): (initial -
//     repeat) / initial x 100; >= 10% early clearance is the cited favorable
//     range. Division by zero guarded (initial must be > 0); a repeat above the
//     initial yields a correctly-signed negative clearance (rising lactate),
//     flagged in words. Class A.
//   - MRC sum score (De Jonghe B, et al, JAMA 2002): six movements scored
//     bilaterally (shoulder abduction, elbow flexion, wrist extension, hip
//     flexion, knee extension, ankle dorsiflexion -- 12 groups), each 0-5 on the
//     MRC scale, sum 0-60; < 48 defines ICU-acquired weakness, < 36 severe.
//     Class A.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));

// --- 2.1 meds-score - Mortality in Emergency Department Sepsis ----------------
const MEDS_NOTE = 'Mortality in Emergency Department Sepsis (MEDS) score (Shapiro NI, Wolfe RE, Moore RB, Smith E, Burdick E, Bates DW, Crit Care Med 2003): nine weighted clinical items summed 0-27 -- terminal illness (6), tachypnea or hypoxia (3), septic shock (3), platelets < 150k (3), bands > 5% (3), age > 65 (3), lower respiratory infection (2), nursing-home resident (2), and altered mental status (2). The 28-day mortality bands (derivation set) are very low 0-4 (~0.9%), low 5-7 (~2.0%), moderate 8-12 (~7.8%), high 13-15 (~20%), and very high >= 16 (~50%). A front-door mortality-risk stratifier distinct from the ICU-admission models; it frames risk, it does not direct disposition -- that stays with the clinician and local protocol.';
const MEDS_ITEMS = [
  { key: 'terminalIllness', pts: 6, label: 'terminal illness' },
  { key: 'tachypneaHypoxia', pts: 3, label: 'tachypnea/hypoxia' },
  { key: 'septicShock', pts: 3, label: 'septic shock' },
  { key: 'lowPlatelets', pts: 3, label: 'platelets < 150k' },
  { key: 'bands', pts: 3, label: 'bands > 5%' },
  { key: 'ageOver65', pts: 3, label: 'age > 65' },
  { key: 'lowerRespInfection', pts: 2, label: 'lower respiratory infection' },
  { key: 'nursingHome', pts: 2, label: 'nursing-home resident' },
  { key: 'alteredMental', pts: 2, label: 'altered mental status' },
];

export function medsScore(input = {}) {
  let total = 0;
  const counted = [];
  for (const it of MEDS_ITEMS) {
    if (onFlag(input[it.key])) { total += it.pts; counted.push(it.label); }
  }
  const tier = total <= 4 ? { name: 'very low', pct: '~0.9%' }
    : total <= 7 ? { name: 'low', pct: '~2.0%' }
    : total <= 12 ? { name: 'moderate', pct: '~7.8%' }
    : total <= 15 ? { name: 'high', pct: '~20%' }
    : { name: 'very high', pct: '~50%' };
  return {
    valid: true, total, tier: tier.name, mortality: tier.pct,
    abnormal: total >= 8,
    band: `MEDS ${total}/27: ${tier.name} risk (28-day mortality ${tier.pct}).`,
    counted: counted.length ? counted.join(', ') : 'no risk items present',
    note: MEDS_NOTE,
  };
}

// --- 2.2 sic-score - Sepsis-Induced Coagulopathy (ISTH) ----------------------
const SIC_NOTE = 'Sepsis-Induced Coagulopathy (SIC) score (Iba T, Levy JH, Warkentin TE, Thachil J, van der Poll T, Levi M, J Thromb Haemost 2019; ISTH criteria): three items -- platelet count (>= 150 = 0, 100 to < 150 = 1, < 100 = 2), PT-INR (<= 1.2 = 0, > 1.2 to <= 1.4 = 1, > 1.4 = 2), and the total SOFA capped at 2 (the ISTH four-organ sum -- respiratory, cardiovascular, hepatic, renal). SIC is met when the total (0-6) is >= 4 AND the platelet + PT-INR subscore is >= 3, so the SOFA item alone can never diagnose SIC. A coagulopathy screen that gates the anticoagulation conversation; it does not place the order -- that stays with the clinician and local protocol.';

export function sicScore(input = {}) {
  const plt = fin(input.platelet);
  const inr = fin(input.inr);
  const sofa = fin(input.sofa);
  if (plt == null || inr == null || sofa == null) {
    return { valid: false, band: 'Enter the platelet count (x10^9/L), the PT-INR, and the total SOFA score to compute the SIC score.', note: SIC_NOTE };
  }
  const pltPts = plt >= 150 ? 0 : plt >= 100 ? 1 : 2;
  const inrPts = inr <= 1.2 ? 0 : inr <= 1.4 ? 1 : 2;
  const sofaPts = clampInt(sofa, 0, Infinity) >= 2 ? 2 : clampInt(sofa, 0, Infinity);
  const coagSub = pltPts + inrPts;
  const total = coagSub + sofaPts;
  const met = total >= 4 && coagSub >= 3;
  return {
    valid: true, total, pltPts, inrPts, sofaPts, coagSub, met,
    abnormal: met,
    band: met
      ? `SIC ${total}/6 (platelets ${pltPts} + PT-INR ${inrPts} + SOFA ${sofaPts}): SIC criteria MET (total >= 4 with the platelet+PT-INR subscore >= 3).`
      : `SIC ${total}/6 (platelets ${pltPts} + PT-INR ${inrPts} + SOFA ${sofaPts}): SIC criteria not met (needs total >= 4 AND platelet+PT-INR subscore >= 3).`,
    note: SIC_NOTE,
  };
}

// --- 2.3 cpis-vap - Clinical Pulmonary Infection Score -----------------------
const CPIS_NOTE = 'Clinical Pulmonary Infection Score (CPIS) (Pugin J, Auckenthaler R, Mili N, Janssens JP, Lew PD, Suter PM, Am Rev Respir Dis 1991; modified culture-inclusive form): six components scored 0/1/2 -- temperature, leukocytes (with +1 when band forms are >= 50%), tracheal secretions, oxygenation by PaO2/FiO2 with the ARDS exclusion, chest-radiograph infiltrate, and culture (with +1 when the same organism is seen on Gram stain), for a total of 0-12. A score greater than 6 suggests ventilator-associated pneumonia. A diagnostic-likelihood aid: it quantifies VAP probability, it does not direct antibiotics or extubation -- those stay with the clinician and local protocol.';

export function cpisVap(input = {}) {
  const temp = fin(input.temp);
  const wbc = fin(input.wbc);
  if (temp == null || wbc == null) {
    return { valid: false, band: 'Enter the temperature (degrees C) and the leukocyte count (per mm^3), then select the remaining CPIS components, to compute the score.', note: CPIS_NOTE };
  }
  const tempPts = (temp >= 36.5 && temp <= 38.4) ? 0 : (temp >= 38.5 && temp <= 38.9) ? 1 : 2;
  const wbcBase = (wbc >= 4000 && wbc <= 11000) ? 0 : 1;
  const wbcPts = Math.min(2, wbcBase + (onFlag(input.bandForms) ? 1 : 0));
  const secMap = { none: 0, 'non-purulent': 1, purulent: 2 };
  const secPts = secMap[input.secretions] ?? 0;
  const oxyPts = input.oxygenation === 'low' ? 2 : 0; // 'low' = PaO2/FiO2 <= 240 and no ARDS
  const cxrMap = { none: 0, diffuse: 1, localized: 2 };
  const cxrPts = cxrMap[input.cxr] ?? 0;
  const cultBase = input.culture === 'moderate' ? 1 : 0;
  const cultPts = Math.min(2, cultBase + (onFlag(input.sameOrganism) ? 1 : 0));
  const total = tempPts + wbcPts + secPts + oxyPts + cxrPts + cultPts;
  const vap = total > 6;
  return {
    valid: true, total, vap,
    abnormal: vap,
    parts: `temp ${tempPts}, WBC ${wbcPts}, secretions ${secPts}, oxygenation ${oxyPts}, radiograph ${cxrPts}, culture ${cultPts}`,
    band: vap
      ? `CPIS ${total}/12: greater than 6 -- suggests ventilator-associated pneumonia.`
      : `CPIS ${total}/12: 6 or below -- VAP less likely by the CPIS threshold.`,
    note: CPIS_NOTE,
  };
}

// --- 2.4 lactate-clearance - lactate clearance between two draws --------------
const LAC_NOTE = 'Lactate clearance (Nguyen HB, Rivers EP, Knoblich BP, Jacobsen G, Muzzin A, Ressler JA, Tomlanovich MC, Crit Care Med 2004): the percentage fall between two draws, (initial - repeat) / initial x 100. In the early-goal-directed cohort, a clearance of >= 10% over the first hours was associated with improved outcome in severe sepsis and septic shock; a negative value means the lactate rose. A resuscitation endpoint, not a target order -- the fluid, pressor, and source-control decisions stay with the clinician and local protocol.';

export function lactateClearance(input = {}) {
  const initial = fin(input.initial);
  const repeat = fin(input.repeat);
  if (initial == null || repeat == null) {
    return { valid: false, band: 'Enter the initial and repeat lactate (mmol/L) to compute the clearance.', note: LAC_NOTE };
  }
  if (!(initial > 0)) {
    return { valid: false, band: 'The initial lactate must be greater than 0 to compute a percentage clearance.', note: LAC_NOTE };
  }
  const pct = (initial - repeat) / initial * 100;
  const rounded = Math.round(pct * 10) / 10;
  const rising = rounded < 0;
  const favorable = rounded >= 10;
  let verdict;
  if (rising) verdict = `lactate is rising (${Math.abs(rounded)}% increase) -- not a favorable trend`;
  else if (favorable) verdict = `>= 10%, the cited favorable early-clearance range`;
  else verdict = `< 10%, below the cited favorable early-clearance range`;
  return {
    valid: true, clearance: rounded, rising, favorable,
    abnormal: !favorable,
    band: `Lactate clearance ${rounded}% (${initial} -> ${repeat} mmol/L): ${verdict}.`,
    note: LAC_NOTE,
  };
}

// --- 2.5 mrc-sum-score - MRC sum score (ICU-acquired weakness) ----------------
const MRC_NOTE = 'MRC sum score (De Jonghe B, Sharshar T, Lefaucheur JP, et al, JAMA 2002): six movements graded bilaterally -- shoulder abduction, elbow flexion, wrist extension, hip flexion, knee extension, and ankle dorsiflexion (12 muscle groups) -- each 0-5 on the Medical Research Council scale, for a sum of 0-60. A sum below 48 defines ICU-acquired weakness; below 36 is severe. A bedside strength measure; it informs the weakness diagnosis, it does not set the sedation, mobility, or weaning plan -- those stay with the clinician and local protocol.';
const MRC_GROUPS = [
  'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR',
  'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR',
];

export function mrcSumScore(input = {}) {
  let total = 0;
  for (const k of MRC_GROUPS) {
    const v = fin(input[k]);
    if (v == null) {
      return { valid: false, band: 'Grade all 12 muscle groups (six movements, left and right) 0-5 to compute the MRC sum score.', note: MRC_NOTE };
    }
    total += clampInt(v, 0, 5);
  }
  const weakness = total < 48;
  const severe = total < 36;
  const verdict = severe
    ? 'below 36 -- severe ICU-acquired weakness'
    : weakness
      ? 'below 48 -- ICU-acquired weakness'
      : 'at or above 48 -- ICU-acquired weakness is not met (< 48 threshold)';
  return {
    valid: true, total, weakness, severe,
    abnormal: weakness,
    band: `MRC sum ${total}/60: ${verdict}.`,
    note: MRC_NOTE,
  };
}
