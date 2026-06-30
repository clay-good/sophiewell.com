// spec-v183 MCP wave 5: adapters for five lib/hemonc-v94.js hematology /
// oncology prognostic and risk scores. dom keys mirror views/group-v94.js and
// META.example.fields; arg names mirror the lib signatures. The yes/no clinical
// items are bools (the lib's onFlag normalizes); organomegaly / cytopenias /
// cytogenetics / febrile-neutropenia burden are enums; labs and counts are
// numbers.

import * as F from '../../lib/hemonc-v94.js';

export default [
  {
    id: 'hscore-hlh',
    summary: 'HScore (Fardet 2014) for reactive hemophagocytic lymphohistiocytosis: known immunosuppression, temperature, organomegaly, number of cytopenias, ferritin, triglyceride, fibrinogen, AST, and marrow hemophagocytosis; the weighted total maps to an HLH probability.',
    compute: F.hscoreHlh,
    fields: [
      { dom: 'hs-immuno', arg: 'immunosuppression', kind: 'bool', label: 'Known underlying immunosuppression' },
      { dom: 'hs-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', unit: 'degrees C' },
      { dom: 'hs-organ', arg: 'organomegaly', kind: 'enum', values: ['none', 'one', 'both'], label: 'Hepatomegaly / splenomegaly' },
      { dom: 'hs-cyto', arg: 'cytopenias', kind: 'enum', values: ['1', '2', '3'], label: 'Number of cytopenias (lineages)' },
      { dom: 'hs-fer', arg: 'ferritin', kind: 'number', required: true, label: 'Ferritin', unit: 'ng/mL' },
      { dom: 'hs-tg', arg: 'triglyceride', kind: 'number', required: true, label: 'Triglyceride', unit: 'mmol/L' },
      { dom: 'hs-fib', arg: 'fibrinogen', kind: 'number', required: true, label: 'Fibrinogen', unit: 'g/L' },
      { dom: 'hs-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'hs-hemo', arg: 'hemophagocytosis', kind: 'bool', label: 'Hemophagocytosis on marrow aspirate' },
    ],
  },
  {
    id: 'ipss-r-mds',
    summary: 'IPSS-R (Greenberg 2012) for myelodysplastic syndromes: cytogenetic risk group plus marrow blast %, hemoglobin, platelets, and ANC; the weighted total maps to a five-tier risk group with median survival and AML-evolution estimates.',
    compute: F.ipssrMds,
    fields: [
      { dom: 'ir-cyto', arg: 'cytogenetics', kind: 'enum', values: ['very-good', 'good', 'intermediate', 'poor', 'very-poor'], label: 'Cytogenetic risk group' },
      { dom: 'ir-blasts', arg: 'blasts', kind: 'number', required: true, label: 'Bone-marrow blasts', unit: '%' },
      { dom: 'ir-hgb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'ir-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: 'x10^9/L' },
      { dom: 'ir-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: 'x10^9/L' },
    ],
  },
  {
    id: 'flipi',
    summary: 'FLIPI (Solal-Celigny 2004) for follicular lymphoma: age >= 60, advanced stage III-IV, elevated LDH, hemoglobin < 12, and > 4 nodal areas; 0-1 low, 2 intermediate, >= 3 high risk (the renderer also reports the IPI count).',
    compute: F.flipi,
    fields: [
      { dom: 'fl-age', arg: 'ageOver60', kind: 'bool', label: 'Age >= 60 years' },
      { dom: 'fl-stage', arg: 'stageAdvanced', kind: 'bool', label: 'Ann Arbor stage III-IV' },
      { dom: 'fl-ldh', arg: 'ldhHigh', kind: 'bool', label: 'LDH above normal' },
      { dom: 'fl-hgb', arg: 'hgbLow', kind: 'bool', label: 'Hemoglobin < 12 g/dL' },
      { dom: 'fl-nodal', arg: 'nodalOver4', kind: 'bool', label: '> 4 nodal areas involved' },
      { dom: 'fl-ecog', arg: 'ecogOver2', kind: 'bool', label: 'ECOG performance status >= 2' },
      { dom: 'fl-extra', arg: 'extranodalOver1', kind: 'bool', label: '> 1 extranodal site' },
    ],
  },
  {
    id: 'mascc',
    summary: 'MASCC risk index (Klastersky 2000) for febrile neutropenia: burden of illness, no hypotension, no COPD, solid tumor / no prior fungal infection, no dehydration, outpatient status, and age < 60; a score >= 21 identifies low risk of serious complications.',
    compute: F.mascc,
    fields: [
      { dom: 'ma-burden', arg: 'burden', kind: 'enum', values: ['no-mild', 'moderate', 'severe'], label: 'Burden of febrile-neutropenia illness' },
      { dom: 'ma-hypo', arg: 'noHypotension', kind: 'bool', label: 'No hypotension (SBP > 90)' },
      { dom: 'ma-copd', arg: 'noCopd', kind: 'bool', label: 'No chronic obstructive pulmonary disease' },
      { dom: 'ma-tumor', arg: 'solidNoFungal', kind: 'bool', label: 'Solid tumor / no prior fungal infection' },
      { dom: 'ma-dehyd', arg: 'noDehydration', kind: 'bool', label: 'No dehydration requiring fluids' },
      { dom: 'ma-outpt', arg: 'outpatient', kind: 'bool', label: 'Outpatient at fever onset' },
      { dom: 'ma-age', arg: 'ageUnder60', kind: 'bool', label: 'Age < 60 years' },
    ],
  },
  {
    id: 'sokal-cml',
    summary: 'Sokal index (1984) for chronic myeloid leukemia: an exponential hazard over age, spleen size below costal margin, platelets, and peripheral blasts; the relative risk maps to low / intermediate / high (the renderer also reports the ELTS score).',
    compute: F.sokalCml,
    fields: [
      { dom: 'sk-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sk-spleen', arg: 'spleen', kind: 'number', required: true, label: 'Spleen size below costal margin', unit: 'cm' },
      { dom: 'sk-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: 'x10^9/L' },
      { dom: 'sk-blasts', arg: 'blasts', kind: 'number', required: true, label: 'Peripheral blood blasts', unit: '%' },
    ],
  },
];
