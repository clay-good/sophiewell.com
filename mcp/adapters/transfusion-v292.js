// spec-v292 MCP wave (one-hundred-sixth): adapter for the restrictive
// transfusion threshold decision aid in lib/transfusion-v292.js. dom keys mirror
// the browser renderer (views/group-v292.js) and
// META['transfusion-threshold'].example.fields. Hemoglobin and population are
// required (both appear in the example); the symptomatic checkbox is optional.
// The `band` carries the "below the 7 g/dL AABB restrictive threshold" example,
// so it round-trips through the default makeToArgs / toBool with no custom
// toArgs. Hemoglobin arrives in the canonical g/dL the compute expects.

import * as F from '../../lib/transfusion-v292.js';

export default [
  {
    id: 'transfusion-threshold',
    summary: 'Restrictive transfusion threshold (AABB 2023): given a hemoglobin (g/dL) and a patient population, reports the population-specific restrictive threshold and whether the value is below it. 7 g/dL for stable hospitalized adults (incl. critically ill), stable critically ill children, and hematologic/oncologic patients; 7.5 cardiac surgery; 8 orthopedic surgery or preexisting cardiovascular disease. Acute coronary syndrome has no AABB numeric recommendation. Reports a guideline threshold comparison, not a transfusion order.',
    compute: F.transfusionThreshold,
    fields: [
      { dom: 'tt-hb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'tt-pop', arg: 'population', kind: 'enum', required: true, values: ['stable-adult', 'cardiac-surgery', 'orthopedic-surgery', 'cardiovascular-disease', 'stable-child', 'heme-onc', 'acute-coronary-syndrome'], label: 'Patient population' },
      { dom: 'tt-sympt', arg: 'symptomatic', kind: 'bool', label: 'Active symptomatic anemia' },
    ],
  },
];
