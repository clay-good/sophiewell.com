// spec-v810 MCP adapter: modified Mallampati class in lib/mallampati-v810.js.
// The dom key mirrors the browser renderer (views/group-v810.js) and META.mallampati.example.
// One enum in, one class plus its pooled test performance out. Clinical domain.

import { mallampati } from '../../lib/mallampati-v810.js';

export default [
  {
    id: 'mallampati',
    summary: 'Grades the oropharyngeal view on the four-class modified Mallampati scale. Returns the class and, with it, what the class is worth: pooled across 177,088 patients the score has a sensitivity of 0.35 and a specificity of 0.91 for difficult tracheal intubation, so about two thirds of difficult airways look reassuring on it. The meta-analysis found it inadequate as a stand-alone test.',
    compute: mallampati,
    fields: [
      {
        dom: 'mallampati-class',
        arg: 'mallampatiClass',
        kind: 'enum',
        required: true,
        label: 'What is visible',
        values: ['1', '2', '3', '4'],
      },
    ],
  },
];
