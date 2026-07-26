// spec-v464 MCP wave: adapter for the Crawford TAAA classification in lib/crawford-taaa-v464.js. The dom key
// mirrors the browser renderer (views/group-v464.js) and META['crawford-taaa'].example. `extent` is an enum
// (I..IV). The compute reports the extent and its aortic-segment description. The example sets extent II; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/crawford-taaa-v464.js';

export default [
  {
    id: 'crawford-taaa',
    summary: 'The Crawford classification of thoracoabdominal aortic aneurysms, by the extent of aortic involvement, extents I/II/III/IV. I: left subclavian to above the renals. II: left subclavian to the aortoiliac bifurcation (most extensive). III: distal descending thoracic (sixth intercostal space) to below the renals. IV: the entire abdominal aorta. Reports the anatomic extent, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.crawfordTaaa,
    fields: [
      { dom: 'crawford-extent', arg: 'extent', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Crawford extent' },
    ],
  },
];
