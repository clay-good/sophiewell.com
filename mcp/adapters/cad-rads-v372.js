// spec-v372 MCP wave: adapter for the CAD-RADS 2.0 coronary-CTA categories in lib/cad-rads-v372.js. The
// dom key mirrors the browser renderer (views/group-v372.js) and META['cad-rads'].example. `category` is
// an enum (0/1/2/3/4A/4B/5). The compute reports the CAD-RADS category and its stenosis description. The
// example sets 3; its expected numbers (50-69) are the stenosis band echoed in the compute band, so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/cad-rads-v372.js';

export default [
  {
    id: 'cad-rads',
    summary: 'CAD-RADS 2.0 (Cury 2022) coronary-CT-angiography categories by maximal coronary stenosis, extending the RADS family. 0: 0% (no plaque). 1: 1-24% minimal (non-obstructive). 2: 25-49% mild (non-obstructive). 3: 50-69% moderate (obstructive). 4A: 70-99% severe. 4B: left main stenosis of 50% or more, or three-vessel obstructive (>= 70%) disease. 5: 100% total coronary occlusion. Categories 3 and above are obstructive. The modifiers (N/S/G/HRP/I/E) and the plaque-burden P-score are out of scope. Reports the category, not a diagnosis, a management order, or a prognosis.',
    compute: C.cadRads,
    fields: [
      { dom: 'cadrads-cat', arg: 'category', kind: 'enum', values: ['0', '1', '2', '3', '4A', '4B', '5'], label: 'CAD-RADS category' },
    ],
  },
];
