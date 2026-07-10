// spec-v260 MCP wave (one-hundredth): adapters for the pneumonia severity /
// drug-resistance risk scores in lib/pneumonia-risk-v260.js — the A-DROP score
// (JRS CAP severity), the DRIP score (drug-resistant-pathogen risk), and the
// Shorr MRSA-pneumonia risk score. dom keys mirror the browser renderer
// (views/group-v260.js) and each tile's META.example.fields. All three are
// all-boolean criteria counts, so no field is individually required.

import * as F from '../../lib/pneumonia-risk-v260.js';

export default [
  {
    id: 'a-drop',
    summary: 'A-DROP score (Japanese Respiratory Society CAP severity) — a 0-5 count over Age (male >= 70 / female >= 75), Dehydration (BUN >= 21 mg/dL), Respiratory failure (SpO2 <= 90% or PaO2 <= 60 mmHg), Orientation disturbance, and low blood Pressure (systolic <= 90 mmHg). Higher counts mark more severe community-acquired pneumonia. A severity score, not a disposition order.',
    compute: F.aDrop,
    fields: [
      { dom: 'ad-age', arg: 'age', kind: 'bool', label: 'Age (male >= 70 or female >= 75)' },
      { dom: 'ad-dehyd', arg: 'dehydration', kind: 'bool', label: 'Dehydration (BUN >= 21 mg/dL / 7.5 mmol/L)' },
      { dom: 'ad-resp', arg: 'respiratory', kind: 'bool', label: 'Respiratory failure (SpO2 <= 90% or PaO2 <= 60 mmHg)' },
      { dom: 'ad-orient', arg: 'orientation', kind: 'bool', label: 'Orientation disturbance (new confusion)' },
      { dom: 'ad-press', arg: 'pressure', kind: 'bool', label: 'Low blood pressure (systolic <= 90 mmHg)' },
    ],
  },
  {
    id: 'drip-score',
    summary: 'DRIP score (Drug Resistance In Pneumonia) — a weighted count of risk factors for a drug-resistant pathogen in community-onset pneumonia; a total >= 4 marks high risk. Risk factors: antibiotic use within 60 days, long-term-care residence, tube feeding, prior drug-resistant-pathogen infection within 1 year, hospitalization within 60 days, chronic pulmonary disease, poor functional status, gastric-acid suppression, wound care, MRSA colonization within 1 year. A risk score, not an antibiotic order.',
    compute: F.dripScore,
    fields: [
      { dom: 'dr-abx', arg: 'antibiotics60', kind: 'bool', label: 'Antibiotic use within 60 days' },
      { dom: 'dr-ltc', arg: 'ltcResidence', kind: 'bool', label: 'Long-term-care residence' },
      { dom: 'dr-tube', arg: 'tubeFeeding', kind: 'bool', label: 'Tube feeding' },
      { dom: 'dr-drp', arg: 'priorDrp', kind: 'bool', label: 'Prior drug-resistant-pathogen infection within 1 year' },
      { dom: 'dr-hosp', arg: 'hospitalization60', kind: 'bool', label: 'Hospitalization within 60 days' },
      { dom: 'dr-pulm', arg: 'chronicPulmonary', kind: 'bool', label: 'Chronic pulmonary disease' },
      { dom: 'dr-func', arg: 'poorFunctional', kind: 'bool', label: 'Poor functional status' },
      { dom: 'dr-acid', arg: 'gastricAcid', kind: 'bool', label: 'Gastric-acid suppression' },
      { dom: 'dr-wound', arg: 'woundCare', kind: 'bool', label: 'Wound care' },
      { dom: 'dr-mrsa', arg: 'mrsaColonization', kind: 'bool', label: 'MRSA colonization within 1 year' },
    ],
  },
  {
    id: 'shorr',
    summary: 'Shorr MRSA-pneumonia risk score — a weighted count predicting MRSA in culture-positive pneumonia (a total marking > 30% MRSA prevalence is high risk). Factors: recent hospitalization (+2), ICU admission at presentation (+2), age < 30 or > 79 (+1), prior IV antibiotic exposure (+1), dementia (+1), cerebrovascular disease (+1), female sex with diabetes (+1), nursing-home / LTAC / SNF exposure (+1). A risk score, not an antibiotic order.',
    compute: F.shorrMrsa,
    fields: [
      { dom: 'sh-hosp', arg: 'recentHospitalization', kind: 'bool', label: 'Recent hospitalization (+2)' },
      { dom: 'sh-icu', arg: 'icuAdmission', kind: 'bool', label: 'ICU admission at presentation (+2)' },
      { dom: 'sh-age', arg: 'ageExtreme', kind: 'bool', label: 'Age < 30 or > 79 (+1)' },
      { dom: 'sh-ivabx', arg: 'priorIvAntibiotics', kind: 'bool', label: 'Prior IV antibiotic exposure (+1)' },
      { dom: 'sh-dementia', arg: 'dementia', kind: 'bool', label: 'Dementia (+1)' },
      { dom: 'sh-cvd', arg: 'cerebrovascular', kind: 'bool', label: 'Cerebrovascular disease (+1)' },
      { dom: 'sh-femdm', arg: 'femaleDiabetes', kind: 'bool', label: 'Female sex with diabetes (+1)' },
      { dom: 'sh-nh', arg: 'nursingHome', kind: 'bool', label: 'Nursing-home / LTAC / SNF exposure (+1)' },
    ],
  },
];
