// spec-v1502 §6: MCP adapter for medicare-ffs-pa-required. The dom keys mirror views/group-v1502.js.

import * as MF from '../../lib/medicare-ffs-pa-required.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'medicare-ffs-pa-required',
    summary: 'Whether Original Medicare requires prior authorization for a code. The CMS outpatient, DMEPOS, ambulance, surgical center and WISeR lists, by setting, state and date of service.',
    compute: MF.medicareFfsPaRequired,
    fields: [
      { dom: 'mfpa-code', arg: 'code', kind: 'string', required: true, label: 'HCPCS or CPT code' },
      { dom: 'mfpa-setting', arg: 'setting', kind: 'enum', required: true, values: vals(MF.SETTINGS), label: 'Setting' },
      { dom: 'mfpa-state', arg: 'state', kind: 'enum', required: false, values: vals(MF.STATES), label: 'State where the service is furnished' },
      { dom: 'mfpa-dos', arg: 'serviceDate', kind: 'string', required: true, label: 'Date of service (YYYY-MM-DD)' },
    ],
  },
];
