// spec-v670 MCP adapter: Ottawa Bowel Preparation Scale in lib/ottawa-bowel-prep-v670.js.
// The dom keys mirror the browser renderer (views/group-v670.js) and
// META['ottawa-bowel-prep'].example. Three segment-cleanliness enums (0-4) plus one
// fluid-quantity enum (0-2); summed to a total 0-14 where lower = better preparation.
// Clinical domain.

import { ottawaBowelPrep } from '../../lib/ottawa-bowel-prep-v670.js';

export default [
  {
    id: 'ottawa-bowel-prep',
    summary: 'Ottawa Bowel Preparation Scale for colonoscopy (Rostom 2004): cleanliness of 3 colon segments (right/ascending, mid, rectosigmoid), each 0 excellent to 4 inadequate, plus overall fluid quantity 0 small to 2 large, summed to 0-14. LOWER is better (0 = perfect prep, 14 = solid stool + large fluid). The original paper sets no fixed adequate/inadequate cutoff; a segment scored 3-4 has obscured mucosa. Companion to the Boston BBPS.',
    compute: ottawaBowelPrep,
    fields: [
      { dom: 'obps-right', arg: 'right', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Right/ascending colon cleanliness (0 excellent - 4 inadequate)' },
      { dom: 'obps-mid', arg: 'mid', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Mid colon (transverse + descending) cleanliness (0-4)' },
      { dom: 'obps-recto', arg: 'rectosigmoid', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Rectosigmoid cleanliness (0-4)' },
      { dom: 'obps-fluid', arg: 'fluid', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Overall fluid quantity (0 small, 1 moderate, 2 large)' },
    ],
  },
];
