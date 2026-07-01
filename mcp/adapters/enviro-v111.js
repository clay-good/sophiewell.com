// spec-v183 MCP wave 13: adapters for the four lib/enviro-v111.js
// environmental-emergency tiles. dom keys mirror views/group-v111.js and
// META.example.fields; arg names mirror the lib signatures (input.headache,
// input.status, input.pulmonary, input.topography, …). The severity items are
// small integer sub-scores; the graded findings are enums.

import * as F from '../../lib/enviro-v111.js';

export default [
  {
    id: 'lake-louise-ams',
    summary: 'Lake Louise Acute Mountain Sickness score (Roach 2018): sums four self-rated 0–3 symptom items; a total ≥ 3 with a headache present diagnoses AMS and grades its severity.',
    compute: F.lakeLouiseAms,
    fields: [
      { dom: 'll-head', arg: 'headache', kind: 'number', required: true, label: 'Headache (0–3)' },
      { dom: 'll-gi', arg: 'gi', kind: 'number', required: true, label: 'Gastrointestinal symptoms (0–3)' },
      { dom: 'll-fat', arg: 'fatigue', kind: 'number', required: true, label: 'Fatigue / weakness (0–3)' },
      { dom: 'll-diz', arg: 'dizziness', kind: 'number', required: true, label: 'Dizziness / lightheadedness (0–3)' },
    ],
  },
  {
    id: 'szpilman-drowning',
    summary: 'Szpilman drowning classification (Szpilman 1997): grades submersion injury 1–6 by respiratory status, auscultation, cough, and hypotension, each grade mapped to its validation-cohort mortality and disposition.',
    compute: F.szpilmanDrowning,
    fields: [
      { dom: 'sz-status', arg: 'status', kind: 'enum', values: ['breathing', 'respiratory-arrest', 'cardiac-arrest', 'dead'], required: true, label: 'Respiratory / cardiac status' },
      { dom: 'sz-ausc', arg: 'auscultation', kind: 'enum', values: ['normal', 'rales-some', 'pulmonary-edema'], label: 'Lung auscultation' },
      { dom: 'sz-cough', arg: 'cough', kind: 'bool', label: 'Cough present' },
      { dom: 'sz-hypo', arg: 'hypotension', kind: 'bool', label: 'Hypotension' },
    ],
  },
  {
    id: 'snakebite-severity',
    summary: 'Snakebite Severity Score (Dart 1996): sums six organ-system sub-scores (pulmonary, cardiovascular, local wound, gastrointestinal, hematologic, CNS) into a 0–20 continuous severity index.',
    compute: F.snakebiteSeverity,
    fields: [
      { dom: 'ss-pul', arg: 'pulmonary', kind: 'number', label: 'Pulmonary (0–3)' },
      { dom: 'ss-cv', arg: 'cardiovascular', kind: 'number', label: 'Cardiovascular (0–3)' },
      { dom: 'ss-loc', arg: 'local', kind: 'number', label: 'Local wound (0–4)' },
      { dom: 'ss-gi', arg: 'gi', kind: 'number', label: 'Gastrointestinal (0–3)' },
      { dom: 'ss-hem', arg: 'hematologic', kind: 'number', label: 'Hematologic (0–4)' },
      { dom: 'ss-cns', arg: 'cns', kind: 'number', label: 'CNS (0–3)' },
    ],
  },
  {
    id: 'cauchy-frostbite',
    summary: 'Cauchy frostbite classification (Cauchy 2001): grades day-of-injury frostbite 1–4 from lesion topography, the day-2 bone-scan uptake, and blister character, predicting amputation risk and sequelae.',
    compute: F.cauchyFrostbite,
    fields: [
      { dom: 'cf-topo', arg: 'topography', kind: 'enum', values: ['none', 'distal-phalanx', 'intermediate-proximal', 'carpal-tarsal'], required: true, label: 'Lesion topography at day 0' },
      { dom: 'cf-bone', arg: 'boneScan', kind: 'enum', values: ['not-done', 'normal', 'hypofixation', 'absent-digit', 'absent-carpal-tarsal'], label: 'Bone-scan uptake (day 2)' },
      { dom: 'cf-blist', arg: 'blisters', kind: 'enum', values: ['none', 'clear', 'hemorrhagic-digit', 'hemorrhagic-carpal-tarsal'], label: 'Blister character' },
    ],
  },
];
