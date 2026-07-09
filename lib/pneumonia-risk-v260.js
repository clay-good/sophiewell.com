// spec-v260: pneumonia severity & antimicrobial-stewardship risk scores — the A-DROP
// (JRS CAP severity), the DRIP score (Drug Resistance in Pneumonia), and the Shorr
// MRSA-pneumonia risk score. Third feature spec of the Advanced Risk-Stratification
// Instruments program. Each id was verified absent by a fixed-string scan of the
// extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2). v260
// runs no AI and makes no runtime network call.
//
// These compute a severity / resistance-risk CATEGORY — none is an admission,
// ICU-transfer, or antibiotic order (spec-v11 §5.3). The admit / broaden-coverage
// decision stays with the clinician.
//
//   a-drop      - A-DROP (JRS community-acquired-pneumonia severity, 0-5)
//   drip-score  - Drug Resistance in Pneumonia (0-14, >= 4 high risk)
//   shorr       - Shorr MRSA-pneumonia risk (0-10, 3-band prevalence)
//
// CRITERIA / WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified against the
// primary papers' point tables (PMC full text) at implementation.

function truthy(v) { return v === true; }
function weightedItems(rows) {
  // rows: [flag, label, points]. Returns { total, fired: [label], items }.
  const items = rows.map(([f, label, points]) => ({ label, points, on: truthy(f) }));
  const fired = items.filter((i) => i.on).map((i) => i.label);
  const total = items.reduce((a, i) => a + (i.on ? i.points : 0), 0);
  return { total, fired, items };
}

// --- A-DROP (JRS community-acquired-pneumonia severity) ----------------------
// Five items, one point each (A-DROP mnemonic). Bands: 0 mild (outpatient), 1-2
// moderate, 3 severe (admission), 4-5 extremely severe (consider ICU). Cross-verified:
// Miyashita N/JRS, Intern Med 2006;45:419-28; MDCalc "A-DROP Score".
const ADROP_NOTE = 'A-DROP (Japanese Respiratory Society) community-acquired-pneumonia severity: Age (male >= 70 or female >= 75), Dehydration (BUN >= 21 mg/dL / 7.5 mmol/L), Respiratory failure (SpO2 <= 90% or PaO2 <= 60 mmHg), Orientation disturbance (new confusion), low blood Pressure (systolic <= 90 mmHg). The sex- and age-thresholded CURB-65 variant used in the JRS pathway. Bands: 0 mild, 1-2 moderate, 3 severe, 4-5 extremely severe. A severity category, not an admission or ICU-transfer order.';
function aDropBand(s) {
  if (s <= 0) return 'mild (outpatient care per source)';
  if (s <= 2) return 'moderate';
  if (s === 3) return 'severe (admission per source)';
  return 'extremely severe (consider ICU per source)';
}
export function aDrop(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, fired } = weightedItems([
    [o.age, 'age (male >= 70 or female >= 75)', 1],
    [o.dehydration, 'dehydration (BUN >= 21)', 1],
    [o.respiratory, 'respiratory failure (SpO2 <= 90% or PaO2 <= 60)', 1],
    [o.orientation, 'orientation disturbance', 1],
    [o.pressure, 'systolic BP <= 90', 1],
  ]);
  const label = aDropBand(total);
  const firedText = fired.length ? fired.join(', ') : 'no criteria positive';
  return { valid: true, score: total, abnormal: total >= 3, bandLabel: `A-DROP ${total}`,
    band: `A-DROP ${total} of 5 — ${label}.`,
    detail: `Positive: ${firedText}.`, note: ADROP_NOTE };
}

