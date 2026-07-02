// spec-v183 MCP wave 14: adapters for the five lib/peds-v140.js pediatric /
// neonatal severity tiles. dom keys mirror views/group-v140.js; arg names mirror
// the lib signatures. Vitals, labs, and item sub-scores are numbers; the EOS
// GBS / antibiotic / exam and baseline-incidence selects are enums; the SNAPPE-II
// seizure / SGA flags are booleans.

import * as F from '../../lib/peds-v140.js';

export default [
  {
    id: 'eos-calculator',
    summary: 'Kaiser Early-Onset Sepsis calculator (Kuzniewicz 2017): the probabilistic EOS risk per 1,000 live births from gestational age, maximum temperature, ROM duration, GBS status, intrapartum antibiotics, and the newborn exam.',
    compute: F.eosCalculator,
    fields: [
      { dom: 'eos-inc', arg: 'incidence', kind: 'enum', values: ['0.5', '0.6', '0.4', '0.3'], label: 'EOS baseline incidence (per 1,000)' },
      { dom: 'eos-ga', arg: 'ga', kind: 'number', label: 'Gestational age (weeks)' },
      { dom: 'eos-temp', arg: 'tempF', kind: 'number', label: 'Maximum maternal temperature (°F)' },
      { dom: 'eos-rom', arg: 'rom', kind: 'number', label: 'Duration of ROM (hours)' },
      { dom: 'eos-gbs', arg: 'gbs', kind: 'enum', values: ['negative', 'positive', 'unknown'], label: 'Maternal GBS status' },
      { dom: 'eos-abx', arg: 'abx', kind: 'enum', values: ['none', 'tx1', 'tx2'], label: 'Intrapartum antibiotics' },
      { dom: 'eos-exam', arg: 'exam', kind: 'enum', values: ['well', 'equivocal', 'illness'], label: 'Newborn clinical exam' },
    ],
  },
  {
    id: 'snappe-ii',
    summary: 'SNAPPE-II (Richardson 2001): a 0–162 neonatal illness-severity score from MAP, temperature, PaO2/FiO2, pH, seizures, urine output, birth weight, SGA status, and 5-minute Apgar.',
    compute: F.snappeII,
    fields: [
      { dom: 'sn-map', arg: 'map', kind: 'number', label: 'Mean arterial pressure (mmHg)' },
      { dom: 'sn-temp', arg: 'temp', kind: 'number', label: 'Lowest temperature (°C)' },
      { dom: 'sn-pao2', arg: 'pao2', kind: 'number', label: 'PaO2 (mmHg)' },
      { dom: 'sn-fio2', arg: 'fio2', kind: 'number', label: 'FiO2 (%)' },
      { dom: 'sn-ph', arg: 'ph', kind: 'number', label: 'Lowest pH' },
      { dom: 'sn-seiz', arg: 'seizures', kind: 'bool', label: 'Seizures' },
      { dom: 'sn-urine', arg: 'urine', kind: 'number', label: 'Urine output (mL/kg/hr)' },
      { dom: 'sn-bw', arg: 'bw', kind: 'number', label: 'Birth weight (g)' },
      { dom: 'sn-sga', arg: 'sga', kind: 'bool', label: 'Small for gestational age (< 3rd percentile)' },
      { dom: 'sn-apgar', arg: 'apgar5', kind: 'number', label: '5-minute Apgar' },
    ],
  },
  {
    id: 'rdai-tal',
    summary: 'RDAI + Tal score: the Respiratory Distress Assessment Instrument (0–17, wheezing + retractions) and the Tal bronchiolitis severity score (0–12) from bedside respiratory findings.',
    compute: F.rdaiTal,
    fields: [
      { dom: 'rd-wexp', arg: 'wheezeExp', kind: 'number', label: 'RDAI: expiratory wheeze (0–4)' },
      { dom: 'rd-winsp', arg: 'wheezeInsp', kind: 'number', label: 'RDAI: inspiratory wheeze (0–2)' },
      { dom: 'rd-wloc', arg: 'wheezeLoc', kind: 'number', label: 'RDAI: wheeze location (0–2)' },
      { dom: 'rd-supra', arg: 'retSupraclav', kind: 'number', label: 'RDAI: supraclavicular retractions (0–3)' },
      { dom: 'rd-inter', arg: 'retIntercostal', kind: 'number', label: 'RDAI: intercostal retractions (0–3)' },
      { dom: 'rd-sub', arg: 'retSubcostal', kind: 'number', label: 'RDAI: subcostal retractions (0–3)' },
      { dom: 'rd-trr', arg: 'talRr', kind: 'number', label: 'Tal: respiratory rate (0–3)' },
      { dom: 'rd-twhz', arg: 'talWheeze', kind: 'number', label: 'Tal: wheeze (0–3)' },
      { dom: 'rd-tcyan', arg: 'talCyanosis', kind: 'number', label: 'Tal: cyanosis (0–3)' },
      { dom: 'rd-tacc', arg: 'talAccessory', kind: 'number', label: 'Tal: accessory muscle use (0–3)' },
    ],
  },
  {
    id: 'clinical-dehydration-scale',
    summary: 'Clinical Dehydration Scale (Goldman 2008): appearance, eyes, mucous membranes, and tears each 0–2 → a 0–8 pediatric dehydration score.',
    compute: F.clinicalDehydrationScale,
    fields: [
      { dom: 'cd-app', arg: 'appearance', kind: 'number', label: 'General appearance (0–2)' },
      { dom: 'cd-eyes', arg: 'eyes', kind: 'number', label: 'Eyes (0–2)' },
      { dom: 'cd-muc', arg: 'mucous', kind: 'number', label: 'Mucous membranes (0–2)' },
      { dom: 'cd-tears', arg: 'tears', kind: 'number', label: 'Tears (0–2)' },
    ],
  },
  {
    id: 'koff-bladder-capacity',
    summary: 'Koff expected bladder capacity (Koff 1983): (age in years + 2) × 30 mL.',
    compute: F.koffBladderCapacity,
    fields: [
      { dom: 'kb-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
    ],
  },
];
