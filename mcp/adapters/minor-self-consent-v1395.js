// spec-v1395: MCP adapter. The dom keys mirror views/group-v1395.js and this tile's META example.

import * as MC from '../../lib/minor-self-consent-v1395.js';

export default [
  {
    id: 'minor-self-consent',
    summary: "Whether a minor may consent alone to a service in California or Texas, and under which section. California's Family Code lets a minor consent to pregnancy prevention and care at any age (6925), and from 12 to STI and reportable-disease care (6926), care after rape (6927), outpatient mental health if mature enough (6924), and substance use treatment (6929), and from 15 if living apart and self-supporting (6922). Texas Family Code 32.003 lets a child consent when on active duty, at 16 if living apart and self-supporting, for reportable infectious disease, for pregnancy care other than abortion, and for drug or chemical dependency. New York and New Jersey are not offered.",
    compute: MC.minorSelfConsent,
    fields: [
      { dom: 'msc-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: MC.MSC_STATES.map((s) => s.value) },
      { dom: 'msc-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'msc-service', arg: 'service', kind: 'enum', required: true, label: 'Service', values: MC.SERVICES.map((s) => s.value) },
      { dom: 'msc-apart', arg: 'livingApart', kind: 'enum', label: 'Living apart from parents', values: ['yes', 'no'] },
      { dom: 'msc-finances', arg: 'ownFinances', kind: 'enum', label: 'Managing own finances', values: ['yes', 'no'] },
      { dom: 'msc-mature', arg: 'mature', kind: 'enum', label: 'Mature enough (California mental health)', values: ['yes', 'no'] },
      { dom: 'msc-duty', arg: 'activeDuty', kind: 'enum', label: 'On active military duty (Texas)', values: ['yes', 'no'] },
    ],
  },
];
