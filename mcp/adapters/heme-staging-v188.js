// spec-v183 MCP wave 9: adapters for the five staging/prognostic instruments in
// lib/heme-staging-v188.js — Binet and Rai chronic-lymphocytic-leukemia staging,
// the Ann Arbor / Lugano lymphoma stage, FLIPI-2 follicular-lymphoma prognosis
// (function flipi2, tile id `flipi-2`), and the Hasford (Euro) CML score.
// dom keys mirror views/group-v188.js.

import * as F from '../../lib/heme-staging-v188.js';

export default [
  {
    id: 'binet-cll',
    summary: 'Binet stage (A/B/C) for chronic lymphocytic leukemia from the number of involved lymphoid areas plus anemia and thrombocytopenia thresholds.',
    compute: F.binetCll,
    fields: [
      { dom: 'binet-areas', arg: 'areas', kind: 'number', required: true, label: 'Involved lymphoid areas (0–5)' },
      { dom: 'binet-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'binet-platelets', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
  {
    id: 'rai-cll',
    summary: 'Rai stage (0–IV) for chronic lymphocytic leukemia — required blood/marrow lymphocytosis plus lymphadenopathy, organomegaly, anemia, and thrombocytopenia.',
    compute: F.raiCll,
    fields: [
      { dom: 'rai-lymphocytosis', arg: 'lymphocytosis', kind: 'bool', required: true, label: 'Blood + marrow lymphocytosis (required)' },
      { dom: 'rai-lymphadenopathy', arg: 'lymphadenopathy', kind: 'bool', required: false, label: 'Lymphadenopathy' },
      { dom: 'rai-organomegaly', arg: 'organomegaly', kind: 'bool', required: false, label: 'Splenomegaly / hepatomegaly' },
      { dom: 'rai-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'rai-platelets', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
  {
    id: 'ann-arbor',
    summary: 'Ann Arbor / Lugano stage (I–IV) for lymphoma from anatomic distribution, with the B-symptom, extranodal (E), and splenic (S) suffixes.',
    compute: F.annArbor,
    fields: [
      { dom: 'ann-distribution', arg: 'distribution', kind: 'enum', values: ['single-region', 'multi-same-side', 'both-sides', 'disseminated'], required: true, label: 'Anatomic distribution' },
      { dom: 'ann-bSymptoms', arg: 'bSymptoms', kind: 'bool', required: false, label: 'B symptoms' },
      { dom: 'ann-extranodal', arg: 'extranodal', kind: 'bool', required: false, label: 'Extranodal extension (E)' },
      { dom: 'ann-splenic', arg: 'splenic', kind: 'bool', required: false, label: 'Splenic involvement (S)' },
    ],
  },
  {
    id: 'flipi-2',
    summary: 'Follicular-Lymphoma International Prognostic Index 2 (FLIPI-2): five equally-weighted factors stratifying into low/intermediate/high risk.',
    compute: F.flipi2,
    fields: [
      { dom: 'flipi2-ageOver60', arg: 'ageOver60', kind: 'bool', required: false, label: 'Age > 60' },
      { dom: 'flipi2-b2m', arg: 'b2m', kind: 'bool', required: false, label: 'Elevated β₂-microglobulin' },
      { dom: 'flipi2-nodeOver6cm', arg: 'nodeOver6cm', kind: 'bool', required: false, label: 'Longest node > 6 cm' },
      { dom: 'flipi2-marrow', arg: 'marrow', kind: 'bool', required: false, label: 'Bone-marrow involvement' },
      { dom: 'flipi2-hbUnder12', arg: 'hbUnder12', kind: 'bool', required: false, label: 'Hemoglobin < 12 g/dL' },
    ],
  },
  {
    id: 'hasford-cml',
    summary: 'Hasford (Euro) prognostic score for chronic-phase CML on interferon/imatinib, from age, spleen size, platelets, blasts, eosinophils, and basophils.',
    compute: F.hasfordCml,
    fields: [
      { dom: 'hasford-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'hasford-spleen', arg: 'spleen', kind: 'number', required: true, label: 'Spleen (cm below costal margin)' },
      { dom: 'hasford-platelets', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
      { dom: 'hasford-blasts', arg: 'blasts', kind: 'number', required: true, label: 'Peripheral blasts', unit: '%' },
      { dom: 'hasford-eosinophils', arg: 'eosinophils', kind: 'number', required: true, label: 'Peripheral eosinophils', unit: '%' },
      { dom: 'hasford-basophils', arg: 'basophils', kind: 'number', required: true, label: 'Peripheral basophils', unit: '%' },
    ],
  },
];
