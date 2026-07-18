// spec-v426 MCP wave: adapter for the Gell and Coombs hypersensitivity classification in
// lib/gell-coombs-v426.js. The dom key mirrors the browser renderer (views/group-v426.js) and
// META['gell-coombs'].example. `type` is an enum (I..IV). The compute reports the type and its mechanism. The
// example sets type I; its expected text carries no numeric facts (the mechanism is word-only), so it flows
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/gell-coombs-v426.js';

export default [
  {
    id: 'gell-coombs',
    summary: 'The Gell and Coombs classification of hypersensitivity reactions, the classic grouping by immune mechanism, types I/II/III/IV. I: immediate, IgE-mediated (anaphylaxis, atopy). II: antibody-mediated cytotoxic, IgG/IgM (autoimmune hemolytic anemia, Goodpasture). III: immune-complex-mediated (serum sickness, SLE). IV: delayed, cell-mediated / T-cell (contact dermatitis, tuberculin reaction). Reports the mechanism type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.gellCoombs,
    fields: [
      { dom: 'gc-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Gell and Coombs hypersensitivity type' },
    ],
  },
];
