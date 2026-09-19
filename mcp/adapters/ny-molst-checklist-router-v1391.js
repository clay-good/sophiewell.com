// spec-v1391: MCP adapter. The dom keys mirror views/group-v1391.js and this tile's META example.
// A blank answer is "not answered", never "no".

import * as MOLST from '../../lib/ny-molst-checklist-router-v1391.js';

export default [
  {
    id: 'ny-molst-checklist-router',
    summary: 'Picks the New York MOLST legal requirements checklist for a patient: #1 to #5 for adults by capacity, proxy, surrogate, and setting, #6 for minors, or the OPWDD checklist. The OPWDD checklist is for a person of any age with a developmental disability who lacks capacity and has no proxy. It must always be attached. It follows the Department of Health\'s MOLST page as revised in June 2025.',
    compute: MOLST.nyMolstChecklistRouter,
    fields: [
      { dom: 'molst-age', arg: 'age', kind: 'enum', required: true, label: 'Adult or minor', values: MOLST.AGES.map((a) => a.value) },
      { dom: 'molst-dd', arg: 'dd', kind: 'enum', required: true, label: 'Intellectual or developmental disability', values: ['yes', 'no'] },
      { dom: 'molst-capacity', arg: 'capacity', kind: 'enum', label: 'Has decision-making capacity (adult)', values: ['yes', 'no'] },
      { dom: 'molst-proxy', arg: 'proxy', kind: 'enum', label: 'Has a health care proxy', values: ['yes', 'no'] },
      { dom: 'molst-setting', arg: 'setting', kind: 'enum', label: 'Setting', values: MOLST.SETTINGS.map((s) => s.value) },
      { dom: 'molst-surrogate', arg: 'surrogate', kind: 'enum', label: 'An FHCDA surrogate is available', values: ['yes', 'no'] },
    ],
  },
];
