// spec-v1635 MCP adapter: sealed-source-leak-test in lib/sealed-source-leak-test-v1635.js. The dom
// keys mirror views/group-v1635.js and META['sealed-source-leak-test'].example. Operational domain.

import * as SL from '../../lib/sealed-source-leak-test-v1635.js';

export default [
  {
    id: 'sealed-source-leak-test',
    summary: 'Sealed source leak test: the wipe activity and whether the source is leaking. Net counts per minute are converted to microcuries and becquerels and compared with 0.005 µCi (185 Bq); it gives the next test date at 6 months, or on a failure the report due within 5 days, and names the exemptions in 10 CFR 35.67(f). The counter efficiency is the reader\'s.',
    compute: SL.sealedSourceLeakTest,
    fields: [
      { dom: 'slt-exemption', arg: 'exemption', kind: 'enum', required: true, values: SL.EXEMPTIONS.map((e) => e.value), label: 'Exemption under 35.67(f)' },
      { dom: 'slt-cpm', arg: 'netCpm', kind: 'number', label: 'Net counts per minute on the wipe', unit: 'cpm' },
      { dom: 'slt-eff', arg: 'efficiencyPercent', kind: 'number', label: 'Counter efficiency', unit: '%' },
      { dom: 'slt-date', arg: 'testDate', kind: 'string', label: 'Date of the leak test (YYYY-MM-DD, optional)' },
    ],
  },
];
