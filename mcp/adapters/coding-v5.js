// spec-v629 wave 8: adapters for the coding calculators (non-clinical /
// administrative). em-time and ndc-convert live in lib/coding-v5.js; em-mdm lives
// in lib/ops-v63.js. No money math, so no withUsd.

import * as C from '../../lib/coding-v5.js';
import * as O from '../../lib/ops-v63.js';

export default [
  {
    id: 'em-time',
    summary: 'Time-based E&M level (AMA 2021): total time and encounter type mapped to the office/outpatient code, with any prolonged-service units.',
    compute: C.emTimeSelector,
    fields: [
      { dom: 'enc', arg: 'encounterType', kind: 'string', required: true, label: 'Encounter type: new or established' },
      { dom: 't', arg: 'totalMinutes', kind: 'number', required: true, label: 'Total time in minutes' },
    ],
  },
  {
    id: 'em-mdm',
    summary: 'E&M level by medical decision making: the level from the two-of-three highest of problems, data, and risk, with the new/established codes.',
    compute: O.emMdm,
    fields: [
      { dom: 'mdm-prob', arg: 'problems', kind: 'number', required: true, label: 'Problems level (1 to 4)', values: ['2', '3', '4', '5'] },
      { dom: 'mdm-data', arg: 'data', kind: 'number', required: true, label: 'Data level (1 to 4)', values: ['2', '3', '4', '5'] },
      { dom: 'mdm-risk', arg: 'risk', kind: 'number', required: true, label: 'Risk level (1 to 4)', values: ['2', '3', '4', '5'] },
    ],
  },
  {
    id: 'ndc-convert',
    summary: 'Convert an NDC between the 10-digit FDA form and the 11-digit billing (5-4-2) form, inferring the original segment layout.',
    compute: C.ndcConvert,
    // ndcConvert takes the NDC string directly (via parseNdc), not an args object.
    toArgs: (i) => i.n,
    fields: [
      { dom: 'n', arg: 'ndc', kind: 'string', required: true, label: 'NDC in any hyphenated form, e.g. 1234-5678-90' },
    ],
  },
];
