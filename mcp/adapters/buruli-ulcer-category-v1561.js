// spec-v1561 MCP adapter: buruli-ulcer-category in lib/buruli-ulcer-category-v1561.js.
// The dom keys mirror views/group-v1561.js and META['buruli-ulcer-category'].example. Clinical domain.

import * as M from '../../lib/buruli-ulcer-category-v1561.js';

export default [
  {
    id: 'buruli-ulcer-category',
    summary: 'Gives the WHO Buruli ulcer category (I, II or III) and the 8-week antibiotics by weight: rifampicin 10 mg/kg plus clarithromycin 7.5 mg/kg twice daily, capped, with the moxifloxacin and streptomycin options.',
    compute: M.buruliUlcerCategory,
    fields: [
      { dom: 'bu-lesions', arg: 'lesions', kind: 'number', required: true, label: 'Number of lesions', min: 1, max: 50 },
      { dom: 'bu-diam', arg: 'diameter', kind: 'number', required: true, label: 'Largest lesion diameter in cm', min: 0.1, max: 100 },
      { dom: 'bu-critical', arg: 'critical', kind: 'enum', label: 'At a critical site (eye, breast, genitals, head and neck)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bu-bone', arg: 'bone', kind: 'enum', label: 'Bone or joint involvement', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bu-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 2, max: 250 },
      { dom: 'bu-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnant', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bu-efv', arg: 'efavirenz', kind: 'enum', label: 'On efavirenz', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
