// spec-v784 MCP adapter: Griffith algorithm in lib/griffith-vt-v784.js.
// The dom keys mirror the browser renderer (views/group-v784.js) and META['griffith-vt'].example.
// A pattern enum plus the morphology booleans for both branches; only the chosen branch is
// evaluated. Clinical domain.

import { griffithVt } from '../../lib/griffith-vt-v784.js';

export default [
  {
    id: 'griffith-vt',
    summary: 'Griffith algorithm (Lancet 1994) for wide-complex tachycardia. It is inverted relative to Brugada and Vereckei: VT is the DEFAULT, and SVT with aberrancy is called only when the QRS is a textbook bundle branch block. Right bundle needs rSR-prime in V1 plus an RS in V6 with R taller than S; left bundle needs rS or QS in V1 and V2, delay to S nadir under 70 ms, and an R with no Q in V6. Sensitivity for VT approx 94%, specificity approx 40%, so VT here is a safe default rather than a positive finding.',
    compute: griffithVt,
    fields: [
      { dom: 'grif-pattern', arg: 'pattern', kind: 'enum', values: ['rbbb', 'lbbb'], required: false, label: 'Bundle branch pattern' },
      { dom: 'grif-rsr', arg: 'rsrV1', kind: 'boolean', required: false, label: 'rSR prime in V1 (right bundle)' },
      { dom: 'grif-v6rs', arg: 'rsV6RTaller', kind: 'boolean', required: false, label: 'RS in V6, R taller than S (right bundle)' },
      { dom: 'grif-rsqs', arg: 'rsOrQsV1V2', kind: 'boolean', required: false, label: 'rS or QS in V1 and V2 (left bundle)' },
      { dom: 'grif-nadir', arg: 'nadirUnder70', kind: 'boolean', required: false, label: 'S nadir under 70 ms (left bundle)' },
      { dom: 'grif-v6r', arg: 'rNoQV6', kind: 'boolean', required: false, label: 'R with no Q in V6 (left bundle)' },
    ],
  },
];
