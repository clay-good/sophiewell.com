// spec-v261 MCP wave (one-hundred-first): adapters for the acute-abdomen /
// emergency-surgery risk scores in lib/acute-abdomen-v261.js — the RIPASA
// appendicitis score, the PULP peptic-ulcer-perforation mortality score, and the
// Emergency Surgery Score (ESS). dom keys mirror the browser renderer
// (views/group-v261.js) and each tile's META.example.fields. Enum inputs default
// in the compute when omitted (the examples set only a subset), so no field is
// individually required.

import * as F from '../../lib/acute-abdomen-v261.js';

export default [
  {
    id: 'ripasa',
    summary: 'RIPASA score (Raja Isteri Pengiran Anak Saleha Appendicitis) — a weighted 0-16 score for the probability of acute appendicitis; >= 7.5 is the diagnostic cutoff. Combines demographics (gender, age band, symptom duration), symptoms/signs (RIF pain and migration, anorexia, nausea/vomiting, RIF tenderness, guarding, rebound, Rovsing sign, fever), and labs (raised WBC, negative urinalysis, foreign NRIC). A probability score, not a decision to operate.',
    compute: F.ripasa,
    fields: [
      { dom: 'rp-gender', arg: 'gender', kind: 'enum', values: ['male', 'female'], label: 'Gender (male +1 / female +0.5)' },
      { dom: 'rp-age', arg: 'ageBand', kind: 'enum', values: ['le40', 'gt40'], label: 'Age (<= 40 +1 / > 40 +0.5)' },
      { dom: 'rp-dur', arg: 'duration', kind: 'enum', values: ['lt48', 'gt48'], label: 'Symptom duration (< 48h +1 / > 48h +0.5)' },
      { dom: 'rp-rifpain', arg: 'rifPain', kind: 'bool', label: 'RIF pain (+0.5)' },
      { dom: 'rp-migration', arg: 'migration', kind: 'bool', label: 'Migration of pain to RIF (+0.5)' },
      { dom: 'rp-anorexia', arg: 'anorexia', kind: 'bool', label: 'Anorexia (+1)' },
      { dom: 'rp-nausea', arg: 'nauseaVomiting', kind: 'bool', label: 'Nausea & vomiting (+1)' },
      { dom: 'rp-riftender', arg: 'rifTenderness', kind: 'bool', label: 'RIF tenderness (+1)' },
      { dom: 'rp-guarding', arg: 'guarding', kind: 'bool', label: 'Guarding (+2)' },
      { dom: 'rp-rebound', arg: 'rebound', kind: 'bool', label: 'Rebound tenderness (+1)' },
      { dom: 'rp-rovsing', arg: 'rovsing', kind: 'bool', label: "Rovsing's sign (+2)" },
      { dom: 'rp-fever', arg: 'fever', kind: 'bool', label: 'Fever 37-39 C (+1)' },
      { dom: 'rp-wbc', arg: 'raisedWbc', kind: 'bool', label: 'Raised WBC (+1)' },
      { dom: 'rp-urine', arg: 'negativeUrinalysis', kind: 'bool', label: 'Negative urinalysis (+1)' },
      { dom: 'rp-nric', arg: 'foreignNric', kind: 'bool', label: 'Foreign NRIC (+1)' },
    ],
  },
  {
    id: 'pulp',
    summary: 'PULP score (Peptic Ulcer Perforation) — a 0-18 preoperative mortality risk score for perforated peptic ulcer; a higher total marks higher 30-day mortality risk. Factors: age > 65 (+3), active malignancy or AIDS (+1), liver cirrhosis (+2), concomitant steroid use (+1), perforation-to-admission > 24h (+1), shock on admission (+1), serum creatinine > 130 umol/L (+2), and ASA class (2 +1, 3 +3, 4 +5, 5 +7). A risk score, not a treatment order.',
    compute: F.pulp,
    fields: [
      { dom: 'pu-age', arg: 'ageOver65', kind: 'bool', label: 'Age > 65 (+3)' },
      { dom: 'pu-malig', arg: 'malignancyAids', kind: 'bool', label: 'Active malignancy or AIDS (+1)' },
      { dom: 'pu-cirr', arg: 'cirrhosis', kind: 'bool', label: 'Liver cirrhosis (+2)' },
      { dom: 'pu-steroid', arg: 'steroids', kind: 'bool', label: 'Concomitant steroid use (+1)' },
      { dom: 'pu-delay', arg: 'delayedAdmission', kind: 'bool', label: 'Perforation to admission > 24h (+1)' },
      { dom: 'pu-shock', arg: 'shock', kind: 'bool', label: 'Shock on admission (SBP < 100) (+1)' },
      { dom: 'pu-creat', arg: 'creatinine', kind: 'bool', label: 'Serum creatinine > 130 umol/L (+2)' },
      { dom: 'pu-asa', arg: 'asa', kind: 'enum', values: ['1', '2', '3', '4', '5'], label: 'ASA class (1 0 / 2 +1 / 3 +3 / 4 +5 / 5 +7)' },
    ],
  },
  {
    id: 'emergency-surgery-score',
    summary: 'Emergency Surgery Score (ESS) — a 0-29 preoperative 30-day mortality predictor for emergency general surgery. Sums demographic, comorbidity, and lab derangement points (age > 60, transfer source, ascites, low BMI, dyspnea, functional dependence, COPD, hypertension, steroids, weight loss, disseminated cancer, ventilator dependence, albumin < 3.0, alkaline phosphatase, BUN, INR, platelets, AST, sodium, creatinine, and a WBC band). A mortality-risk score, not a treatment order.',
    compute: F.emergencySurgeryScore,
    fields: [
      { dom: 'es-age', arg: 'ageOver60', kind: 'bool', label: 'Age > 60 (+2)' },
      { dom: 'es-race', arg: 'whiteRace', kind: 'bool', label: 'White race (+1, derivation coefficient)' },
      { dom: 'es-transfer', arg: 'transfer', kind: 'enum', values: ['none', 'ed', 'inpatient'], label: 'Transfer source (none / outside ED / acute-care inpatient)' },
      { dom: 'es-ascites', arg: 'ascites', kind: 'bool', label: 'Ascites (+1)' },
      { dom: 'es-bmi', arg: 'bmiUnder20', kind: 'bool', label: 'BMI < 20 (+1)' },
      { dom: 'es-dyspnea', arg: 'dyspnea', kind: 'bool', label: 'Dyspnea (+1)' },
      { dom: 'es-funcdep', arg: 'functionalDependence', kind: 'bool', label: 'Functional dependence (+1)' },
      { dom: 'es-copd', arg: 'copd', kind: 'bool', label: 'COPD (+1)' },
      { dom: 'es-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension (+1)' },
      { dom: 'es-steroid', arg: 'steroids', kind: 'bool', label: 'Steroid use (+1)' },
      { dom: 'es-wtloss', arg: 'weightLoss', kind: 'bool', label: '> 10% weight loss in 6 months (+1)' },
      { dom: 'es-cancer', arg: 'disseminatedCancer', kind: 'bool', label: 'Disseminated cancer (+3)' },
      { dom: 'es-vent', arg: 'ventilatorDependence', kind: 'bool', label: 'Ventilator dependence within 48h preop (+3)' },
      { dom: 'es-alb', arg: 'albumin', kind: 'bool', label: 'Albumin < 3.0 (+1)' },
      { dom: 'es-alkphos', arg: 'alkPhos', kind: 'bool', label: 'Alkaline phosphatase > 125 (+1)' },
      { dom: 'es-bun', arg: 'bun', kind: 'bool', label: 'BUN > 40 (+1)' },
      { dom: 'es-inr', arg: 'inr', kind: 'bool', label: 'INR > 1.5 (+1)' },
      { dom: 'es-plt', arg: 'platelets', kind: 'bool', label: 'Platelets < 150k (+1)' },
      { dom: 'es-ast', arg: 'ast', kind: 'bool', label: 'AST > 40 (+1)' },
      { dom: 'es-na', arg: 'sodium', kind: 'bool', label: 'Sodium > 145 (+1)' },
      { dom: 'es-creat', arg: 'creatinine', kind: 'bool', label: 'Creatinine > 1.2 (+2)' },
      { dom: 'es-wbc', arg: 'wbc', kind: 'enum', values: ['normal', 'abnormal', 'high'], label: 'WBC band (normal / < 4.5 or 15-25k / > 25k)' },
    ],
  },
];
