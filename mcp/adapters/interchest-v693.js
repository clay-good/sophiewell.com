// spec-v693 MCP adapter: INTERCHEST chest-pain CAD rule in lib/interchest-v693.js.
// The dom keys mirror the browser renderer (views/group-v693.js) and
// META['interchest'].example. Age + sex + five booleans (one worth -1); the sum -1..+5
// maps to a CAD-probability band. Clinical domain.

import { interchest } from '../../lib/interchest-v693.js';

export default [
  {
    id: 'interchest',
    summary: 'INTERCHEST rule (Aerts 2017): probability that chest pain is coronary in primary care. Age/sex (female >=65 or male >=55) +1, history of CAD +1, pain on exertion +1, pressure-like pain +1, physician suspected serious/cardiac +1, reproducible by palpation -1. Sum -1 to +5; <2 CAD unlikely (~2.1%, NPV ~98%), >=2 ~43% (expedite testing). Primary-care rule, not for ED ACS triage.',
    compute: interchest,
    fields: [
      { dom: 'ic-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: 'Age (years)' },
      { dom: 'ic-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex' },
      { dom: 'ic-cad', arg: 'historyCad', kind: 'boolean', required: false, label: 'History of coronary artery disease' },
      { dom: 'ic-exertion', arg: 'exertion', kind: 'boolean', required: false, label: 'Pain brought on by exertion' },
      { dom: 'ic-pressure', arg: 'pressure', kind: 'boolean', required: false, label: 'Pain feels like pressure' },
      { dom: 'ic-suspect', arg: 'physicianSuspicion', kind: 'boolean', required: false, label: 'Physician initially suspected a serious / cardiac cause' },
      { dom: 'ic-palpation', arg: 'reproduciblePalpation', kind: 'boolean', required: false, label: 'Pain reproducible by palpation (subtracts 1)' },
    ],
  },
];
