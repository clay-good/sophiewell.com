// spec-v183 MCP wave 5: adapters for five lib/critcare-v112.js critical-care
// severity / weakness instruments. dom keys mirror views/group-v112.js (and the
// shared bedside group) and META.example.fields; arg names mirror the lib
// signatures. CPIS temperature is entered in degrees Celsius (the lib reads the
// canonical Celsius value directly); the MEDS criteria are bools; the manual-
// muscle-test grades are 0-5 numbers.

import * as F from '../../lib/critcare-v112.js';

export default [
  {
    id: 'meds-score',
    summary: 'MEDS score (Shapiro 2003): the Mortality in Emergency Department Sepsis score — terminal illness (6), tachypnea/hypoxia (3), septic shock (3), platelets < 150k (3), bands > 5% (3), age > 65 (3), lower respiratory infection (2), nursing-home resident (2), altered mental status (2); the total maps to 28-day mortality.',
    compute: F.medsScore,
    fields: [
      { dom: 'md-term', arg: 'terminalIllness', kind: 'bool', label: 'Terminal illness (< 30-day expected mortality)' },
      { dom: 'md-tach', arg: 'tachypneaHypoxia', kind: 'bool', label: 'Tachypnea or hypoxia' },
      { dom: 'md-shock', arg: 'septicShock', kind: 'bool', label: 'Septic shock' },
      { dom: 'md-plt', arg: 'lowPlatelets', kind: 'bool', label: 'Platelets < 150,000/mm^3' },
      { dom: 'md-band', arg: 'bands', kind: 'bool', label: 'Bands > 5%' },
      { dom: 'md-age', arg: 'ageOver65', kind: 'bool', label: 'Age > 65 years' },
      { dom: 'md-lri', arg: 'lowerRespInfection', kind: 'bool', label: 'Lower respiratory infection' },
      { dom: 'md-nh', arg: 'nursingHome', kind: 'bool', label: 'Nursing-home resident' },
      { dom: 'md-ams', arg: 'alteredMental', kind: 'bool', label: 'Altered mental status' },
    ],
  },
  {
    id: 'sic-score',
    summary: 'SIC score (ISTH 2019): the Sepsis-Induced Coagulopathy score from platelet count, PT-INR, and total SOFA; SIC is met at total >= 4 with a platelet + PT-INR subscore >= 3.',
    compute: F.sicScore,
    fields: [
      { dom: 'si-plt', arg: 'platelet', kind: 'number', required: true, label: 'Platelet count', unit: 'x10^9/L' },
      { dom: 'si-inr', arg: 'inr', kind: 'number', required: true, label: 'PT-INR' },
      { dom: 'si-sofa', arg: 'sofa', kind: 'number', required: true, label: 'Total SOFA score' },
    ],
  },
  {
    id: 'cpis-vap',
    summary: 'Clinical Pulmonary Infection Score (Pugin 1991): temperature, leukocyte count and bands, tracheal secretions, oxygenation, chest radiograph, and tracheal-aspirate culture; CPIS 0-12, with > 6 suggesting ventilator-associated pneumonia.',
    compute: F.cpisVap,
    fields: [
      { dom: 'cp-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', unit: 'degrees C' },
      { dom: 'cp-wbc', arg: 'wbc', kind: 'number', required: true, label: 'Leukocyte count', unit: 'per mm^3' },
      { dom: 'cp-band', arg: 'bandForms', kind: 'bool', label: 'Band forms >= 50%' },
      { dom: 'cp-sec', arg: 'secretions', kind: 'enum', values: ['none', 'non-purulent', 'purulent'], label: 'Tracheal secretions' },
      { dom: 'cp-oxy', arg: 'oxygenation', kind: 'enum', values: ['normal', 'low'], label: 'Oxygenation (PaO2/FiO2)' },
      { dom: 'cp-cxr', arg: 'cxr', kind: 'enum', values: ['none', 'diffuse', 'localized'], label: 'Chest radiograph infiltrate' },
      { dom: 'cp-cult', arg: 'culture', kind: 'enum', values: ['none', 'moderate'], label: 'Tracheal-aspirate culture' },
      { dom: 'cp-same', arg: 'sameOrganism', kind: 'bool', label: 'Same organism on Gram stain' },
    ],
  },
  {
    id: 'lactate-clearance',
    summary: 'Lactate clearance: (initial - repeat) / initial x 100; a clearance >= 10% is the cited favorable early-resuscitation range.',
    compute: F.lactateClearance,
    fields: [
      { dom: 'la-init', arg: 'initial', kind: 'number', required: true, label: 'Initial lactate', unit: 'mmol/L' },
      { dom: 'la-rep', arg: 'repeat', kind: 'number', required: true, label: 'Repeat lactate', unit: 'mmol/L' },
    ],
  },
  {
    id: 'mrc-sum-score',
    summary: 'MRC sum score (Kleyweg 1991): manual-muscle-test grades 0-5 across six bilateral muscle groups (shoulder, elbow, wrist, hip, knee, ankle); the 0-60 sum < 48 defines ICU-acquired weakness.',
    compute: F.mrcSumScore,
    fields: [
      { dom: 'mr-shl', arg: 'shoulderL', kind: 'number', required: true, label: 'Shoulder abduction, left (0-5)' },
      { dom: 'mr-shr', arg: 'shoulderR', kind: 'number', required: true, label: 'Shoulder abduction, right (0-5)' },
      { dom: 'mr-ell', arg: 'elbowL', kind: 'number', required: true, label: 'Elbow flexion, left (0-5)' },
      { dom: 'mr-elr', arg: 'elbowR', kind: 'number', required: true, label: 'Elbow flexion, right (0-5)' },
      { dom: 'mr-wrl', arg: 'wristL', kind: 'number', required: true, label: 'Wrist extension, left (0-5)' },
      { dom: 'mr-wrr', arg: 'wristR', kind: 'number', required: true, label: 'Wrist extension, right (0-5)' },
      { dom: 'mr-hil', arg: 'hipL', kind: 'number', required: true, label: 'Hip flexion, left (0-5)' },
      { dom: 'mr-hir', arg: 'hipR', kind: 'number', required: true, label: 'Hip flexion, right (0-5)' },
      { dom: 'mr-knl', arg: 'kneeL', kind: 'number', required: true, label: 'Knee extension, left (0-5)' },
      { dom: 'mr-knr', arg: 'kneeR', kind: 'number', required: true, label: 'Knee extension, right (0-5)' },
      { dom: 'mr-anl', arg: 'ankleL', kind: 'number', required: true, label: 'Ankle dorsiflexion, left (0-5)' },
      { dom: 'mr-anr', arg: 'ankleR', kind: 'number', required: true, label: 'Ankle dorsiflexion, right (0-5)' },
    ],
  },
];
