// spec-v1393: MCP adapter. The dom keys mirror views/group-v1393.js and this tile's META example.

import * as PMP from '../../lib/pmp-check-required-v1393.js';

export default [
  {
    id: 'pmp-check-required',
    summary: "Whether a prescription monitoring program check is required first, in New York, New Jersey, California, or Texas. New York (Public Health Law 3343-a, I-STOP) and California (Health and Safety Code 11165.4, CURES) require a check before Schedule II, III, and IV, California at least every six months while renewed. New Jersey (N.J.A.C. 13:45A-35.9) requires one for the first Schedule II or opioid prescription for pain, the first Schedule III or IV benzodiazepine, every three months while continuing, and every emergency-department Schedule II for pain. Texas (481.0764) requires one by drug class: opioids, benzodiazepines, barbiturates, and carisoprodol. Each state's exemptions are named, with the note the record needs.",
    compute: PMP.pmpCheckRequired,
    fields: [
      { dom: 'pmp-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: PMP.PMP_STATES.map((s) => s.value) },
      { dom: 'pmp-class', arg: 'drugClass', kind: 'enum', required: true, label: 'Drug class', values: PMP.DRUG_CLASSES.map((s) => s.value) },
      { dom: 'pmp-schedule', arg: 'schedule', kind: 'enum', required: true, label: 'Schedule', values: PMP.SCHEDULES.map((s) => s.value) },
      { dom: 'pmp-setting', arg: 'setting', kind: 'enum', required: true, label: 'Setting', values: PMP.SETTINGS.map((s) => s.value) },
      { dom: 'pmp-first', arg: 'first', kind: 'enum', required: true, label: 'First prescription or continuing', values: PMP.FIRST_OR_CONTINUING.map((s) => s.value) },
      { dom: 'pmp-days', arg: 'days', kind: 'number', required: true, label: 'Days supplied' },
      { dom: 'pmp-refills', arg: 'refills', kind: 'enum', label: 'Refills ordered', values: ['yes', 'no'] },
      { dom: 'pmp-pain', arg: 'forPain', kind: 'enum', label: 'For acute or chronic pain (New Jersey)', values: ['yes', 'no'] },
      { dom: 'pmp-24h', arg: 'within24', kind: 'enum', label: 'Within 24 hours of surgery or trauma (New Jersey)', values: ['yes', 'no'] },
      { dom: 'pmp-bup', arg: 'buprenorphine', kind: 'enum', label: 'Buprenorphine (California emergency department)', values: ['yes', 'no'] },
      { dom: 'pmp-last', arg: 'lastCheck', kind: 'string', label: 'Date of the last check (YYYY-MM-DD)' },
    ],
  },
];
