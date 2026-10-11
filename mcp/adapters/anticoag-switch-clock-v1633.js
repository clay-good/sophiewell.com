// spec-v1633 MCP adapter: anticoag-switch-clock in lib/anticoag-switch-clock-v1633.js. The dom keys
// mirror views/group-v1633.js and META['anticoag-switch-clock'].example. Clinical domain. Four label
// rows: Eliquis, Xarelto, Pradaxa and Savaysa.

import * as AS from '../../lib/anticoag-switch-clock-v1633.js';

export default [
  {
    id: 'anticoag-switch-clock',
    summary: 'When the next anticoagulant starts in a switch, as the DOAC labels state it. From warfarin it checks the INR against the threshold of the drug being started (each label has its own). To warfarin it gives the overlap or bridging plan of the drug being stopped. Between two other anticoagulants it gives each label\'s timing rule, as a date and time when the next or last dose time is supplied. It does not choose a dose.',
    compute: AS.anticoagSwitchClock,
    fields: [
      { dom: 'asc-from', arg: 'from', kind: 'enum', required: true, values: AS.DRUGS.map((d) => d.value), label: 'Anticoagulant being stopped' },
      { dom: 'asc-to', arg: 'to', kind: 'enum', required: true, values: AS.DRUGS.map((d) => d.value), label: 'Anticoagulant being started' },
      { dom: 'asc-pop', arg: 'population', kind: 'enum', required: true, values: AS.POPULATIONS.map((d) => d.value), label: 'Adult or pediatric' },
      { dom: 'asc-inr', arg: 'inr', kind: 'number', label: 'Current INR (when warfarin is being stopped)' },
      { dom: 'asc-crcl', arg: 'crcl', kind: 'number', label: 'Creatinine clearance (when dabigatran is being stopped; pediatric: eGFR in mL/min/1.73 m²)', unit: 'mL/min' },
      { dom: 'asc-edo-option', arg: 'edoxabanOption', kind: 'enum', values: AS.EDOXABAN_OPTIONS.map((d) => d.value), label: 'Edoxaban to warfarin: oral or parenteral option' },
      { dom: 'asc-edo-dose', arg: 'edoxabanDose', kind: 'enum', values: AS.EDOXABAN_DOSES.map((d) => d.value), label: 'Edoxaban to warfarin, oral option: current dose in mg' },
      { dom: 'asc-next', arg: 'nextDose', kind: 'string', label: 'Next scheduled dose of the drug being stopped (YYYY-MM-DDTHH:MM, optional)' },
      { dom: 'asc-last', arg: 'lastDose', kind: 'string', label: 'Last dose of dabigatran (YYYY-MM-DDTHH:MM, optional)' },
    ],
  },
];
