// spec-v352 MCP wave: adapter for the Lansky Play-Performance Scale in lib/lansky-v352.js. The dom key
// mirrors the browser renderer (views/group-v352.js) and META['lansky'].example. `score` is an enum of
// the eleven valid steps (0/10/.../100). The compute reports the Lansky score, its play/activity
// description, and its coarse functional band. The example sets score 60; its expected numbers (60)
// round-trip through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/lansky-v352.js';

export default [
  {
    id: 'lansky',
    summary: 'Lansky Play-Performance Scale (Lansky et al. 1987) — the observer-rated pediatric functional-status scale (0-100 in steps of 10), the pediatric counterpart to the adult Karnofsky Performance Status. 80-100: able to carry on normal activity (100 fully active; 90 minor strenuous-activity limits; 80 tires more quickly). 50-70: reduced activity but up and about (70 less play; 60 minimal active play; 50 dressed but lies around, quiet play only). 0-40: mostly bedbound / disabled (40 mostly in bed; 30 needs assistance; 20 very passive; 10 no play, does not get out of bed; 0 unresponsive). Reports the score, not a diagnosis, a treatment/eligibility decision, or a prognosis.',
    compute: C.lansky,
    fields: [
      { dom: 'lansky-score', arg: 'score', kind: 'enum', values: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], label: 'Lansky score' },
    ],
  },
];
