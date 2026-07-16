// spec-v329 MCP wave: adapter for the Paris endoscopic classification in
// lib/paris-classification-v329.js. The dom key mirrors the browser renderer
// (views/group-v329.js) and META['paris-classification'].example. `type` is an enum (0-Ip,
// 0-Is, 0-IIa, 0-IIb, 0-IIc, 0-III). The compute reports the type and its description. The
// example sets 0-IIc; its expected text carries the "0" from the type code, so it round-trips
// through the default makeToArgs with no custom toArgs.

import * as P from '../../lib/paris-classification-v329.js';

export default [
  {
    id: 'paris-classification',
    summary: 'Paris endoscopic classification of superficial neoplastic lesions (esophagus, stomach, colon; 2002/2005). 0-Ip: protruded, pedunculated. 0-Is: protruded, sessile. 0-IIa: non-protruding, slightly elevated. 0-IIb: completely flat. 0-IIc: slightly depressed. 0-III: excavated (ulcerated). Depressed (0-IIc) and excavated (0-III) lesions carry a higher risk of submucosal invasion. Reports the morphologic type, not a diagnosis or a treatment order.',
    compute: P.parisClassification,
    fields: [
      { dom: 'paris-type', arg: 'type', kind: 'enum', values: ['0-Ip', '0-Is', '0-IIa', '0-IIb', '0-IIc', '0-III'], label: 'Paris morphologic type' },
    ],
  },
];
