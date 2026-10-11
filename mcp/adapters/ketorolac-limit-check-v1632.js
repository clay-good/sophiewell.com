// spec-v1632 MCP adapter: ketorolac-limit-check in lib/ketorolac-limit-check-v1632.js. The dom keys
// mirror views/group-v1632.js and META['ketorolac-limit-check'].example. Clinical domain. Two label
// rows: ketorolac injection and ketorolac tablets.

import * as KT from '../../lib/ketorolac-limit-check-v1632.js';

export default [
  {
    id: 'ketorolac-limit-check',
    summary: 'The ketorolac dose and limits on the FDA labels. From age, weight, renal impairment and the route it reports the label dose for the patient group (the lower dose at 65 or over, renally impaired, or under 50 kg), the daily ceiling against what was given in the last 24 hours, and the 5-day combined limit against the days so far. Advanced renal impairment is reported as the contraindication it is.',
    compute: KT.ketorolacLimitCheck,
    fields: [
      { dom: 'ket-route', arg: 'route', kind: 'enum', required: true, values: KT.ROUTES.map((r) => r.value), label: 'Route and regimen' },
      { dom: 'ket-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ket-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'ket-renal', arg: 'renal', kind: 'enum', required: true, values: KT.RENAL.map((r) => r.value), label: 'Renal impairment: no, impaired or advanced' },
      { dom: 'ket-days', arg: 'daysSoFar', kind: 'number', required: true, label: 'Days of ketorolac so far, any route', unit: 'days' },
      { dom: 'ket-mg', arg: 'mg24h', kind: 'number', label: 'Ketorolac in the last 24 hours (multiple dose)', unit: 'mg' },
    ],
  },
];
