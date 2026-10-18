// spec-v1634 MCP adapter: hartwig-adr-severity in lib/hartwig-adr-severity-v1634.js. The dom keys mirror
// views/group-v1634.js and META['hartwig-adr-severity'].example. Clinical domain.

import * as HW from '../../lib/hartwig-adr-severity-v1634.js';

const yn = HW.YES_NO.map((x) => x.value);
export default [
  {
    id: 'hartwig-adr-severity',
    summary: 'Severity level 1 to 7 of an adverse drug reaction (Hartwig and Siegel), with its band. From whether the drug was changed, treatment was needed, the stay was longer or the reaction caused the admission, intensive care, permanent harm or death.',
    compute: HW.hartwigAdrSeverity,
    fields: [
      { dom: 'hw-death', arg: 'death', kind: 'enum', required: true, values: yn, label: 'Led directly or indirectly to death' },
      { dom: 'hw-harm', arg: 'permanentHarm', kind: 'enum', required: true, values: yn, label: 'Caused permanent harm' },
      { dom: 'hw-icu', arg: 'intensiveCare', kind: 'enum', required: true, values: yn, label: 'Needed intensive medical care' },
      { dom: 'hw-stay', arg: 'longerStay', kind: 'enum', required: true, values: yn, label: 'Added at least 1 day to the stay' },
      { dom: 'hw-adm', arg: 'admission', kind: 'enum', required: true, values: yn, label: 'Was the reason for admission' },
      { dom: 'hw-chg', arg: 'drugChanged', kind: 'enum', required: true, values: yn, label: 'Suspected drug held, stopped or changed' },
      { dom: 'hw-tx', arg: 'treatment', kind: 'enum', required: true, values: yn, label: 'Antidote or other treatment needed' },
    ],
  },
];
