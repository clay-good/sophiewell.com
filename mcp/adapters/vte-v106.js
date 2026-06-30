// spec-v183 MCP wave 7: adapters for the six lib/vte-v106.js venous-thrombo-
// embolism instruments (PEGeD graduated D-dimer rule, 4PEPS, the Bova score,
// the Hestia outpatient gate, the original Geneva score, and the Constans
// upper-extremity DVT score). dom keys mirror views/group-v31.js; age / heart
// rate / SpO2 / D-dimer are numbers, the criteria are booleans, and the C-PTP
// tier and the blood-gas bands are enums.

import * as F from '../../lib/vte-v106.js';

export default [
  {
    id: 'peged',
    summary: 'PEGeD graduated D-dimer rule: the D-dimer threshold (500 / 1000 ng/mL FEU) is chosen by the Wells 3-tier clinical pretest probability (Kearon 2019).',
    compute: F.peged,
    fields: [
      { dom: 'pg-tier', arg: 'tier', kind: 'enum', values: ['low', 'moderate', 'high'], required: true, label: 'Clinical pretest probability (C-PTP, by Wells)' },
      { dom: 'pg-dd', arg: 'dDimer', kind: 'number', required: false, label: 'Measured D-dimer', unit: 'ng/mL FEU' },
    ],
  },
  {
    id: '4peps',
    summary: '4PEPS: a 13-item weighted clinical pretest-probability score for PE, ruling out at the very-low and low strata (Roy 2021).',
    compute: F.fourPeps,
    fields: [
      { dom: 'pp-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'pp-hr', arg: 'heartRate', kind: 'number', required: false, label: 'Heart rate', unit: 'bpm' },
      { dom: 'pp-spo2', arg: 'spo2', kind: 'number', required: false, label: 'Pulse-oximetry O2 saturation', unit: '%' },
      { dom: 'pp-male', arg: 'male', kind: 'bool', required: false, label: 'Male sex' },
      { dom: 'pp-resp', arg: 'chronicResp', kind: 'bool', required: false, label: 'Chronic respiratory disease' },
      { dom: 'pp-cpd', arg: 'chestPainDyspnea', kind: 'bool', required: false, label: 'Chest pain AND acute dyspnea' },
      { dom: 'pp-est', arg: 'estrogen', kind: 'bool', required: false, label: 'Hormonal estrogenic treatment' },
      { dom: 'pp-vte', arg: 'priorVte', kind: 'bool', required: false, label: 'Prior VTE (DVT or PE)' },
      { dom: 'pp-syn', arg: 'syncope', kind: 'bool', required: false, label: 'Syncope' },
      { dom: 'pp-imm', arg: 'immobility', kind: 'bool', required: false, label: 'Immobility or surgery within 4 weeks' },
      { dom: 'pp-calf', arg: 'calfPainEdema', kind: 'bool', required: false, label: 'Calf pain and/or unilateral lower-limb edema' },
      { dom: 'pp-pe', arg: 'peMostLikely', kind: 'bool', required: false, label: 'PE is the most likely diagnosis' },
    ],
  },
  {
    id: 'bova-pe',
    summary: 'Bova score for 30-day complications in normotensive confirmed PE: four binary criteria, Stage I-III (Bova 2014).',
    compute: F.bovaPe,
    fields: [
      { dom: 'bv-sbp', arg: 'sbp90to100', kind: 'bool', required: false, label: 'Systolic BP 90-100 mmHg' },
      { dom: 'bv-trop', arg: 'troponin', kind: 'bool', required: false, label: 'Elevated cardiac troponin' },
      { dom: 'bv-rv', arg: 'rvDysfunction', kind: 'bool', required: false, label: 'RV dysfunction (echo or CT)' },
      { dom: 'bv-hr', arg: 'hr110', kind: 'bool', required: false, label: 'Heart rate >= 110 bpm' },
    ],
  },
  {
    id: 'hestia',
    summary: 'Hestia criteria: any one of 11 positive items excludes outpatient PE management; all negative supports home treatment (Zondag 2011).',
    compute: F.hestia,
    fields: [
      { dom: 'he-unstable', arg: 'unstable', kind: 'bool', required: false, label: 'Hemodynamically unstable' },
      { dom: 'he-thromb', arg: 'thrombolysis', kind: 'bool', required: false, label: 'Thrombolysis or embolectomy needed' },
      { dom: 'he-bleed', arg: 'bleeding', kind: 'bool', required: false, label: 'Active bleeding or high bleeding risk' },
      { dom: 'he-o2', arg: 'oxygen', kind: 'bool', required: false, label: '> 24 h oxygen needed to keep SaO2 > 90%' },
      { dom: 'he-anticoag', arg: 'onAnticoag', kind: 'bool', required: false, label: 'PE diagnosed while on anticoagulation' },
      { dom: 'he-pain', arg: 'severePain', kind: 'bool', required: false, label: 'Severe pain needing IV analgesia > 24 h' },
      { dom: 'he-social', arg: 'medSocial', kind: 'bool', required: false, label: 'Medical or social reason for admission > 24 h' },
      { dom: 'he-renal', arg: 'renal', kind: 'bool', required: false, label: 'Creatinine clearance < 30 mL/min' },
      { dom: 'he-liver', arg: 'liver', kind: 'bool', required: false, label: 'Severe liver impairment' },
      { dom: 'he-preg', arg: 'pregnant', kind: 'bool', required: false, label: 'Pregnant' },
      { dom: 'he-hit', arg: 'hit', kind: 'bool', required: false, label: 'Documented history of HIT' },
    ],
  },
  {
    id: 'geneva-original',
    summary: 'The original (objective) Geneva score for PE pretest probability: age, prior VTE, recent surgery, heart rate, arterial blood gas, and chest-film findings (Wicki 2001).',
    compute: F.genevaOriginal,
    fields: [
      { dom: 'gv-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'gv-hr', arg: 'heartRate', kind: 'number', required: false, label: 'Heart rate', unit: 'bpm' },
      { dom: 'gv-vte', arg: 'priorVte', kind: 'bool', required: false, label: 'Previous DVT or PE' },
      { dom: 'gv-surg', arg: 'recentSurgery', kind: 'bool', required: false, label: 'Surgery within 4 weeks' },
      { dom: 'gv-co2', arg: 'paco2Band', kind: 'enum', values: ['normal', 'low1', 'low2'], required: false, label: 'PaCO2 (arterial)' },
      { dom: 'gv-o2', arg: 'pao2Band', kind: 'enum', values: ['normal', 'b1', 'b2', 'b3', 'b4'], required: false, label: 'PaO2 (arterial)' },
      { dom: 'gv-atel', arg: 'bandAtelectasis', kind: 'bool', required: false, label: 'Band (platelike) atelectasis on chest film' },
      { dom: 'gv-diaph', arg: 'elevatedHemidiaphragm', kind: 'bool', required: false, label: 'Elevated hemidiaphragm on chest film' },
    ],
  },
  {
    id: 'constans-uedvt',
    summary: 'Constans score for upper-extremity DVT pretest probability: venous material, localized pain, unilateral edema, and a plausible alternative diagnosis (Constans 2008).',
    compute: F.constansUedvt,
    fields: [
      { dom: 'co-mat', arg: 'venousMaterial', kind: 'bool', required: false, label: 'Venous material in the limb (central line or pacemaker)' },
      { dom: 'co-pain', arg: 'localizedPain', kind: 'bool', required: false, label: 'Localized pain' },
      { dom: 'co-edema', arg: 'unilateralEdema', kind: 'bool', required: false, label: 'Unilateral pitting edema' },
      { dom: 'co-other', arg: 'otherDxPlausible', kind: 'bool', required: false, label: 'Other diagnosis at least as plausible (-1)' },
    ],
  },
];