// --- DRIP score (Drug Resistance in Pneumonia) -------------------------------
// Four major criteria (+2 each) and six minor criteria (+1 each); total 0-14.
// >= 4 = high risk for a drug-resistant pathogen. Cross-verified: Webb BJ et al.,
// Antimicrob Agents Chemother 2016;60:2652-63 (Table 3, PMC4862530); MDCalc "DRIP Score".
const DRIP_NOTE = 'Drug Resistance in Pneumonia (DRIP) score: major criteria (+2 each) = antibiotic use within 60 days, long-term-care residence, tube feeding, prior drug-resistant-pathogen infection within 1 year; minor criteria (+1 each) = hospitalization within 60 days, chronic pulmonary disease, poor functional status, gastric-acid suppression, wound care, MRSA colonization within 1 year. >= 4 favors broad-spectrum empiric coverage; < 4 narrow-spectrum reasonable. The validated replacement for the discredited HCAP definition. It flags resistance risk, not an antibiotic order.';
export function dripScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, fired } = weightedItems([
    [o.antibiotics60, 'antibiotic use within 60 days (+2)', 2],
    [o.ltcResidence, 'long-term-care residence (+2)', 2],
    [o.tubeFeeding, 'tube feeding (+2)', 2],
    [o.priorDrp, 'prior drug-resistant-pathogen infection within 1 year (+2)', 2],
    [o.hospitalization60, 'hospitalization within 60 days (+1)', 1],
    [o.chronicPulmonary, 'chronic pulmonary disease (+1)', 1],
    [o.poorFunctional, 'poor functional status (+1)', 1],
    [o.gastricAcid, 'gastric-acid suppression (+1)', 1],
    [o.woundCare, 'wound care (+1)', 1],
    [o.mrsaColonization, 'MRSA colonization within 1 year (+1)', 1],
  ]);
  const high = total >= 4;
  const firedText = fired.length ? fired.join(', ') : 'no risk factors present';
  return { valid: true, score: total, abnormal: high, bandLabel: `DRIP ${total}`,
    band: `DRIP ${total} — ${high ? 'high risk for a drug-resistant pathogen (>= 4)' : 'low risk for a drug-resistant pathogen (< 4)'}.`,
    detail: `Positive: ${firedText}.`, note: DRIP_NOTE };
}

// --- Shorr MRSA-pneumonia risk score -----------------------------------------
// Two +2 items and six +1 items; total 0-10. Bands: low 0-1 (MRSA < 10%),
// medium 2-5, high >= 6 (MRSA > 30%). Cross-verified: Shorr AF et al., BMC Infect Dis
// 2013;13:268 (Table 2, PMC3681572); MDCalc "Shorr Score".
const SHORR_NOTE = 'Shorr MRSA-pneumonia risk score: +2 each for recent hospitalization and ICU admission at presentation; +1 each for age < 30 or > 79, prior IV antibiotic exposure, dementia, cerebrovascular disease, female sex with diabetes, and recent nursing-home / long-term-acute-care / skilled-nursing-facility exposure. Bands: low 0-1 (MRSA < 10%), medium 2-5, high >= 6 (MRSA > 30%). The MRSA-specific rule-out that lets anti-MRSA therapy be safely withheld in the low band. It reports MRSA risk, not a vancomycin/linezolid order.';
function shorrBand(s) {
  if (s <= 1) return 'low (MRSA < 10% per source)';
  if (s <= 5) return 'medium';
  return 'high (MRSA > 30% per source)';
}
export function shorrMrsa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, fired } = weightedItems([
    [o.recentHospitalization, 'recent hospitalization (+2)', 2],
    [o.icuAdmission, 'ICU admission at presentation (+2)', 2],
    [o.ageExtreme, 'age < 30 or > 79 (+1)', 1],
    [o.priorIvAntibiotics, 'prior IV antibiotic exposure (+1)', 1],
    [o.dementia, 'dementia (+1)', 1],
    [o.cerebrovascular, 'cerebrovascular disease (+1)', 1],
    [o.femaleDiabetes, 'female sex with diabetes (+1)', 1],
    [o.nursingHome, 'nursing-home / LTAC / SNF exposure (+1)', 1],
  ]);
  const label = shorrBand(total);
  const firedText = fired.length ? fired.join(', ') : 'no risk factors present';
  return { valid: true, score: total, abnormal: total >= 6, bandLabel: `Shorr ${total}`,
    band: `Shorr ${total} — ${label} MRSA risk.`,
    detail: `Positive: ${firedText}.`, note: SHORR_NOTE };
}
