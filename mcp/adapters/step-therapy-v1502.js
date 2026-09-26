// spec-v1502: MCP adapter for the step therapy history builder. The dom keys mirror views/group-v1502.js.

import * as ST from '../../lib/step-therapy-v1502.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'step-therapy-history',
    summary: 'Whether a patient\'s drug history meets a plan\'s step therapy. Counts each trial against the steps entered and checks the Medicare Advantage Part B lookback.',
    compute: ST.stepTherapyHistory,
    fields: [
      { dom: 'st-steps', arg: 'steps', kind: 'string', required: true, label: 'Required steps, one per line: step name, number of agents, minimum days' },
      { dom: 'st-trials', arg: 'trials', kind: 'string', required: true, label: 'Drugs tried, one per line: drug, step, start date, stop date or "ongoing", reason (inadequate response, intolerance, contraindication, still taking)' },
      { dom: 'st-accepts', arg: 'acceptsIntolerance', kind: 'enum', required: false, values: vals(ST.YES_NO), label: 'Plan accepts intolerance or a contraindication in place of a full trial' },
      { dom: 'st-plan', arg: 'planType', kind: 'enum', required: false, values: vals(ST.PLAN_TYPES), label: 'Plan type' },
      { dom: 'st-request', arg: 'requestDate', kind: 'string', required: false, label: 'Request date (YYYY-MM-DD)' },
      { dom: 'st-lastclaim', arg: 'lastClaim', kind: 'string', required: false, label: 'Last claim for the requested drug (YYYY-MM-DD)' },
    ],
  },
];
