// spec-v183 MCP wave 11: adapters for the six lib/trauma-v108.js trauma severity
// scores and decision rules (TRISS survival probability, New ISS, TASH and RABT
// massive-transfusion predictors, the GCS-Pupils score, and the NEXUS Chest CT
// rule). dom keys mirror views/group-v33.js; the compute arg names are the
// verbatim keys that renderer passes. optNum and Number(selVal) inputs are
// 'number', chk inputs 'bool', and the mechanism / pupil selects 'enum'/'number'.
// Default makeToArgs round-trips every documented example.

import * as F from '../../lib/trauma-v108.js';

export default [
  {
    id: 'triss',
    summary: 'TRISS (Boyd 1987): the probability of survival after trauma from the Revised Trauma Score, Injury Severity Score, age, and blunt/penetrating mechanism.',
    compute: F.triss,
    fields: [
      { dom: 'tr-mech', arg: 'mechanism', kind: 'enum', values: ['blunt', 'penetrating'], required: true, label: 'Mechanism' },
      { dom: 'tr-rts', arg: 'rts', kind: 'number', required: true, label: 'Revised Trauma Score' },
      { dom: 'tr-iss', arg: 'iss', kind: 'number', required: true, label: 'Injury Severity Score' },
      { dom: 'tr-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
    ],
  },
  {
    id: 'niss',
    summary: 'New Injury Severity Score (Osler 1997): the sum of squares of the three most severe AIS injuries regardless of body region (0-75).',
    compute: F.niss,
    fields: [
      { dom: 'ni-a1', arg: 'ais1', kind: 'number', required: true, label: 'Highest AIS (1-6)' },
      { dom: 'ni-a2', arg: 'ais2', kind: 'number', required: true, label: 'Second-highest AIS (1-6)' },
      { dom: 'ni-a3', arg: 'ais3', kind: 'number', required: true, label: 'Third-highest AIS (1-6)' },
    ],
  },
  {
    id: 'tash-score',
    summary: 'TASH score (Yucel 2006): predicts the probability of mass transfusion after severe trauma from hemoglobin, base excess, hemodynamics, FAST, and injury pattern.',
    compute: F.tashScore,
    fields: [
      { dom: 'ta-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin (g/dL)' },
      { dom: 'ta-be', arg: 'baseExcess', kind: 'number', required: true, label: 'Base excess (mmol/L)' },
      { dom: 'ta-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP (mm Hg)' },
      { dom: 'ta-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate (beats/min)' },
      { dom: 'ta-fast', arg: 'fast', kind: 'bool', label: 'Positive FAST' },
      { dom: 'ta-pelvis', arg: 'pelvis', kind: 'bool', label: 'Unstable pelvic fracture' },
      { dom: 'ta-femur', arg: 'femur', kind: 'bool', label: 'Open or dislocated femur fracture' },
      { dom: 'ta-male', arg: 'male', kind: 'bool', label: 'Male sex' },
    ],
  },
  {
    id: 'rabt-score',
    summary: 'RABT score (Joseph 2018): predicts the need for massive transfusion (>= 2 of 4) from shock index, pelvic fracture, penetrating mechanism, and FAST.',
    compute: F.rabtScore,
    fields: [
      { dom: 'ra-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate (beats/min)' },
      { dom: 'ra-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP (mm Hg)' },
      { dom: 'ra-pelvis', arg: 'pelvis', kind: 'bool', label: 'Pelvic fracture' },
      { dom: 'ra-pen', arg: 'penetrating', kind: 'bool', label: 'Penetrating mechanism' },
      { dom: 'ra-fast', arg: 'fast', kind: 'bool', label: 'Positive FAST' },
    ],
  },
  {
    id: 'gcs-pupils',
    summary: 'GCS-Pupils score (Brennan 2018): the Glasgow Coma Scale minus a pupil-reactivity penalty (0-2), extending the prognostic range at the low end.',
    compute: F.gcsPupils,
    fields: [
      { dom: 'gp-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale total (3-15)' },
      { dom: 'gp-pupils', arg: 'pupils', kind: 'number', required: true, label: 'Unreactive pupils (0 / 1 / 2)' },
    ],
  },
  {
    id: 'nexus-chest-ct',
    summary: 'NEXUS Chest CT decision instrument (Rodriguez 2015): whether chest CT is indicated after blunt trauma from seven criteria; any positive suggests imaging.',
    compute: F.nexusChestCt,
    fields: [
      { dom: 'nx-cxr', arg: 'abnormalCxr', kind: 'bool', label: 'Abnormal chest X-ray' },
      { dom: 'nx-distract', arg: 'distractingInjury', kind: 'bool', label: 'Distracting painful injury' },
      { dom: 'nx-tender', arg: 'chestTenderness', kind: 'bool', label: 'Chest-wall tenderness' },
      { dom: 'nx-decel', arg: 'rapidDeceleration', kind: 'bool', label: 'Rapid deceleration mechanism' },
      { dom: 'nx-age', arg: 'ageOver60', kind: 'bool', label: 'Age > 60 years' },
      { dom: 'nx-intox', arg: 'intoxication', kind: 'bool', label: 'Intoxication' },
      { dom: 'nx-mental', arg: 'abnormalAlertness', kind: 'bool', label: 'Abnormal alertness / mental status' },
    ],
  },
];
