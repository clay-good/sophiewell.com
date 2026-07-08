// spec-v183 MCP wave 75: adapters for lib/idcrit-v99.js - the infectious-
// disease and critical-care criteria/severity scores rendered by
// views/group-v25.js: the modified Duke endocarditis rule, the Pitt Bacteremia
// Score, SAPS II, and the NICE refeeding-syndrome risk criteria. dom keys
// mirror the renderers.
//
// dukeEndocarditis takes { major: [keys], minor: [keys] } arrays; a bespoke
// toArgs rebuilds them from the flat per-criterion booleans (the kawasaki /
// mcgeer precedent). The criterion key sets are read from the lib's own tables
// (DUKE_MAJOR_CRITERIA / DUKE_MINOR_CRITERIA) so the schema cannot drift.
//
// lundBrowder stays deferred: it takes a variable-length per-region fraction
// object that needs its own bespoke toArgs.

import * as F from '../../lib/idcrit-v99.js';

const DUKE_MAJOR_KEYS = F.DUKE_MAJOR_CRITERIA.map((c) => c.key);
const DUKE_MINOR_KEYS = F.DUKE_MINOR_CRITERIA.map((c) => c.key);

export default [
  {
    id: 'duke-endocarditis',
    summary: 'Modified Duke criteria for infective endocarditis (2023 Duke-ISCVID): the count of major criteria (microbiologic, imaging, surgical) and minor criteria (predisposition, fever, vascular, immunologic, minor microbiologic) determines definite / possible / rejected.',
    // Rebuild the major/minor key arrays from the flat per-criterion booleans.
    // The default makeToArgs coerces each bool field (arg === dom), so a[...] is
    // a real boolean here, not a truthy '0' string.
    compute: (a) => F.dukeEndocarditis({
      major: DUKE_MAJOR_KEYS.filter((k) => a[`duke-maj-${k}`]),
      minor: DUKE_MINOR_KEYS.filter((k) => a[`duke-min-${k}`]),
    }),
    fields: [
      ...DUKE_MAJOR_KEYS.map((k) => ({ dom: `duke-maj-${k}`, arg: `duke-maj-${k}`, kind: 'bool', label: `Major: ${k}` })),
      ...DUKE_MINOR_KEYS.map((k) => ({ dom: `duke-min-${k}`, arg: `duke-min-${k}`, kind: 'bool', label: `Minor: ${k}` })),
    ],
  },
  {
    id: 'pitt-bacteremia',
    summary: 'Pitt Bacteremia Score for bloodstream-infection mortality risk: temperature band (0/1/2), hypotension (2), mechanical ventilation (2), cardiac arrest (4), and mental status (alert 0 / disoriented 1 / stupor 2 / coma 4); total 0-14, >= 4 marks high mortality risk.',
    compute: F.pittBacteremia,
    fields: [
      { dom: 'pitt-temp', arg: 'temperature', kind: 'enum', values: ['normal', 'mild', 'severe'], required: true, label: 'Temperature band (normal 0 / mild 1 / severe 2)' },
      { dom: 'pitt-hypotension', arg: 'hypotension', kind: 'bool', label: 'Hypotension (2)' },
      { dom: 'pitt-vent', arg: 'mechVent', kind: 'bool', label: 'Mechanical ventilation (2)' },
      { dom: 'pitt-arrest', arg: 'cardiacArrest', kind: 'bool', label: 'Cardiac arrest (4)' },
      { dom: 'pitt-mental', arg: 'mentalStatus', kind: 'enum', values: ['alert', 'disoriented', 'stupor', 'coma'], required: true, label: 'Mental status (alert 0 / disoriented 1 / stupor 2 / coma 4)' },
    ],
  },
  {
    id: 'saps-ii',
    summary: 'Simplified Acute Physiology Score II (Le Gall 1993): age, heart rate, SBP, temperature, oxygenation (if ventilated), urine output, BUN, sodium, potassium, bicarbonate, bilirubin, WBC, GCS, chronic disease, and admission type each banded to points; the total maps to a predicted hospital-mortality percentage via the logistic model.',
    compute: F.sapsII,
    fields: [
      { dom: 'saps-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'saps-hr', arg: 'heartRate', kind: 'number', required: true, label: 'Heart rate (worst)', unit: 'bpm' },
      { dom: 'saps-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP (worst)', unit: 'mmHg' },
      { dom: 'saps-temp', arg: 'temperature', kind: 'number', required: true, label: 'Temperature (highest)', unit: 'C' },
      { dom: 'saps-vent', arg: 'ventilated', kind: 'bool', label: 'Mechanically ventilated or CPAP' },
      { dom: 'saps-pao2', arg: 'paO2', kind: 'number', required: true, label: 'PaO2 (if ventilated)', unit: 'mmHg' },
      { dom: 'saps-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (if ventilated, fraction)' },
      { dom: 'saps-urine', arg: 'urineOutput', kind: 'number', required: true, label: 'Urine output', unit: 'L/day' },
      { dom: 'saps-bun', arg: 'bun', kind: 'number', required: true, label: 'BUN', unit: 'mg/dL' },
      { dom: 'saps-na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'saps-k', arg: 'potassium', kind: 'number', required: true, label: 'Potassium', unit: 'mEq/L' },
      { dom: 'saps-hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Bicarbonate', unit: 'mEq/L' },
      { dom: 'saps-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Bilirubin', unit: 'mg/dL' },
      { dom: 'saps-wbc', arg: 'wbc', kind: 'number', required: true, label: 'WBC', unit: 'x10^3/mm^3' },
      { dom: 'saps-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3-15)' },
      { dom: 'saps-chronic', arg: 'chronicDisease', kind: 'enum', values: ['none', 'metastatic', 'hematologic', 'aids'], required: true, label: 'Chronic disease (none / metastatic / hematologic / AIDS)' },
      { dom: 'saps-admit', arg: 'admissionType', kind: 'enum', values: ['scheduled-surgical', 'medical', 'unscheduled-surgical'], required: true, label: 'Type of admission' },
    ],
  },
  {
    id: 'refeeding-risk',
    summary: 'NICE refeeding-syndrome risk criteria: major criteria (BMI < 16, unintentional weight loss > 15%, > 10 days negligible intake, low pre-feeding potassium/magnesium/phosphate) and minor criteria (BMI < 18.5, weight loss > 10%, > 5 days negligible intake, history of alcohol/insulin/chemotherapy/antacids/diuretics); high risk with >= 1 major or >= 2 minor.',
    compute: F.refeedingRisk,
    fields: [
      { dom: 'ref-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
      { dom: 'ref-wl', arg: 'weightLoss', kind: 'number', required: true, label: 'Unintentional weight loss over 3-6 months', unit: '%' },
      { dom: 'ref-days', arg: 'daysNoIntake', kind: 'number', required: true, label: 'Days with little or no nutritional intake' },
      { dom: 'ref-electrolytes', arg: 'lowElectrolytes', kind: 'bool', label: 'Low pre-feeding potassium, magnesium, or phosphate' },
      { dom: 'ref-history', arg: 'historyFlag', kind: 'bool', label: 'History of alcohol misuse or insulin / chemotherapy / antacids / diuretics' },
    ],
  },
];
