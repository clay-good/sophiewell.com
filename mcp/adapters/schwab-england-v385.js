// spec-v385 MCP wave: adapter for the Schwab & England ADL scale in lib/schwab-england-v385.js. The dom
// key mirrors the browser renderer (views/group-v385.js) and META['schwab-england'].example. `percent`
// is a number-like enum (0-100 in steps of 10). The compute reports the level and its functional
// description. The example sets 50; its expected text quotes "50%" and "half", both echoed in the band,
// so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/schwab-england-v385.js';

export default [
  {
    id: 'schwab-england',
    summary: 'Schwab & England Activities of Daily Living (ADL) scale (0-100%, in 10% steps; Schwab 1969) - a global measure of functional independence widely used in Parkinson disease. 100%: completely independent, essentially normal, unaware of difficulty. 80%: completely independent in most chores, takes twice as long. 60%: some dependency; most chores exceedingly slowly and with much effort. 50%: more dependent; needs help with half of chores. 20%: nothing alone; a slight help with some chores; severe invalid. 0%: vegetative functions (swallowing, bladder, bowel) not working; bedridden. A functional-status descriptor, not a measure of pathology. Reports the level, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.schwabEngland,
    fields: [
      { dom: 'se-percent', arg: 'percent', kind: 'enum', values: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], label: 'Schwab & England level (%)' },
    ],
  },
];
