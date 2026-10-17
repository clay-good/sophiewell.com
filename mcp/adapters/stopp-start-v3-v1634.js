// spec-v1634 MCP adapter: stopp-start-v3 in lib/stopp-start-v3-v1634.js. The dom keys mirror
// views/group-v1634.js and META['stopp-start-v3'].example. Each tick box is one boolean field, rebuilt into
// the drugs[] and conditions[] arrays (the beers-check precedent). Clinical domain.

import * as SS from '../../lib/stopp-start-v3-v1634.js';

export default [
  {
    id: 'stopp-start-v3',
    summary: 'STOPP/START version 3 screen for a person 65 or older. From ticked drug classes and conditions, it lists the STOPP criteria (potentially inappropriate drugs) and START criteria (potential omissions) that match, each quoted whole. Doses, durations and lab values in a criterion are not tested.',
    compute: (a) => SS.stoppStartV3({
      ageYears: a.ageYears,
      egfr: a.egfr,
      drugs: SS.DRUGS.filter((t) => a[`drug:${t.value}`]).map((t) => t.value),
      conditions: SS.CONDITIONS.filter((t) => a[`cond:${t.value}`]).map((t) => t.value),
    }),
    fields: [
      { dom: 'ss3-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age, years (65 or older)' },
      { dom: 'ss3-egfr', arg: 'egfr', kind: 'number', required: false, label: 'eGFR, mL/min/1.73 m² (optional, for the kidney criteria)' },
      ...SS.DRUGS.map((t) => ({ dom: `ss3-d-${t.value}`, arg: `drug:${t.value}`, kind: 'bool', required: false, label: t.text })),
      ...SS.CONDITIONS.map((t) => ({ dom: `ss3-c-${t.value}`, arg: `cond:${t.value}`, kind: 'bool', required: false, label: t.text })),
    ],
  },
];
