// spec-v183 MCP wave 42: adapters for the six hepatology prognostic instruments
// in lib/hepatology-prognosis-v220.js — the FIPS post-TIPS mortality score, the
// ALBI-PLT varices-risk score, D'Amico cirrhosis staging, the aMAP HCC-risk
// score, the NACSELD-ACLF organ-failure count, and the FibroQ fibrosis index.
// dom keys mirror views/group-v220.js; all inputs are numeric labs plus a few
// boolean clinical flags.

import * as F from '../../lib/hepatology-prognosis-v220.js';

export default [
  {
    id: 'fips-score',
    summary: 'FIPS score (Freiburg index of post-TIPS survival): bilirubin, creatinine, age, and albumin give a score where ≥ 0.92 marks higher post-TIPS mortality.',
    compute: F.fips,
    fields: [
      { dom: 'fips-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'fips-cr', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'fips-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'fips-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'albi-plt',
    summary: 'ALBI-PLT score (Chen 2018): ALBI grade points plus platelet points (2–5); a score of 2 marks very low high-risk-varices risk (screening deferrable).',
    compute: F.albiPlt,
    fields: [
      { dom: 'ap-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'µmol/L' },
      { dom: 'ap-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/L' },
      { dom: 'ap-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
  {
    id: 'damico-cirrhosis-stage',
    summary: "D'Amico staging (D'Amico 2006): the presence of varices, ascites, and variceal bleeding assigns a cirrhosis stage 1–4 with rising 1-year mortality.",
    compute: F.damicoStage,
    fields: [
      { dom: 'dam-varices', arg: 'varices', kind: 'bool', required: false, label: 'Varices present' },
      { dom: 'dam-ascites', arg: 'ascites', kind: 'bool', required: false, label: 'Ascites present' },
      { dom: 'dam-bleeding', arg: 'bleeding', kind: 'bool', required: false, label: 'Variceal bleeding' },
    ],
  },
  {
    id: 'amap-score',
    summary: 'aMAP score (Fan 2020): age, sex, ALBI (bilirubin/albumin), and platelets give a 0–100 hepatocellular-carcinoma risk score (< 50 low, 50–60 medium, > 60 high).',
    compute: F.amap,
    fields: [
      { dom: 'amap-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'amap-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'µmol/L' },
      { dom: 'amap-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/L' },
      { dom: 'amap-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
      { dom: 'amap-male', arg: 'male', kind: 'bool', required: false, label: 'Male sex' },
    ],
  },
  {
    id: 'nacseld-aclf',
    summary: "NACSELD-ACLF (O'Leary 2018): a count of extrahepatic organ failures (circulatory, brain, renal, respiratory); ≥ 2 defines acute-on-chronic liver failure with sharply lower 30-day survival.",
    compute: F.nacseldAclf,
    fields: [
      { dom: 'nac-circ', arg: 'circulatory', kind: 'bool', required: false, label: 'Circulatory failure (shock)' },
      { dom: 'nac-brain', arg: 'brain', kind: 'bool', required: false, label: 'Brain failure (grade III–IV encephalopathy)' },
      { dom: 'nac-renal', arg: 'renal', kind: 'bool', required: false, label: 'Renal failure (dialysis)' },
      { dom: 'nac-resp', arg: 'respiratory', kind: 'bool', required: false, label: 'Respiratory failure (mechanical ventilation)' },
    ],
  },
  {
    id: 'fibroq',
    summary: 'FibroQ (Hsieh 2009): 10 × (age × AST × INR) / (ALT × platelets); a value > 1.6 predicts significant fibrosis (≥ F2).',
    compute: F.fibroq,
    fields: [
      { dom: 'fq-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'fq-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'IU/L' },
      { dom: 'fq-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'fq-alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'IU/L' },
      { dom: 'fq-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
];
