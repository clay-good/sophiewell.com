// spec-v1633 MCP adapter: basal-insulin-switch in lib/basal-insulin-switch-v1633.js. The dom keys
// mirror views/group-v1633.js and META['basal-insulin-switch'].example. Clinical domain. Four label
// rows: Lantus, Basaglar, Toujeo and Tresiba.

import * as BI from '../../lib/basal-insulin-switch-v1633.js';

export default [
  {
    id: 'basal-insulin-switch',
    summary: 'The starting dose when one basal insulin replaces another, from the label of the insulin being started. For Lantus, Basaglar, Toujeo or Tresiba it reports the same dose or 80% of the total, by the insulin being stopped, once or twice daily dosing, and (for Tresiba) adult or pediatric. Where the target label gives no figure for the pair it says so. Fractions are rounded down to a whole unit and the result says that is the tool\'s convention.',
    compute: BI.basalInsulinSwitch,
    fields: [
      { dom: 'bis-to', arg: 'to', kind: 'enum', required: true, values: BI.TARGETS.map((d) => d.value), label: 'Basal insulin being started' },
      { dom: 'bis-from', arg: 'from', kind: 'enum', required: true, values: BI.SOURCES.map((d) => d.value), label: 'Basal insulin being stopped' },
      { dom: 'bis-freq', arg: 'frequency', kind: 'enum', required: true, values: BI.FREQUENCIES.map((d) => d.value), label: 'Current basal insulin taken once or twice daily' },
      { dom: 'bis-units', arg: 'totalUnits', kind: 'number', required: true, label: 'Current total daily basal dose', unit: 'units' },
      { dom: 'bis-pop', arg: 'population', kind: 'enum', values: BI.POPULATIONS.map((d) => d.value), label: 'Adult or pediatric (Tresiba)' },
    ],
  },
];
