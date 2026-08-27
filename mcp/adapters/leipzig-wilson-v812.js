// spec-v812 MCP adapter: Leipzig (Ferenci) Wilson disease score in lib/leipzig-wilson-v812.js.
// The dom keys mirror the browser renderer (views/group-v812.js) and
// META['leipzig-wilson'].example. Enum codes, not point values, because two urinary-copper
// options are both worth 2. Clinical domain.

import { leipzigWilson } from '../../lib/leipzig-wilson-v812.js';

export default [
  {
    id: 'leipzig-wilson',
    summary: 'Scores the Leipzig (Ferenci) system for diagnosing Wilson disease. 4 or more points establishes the diagnosis, exactly 3 makes it possible, 2 or fewer very unlikely. Two items behave unlike a plain checklist: a NORMAL quantitative liver copper scores minus 1 rather than zero, and rhodanine-positive granules are scored only when no quantitative liver copper is available, standing in for it rather than adding to it.',
    compute: leipzigWilson,
    fields: [
      { dom: 'lw-kf', arg: 'kfRings', kind: 'enum', required: false, label: 'Kayser-Fleischer rings', values: ['0', '1'] },
      { dom: 'lw-neuro', arg: 'neurologic', kind: 'enum', required: false, label: 'Neurologic symptoms or MRI changes', values: ['0', '1', '2'] },
      { dom: 'lw-cerulo', arg: 'ceruloplasmin', kind: 'enum', required: false, label: 'Serum ceruloplasmin', values: ['0', '1', '2'] },
      { dom: 'lw-hemolysis', arg: 'hemolysis', kind: 'enum', required: false, label: 'Coombs-negative hemolytic anemia', values: ['0', '1'] },
      { dom: 'lw-livercu', arg: 'liverCopper', kind: 'enum', required: false, label: 'Quantitative liver copper', values: ['na', '0', '1', '2'] },
      { dom: 'lw-rhodanine', arg: 'rhodanineGranules', kind: 'boolean', required: false, label: 'Rhodanine-positive granules' },
      { dom: 'lw-urinecu', arg: 'urinaryCopper', kind: 'enum', required: false, label: '24-hour urinary copper', values: ['0', '1', '2', '3'] },
      { dom: 'lw-mutation', arg: 'mutation', kind: 'enum', required: false, label: 'ATP7B mutation analysis', values: ['0', '1', '2'] },
    ],
  },
];
