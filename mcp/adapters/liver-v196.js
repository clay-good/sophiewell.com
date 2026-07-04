// spec-v183 MCP wave 18: adapters for the five chronic-liver-disease
// prognostic instruments in lib/liver-v196.js — the ABIC score for alcoholic
// hepatitis, the GLOBE score for PBC transplant-free survival, the UK-PBC risk
// score, PAGE-B for HCC risk in chronic hepatitis B, and the revised Mayo PSC
// natural-history model. dom keys mirror views/group-v196.js.

import * as F from '../../lib/liver-v196.js';

export default [
  {
    id: 'abic-score',
    summary: 'ABIC score for alcoholic hepatitis (Dominguez 2008): 0.1×age + 0.08×bilirubin + 0.3×creatinine + 0.8×INR stratifies 90-day survival into low, intermediate, and high risk.',
    compute: F.abicScore,
    fields: [
      { dom: 'abic-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'abic-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Serum bilirubin', unit: 'mg/dL' },
      { dom: 'abic-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'abic-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
    ],
  },
  {
    id: 'globe-score',
    summary: 'GLOBE score for PBC transplant-free survival on ursodeoxycholic acid (Lammers 2015): age plus 1-year bilirubin, alkaline phosphatase, albumin, and platelets; > 0.30 marks a non-responder profile.',
    compute: F.globeScore,
    fields: [
      { dom: 'globe-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'globe-bili', arg: 'bili', kind: 'number', required: true, label: 'Bilirubin (× ULN)' },
      { dom: 'globe-alp', arg: 'alp', kind: 'number', required: true, label: 'Alkaline phosphatase (× ULN)' },
      { dom: 'globe-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin (× LLN)' },
      { dom: 'globe-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '× 10⁹/L' },
    ],
  },
  {
    id: 'uk-pbc-risk',
    summary: 'UK-PBC risk score (Carbone 2016): from 12-month alkaline phosphatase, transaminase, and bilirubin plus baseline albumin and platelets, the 5-, 10-, and 15-year risk of end-stage liver disease in PBC.',
    compute: F.ukPbcRisk,
    fields: [
      { dom: 'ukpbc-alp', arg: 'alp', kind: 'number', required: true, label: 'Alkaline phosphatase (× ULN, 12 mo)' },
      { dom: 'ukpbc-trans', arg: 'transaminase', kind: 'number', required: true, label: 'Transaminase ALT or AST (× ULN, 12 mo)' },
      { dom: 'ukpbc-bili', arg: 'bili', kind: 'number', required: true, label: 'Bilirubin (× ULN, 12 mo)' },
      { dom: 'ukpbc-alb', arg: 'albumin', kind: 'number', required: true, label: 'Baseline albumin (× LLN)' },
      { dom: 'ukpbc-plt', arg: 'platelets', kind: 'number', required: true, label: 'Baseline platelets (× LLN)' },
    ],
  },
  {
    id: 'page-b',
    summary: 'PAGE-B score for HCC risk in Caucasians with chronic hepatitis B on antivirals (Papatheodoridis 2016): age, sex, and platelet count map to points; ≤ 9 low, 10–17 intermediate, ≥ 18 high 5-year HCC risk.',
    compute: F.pageB,
    fields: [
      { dom: 'pageb-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'pageb-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex' },
      { dom: 'pageb-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '× 10⁹/L' },
    ],
  },
  {
    id: 'mayo-psc-risk',
    summary: 'Revised Mayo PSC natural-history model (Kim 2000): age, bilirubin, albumin, AST, and a history of variceal bleeding give a relative risk score banding survival in primary sclerosing cholangitis.',
    compute: F.mayoPscRisk,
    fields: [
      { dom: 'mayopsc-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mayopsc-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Bilirubin', unit: 'mg/dL' },
      { dom: 'mayopsc-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
      { dom: 'mayopsc-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'mayopsc-var', arg: 'variceal', kind: 'bool', required: false, label: 'History of variceal bleeding' },
    ],
  },
];
