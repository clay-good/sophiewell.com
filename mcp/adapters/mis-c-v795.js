// spec-v795 MCP adapter: 2023 MIS-C surveillance case definition in lib/mis-c-v795.js.
// The dom keys mirror the browser renderer (views/group-v795.js) and META['mis-c'].example.
// Every criterion is required; the Kawasaki flag is an EXCLUSION that overrides the rest.
// Clinical domain.

import { misC } from '../../lib/mis-c-v795.js';

export default [
  {
    id: 'mis-c',
    summary: '2023 surveillance case definition for multisystem inflammatory syndrome in children (CSTE and CDC, MMWR 2022;71(4)). ALL required: age under 21; fever 38.0 C or above, documented or reported; CRP 3.0 mg/dL or above; new-onset involvement in at least TWO of cardiac, mucocutaneous, shock, gastrointestinal, hematologic; SARS-CoV-2 detected within 60 days before or during admission; and no alternative diagnosis, where a final diagnosis of Kawasaki disease by the treating team counts as one and excludes the case. A surveillance definition, not a clinical diagnosis.',
    compute: misC,
    fields: [
      { dom: 'misc-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'yr' },
      { dom: 'misc-fever', arg: 'fever', kind: 'boolean', required: false, label: 'Fever 38.0 C or above' },
      { dom: 'misc-crp', arg: 'crp', kind: 'number', required: true, label: 'C-reactive protein', unit: 'mg/dL' },
      { dom: 'misc-cardiac', arg: 'cardiac', kind: 'boolean', required: false, label: 'Cardiac involvement' },
      { dom: 'misc-mucocutaneous', arg: 'mucocutaneous', kind: 'boolean', required: false, label: 'Mucocutaneous involvement' },
      { dom: 'misc-shock', arg: 'shock', kind: 'boolean', required: false, label: 'Shock' },
      { dom: 'misc-gi', arg: 'gastrointestinal', kind: 'boolean', required: false, label: 'Gastrointestinal involvement' },
      { dom: 'misc-heme', arg: 'hematologic', kind: 'boolean', required: false, label: 'Hematologic involvement' },
      { dom: 'misc-sars', arg: 'sarsCov2Evidence', kind: 'boolean', required: false, label: 'SARS-CoV-2 within 60 days' },
      { dom: 'misc-kawasaki', arg: 'kawasakiFinalDiagnosis', kind: 'boolean', required: false, label: 'Kawasaki is the final diagnosis' },
    ],
  },
];
