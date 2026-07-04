// spec-v183 MCP wave 33: adapters for the four hematology-oncology risk
// instruments in lib/heme-onc-risk-v211.js — the EUTOS score for chronic myeloid
// leukemia, the IMPROVEDD and COMPASS-CAT VTE risk scores, and the ELN 2022 AML
// genetic-risk stratification. dom keys mirror views/group-v211.js. EUTOS takes
// two numeric inputs; IMPROVEDD, COMPASS-CAT, and ELN 2022 are boolean item
// panels.

import * as F from '../../lib/heme-onc-risk-v211.js';

export default [
  {
    id: 'eutos',
    summary: 'EUTOS score (Hasford 2011): peripheral-blood basophils and spleen size predict 18-month complete cytogenetic response in chronic-phase CML on imatinib; > 87 marks high risk.',
    compute: F.eutos,
    fields: [
      { dom: 'eutos-baso', arg: 'basophils', kind: 'number', required: true, label: 'Basophils (% of peripheral blood)' },
      { dom: 'eutos-spleen', arg: 'spleenCm', kind: 'number', required: true, label: 'Spleen size (cm below costal margin; 0 if not palpable)' },
    ],
  },
  {
    id: 'improvedd',
    summary: 'IMPROVEDD VTE risk score (Gibson 2017): the seven IMPROVE items plus D-dimer ≥ 2× ULN give a 0–14 inpatient medical-VTE score; ≥ 2 is the threshold for discussing extended thromboprophylaxis.',
    compute: F.improvedd,
    fields: [
      { dom: 'imdd-vte', arg: 'previousVte', kind: 'bool', required: false, label: 'Previous VTE (+3)' },
      { dom: 'imdd-thromb', arg: 'thrombophilia', kind: 'bool', required: false, label: 'Known thrombophilia (+2)' },
      { dom: 'imdd-paralysis', arg: 'paralysis', kind: 'bool', required: false, label: 'Current lower-limb paralysis (+2)' },
      { dom: 'imdd-cancer', arg: 'cancer', kind: 'bool', required: false, label: 'Active cancer (+2)' },
      { dom: 'imdd-immob', arg: 'immobilization', kind: 'bool', required: false, label: 'Immobilization ≥ 7 days (+1)' },
      { dom: 'imdd-icu', arg: 'icu', kind: 'bool', required: false, label: 'ICU / CCU stay (+1)' },
      { dom: 'imdd-age', arg: 'ageOver60', kind: 'bool', required: false, label: 'Age > 60 (+1)' },
      { dom: 'imdd-ddimer', arg: 'dDimer', kind: 'bool', required: false, label: 'D-dimer ≥ 2× upper limit of normal (+2)' },
    ],
  },
  {
    id: 'compass-cat',
    summary: 'COMPASS-CAT VTE risk score (Gerotziafas 2017): anti-hormonal/anthracycline therapy, recent diagnosis, central line, advanced stage, cardiovascular risk factors, recent hospitalization, prior VTE, and thrombocytosis give a 6-month cancer-associated VTE risk; ≥ 7 marks high risk.',
    compute: F.compassCat,
    fields: [
      { dom: 'cc-antihorm', arg: 'antiHormonalAnthracycline', kind: 'bool', required: false, label: 'Anti-hormonal or anthracycline therapy (+6)' },
      { dom: 'cc-diag6mo', arg: 'diagWithin6mo', kind: 'bool', required: false, label: 'Cancer diagnosis ≤ 6 months ago (+4)' },
      { dom: 'cc-cvc', arg: 'cvc', kind: 'bool', required: false, label: 'Central venous catheter (+3)' },
      { dom: 'cc-stage', arg: 'advancedStage', kind: 'bool', required: false, label: 'Advanced-stage cancer (+2)' },
      { dom: 'cc-cvrisk', arg: 'cvRiskFactors', kind: 'bool', required: false, label: 'Cardiovascular risk factors (+5)' },
      { dom: 'cc-hosp', arg: 'recentHospitalization', kind: 'bool', required: false, label: 'Recent hospitalization for acute medical illness (+5)' },
      { dom: 'cc-vte', arg: 'priorVte', kind: 'bool', required: false, label: 'Personal history of VTE (+1)' },
      { dom: 'cc-plt', arg: 'platelets350', kind: 'bool', required: false, label: 'Platelet count ≥ 350 ×10⁹/L (+2)' },
    ],
  },
  {
    id: 'eln-2022-aml',
    summary: 'ELN 2022 AML genetic-risk stratification (Döhner 2022): core-binding-factor / bZIP CEBPA / NPM1 without FLT3-ITD favor a favorable category, while adverse cytogenetic-molecular lesions drive an adverse category, with the remainder intermediate.',
    compute: F.eln2022Aml,
    fields: [
      { dom: 'eln-cbf', arg: 'cbf', kind: 'bool', required: false, label: 'Core-binding-factor AML — t(8;21) or inv(16)/t(16;16) (favorable)' },
      { dom: 'eln-cebpa', arg: 'cebpa', kind: 'bool', required: false, label: 'bZIP in-frame CEBPA mutation (favorable)' },
      { dom: 'eln-npm1', arg: 'npm1', kind: 'bool', required: false, label: 'Mutated NPM1 (favorable if no FLT3-ITD)' },
      { dom: 'eln-flt3', arg: 'flt3itd', kind: 'bool', required: false, label: 'FLT3-ITD present' },
      { dom: 'eln-adverse', arg: 'adverse', kind: 'bool', required: false, label: 'Any adverse cytogenetic / molecular lesion' },
    ],
  },
];
