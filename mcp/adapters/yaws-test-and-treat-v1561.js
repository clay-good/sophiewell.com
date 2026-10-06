// spec-v1561 MCP adapter: yaws-test-and-treat in lib/yaws-test-and-treat-v1561.js.
// The dom keys mirror views/group-v1561.js and META['yaws-test-and-treat'].example. Clinical domain.

import * as M from '../../lib/yaws-test-and-treat-v1561.js';

export default [
  {
    id: 'yaws-test-and-treat',
    summary: 'Reads the yaws rapid and DPP tests, gives the WHO case class, and the azithromycin dose: 30 mg/kg once (maximum 2 g) or the age band, never under 6 months, with benzathine penicillin as the fallback.',
    compute: M.yawsTestAndTreat,
    fields: [
      { dom: 'yw-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'yw-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (for 30 mg/kg)', min: 2, max: 250 },
      { dom: 'yw-endemic', arg: 'endemic', kind: 'enum', required: true, label: 'Lives or lived where yaws is or was endemic', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yw-lesion', arg: 'lesion', kind: 'enum', required: true, label: 'Yaws-like skin lesion', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yw-rdtc', arg: 'rdtC', kind: 'enum', label: 'Rapid test: control line visible', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yw-rdtt', arg: 'rdtT', kind: 'enum', label: 'Rapid test: treponemal line visible', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yw-dppc', arg: 'dppC', kind: 'enum', label: 'DPP: control line visible', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yw-dppt', arg: 'dppT', kind: 'enum', label: 'DPP: treponemal (T) line visible', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yw-dppnt', arg: 'dppNT', kind: 'enum', label: 'DPP: non-treponemal line visible', values: M.YES_NO.map((d) => d.value) },
      { dom: 'yw-pcr', arg: 'pcr', kind: 'enum', label: 'PCR', values: M.PCR_OPTIONS.map((d) => d.value) },
    ],
  },
];
