// spec-v183 MCP wave 20: adapters for the five cross-subspecialty prognostic /
// assessment instruments in lib/subspecialty-v198.js — the CNS International
// Prognostic Index (CNS-IPI), the ISTH bleeding assessment tool (ISTH-BAT), the
// VIRSTA score for infective-endocarditis risk in S. aureus bacteremia, the
// SeLECT score for late post-stroke epilepsy, and the WHO/FIGO prognostic score
// for gestational trophoblastic neoplasia. dom keys mirror views/group-v198.js.
//
// ISTH-BAT's 14 domains are each a 0–4 numeric bleeding-severity score plus a
// patient-group enum that sets the abnormal threshold; SeLECT and FIGO-GTN mix
// numeric inputs with ordinal-select enums whose values mirror the renderer.

import * as F from '../../lib/subspecialty-v198.js';

export default [
  {
    id: 'cns-ipi',
    summary: 'CNS International Prognostic Index (Schmitz 2016): age > 60, elevated LDH, ECOG > 1, Ann Arbor III/IV, > 1 extranodal site, and kidney/adrenal involvement sum to 0–6, banding the 2-year risk of CNS relapse in DLBCL.',
    compute: F.cnsIpi,
    fields: [
      { dom: 'cnsipi-age', arg: 'age', kind: 'bool', required: false, label: 'Age > 60 years' },
      { dom: 'cnsipi-ldh', arg: 'ldh', kind: 'bool', required: false, label: 'LDH > normal' },
      { dom: 'cnsipi-ecog', arg: 'ecog', kind: 'bool', required: false, label: 'ECOG performance status > 1' },
      { dom: 'cnsipi-stage', arg: 'stage', kind: 'bool', required: false, label: 'Ann Arbor stage III/IV' },
      { dom: 'cnsipi-extranodal', arg: 'extranodal', kind: 'bool', required: false, label: '> 1 extranodal site' },
      { dom: 'cnsipi-kidney', arg: 'kidneyAdrenal', kind: 'bool', required: false, label: 'Kidney and/or adrenal involvement' },
    ],
  },
  {
    id: 'isth-bat',
    summary: 'ISTH bleeding assessment tool (Rodeghiero 2010; thresholds Elbatarny 2014): 14 bleeding domains each scored 0 to +4; the total is abnormal at ≥ 4 (adult male), ≥ 6 (adult female), or ≥ 3 (child).',
    compute: F.isthBat,
    fields: [
      { dom: 'isth-group', arg: 'group', kind: 'enum', values: ['male', 'female', 'child'], required: true, label: 'Patient group (sets the abnormal threshold)' },
      { dom: 'isth-epistaxis', arg: 'epistaxis', kind: 'number', required: false, label: 'Epistaxis (0–4)' },
      { dom: 'isth-cutaneous', arg: 'cutaneous', kind: 'number', required: false, label: 'Cutaneous / bruising (0–4)' },
      { dom: 'isth-minorWounds', arg: 'minorWounds', kind: 'number', required: false, label: 'Bleeding from minor wounds (0–4)' },
      { dom: 'isth-oralCavity', arg: 'oralCavity', kind: 'number', required: false, label: 'Oral cavity (0–4)' },
      { dom: 'isth-gi', arg: 'gi', kind: 'number', required: false, label: 'GI bleeding (0–4)' },
      { dom: 'isth-hematuria', arg: 'hematuria', kind: 'number', required: false, label: 'Hematuria (0–4)' },
      { dom: 'isth-toothExtraction', arg: 'toothExtraction', kind: 'number', required: false, label: 'Tooth extraction (0–4)' },
      { dom: 'isth-surgery', arg: 'surgery', kind: 'number', required: false, label: 'Surgery (0–4)' },
      { dom: 'isth-menorrhagia', arg: 'menorrhagia', kind: 'number', required: false, label: 'Menorrhagia (0–4)' },
      { dom: 'isth-postpartum', arg: 'postpartum', kind: 'number', required: false, label: 'Postpartum hemorrhage (0–4)' },
      { dom: 'isth-muscleHematoma', arg: 'muscleHematoma', kind: 'number', required: false, label: 'Muscle hematoma (0–4)' },
      { dom: 'isth-hemarthrosis', arg: 'hemarthrosis', kind: 'number', required: false, label: 'Hemarthrosis (0–4)' },
      { dom: 'isth-cns', arg: 'cns', kind: 'number', required: false, label: 'CNS bleeding (0, 3, or 4)' },
      { dom: 'isth-other', arg: 'other', kind: 'number', required: false, label: 'Other bleeding (0–4)' },
    ],
  },
  {
    id: 'virsta',
    summary: 'VIRSTA score for infective-endocarditis risk in S. aureus bacteremia (Tubiana 2016): weighted clinical items sum to a total where ≤ 2 is low risk (IE ~1%, echo deferrable) and ≥ 3 higher (~17%, echo recommended).',
    compute: F.virsta,
    fields: [
      { dom: 'virsta-emboli', arg: 'emboli', kind: 'bool', required: false, label: 'Cerebral / peripheral emboli (+5)' },
      { dom: 'virsta-meningitis', arg: 'meningitis', kind: 'bool', required: false, label: 'Meningitis (+5)' },
      { dom: 'virsta-device', arg: 'device', kind: 'bool', required: false, label: 'Intracardiac device or previous IE (+4)' },
      { dom: 'virsta-ivdu', arg: 'ivdu', kind: 'bool', required: false, label: 'IV drug use (+4)' },
      { dom: 'virsta-valve', arg: 'valve', kind: 'bool', required: false, label: 'Preexisting native valve disease (+3)' },
      { dom: 'virsta-persistent', arg: 'persistent', kind: 'bool', required: false, label: 'Persistent bacteremia (+3)' },
      { dom: 'virsta-vertebral', arg: 'vertebral', kind: 'bool', required: false, label: 'Vertebral osteomyelitis (+2)' },
      { dom: 'virsta-community', arg: 'community', kind: 'bool', required: false, label: 'Community / non-nosocomial acquisition (+2)' },
      { dom: 'virsta-sepsis', arg: 'sepsis', kind: 'bool', required: false, label: 'Severe sepsis / septic shock (+1)' },
      { dom: 'virsta-crp', arg: 'crp', kind: 'bool', required: false, label: 'CRP > 190 mg/L (+1)' },
    ],
  },
  {
    id: 'select-pse',
    summary: 'SeLECT score for late post-stroke epilepsy (Galovic 2018): stroke severity plus large-artery atherosclerosis, early seizure, cortical involvement, and MCA territory sum to 0–9, mapping to 1-year and 5-year late-seizure risk.',
    compute: F.selectPse,
    fields: [
      { dom: 'select-nihss', arg: 'nihss', kind: 'enum', values: ['0-3', '4-10', '11+'], required: true, label: 'Stroke severity (NIHSS band)' },
      { dom: 'select-laa', arg: 'laa', kind: 'bool', required: false, label: 'Large-artery atherosclerotic etiology (+1)' },
      { dom: 'select-early', arg: 'early', kind: 'bool', required: false, label: 'Early seizure ≤ 7 days (+3)' },
      { dom: 'select-cortical', arg: 'cortical', kind: 'bool', required: false, label: 'Cortical involvement (+2)' },
      { dom: 'select-territory', arg: 'territory', kind: 'bool', required: false, label: 'MCA territory (+1)' },
    ],
  },
  {
    id: 'figo-gtn',
    summary: 'WHO/FIGO prognostic score for gestational trophoblastic neoplasia (FIGO 2000): eight factors scored 0/1/2/4; a total ≤ 6 is low risk (single-agent chemotherapy) and ≥ 7 high risk (multi-agent).',
    compute: F.figoGtn,
    fields: [
      { dom: 'figo-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'figo-antecedent', arg: 'antecedent', kind: 'enum', values: ['mole', 'abortion', 'term'], required: true, label: 'Antecedent pregnancy' },
      { dom: 'figo-interval', arg: 'interval', kind: 'number', required: true, label: 'Interval from index pregnancy', unit: 'months' },
      { dom: 'figo-hcg', arg: 'hcg', kind: 'number', required: true, label: 'Pretreatment hCG', unit: 'IU/L' },
      { dom: 'figo-size', arg: 'size', kind: 'number', required: true, label: 'Largest tumor size incl. uterus', unit: 'cm' },
      { dom: 'figo-site', arg: 'site', kind: 'enum', values: ['lung', 'spleenkidney', 'gi', 'liverbrain'], required: true, label: 'Site of metastases' },
      { dom: 'figo-mets', arg: 'mets', kind: 'number', required: true, label: 'Number of metastases' },
      { dom: 'figo-chemo', arg: 'priorChemo', kind: 'enum', values: ['none', 'single', 'multi'], required: true, label: 'Previous failed chemotherapy' },
    ],
  },
];
