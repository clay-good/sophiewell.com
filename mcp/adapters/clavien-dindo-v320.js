// spec-v320 MCP wave: adapter for the Clavien-Dindo classification of surgical
// complications in lib/clavien-dindo-v320.js. The dom key mirrors the browser renderer
// (views/group-v320.js) and META['clavien-dindo'].example. `grade` is an enum (I / II /
// IIIa / IIIb / IVa / IVb / V). The compute reports the grade and its standard definition.
// The example sets grade IIIa; its expected text is the grade definition (letter-graded,
// no numeric facts), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/clavien-dindo-v320.js';

export default [
  {
    id: 'clavien-dindo',
    summary: 'Clavien-Dindo classification of surgical complications (Dindo 2004, Ann Surg), graded by the therapy the complication required. I: no treatment beyond antiemetics/analgesics/electrolytes/physiotherapy. II: pharmacological treatment beyond grade I (incl. transfusion, TPN). IIIa: surgical/endoscopic/radiological intervention not under general anesthesia; IIIb: under general anesthesia. IVa: life-threatening, single-organ dysfunction (incl. dialysis); IVb: multiorgan dysfunction. V: death. Reports the grade the clinician has assigned, not a diagnosis or a management order.',
    compute: C.clavienDindo,
    fields: [
      { dom: 'cd-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'IIIa', 'IIIb', 'IVa', 'IVb', 'V'], label: 'Clavien-Dindo grade (therapy the complication required)' },
    ],
  },
];
