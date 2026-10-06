// spec-v1563 MCP adapter: chikungunya-case-def in lib/chikungunya-case-def-v1563.js.
// The dom keys mirror views/group-v1563.js and META['chikungunya-case-def'].example. Clinical domain.

import * as M from '../../lib/chikungunya-case-def-v1563.js';

export default [
  {
    id: 'chikungunya-case-def',
    summary: 'Classifies a chikungunya case by the WHO/PAHO 2015 definitions: suspected, confirmed, atypical, severe acute, or suspected or confirmed chronic, for surveillance and reporting.',
    compute: M.chikungunyaCaseDef,
    fields: [
      { dom: 'ck-fever', arg: 'fever', kind: 'enum', label: 'Fever over 38.5 °C', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ck-joint', arg: 'joint', kind: 'enum', label: 'Joint pain of acute onset', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ck-epi', arg: 'epi', kind: 'enum', label: 'Lives in or visited an area with local transmission in the last 15 days', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ck-lab', arg: 'lab', kind: 'enum', label: 'Positive PCR, serology or culture', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ck-atyp', arg: 'atypical', kind: 'enum', label: 'Other organ manifestations (neurological, heart, skin, eye, liver, kidney, lung, blood)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ck-severe', arg: 'severe', kind: 'enum', label: 'Life-threatening organ dysfunction needing hospitalization', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ck-chronic', arg: 'chronic', kind: 'enum', label: 'Previous diagnosis with joint symptoms beyond 12 weeks', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
