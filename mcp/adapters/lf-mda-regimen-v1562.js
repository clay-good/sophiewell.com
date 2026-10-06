// spec-v1562 MCP adapter: lf-mda-regimen in lib/lf-mda-regimen-v1562.js.
// The dom keys mirror views/group-v1562.js and META['lf-mda-regimen'].example. Clinical domain.

import * as M from '../../lib/lf-mda-regimen-v1562.js';

export default [
  {
    id: 'lf-mda-regimen',
    summary: 'Picks the WHO 2017 filariasis mass treatment regimen for an area. DA, IDA, IA or twice-yearly albendazole by onchocerciasis and loiasis, and whether this person is eligible.',
    compute: M.lfMdaRegimen,
    fields: [
      { dom: 'lf-oncho', arg: 'oncho', kind: 'enum', required: true, label: 'Onchocerciasis endemic anywhere in the country', values: M.YES_NO.map((d) => d.value) },
      { dom: 'lf-loa', arg: 'loiasis', kind: 'enum', required: true, label: 'Loiasis co-endemic', values: M.YES_NO.map((d) => d.value) },
      { dom: 'lf-iver', arg: 'ivermectinGiven', kind: 'enum', label: 'Ivermectin already distributed here (onchocerciasis or LF)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'lf-status', arg: 'status', kind: 'enum', label: 'Program status (no onchocerciasis or loiasis)', values: M.STATUS_OPTIONS.map((d) => d.value) },
      { dom: 'lf-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'lf-height', arg: 'height', kind: 'number', label: 'Height in cm', min: 40, max: 230 },
      { dom: 'lf-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnancy', values: M.PREG_OPTIONS.map((d) => d.value) },
      { dom: 'lf-ill', arg: 'ill', kind: 'enum', label: 'Severely ill', values: M.YES_NO.map((d) => d.value) },
      { dom: 'lf-seiz', arg: 'seizures', kind: 'enum', label: 'History of seizures or neurocysticercosis', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
