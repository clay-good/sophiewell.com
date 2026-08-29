// spec-v863 MCP adapter: the CDC blood lead reference value in lib/lead-v863.js. The dom keys
// mirror the browser renderer (views/group-v863.js) and META['blood-lead'].example.
//
// The sample type never changes the band. It selects the confirmation warning. Clinical domain.

import { bloodLead } from '../../lib/lead-v863.js';

export default [
  {
    id: 'blood-lead',
    summary: 'Reads a blood lead level against the CDC blood lead reference value. THE REFERENCE VALUE IS 3.5 MICROGRAMS PER DECILITER, lowered from 5 in 2021, so a result read against the old line leaves every child between 3.5 and 5 looking normal. IT IS NOT A SAFE LEVEL AND NOT A TREATMENT THRESHOLD: it is the 97.5th percentile of the blood lead distribution among young children in the United States, no level of lead in blood is known to be without effect, and at or above it the response is to find and remove the source rather than to give a drug. Chelation is considered at 45 and above, and 70 and above is a medical emergency. A CAPILLARY RESULT IS NOT A DIAGNOSIS — lead on the skin contaminates a fingerstick, so an elevated one is confirmed venous first. It does not schedule confirmatory testing or choose a chelating agent.',
    compute: bloodLead,
    fields: [
      { dom: 'bl-level', arg: 'level', kind: 'number', required: true, label: 'Blood lead level', unit: 'micrograms per deciliter' },
      { dom: 'bl-sample', arg: 'sample', kind: 'enum', values: ['', 'venous', 'capillary'], required: false, label: 'Sample type' },
    ],
  },
];
