// spec-v1636 MCP adapter: cdi-labid-category in lib/cdi-labid-category-v1636.js. The dom keys mirror
// views/group-v1636.js and META['cdi-labid-category'].example. Administrative domain (surveillance).

import * as CL from '../../lib/cdi-labid-category-v1636.js';

export default [
  {
    id: 'cdi-labid-category',
    summary: 'C. difficile LabID event category under the CDC NHSN protocol: duplicate or event, onset (community-onset, community-onset healthcare facility-associated, or healthcare facility-onset), and incident, recurrent or unassigned, with the day numbers that decided each. The earlier specimen\'s date is day 1, as the protocol states. An optional panel gives events per 10,000 patient days.',
    compute: (args) => CL.cdiLabidCategory(args),
    fields: [
      { dom: 'clc-specimen', arg: 'specimenDate', kind: 'string', required: true, label: 'Specimen collection date (YYYY-MM-DD)' },
      { dom: 'clc-location', arg: 'location', kind: 'enum', required: true, values: CL.LOCATIONS.map((x) => x.value), label: 'Where the specimen was collected' },
      { dom: 'clc-admission', arg: 'admissionDate', kind: 'string', label: 'Admission date (YYYY-MM-DD; inpatient specimens)' },
      { dom: 'clc-discharge-had', arg: 'priorDischarge', kind: 'enum', required: true, values: CL.DISCHARGES.map((x) => x.value), label: 'Earlier inpatient discharge from this facility' },
      { dom: 'clc-discharge', arg: 'dischargeDate', kind: 'string', label: 'Date of that discharge (YYYY-MM-DD)' },
      { dom: 'clc-prior-had', arg: 'priorPositive', kind: 'enum', required: true, values: CL.PRIORS.map((x) => x.value), label: 'Previous C. difficile positive' },
      { dom: 'clc-prior', arg: 'priorPositiveDate', kind: 'string', label: 'Collection date of the most recent previous positive (YYYY-MM-DD)' },
      { dom: 'clc-events', arg: 'events', kind: 'number', label: 'Rate panel: number of events (optional)' },
      { dom: 'clc-days', arg: 'patientDays', kind: 'number', label: 'Rate panel: patient days (optional)' },
    ],
  },
];
