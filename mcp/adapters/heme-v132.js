// spec-v183 MCP wave 4: adapters for the five lib/heme-v132.js hematology
// pretest / risk scores. dom keys mirror views/group-v132.js and
// META.example.fields; arg names mirror the lib signatures (platelet, hemolysis,
// ana, ecog, …). The yes/no clinical questions are enums (the lib `flag()` helper
// distinguishes an explicit 'no' from a blank); ECOG / mucositis grades and lab
// values are numbers.

import * as F from '../../lib/heme-v132.js';

const YN = ['yes', 'no'];

export default [
  {
    id: 'plasmic-ttp',
    summary: 'PLASMIC score (Bendapudi 2017): 0-7 pretest probability of severe ADAMTS13 deficiency (acquired TTP) — platelet < 30, hemolysis, no active cancer, no transplant, MCV < 90, INR < 1.5, creatinine < 2.0; 0-4 low, 5 intermediate, 6-7 high.',
    compute: F.plasmicTtp,
    fields: [
      { dom: 'pl-plt', arg: 'platelet', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
      { dom: 'pl-hem', arg: 'hemolysis', kind: 'enum', values: YN, required: true, label: 'Hemolysis sign (retic > 2.5%, undetectable haptoglobin, or indirect bilirubin > 2.0)' },
      { dom: 'pl-ca', arg: 'activeCancer', kind: 'enum', values: YN, required: true, label: 'Active cancer in the past year' },
      { dom: 'pl-tx', arg: 'transplant', kind: 'enum', values: YN, required: true, label: 'Prior solid-organ or stem-cell transplant' },
      { dom: 'pl-mcv', arg: 'mcv', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'pl-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'pl-cr', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'french-ttp',
    summary: 'French TTP score (Coppo 2010): 0-3 pretest rule for severe acquired ADAMTS13 deficiency — platelet < 30, creatinine ≤ 2.26 mg/dL, positive ANA; 0 very unlikely, 2-3 highly likely.',
    compute: F.frenchTtp,
    fields: [
      { dom: 'ft-plt', arg: 'platelet', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
      { dom: 'ft-cr', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'ft-ana', arg: 'ana', kind: 'enum', values: YN, required: true, label: 'Antinuclear antibody (ANA) positive' },
    ],
  },
  {
    id: 'jaam-dic',
    summary: 'JAAM DIC score (Gando 2006): 0-8 acute-DIC score — SIRS ≥ 3 (1), platelet band/fall (1-3), FDP band (1-3), PT ratio ≥ 1.2 (1); total ≥ 4 meets the DIC criteria.',
    compute: F.jaamDic,
    fields: [
      { dom: 'jd-sirs', arg: 'sirs', kind: 'enum', values: YN, required: true, label: '≥ 3 SIRS criteria met' },
      { dom: 'jd-plt', arg: 'platelet', kind: 'number', required: true, label: 'Platelet count now', unit: '×10⁹/L' },
      { dom: 'jd-prior', arg: 'priorPlatelet', kind: 'number', label: 'Platelet 24 h ago (optional; scores the > 30% / > 50% fall)', unit: '×10⁹/L' },
      { dom: 'jd-fdp', arg: 'fdp', kind: 'number', required: true, label: 'Fibrin/fibrinogen degradation products (FDP)', unit: 'µg/mL' },
      { dom: 'jd-pt', arg: 'ptRatio', kind: 'number', required: true, label: 'Prothrombin-time ratio' },
    ],
  },
  {
    id: 'ipset-thrombosis',
    summary: 'Revised IPSET-thrombosis (Barbui 2015): thrombotic-risk category in essential thrombocythemia from age > 60, prior thrombosis, and JAK2 V617F — very low / low / intermediate / high with the published annual rates.',
    compute: F.ipsetThrombosis,
    fields: [
      { dom: 'ip-age', arg: 'ageOver60', kind: 'enum', values: YN, required: true, label: 'Age older than 60 years' },
      { dom: 'ip-thr', arg: 'thrombosis', kind: 'enum', values: YN, required: true, label: 'History of thrombosis' },
      { dom: 'ip-jak2', arg: 'jak2', kind: 'enum', values: YN, required: true, label: 'JAK2 V617F mutation present' },
    ],
  },
  {
    id: 'cisne',
    summary: 'CISNE (Carmona-Bayonas 2015): 0-8 serious-complication score for clinically stable febrile-neutropenia outpatients — ECOG ≥ 2 (2), stress hyperglycemia (2), COPD (1), cardiovascular disease (1), mucositis ≥ 2 (1), monocytes < 200 (1); 0 low, 1-2 intermediate, ≥ 3 high.',
    compute: F.cisne,
    fields: [
      { dom: 'ci-ecog', arg: 'ecog', kind: 'number', required: true, label: 'ECOG performance status (0-4)' },
      { dom: 'ci-glu', arg: 'hyperglycemia', kind: 'enum', values: YN, required: true, label: 'Stress-induced hyperglycemia' },
      { dom: 'ci-copd', arg: 'copd', kind: 'enum', values: YN, required: true, label: 'COPD' },
      { dom: 'ci-cv', arg: 'cardiovascular', kind: 'enum', values: YN, required: true, label: 'Chronic cardiovascular disease' },
      { dom: 'ci-muc', arg: 'mucositis', kind: 'number', required: true, label: 'NCI mucositis grade (0-4)' },
      { dom: 'ci-mono', arg: 'monocytes', kind: 'number', required: true, label: 'Monocyte count', unit: '/µL' },
    ],
  },
];
