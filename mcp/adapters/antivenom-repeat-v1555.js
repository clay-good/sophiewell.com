// spec-v1555 MCP adapter: antivenom-repeat in lib/antivenom-repeat-v1555.js.
// The dom keys mirror views/group-v1555b.js and META['antivenom-repeat'].example. Clinical domain.

import * as M from '../../lib/antivenom-repeat-v1555.js';

export default [
  {
    id: 'antivenom-repeat',
    summary: 'Says whether and when to repeat antivenom after a snakebite. WHO SEARO, AFRO or India: the 6-hour clotting rule, bleeding and neurotoxic timings, and India\'s regimens with its 20- and 30-vial limits.',
    compute: M.antivenomRepeat,
    fields: [
      { dom: 'ar-protocol', arg: 'protocol', kind: 'enum', required: true, label: 'Protocol', values: M.PROTOCOL_OPTIONS.map((d) => d.value) },
      { dom: 'ar-regimen', arg: 'regimen', kind: 'enum', label: 'India regimen', values: M.REGIMEN_OPTIONS.map((d) => d.value) },
      { dom: 'ar-dose', arg: 'dose', kind: 'number', label: 'Initial dose in vials (product insert or national protocol; India mode sets its own)', min: 1, max: 100 },
      { dom: 'ar-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours since the initial dose ended', min: 0, max: 48 },
      { dom: 'ar-wbct', arg: 'wbct', kind: 'enum', required: true, label: '20WBCT now', values: M.WBCT_OPTIONS.map((d) => d.value) },
      { dom: 'ar-bleeding', arg: 'bleeding', kind: 'enum', required: true, label: 'Still bleeding briskly', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ar-neuro', arg: 'neuro', kind: 'enum', required: true, label: 'Neurotoxic or cardiovascular signs', values: M.NEURO_OPTIONS.map((d) => d.value) },
      { dom: 'ar-vent', arg: 'ventilated', kind: 'enum', required: true, label: 'Paralyzed and on a ventilator', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ar-given', arg: 'given', kind: 'number', label: 'Vials given so far (checked against India\'s limits)', min: 0, max: 200 },
    ],
  },
];
