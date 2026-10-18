// spec-v1634 MCP adapter: gerontonet-adr-risk in lib/gerontonet-adr-risk-v1634.js. The dom keys mirror
// views/group-v1634.js and META['gerontonet-adr-risk'].example. Clinical domain.

import * as GN from '../../lib/gerontonet-adr-risk-v1634.js';

const yn = GN.YES_NO.map((x) => x.value);
export default [
  {
    id: 'gerontonet-adr-risk',
    summary: 'GerontoNet ADR risk score for an inpatient 65 or older. It adds points for the number of drugs, a previous ADR, heart failure, liver disease, 4 or more conditions and renal failure (Onder 2010), with the cohort ADR rate at that score.',
    compute: GN.gerontonetAdrRisk,
    fields: [
      { dom: 'gn-drugs', arg: 'drugs', kind: 'number', required: true, label: 'Number of drugs' },
      { dom: 'gn-adr', arg: 'previousAdr', kind: 'enum', required: true, values: yn, label: 'Previous adverse drug reaction' },
      { dom: 'gn-com', arg: 'comorbidities', kind: 'enum', required: true, values: yn, label: '4 or more comorbid conditions' },
      { dom: 'gn-hf', arg: 'heartFailure', kind: 'enum', required: true, values: yn, label: 'Heart failure' },
      { dom: 'gn-liver', arg: 'liverDisease', kind: 'enum', required: true, values: yn, label: 'Liver disease' },
      { dom: 'gn-renal', arg: 'renalFailure', kind: 'enum', required: true, values: yn, label: 'Renal failure (GFR under 60 mL/min)' },
    ],
  },
];
