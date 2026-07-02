// spec-v183 MCP wave 14: adapters for the five lib/frailty-v143.js frailty /
// geriatric-oncology screening tiles. dom keys mirror views/group-v143.js; arg
// names mirror the lib signatures. mFI / FRAIL / CARG deficits are checkbox
// booleans; VES-13 age / health / functional-difficulty axes are enums and its
// disability items are booleans.

import * as F from '../../lib/frailty-v143.js';

export default [
  {
    id: 'mfi-5',
    summary: 'Modified Frailty Index-5 (Subramaniam 2018): a 0–5 deficit count over diabetes, hypertension, COPD, CHF, and functional dependence; ≥ 2 flags the frailty threshold.',
    compute: F.mfi5,
    fields: [
      { dom: 'mfi5-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'mfi5-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension requiring medication' },
      { dom: 'mfi5-copd', arg: 'copd', kind: 'bool', label: 'COPD or current pneumonia' },
      { dom: 'mfi5-chf', arg: 'chf', kind: 'bool', label: 'Congestive heart failure' },
      { dom: 'mfi5-dep', arg: 'dependent', kind: 'bool', label: 'Partially or totally dependent functional status' },
    ],
  },
  {
    id: 'mfi-11',
    summary: 'Modified Frailty Index-11 (Velanovich 2013): an 11-item accumulated-deficit fraction; a higher fraction tracks rising postoperative morbidity and mortality.',
    compute: F.mfi11,
    fields: [
      { dom: 'mfi11-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'mfi11-dep', arg: 'dependent', kind: 'bool', label: 'Dependent functional status' },
      { dom: 'mfi11-copd', arg: 'copd', kind: 'bool', label: 'COPD or current pneumonia' },
      { dom: 'mfi11-chf', arg: 'chf', kind: 'bool', label: 'Congestive heart failure' },
      { dom: 'mfi11-mi', arg: 'mi', kind: 'bool', label: 'Myocardial infarction' },
      { dom: 'mfi11-card', arg: 'cardiac', kind: 'bool', label: 'Prior PCI, cardiac surgery, or angina' },
      { dom: 'mfi11-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension requiring medication' },
      { dom: 'mfi11-pvd', arg: 'pvd', kind: 'bool', label: 'Peripheral vascular disease or rest pain' },
      { dom: 'mfi11-sens', arg: 'sensorium', kind: 'bool', label: 'Impaired sensorium' },
      { dom: 'mfi11-tia', arg: 'tia', kind: 'bool', label: 'TIA or cerebrovascular accident' },
      { dom: 'mfi11-cva', arg: 'cvaDeficit', kind: 'bool', label: 'CVA with neurological deficit' },
    ],
  },
  {
    id: 'frail-scale',
    summary: 'FRAIL Scale (Morley 2012): a 0–5 count over fatigue, resistance, ambulation, illnesses, and weight loss; 0 = robust, 1–2 = pre-frail, ≥ 3 = frail.',
    compute: F.frailScale,
    fields: [
      { dom: 'frail-fat', arg: 'fatigue', kind: 'bool', label: 'Fatigue most of the time' },
      { dom: 'frail-res', arg: 'resistance', kind: 'bool', label: 'Resistance: difficulty climbing 10 stairs' },
      { dom: 'frail-amb', arg: 'ambulation', kind: 'bool', label: 'Ambulation: difficulty walking one block' },
      { dom: 'frail-ill', arg: 'illnesses', kind: 'bool', label: '≥ 5 illnesses' },
      { dom: 'frail-wt', arg: 'weightLoss', kind: 'bool', label: 'Loss of > 5% weight' },
    ],
  },
  {
    id: 'ves-13',
    summary: 'Vulnerable Elders Survey-13 (Saliba 2001): a 0–10 score from age, self-rated health, six functional difficulties, and five disability items; ≥ 3 = vulnerable.',
    compute: F.ves13,
    fields: [
      { dom: 'ves-age', arg: 'age', kind: 'enum', values: ['under75', '75to84', '85plus'], label: 'Age band' },
      { dom: 'ves-health', arg: 'health', kind: 'enum', values: ['excellent', 'verygood', 'good', 'fair', 'poor'], label: 'Self-rated health' },
      { dom: 'ves-stooping', arg: 'stooping', kind: 'enum', values: ['none', 'little', 'some', 'alot', 'unable'], label: 'Difficulty stooping / crouching' },
      { dom: 'ves-lifting', arg: 'lifting', kind: 'enum', values: ['none', 'little', 'some', 'alot', 'unable'], label: 'Difficulty lifting ~10 lb' },
      { dom: 'ves-reaching', arg: 'reaching', kind: 'enum', values: ['none', 'little', 'some', 'alot', 'unable'], label: 'Difficulty reaching above shoulder' },
      { dom: 'ves-writing', arg: 'writing', kind: 'enum', values: ['none', 'little', 'some', 'alot', 'unable'], label: 'Difficulty writing / handling small objects' },
      { dom: 'ves-walking', arg: 'walking', kind: 'enum', values: ['none', 'little', 'some', 'alot', 'unable'], label: 'Difficulty walking a quarter mile' },
      { dom: 'ves-housework', arg: 'housework', kind: 'enum', values: ['none', 'little', 'some', 'alot', 'unable'], label: 'Difficulty with heavy housework' },
      { dom: 'ves-shop', arg: 'shopping', kind: 'bool', label: 'Needs help shopping' },
      { dom: 'ves-money', arg: 'money', kind: 'bool', label: 'Needs help managing money' },
      { dom: 'ves-room', arg: 'walkRoom', kind: 'bool', label: 'Needs help walking across the room' },
      { dom: 'ves-light', arg: 'lightHousework', kind: 'bool', label: 'Needs help with light housework' },
      { dom: 'ves-bath', arg: 'bathing', kind: 'bool', label: 'Needs help bathing / showering' },
    ],
  },
  {
    id: 'carg-toxicity',
    summary: 'CARG chemotherapy-toxicity score (Hurria 2011): a weighted geriatric-assessment sum stratifying the risk of grade 3–5 chemotherapy toxicity in older adults.',
    compute: F.cargToxicity,
    fields: [
      { dom: 'carg-age', arg: 'age72', kind: 'bool', label: 'Age ≥ 72 years' },
      { dom: 'carg-cancer', arg: 'giGu', kind: 'bool', label: 'GI or GU cancer' },
      { dom: 'carg-dose', arg: 'standardDose', kind: 'bool', label: 'Standard-dose chemotherapy' },
      { dom: 'carg-poly', arg: 'polychemo', kind: 'bool', label: 'Polychemotherapy (> 1 agent)' },
      { dom: 'carg-hgb', arg: 'anemia', kind: 'bool', label: 'Hemoglobin < 11 (M) / < 10 (F) g/dL' },
      { dom: 'carg-crcl', arg: 'lowCrCl', kind: 'bool', label: 'Creatinine clearance < 34 mL/min' },
      { dom: 'carg-hear', arg: 'hearing', kind: 'bool', label: 'Hearing fair or worse' },
      { dom: 'carg-falls', arg: 'falls', kind: 'bool', label: '≥ 1 fall in the last 6 months' },
      { dom: 'carg-meds', arg: 'medHelp', kind: 'bool', label: 'Needs help taking medications' },
      { dom: 'carg-walk', arg: 'walkLimited', kind: 'bool', label: 'Limited in walking one block' },
      { dom: 'carg-social', arg: 'socialDecreased', kind: 'bool', label: 'Decreased social activity' },
    ],
  },
];
