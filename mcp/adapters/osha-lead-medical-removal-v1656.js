// spec-v1656 MCP adapter: osha-lead-medical-removal in lib/osha-lead-medical-removal-v1656.js. The dom keys
// mirror views/group-v1656.js and META['osha-lead-medical-removal'].example.

import * as OLM from '../../lib/osha-lead-medical-removal-v1656.js';

export default [
  {
    id: 'osha-lead-medical-removal',
    summary: 'When the next blood lead test is due under OSHA\'s lead standard, whether medical removal is required, and whether return is met. From dated results in µg/100 g, per 29 CFR 1910.1025(j) and (k).',
    compute: OLM.oshaLeadMedicalRemoval,
    fields: [
      { dom: 'olm-results', arg: 'results', kind: 'string', required: true, label: 'Blood lead results, one per line: YYYY-MM-DD, result in µg/100 g' },
      { dom: 'olm-followup', arg: 'lastIsFollowUp', kind: 'enum', values: ['yes', 'no'], required: false, label: 'The last result is the follow-up test of the one before it' },
      { dom: 'olm-removed', arg: 'currentlyRemoved', kind: 'enum', values: ['yes', 'no'], required: false, label: 'Currently removed for an elevated blood lead' },
    ]
  },
];
