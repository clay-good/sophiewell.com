// spec-v828 MCP adapter: 2017 CFF cystic fibrosis diagnostic criteria in
// lib/cf-diagnosis-v828.js. The dom keys mirror the browser renderer (views/group-v828.js)
// and META['cf-diagnosis'].example. Clinical domain.

import { cfDiagnosis } from '../../lib/cf-diagnosis-v828.js';

export default [
  {
    id: 'cf-diagnosis',
    summary: 'Applies the 2017 Cystic Fibrosis Foundation consensus criteria. A diagnosis needs BOTH an entry route - a positive newborn screen, clinical features, or an affected sibling - AND evidence of CFTR dysfunction, meaning a sweat chloride of 60 mmol/L or more or two CF-causing variants in trans. Bands are 60 or more consistent, 30-59 intermediate, under 30 unlikely. The lower boundary has been 30 at EVERY age since 2017, where it was 40 above six months.',
    compute: cfDiagnosis,
    fields: [
      { dom: 'cfd-nbs', arg: 'newbornScreenPositive', kind: 'boolean', required: false, label: 'Positive newborn screen' },
      { dom: 'cfd-clinical', arg: 'clinicalFeatures', kind: 'boolean', required: false, label: 'Clinical features consistent with CF' },
      { dom: 'cfd-sibling', arg: 'affectedSibling', kind: 'boolean', required: false, label: 'Sibling with cystic fibrosis' },
      { dom: 'cfd-sweat', arg: 'sweatChloride', kind: 'number', required: false, label: 'Sweat chloride, mmol/L' },
      { dom: 'cfd-age', arg: 'ageMonths', kind: 'number', required: false, label: 'Age in months' },
      { dom: 'cfd-cftr', arg: 'cftrVariants', kind: 'enum', required: false, label: 'CFTR genetic analysis', values: ['not-tested', 'two-cf-causing', 'one-or-none'] },
    ],
  },
];
