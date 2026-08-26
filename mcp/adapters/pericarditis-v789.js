// spec-v789 MCP adapter: acute pericarditis criteria in lib/pericarditis-v789.js.
// The dom keys mirror the browser renderer (views/group-v789.js) and
// META['acute-pericarditis'].example. Four criteria booleans, two supporting booleans that
// deliberately do NOT count, and a course enum. Clinical domain.

import { pericarditis } from '../../lib/pericarditis-v789.js';

export default [
  {
    id: 'acute-pericarditis',
    summary: 'Acute pericarditis diagnostic criteria (Adler 2015): at least TWO of four - sharp pleuritic chest pain better sitting forward, pericardial friction rub, new widespread ST elevation or PR depression, new or worsening pericardial effusion. Raised inflammatory markers and inflammation on CT or cardiac MRI support the diagnosis but do NOT count toward the two. The course (acute, incessant, recurrent, chronic) is classified separately and does not change the count.',
    compute: pericarditis,
    fields: [
      { dom: 'per-pain', arg: 'chestPain', kind: 'boolean', required: false, label: 'Pleuritic chest pain' },
      { dom: 'per-rub', arg: 'frictionRub', kind: 'boolean', required: false, label: 'Pericardial friction rub' },
      { dom: 'per-ecg', arg: 'ecgChanges', kind: 'boolean', required: false, label: 'ST elevation or PR depression' },
      { dom: 'per-effusion', arg: 'effusion', kind: 'boolean', required: false, label: 'Pericardial effusion' },
      { dom: 'per-markers', arg: 'inflammatoryMarkers', kind: 'boolean', required: false, label: 'Raised markers (supporting)' },
      { dom: 'per-imaging', arg: 'imagingInflammation', kind: 'boolean', required: false, label: 'CT or MRI inflammation (supporting)' },
      { dom: 'per-course', arg: 'course', kind: 'enum', values: ['acute', 'incessant', 'recurrent', 'chronic'], required: false, label: 'Course over time' },
    ],
  },
];
