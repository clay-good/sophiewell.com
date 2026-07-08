// spec-v183 (wave 2): adapters for lib/neuro-v118.js hemorrhagic-stroke /
// SAH / IVH risk tiles. dom keys mirror views/group-v118.js and
// META.example.fields; arg names mirror the lib signatures. The `phases`
// aneurysm-rupture-risk tile joined in wave 53 once its META.example was added.
//
// graeb-ivh's eight compartment selects are scored as plain numbers (0-4 for the
// lateral/3rd/4th ventricles, 0-2 for the horns) with a per-compartment
// expansion checkbox, exactly as the renderer assembles them.

import * as N from '../../lib/neuro-v118.js';

const YESNO = ['no', 'yes'];

const graebCompartment = (dom, arg, label) => ([
  { dom, arg, kind: 'number', label },
  { dom: `${dom}-exp`, arg: `${arg}Exp`, kind: 'bool', label: `${label}: expanded by clot (+1)` },
]);

export default [
  {
    id: 'modified-fisher',
    summary: 'Modified Fisher grade (0-4) from cisternal SAH thickness and intraventricular hemorrhage, with the symptomatic-vasospasm risk band.',
    compute: N.modifiedFisher,
    fields: [
      { dom: 'mf-sah', arg: 'sah', kind: 'enum', values: ['none', 'thin', 'thick'], label: 'Cisternal subarachnoid blood' },
      { dom: 'mf-ivh', arg: 'ivh', kind: 'bool', label: 'Intraventricular hemorrhage present' },
    ],
  },
  {
    id: 'graeb-ivh',
    summary: 'Modified Graeb Score (0-32): intraventricular-hemorrhage burden across eight compartments, each with an expansion modifier.',
    compute: N.graebIvh,
    fields: [
      ...graebCompartment('gr-rl', 'rightLateral', 'Right lateral ventricle'),
      ...graebCompartment('gr-ll', 'leftLateral', 'Left lateral ventricle'),
      ...graebCompartment('gr-3', 'third', 'Third ventricle'),
      ...graebCompartment('gr-4', 'fourth', 'Fourth ventricle'),
      ...graebCompartment('gr-ro', 'rightOccipital', 'Right occipital horn'),
      ...graebCompartment('gr-lo', 'leftOccipital', 'Left occipital horn'),
      ...graebCompartment('gr-rt', 'rightTemporal', 'Right temporal horn'),
      ...graebCompartment('gr-lt', 'leftTemporal', 'Left temporal horn'),
    ],
  },
  {
    id: 'bat-score',
    summary: 'BAT score (0-5) for predicting intracerebral-hemorrhage expansion from the blend sign, hypodensity, and onset-to-CT timing.',
    compute: N.batScore,
    fields: [
      { dom: 'bt-blend', arg: 'blend', kind: 'bool', label: 'Blend sign present (+1)' },
      { dom: 'bt-hypo', arg: 'hypodensity', kind: 'bool', label: 'Any intrahematoma hypodensity present (+2)' },
      { dom: 'bt-timing', arg: 'timing', kind: 'bool', label: 'Onset-to-baseline-NCCT < 2.5 hours (+2)' },
    ],
  },
  {
    id: 'elapss',
    summary: 'ELAPSS score for unruptured-aneurysm growth: earlier SAH, location, age, population, size and shape mapped to 3- and 5-year growth risk.',
    compute: N.elapss,
    fields: [
      { dom: 'el-sah', arg: 'earlierSah', kind: 'enum', values: YESNO, label: 'Earlier subarachnoid hemorrhage', to: (v) => v === 'yes' },
      { dom: 'el-loc', arg: 'location', kind: 'enum', values: ['icaAcaAcom', 'mca', 'pcomPost'], label: 'Location of aneurysm' },
      { dom: 'el-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'el-pop', arg: 'population', kind: 'enum', values: ['na', 'japan', 'finland'], label: 'Population' },
      { dom: 'el-size', arg: 'size', kind: 'number', required: true, label: 'Aneurysm size', unit: 'mm' },
      { dom: 'el-irregular', arg: 'irregular', kind: 'bool', label: 'Irregular shape (+4)' },
    ],
  },
  {
    // wave 53: the flat population/site enums and age/size/flag inputs map
    // straight through the default toArgs (the renderer passes exactly these).
    id: 'phases',
    summary: 'PHASES score (Greving 2014): 5-year cumulative rupture risk of an unruptured intracranial aneurysm from population, hypertension, age, aneurysm size, earlier SAH, and site (total 0–22).',
    compute: N.phases,
    fields: [
      { dom: 'ph-pop', arg: 'population', kind: 'enum', values: ['na', 'japanese', 'finnish'], label: 'Population' },
      { dom: 'ph-htn', arg: 'htn', kind: 'bool', label: 'Hypertension (+1)' },
      { dom: 'ph-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ph-size', arg: 'size', kind: 'number', required: true, label: 'Aneurysm size', unit: 'mm' },
      { dom: 'ph-sah', arg: 'earlierSah', kind: 'bool', label: 'Earlier SAH from a different aneurysm (+1)' },
      { dom: 'ph-site', arg: 'site', kind: 'enum', values: ['ica', 'mca', 'acaPcomPost'], label: 'Aneurysm site' },
    ],
  },
];
