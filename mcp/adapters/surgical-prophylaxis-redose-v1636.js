// spec-v1636 MCP adapter: surgical-prophylaxis-redose in lib/surgical-prophylaxis-redose-v1636.js. The dom keys
// mirror views/group-v1636.js and META['surgical-prophylaxis-redose'].example. Clinical domain.

import * as SP from '../../lib/surgical-prophylaxis-redose-v1636.js';

export default [
  {
    id: 'surgical-prophylaxis-redose',
    summary: 'The preoperative antibiotic dose by weight and when to redose it, from Table 1 of the 2013 ASHP/IDSA/SIS/SHEA guideline. It also checks the start against the 60-minute window (120 for vancomycin and fluoroquinolones).',
    compute: SP.surgicalProphylaxisRedose,
    fields: [
      { dom: 'spr-agent', arg: 'agent', kind: 'enum', values: SP.AGENTS.map((a) => a.value), required: true, label: 'Antimicrobial' },
      { dom: 'spr-patient', arg: 'patient', kind: 'enum', values: ['adult', 'child'], required: true, label: 'Adult or child' },
      { dom: 'spr-weight', arg: 'weightKg', kind: 'number', required: true, label: 'Actual weight', unit: 'kg' },
      { dom: 'spr-ibw', arg: 'ibwKg', kind: 'number', required: false, label: 'Ideal body weight (gentamicin only)', unit: 'kg' },
      { dom: 'spr-pip-age', arg: 'pipAge', kind: 'enum', values: ['infant', 'child'], required: false, label: 'Age band (piperacillin-tazobactam in a child)' },
      { dom: 'spr-start', arg: 'startTime', kind: 'string', required: false, label: 'Preoperative dose started (YYYY-MM-DDTHH:MM)' },
      { dom: 'spr-incision', arg: 'incisionTime', kind: 'string', required: false, label: 'Incision time (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
