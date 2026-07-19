// spec-v475 MCP wave: adapter for the Glogau photoaging classification in lib/glogau-photoaging-v475.js. The
// dom key mirrors the browser renderer (views/group-v475.js) and META['glogau-photoaging'].example. `type` is
// an enum (I..IV). The compute reports the type and its photoaging-severity description. The example sets type
// II; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/glogau-photoaging-v475.js';

export default [
  {
    id: 'glogau-photoaging',
    summary: 'The Glogau classification of photoaging, by the severity of wrinkles, keratoses, and dyschromia, types I/II/III/IV. I: no wrinkles (early photoaging). II: wrinkles in motion (dynamic). III: wrinkles at rest (static). IV: only wrinkles (severe photoaging). Reports the photoaging type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.glogauPhotoaging,
    fields: [
      { dom: 'glogau-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Glogau type' },
    ],
  },
];
