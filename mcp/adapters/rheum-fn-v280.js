// spec-v280 MCP wave (ninety-seventh): adapters for the two rheumatology
// function / case-definition tiles in lib/rheum-fn-v280.js — the HAQ-DI
// disability index and the ASAS classification criteria for axial SpA. dom keys
// mirror the browser renderer (views/group-v280.js) and each tile's
// META.example.fields. HAQ-DI needs >= 6 of 8 categories answered and ASAS has
// its own entry/arm gate, so no single field is marked required (the lib's own
// completeness guard fires); enum categories carry the 0-3 difficulty values.

import * as F from '../../lib/rheum-fn-v280.js';

const DIFFICULTY = ['0', '1', '2', '3'];

function haqCategory(key, label) {
  return [
    { dom: `haq-${key}`, arg: key, kind: 'enum', values: DIFFICULTY, label: `${label} difficulty (0 none - 3 unable)` },
    { dom: `haq-${key}-aid`, arg: `${key}Aid`, kind: 'bool', label: `${label}: uses aids/devices or help from another person` },
  ];
}

export default [
  {
    id: 'haq-di',
    summary: 'Health Assessment Questionnaire Disability Index (HAQ-DI; Fries 1980) — the mean of 8 functional-category scores (dressing/grooming, arising, eating, walking, hygiene, reach, grip, activities), each 0-3 (0 no difficulty to 3 unable). A category is the highest of its items; aids/devices or help from another person raise a category scored 0 or 1 to 2. Computed when >= 6 of 8 categories are answered; range 0-3, higher = more disability. Bands: <= 1 mild-to-moderate, > 1 to 2 moderate-to-severe, > 2 severe. A disability index, not a diagnosis or treatment order.',
    compute: F.haqDi,
    fields: [
      ...haqCategory('dressing', 'Dressing & grooming'),
      ...haqCategory('arising', 'Arising'),
      ...haqCategory('eating', 'Eating'),
      ...haqCategory('walking', 'Walking'),
      ...haqCategory('hygiene', 'Hygiene'),
      ...haqCategory('reach', 'Reach'),
      ...haqCategory('grip', 'Grip'),
      ...haqCategory('activities', 'Common activities'),
    ],
  },
  {
    id: 'asas-axspa',
    summary: 'ASAS classification criteria for axial spondyloarthritis (Rudwaleit 2009) — entry = back pain >= 3 months with age at onset < 45 years, then either the imaging arm (sacroiliitis on imaging plus >= 1 SpA feature) or the clinical arm (HLA-B27 positive plus >= 2 other SpA features). Classifies for study enrollment (admits radiographic and non-radiographic axial SpA); it is not a diagnostic test or a treatment order.',
    compute: F.asasAxspa,
    fields: [
      { dom: 'asas-bp', arg: 'backPain3mo', kind: 'bool', label: 'Back pain >= 3 months (entry)' },
      { dom: 'asas-age', arg: 'ageOnsetUnder45', kind: 'bool', label: 'Age at onset < 45 years (entry)' },
      { dom: 'asas-sacro', arg: 'sacroiliitisImaging', kind: 'bool', label: 'Sacroiliitis on imaging (active MRI or definite radiographic, modified New York)' },
      { dom: 'asas-ibp', arg: 'ibp', kind: 'bool', label: 'Inflammatory back pain' },
      { dom: 'asas-arthritis', arg: 'arthritis', kind: 'bool', label: 'Arthritis' },
      { dom: 'asas-enthesitis', arg: 'enthesitis', kind: 'bool', label: 'Enthesitis (heel)' },
      { dom: 'asas-uveitis', arg: 'uveitis', kind: 'bool', label: 'Uveitis' },
      { dom: 'asas-dactylitis', arg: 'dactylitis', kind: 'bool', label: 'Dactylitis' },
      { dom: 'asas-psoriasis', arg: 'psoriasis', kind: 'bool', label: 'Psoriasis' },
      { dom: 'asas-ibd', arg: 'ibd', kind: 'bool', label: "Crohn's / colitis" },
      { dom: 'asas-nsaidResponse', arg: 'nsaidResponse', kind: 'bool', label: 'Good response to NSAIDs' },
      { dom: 'asas-familyHistory', arg: 'familyHistory', kind: 'bool', label: 'Family history of SpA' },
      { dom: 'asas-hlaB27', arg: 'hlaB27', kind: 'bool', label: 'HLA-B27 positive' },
      { dom: 'asas-elevatedCrp', arg: 'elevatedCrp', kind: 'bool', label: 'Elevated CRP' },
    ],
  },
];
