// spec-v1391: MCP adapter. The dom keys mirror views/group-v1391.js and this tile's META example.
// A blank answer is "not answered", never "no".

import * as HCP from '../../lib/ny-health-care-proxy-check-v1391.js';

export default [
  {
    id: 'ny-health-care-proxy-check',
    summary: 'Checks a New York health care proxy\'s execution against Public Health Law 2981 and names each defect. It needs the principal\'s signature and date and two adult witnesses, and the agent may not be one of them. Facility staff may not be the agent unless related, and OMH and OPWDD residents need an unaffiliated witness plus a psychiatric or OPWDD-qualified clinician witness where the section requires one.',
    compute: HCP.nyHealthCareProxyCheck,
    fields: [
      { dom: 'hcp-facility', arg: 'facility', kind: 'enum', required: true, label: 'Where the principal lives or is treated', values: HCP.FACILITIES.map((f) => f.value) },
      { dom: 'hcp-signed', arg: 'signedDated', kind: 'enum', required: true, label: 'Principal signed and dated it', values: ['yes', 'no'] },
      { dom: 'hcp-witnesses', arg: 'twoWitnesses', kind: 'enum', required: true, label: 'Two adult witnesses signed it', values: ['yes', 'no'] },
      { dom: 'hcp-agent-witness', arg: 'agentWitnessed', kind: 'enum', required: true, label: 'The agent signed as a witness', values: ['yes', 'no'] },
      { dom: 'hcp-role', arg: 'agentRole', kind: 'enum', label: 'The agent\'s tie to the facility', values: HCP.AGENT_ROLES.map((r) => r.value) },
      { dom: 'hcp-related', arg: 'related', kind: 'enum', label: 'Agent related by blood, marriage, or adoption', values: ['yes', 'no'] },
      { dom: 'hcp-unaffiliated', arg: 'unaffiliated', kind: 'enum', label: 'A witness is unaffiliated with the facility', values: ['yes', 'no'] },
      { dom: 'hcp-psych', arg: 'psychWitness', kind: 'enum', label: 'A witness is a psychiatrist or psychiatric NP', values: ['yes', 'no'] },
      { dom: 'hcp-opwdd', arg: 'opwddClinician', kind: 'enum', label: 'A witness meets the OPWDD clinician criteria', values: ['yes', 'no'] },
    ],
  },
];
