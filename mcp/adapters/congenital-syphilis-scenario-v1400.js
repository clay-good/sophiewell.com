// spec-v1400: MCP adapter. The dom keys mirror views/group-v1400.js and this tile's META example.

import * as CS from '../../lib/congenital-syphilis-scenario-v1400.js';

export default [
  {
    id: 'congenital-syphilis-scenario',
    summary: "CDC 2021 congenital syphilis scenario, evaluation, and penicillin dose for a newborn whose mother has reactive syphilis serology. Scenario 1 (proven or highly probable): an exam consistent with congenital syphilis, an infant nontreponemal titer fourfold or more above the mother's, or a positive darkfield or PCR. Scenario 2 (possible): the mother untreated, inadequately treated, treated with a non-penicillin regimen, or treated LESS THAN 30 days before delivery. Scenario 3 (less likely): penicillin appropriate for stage begun 30 or more days before delivery with no reinfection. Scenario 4 (unlikely): adequate treatment before pregnancy with a low, stable maternal titer. The days are computed from the treatment start and delivery dates, because the 30-day cut is what separates Scenario 3 from Scenario 2.",
    compute: CS.congenitalSyphilisScenario,
    fields: [
      { dom: 'cs-exam', arg: 'exam', kind: 'enum', required: true, label: 'Infant physical exam', values: CS.EXAM.map((a) => a.value) },
      { dom: 'cs-direct', arg: 'direct', kind: 'enum', label: 'Darkfield or PCR positive', values: CS.DIRECT.map((a) => a.value) },
      { dom: 'cs-infant', arg: 'infantTiter', kind: 'number', label: 'Infant nontreponemal titer, the number after 1: (0 if nonreactive)' },
      { dom: 'cs-maternal', arg: 'maternalTiter', kind: 'number', label: 'Maternal nontreponemal titer at delivery, the number after 1:' },
      { dom: 'cs-treatment', arg: 'maternalTreatment', kind: 'enum', label: 'Maternal treatment', values: CS.MATERNAL_TREATMENT.map((a) => a.value) },
      { dom: 'cs-start', arg: 'treatmentStart', kind: 'string', label: 'Date maternal treatment began (YYYY-MM-DD)' },
      { dom: 'cs-delivery', arg: 'delivery', kind: 'string', label: 'Delivery date (YYYY-MM-DD)' },
      { dom: 'cs-reinfection', arg: 'reinfection', kind: 'enum', label: 'Maternal evidence of reinfection or relapse', values: ['yes', 'no'] },
      { dom: 'cs-lowstable', arg: 'maternalLowStable', kind: 'enum', label: 'Maternal titer low and stable, if treated before pregnancy', values: ['yes', 'no'] },
      { dom: 'cs-weight', arg: 'weightKg', kind: 'number', label: 'Infant weight (kg)' },
    ],
  },
];
