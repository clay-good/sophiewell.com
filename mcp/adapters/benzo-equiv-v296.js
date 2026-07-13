// spec-v296 MCP wave: adapter for the benzodiazepine dose-equivalence converter
// in lib/benzo-equiv-v296.js. dom keys mirror the browser renderer
// (views/group-v296.js) and META['benzodiazepine-equivalence'].example.fields.
// Source, dose, and target all appear in the example, so all three are required;
// the `band` carries the "2 mg lorazepam ..." example, so it round-trips through
// the default makeToArgs with no custom toArgs.

import * as B from '../../lib/benzo-equiv-v296.js';

const AGENTS = ['alprazolam', 'chlordiazepoxide', 'clonazepam', 'clorazepate', 'diazepam', 'estazolam', 'flurazepam', 'lorazepam', 'oxazepam', 'quazepam', 'temazepam', 'triazolam'];

export default [
  {
    id: 'benzodiazepine-equivalence',
    summary: 'Benzodiazepine dose-equivalence converter for tapering: given a source benzodiazepine and daily dose (mg) and a target benzodiazepine, reports the approximate oral-diazepam equivalent and target-drug dose under BOTH the VA/DoD 2021 and Ashton 2002 systems (factors are mg approximately equal to 10 mg oral diazepam). Estimates only, shown side by side because the systems differ; a tapering planning aid, not a prescription.',
    compute: B.benzoEquivalence,
    fields: [
      { dom: 'bz-source', arg: 'source', kind: 'enum', required: true, values: AGENTS, label: 'Source benzodiazepine' },
      { dom: 'bz-dose', arg: 'dose', kind: 'number', required: true, label: 'Source dose', unit: 'mg' },
      { dom: 'bz-target', arg: 'target', kind: 'enum', required: true, values: AGENTS, label: 'Target benzodiazepine' },
    ],
  },
];
