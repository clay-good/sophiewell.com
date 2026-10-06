// spec-v1561 MCP adapter: leprosy-classify-mdt in lib/leprosy-classify-mdt-v1561.js.
// The dom keys mirror views/group-v1561.js and META['leprosy-classify-mdt'].example. Clinical domain.

import * as M from '../../lib/leprosy-classify-mdt-v1561.js';

export default [
  {
    id: 'leprosy-classify-mdt',
    summary: 'Classifies leprosy as paucibacillary or multibacillary by WHO 2017 definitions and gives the 2018 MDT. The same three drugs for 6 or 12 months, child doses by age or weight; an unassessed nerve never reads as none.',
    compute: M.leprosyClassifyMdt,
    fields: [
      { dom: 'lep-lesions', arg: 'lesions', kind: 'number', required: true, label: 'Number of skin lesions', min: 0, max: 100 },
      { dom: 'lep-nerve', arg: 'nerve', kind: 'enum', label: 'Nerve involvement', values: M.NERVE_OPTIONS.map((d) => d.value) },
      { dom: 'lep-smear', arg: 'smear', kind: 'enum', label: 'Skin smear', values: M.SMEAR_OPTIONS.map((d) => d.value) },
      { dom: 'lep-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'lep-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (needed under 10 years or under 40 kg)', min: 2, max: 250 },
    ],
  },
];
