// spec-v1633 MCP adapter: methadone-label-conversion in lib/methadone-label-conversion-v1633.js. The
// dom keys mirror views/group-v1633.js and META['methadone-label-conversion'].example. Clinical
// domain. One label row (methadone tablets). One way: there is no conversion from methadone.

import * as ML from '../../lib/methadone-label-conversion-v1633.js';

export default [
  {
    id: 'methadone-label-conversion',
    summary: 'The estimated starting oral methadone dose from another oral opioid, by the FDA label\'s percentage table. From the total daily oral morphine equivalent, the doses per day and the tablet strength it reports the label\'s range (never one figure) and each dose rounded down to whole tablets, showing both rows where the label prints a value in two. It also applies the label\'s 1:2 ratio from parenteral to oral methadone. One way only.',
    compute: ML.methadoneLabelConversion,
    fields: [
      { dom: 'mlc-mode', arg: 'mode', kind: 'enum', required: true, values: ML.MODES.map((d) => d.value), label: 'Coming from: another oral opioid, or parenteral methadone' },
      { dom: 'mlc-med', arg: 'morphineEquivalentMg', kind: 'number', label: 'Total daily oral morphine-equivalent dose (from another oral opioid)', unit: 'mg' },
      { dom: 'mlc-n', arg: 'dosesPerDay', kind: 'number', label: 'Methadone doses a day (from another oral opioid)' },
      { dom: 'mlc-tab', arg: 'tabletMg', kind: 'enum', values: ML.TABLETS.map((d) => d.value), label: 'Tablet strength in mg (from another oral opioid)' },
      { dom: 'mlc-iv', arg: 'parenteralMg', kind: 'number', label: 'Parenteral methadone dose over 24 hours (from parenteral methadone)', unit: 'mg' },
    ],
  },
];
