// spec-v1633 MCP adapter: doac-periprocedural-timing in lib/doac-periprocedural-timing-v1633.js. The
// dom keys mirror views/group-v1633.js and META['doac-periprocedural-timing'].example. Clinical
// domain. Four label rows and the PAUSE protocol (Douketis 2019).

import * as DP from '../../lib/doac-periprocedural-timing-v1633.js';

export default [
  {
    id: 'doac-periprocedural-timing',
    summary: 'The last DOAC dose before a procedure and the first after, by the label and by the PAUSE protocol. From the drug, kidney function, bleeding risk and procedure time it gives the label\'s latest time for the last dose and the PAUSE calendar: last dose day, days omitted and the resumption day. Where PAUSE did not study the patient (edoxaban, children, a clearance below its floor) it says so. Bridging is not covered.',
    compute: DP.doacPeriproceduralTiming,
    fields: [
      { dom: 'dpt-drug', arg: 'drug', kind: 'enum', required: true, values: DP.DRUGS.map((d) => d.value), label: 'DOAC' },
      { dom: 'dpt-pop', arg: 'population', kind: 'enum', required: true, values: DP.POPULATIONS.map((d) => d.value), label: 'Adult or pediatric' },
      { dom: 'dpt-risk', arg: 'risk', kind: 'enum', required: true, values: DP.RISKS.map((d) => d.value), label: 'Bleeding risk of the procedure (your classification)' },
      { dom: 'dpt-source', arg: 'source', kind: 'enum', required: true, values: DP.SOURCES.map((d) => d.value), label: 'Source: both, label or pause' },
      { dom: 'dpt-when', arg: 'procedure', kind: 'string', required: true, label: 'Procedure date and time (YYYY-MM-DDTHH:MM)' },
      { dom: 'dpt-crcl', arg: 'crcl', kind: 'number', label: 'Creatinine clearance (dabigatran, and any drug under PAUSE; pediatric dabigatran: eGFR)', unit: 'mL/min' },
    ],
  },
];
