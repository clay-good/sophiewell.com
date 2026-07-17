// spec-v368 MCP wave: adapter for the Ross classification of pediatric heart failure in
// lib/ross-hf-peds-v368.js. The dom key mirrors the browser renderer (views/group-v368.js) and
// META['ross-hf-peds'].example. `cls` is an enum (I/II/III/IV). The compute reports the Ross class and
// its symptom description. The example sets class III; its expected text is the class description (a
// roman numeral, no numeric facts), so it round-trips through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/ross-hf-peds-v368.js';

export default [
  {
    id: 'ross-hf-peds',
    summary: 'Ross classification (Ross 1992; modified 2012) of heart failure in infants and children (classes I-IV) — the pediatric functional classification of heart-failure severity, the pediatric counterpart to the adult NYHA class. I: no limitation or symptoms. II: mild tachypnea and/or diaphoresis with feeds in infants, or dyspnea on exertion in older children; no growth failure. III: marked tachypnea and/or diaphoresis with feeds or exertion, with prolonged feeding time and growth failure. IV: symptomatic at rest (tachypnea, retractions, grunting, and/or diaphoresis). Reports the class, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.rossHfPeds,
    fields: [
      { dom: 'ross-class', arg: 'cls', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Ross class' },
    ],
  },
];
