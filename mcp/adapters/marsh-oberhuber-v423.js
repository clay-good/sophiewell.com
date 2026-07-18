// spec-v423 MCP wave: adapter for the Marsh-Oberhuber classification in lib/marsh-oberhuber-v423.js. The dom
// key mirrors the browser renderer (views/group-v423.js) and META['marsh-oberhuber'].example. `type` is an
// enum (0/1/2/3a/3b/3c). The compute reports the type and its histologic description. The example sets type
// 3a; its expected text carries no numeric facts beyond the type label (the description is word-only), so it
// flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/marsh-oberhuber-v423.js';

export default [
  {
    id: 'marsh-oberhuber',
    summary: 'Modified Marsh (Marsh-Oberhuber) classification of the duodenal histology in celiac disease, by the intraepithelial-lymphocyte infiltrate, crypt architecture, and villous atrophy, types 0/1/2/3a/3b/3c. 0: preinfiltrative (normal). 1: infiltrative (increased IELs, normal villi). 2: hyperplastic (increased IELs + crypt hyperplasia). 3a: partial villous atrophy. 3b: subtotal. 3c: total. Reports the histologic type, not a diagnosis of celiac disease, a treatment decision, or a prognosis.',
    compute: C.marshOberhuber,
    fields: [
      { dom: 'mo-type', arg: 'type', kind: 'enum', values: ['0', '1', '2', '3a', '3b', '3c'], label: 'Marsh-Oberhuber type' },
    ],
  },
];
