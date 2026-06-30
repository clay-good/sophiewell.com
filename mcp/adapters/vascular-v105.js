// spec-v183 MCP wave 7: adapters for the four lib/vascular-v105.js vascular
// instruments (ankle-brachial index, the Rutherford / Fontaine PAD mapping, the
// SVS WIfI limb-threat stage, and the logistic EuroSCORE II). dom keys mirror
// views/group-v30.js; the cuff pressures and age are numbers, the EuroSCORE II
// risk factors are booleans, and the clinical picture / WIfI grades / EuroSCORE
// II categories are enums. EuroSCORE II is a logistic model; the lib evaluates
// it in a saturation-safe form and the result clamps the predicted mortality to
// [0, 1] (spec-v140), so the MCP surface never leaks a non-finite value.

import * as F from '../../lib/vascular-v105.js';

export default [
  {
    id: 'abi',
    summary: 'Ankle-brachial index (higher ankle / higher brachial per leg) with the PAD severity bands; the lower of the two legs governs (Aboyans 2012).',
    compute: F.abi,
    fields: [
      { dom: 'abi-ra', arg: 'rightAnkle', kind: 'number', required: false, label: 'Right ankle systolic pressure (higher of DP / PT)', unit: 'mmHg' },
      { dom: 'abi-la', arg: 'leftAnkle', kind: 'number', required: false, label: 'Left ankle systolic pressure (higher of DP / PT)', unit: 'mmHg' },
      { dom: 'abi-rb', arg: 'rightBrachial', kind: 'number', required: false, label: 'Right brachial systolic pressure', unit: 'mmHg' },
      { dom: 'abi-lb', arg: 'leftBrachial', kind: 'number', required: false, label: 'Left brachial systolic pressure', unit: 'mmHg' },
    ],
  },
  {
    id: 'rutherford-fontaine',
    summary: 'Map a chronic limb-ischemia clinical picture to the Rutherford category (0-6) and the Fontaine stage (I-IV).',
    compute: F.rutherfordFontaine,
    fields: [
      { dom: 'rf-pic', arg: 'picture', kind: 'enum', values: ['asymptomatic', 'mild-claudication', 'moderate-claudication', 'severe-claudication', 'rest-pain', 'minor-tissue-loss', 'major-tissue-loss'], required: true, label: 'Clinical picture' },
    ],
  },
  {
    id: 'wifi',
    summary: 'SVS WIfI limb-threat classification: Wound, Ischemia and foot Infection grades (0-3 each) mapped to the clinical stage 1-4 amputation risk (Mills 2014).',
    compute: F.wifi,
    fields: [
      { dom: 'wifi-w', arg: 'wound', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Wound (W) grade' },
      { dom: 'wifi-i', arg: 'ischemia', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Ischemia (I) grade' },
      { dom: 'wifi-fi', arg: 'infection', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'foot Infection (fI) grade' },
    ],
  },
  {
    id: 'euroscore2',
    summary: 'EuroSCORE II: predicted in-hospital mortality after cardiac surgery from the logistic risk model (Nashef 2012).',
    compute: F.euroScore2,
    fields: [
      { dom: 'es-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'es-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
      { dom: 'es-nyha', arg: 'nyha', kind: 'enum', values: ['1', '2', '3', '4'], required: false, label: 'NYHA class' },
      { dom: 'es-ccs4', arg: 'ccs4', kind: 'bool', required: false, label: 'CCS class 4 angina' },
      { dom: 'es-ins', arg: 'insulinDiabetes', kind: 'bool', required: false, label: 'Insulin-dependent diabetes' },
      { dom: 'es-cpd', arg: 'chronicPulmonary', kind: 'bool', required: false, label: 'Chronic pulmonary dysfunction' },
      { dom: 'es-eca', arg: 'extracardiacArteriopathy', kind: 'bool', required: false, label: 'Extracardiac arteriopathy' },
      { dom: 'es-mob', arg: 'poorMobility', kind: 'bool', required: false, label: 'Poor mobility (neuro / musculoskeletal)' },
      { dom: 'es-redo', arg: 'previousCardiacSurgery', kind: 'bool', required: false, label: 'Previous cardiac surgery' },
      { dom: 'es-endo', arg: 'activeEndocarditis', kind: 'bool', required: false, label: 'Active endocarditis' },
      { dom: 'es-crit', arg: 'criticalPreop', kind: 'bool', required: false, label: 'Critical preoperative state' },
      { dom: 'es-mi', arg: 'recentMi', kind: 'bool', required: false, label: 'Recent MI (within 90 days)' },
      { dom: 'es-aorta', arg: 'thoracicAorta', kind: 'bool', required: false, label: 'Surgery on the thoracic aorta' },
      { dom: 'es-lv', arg: 'lvFunction', kind: 'enum', values: ['good', 'moderate', 'poor', 'very-poor'], required: false, label: 'LV function / ejection fraction' },
      { dom: 'es-pa', arg: 'pulmonaryHypertension', kind: 'enum', values: ['none', 'moderate', 'severe'], required: false, label: 'Pulmonary artery systolic pressure' },
      { dom: 'es-renal', arg: 'renal', kind: 'enum', values: ['normal', 'cc51-85', 'cc-le50', 'dialysis'], required: false, label: 'Renal impairment (Cockcroft-Gault CrCl)' },
      { dom: 'es-urg', arg: 'urgency', kind: 'enum', values: ['elective', 'urgent', 'emergency', 'salvage'], required: false, label: 'Urgency' },
      { dom: 'es-wt', arg: 'weightOfIntervention', kind: 'enum', values: ['cabg', 'single', 'two', 'three'], required: false, label: 'Weight of intervention' },
    ],
  },
];
