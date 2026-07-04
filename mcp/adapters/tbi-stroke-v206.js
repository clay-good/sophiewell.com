// spec-v183 MCP wave 28: adapters for the four TBI / stroke prognostic
// instruments in lib/tbi-stroke-v206.js — the Essen Stroke Risk Score, the
// Rotterdam and Marshall head-CT classifications, and the FUNC score for
// functional independence after primary ICH. dom keys mirror
// views/group-v206.js. Rotterdam's cistern status, Marshall's mass-lesion axis,
// and FUNC's ICH location are ordinal / categorical enums mirroring the renderer
// selects; every other item is a boolean.

import * as F from '../../lib/tbi-stroke-v206.js';

export default [
  {
    id: 'essen-stroke-risk',
    summary: 'Essen Stroke Risk Score (Diener 2005): age plus hypertension, diabetes, prior MI, other cardiovascular disease, peripheral arterial disease, smoking, and prior stroke/TIA give a 0–9 risk of recurrent stroke; ≥ 3 marks a high annual recurrence.',
    compute: F.essenStroke,
    fields: [
      { dom: 'essen-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'essen-htn', arg: 'hypertension', kind: 'bool', required: false, label: 'Hypertension (+1)' },
      { dom: 'essen-dm', arg: 'diabetes', kind: 'bool', required: false, label: 'Diabetes (+1)' },
      { dom: 'essen-mi', arg: 'priorMi', kind: 'bool', required: false, label: 'Prior myocardial infarction (+1)' },
      { dom: 'essen-cvd', arg: 'otherCvd', kind: 'bool', required: false, label: 'Other cardiovascular disease (+1)' },
      { dom: 'essen-pad', arg: 'pad', kind: 'bool', required: false, label: 'Peripheral arterial disease (+1)' },
      { dom: 'essen-smoke', arg: 'smoker', kind: 'bool', required: false, label: 'Current smoker (+1)' },
      { dom: 'essen-prior', arg: 'priorStroke', kind: 'bool', required: false, label: 'Prior stroke / TIA (+1)' },
    ],
  },
  {
    id: 'rotterdam-ct',
    summary: 'Rotterdam CT score for traumatic brain injury (Maas 2005): basal cistern status, midline shift, epidural mass, and intraventricular/subarachnoid blood give a 1–6 score banding 6-month mortality.',
    compute: F.rotterdamCt,
    fields: [
      { dom: 'rott-cist', arg: 'cisterns', kind: 'enum', values: ['normal', 'compressed', 'absent'], required: true, label: 'Basal cisterns' },
      { dom: 'rott-shift', arg: 'shiftOver5', kind: 'bool', required: false, label: 'Midline shift > 5 mm (+1)' },
      { dom: 'rott-edh', arg: 'epiduralPresent', kind: 'bool', required: false, label: 'Epidural mass lesion present (subtracts 1)' },
      { dom: 'rott-ivh', arg: 'ivhOrSah', kind: 'bool', required: false, label: 'Intraventricular blood or traumatic SAH (+1)' },
    ],
  },
  {
    id: 'marshall-ct',
    summary: 'Marshall CT classification for traumatic brain injury (Marshall 1991): an ordinal head-CT descriptor (Diffuse Injury I–IV, Evacuated Mass Lesion V, Non-evacuated VI) from basal cisterns, midline shift, and the presence/evacuation of a > 25 cc mass lesion.',
    compute: F.marshallCt,
    fields: [
      { dom: 'mar-mass', arg: 'massLesion', kind: 'enum', values: ['none', 'evacuated', 'non-evacuated'], required: true, label: 'High/mixed-density mass lesion > 25 cc' },
      { dom: 'mar-path', arg: 'pathology', kind: 'bool', required: false, label: 'Any visible intracranial pathology (diffuse injury)' },
      { dom: 'mar-cist', arg: 'cisternsAbnormal', kind: 'bool', required: false, label: 'Basal cisterns compressed or absent' },
      { dom: 'mar-shift', arg: 'shiftOver5', kind: 'bool', required: false, label: 'Midline shift > 5 mm' },
    ],
  },
  {
    id: 'func-score',
    summary: 'FUNC score (Rost 2008): a point model for the likelihood of functional independence (GOS ≥ 4) at 90 days after primary ICH from ICH volume, age, location, GCS, and pre-ICH cognitive impairment; total 0–11.',
    compute: F.funcScore,
    fields: [
      { dom: 'func-vol', arg: 'ichVolume', kind: 'number', required: true, label: 'ICH volume', unit: 'cc' },
      { dom: 'func-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'func-loc', arg: 'location', kind: 'enum', values: ['lobar', 'deep', 'infratentorial'], required: true, label: 'ICH location' },
      { dom: 'func-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3–15)' },
      { dom: 'func-cog', arg: 'cognitiveImpairment', kind: 'bool', required: false, label: 'Pre-ICH cognitive impairment (present scores 0; absent scores +1)' },
    ],
  },
];
