// spec-v698 MCP adapter: Quick COVID-19 Severity Index in lib/qcsi-v698.js.
// The dom keys mirror the browser renderer (views/group-v698.js) and META['qcsi'].example.
// Three bedside numbers; a banded sum 0-12 gives the 24-hour respiratory-decompensation
// risk. Clinical domain.

import { qcsi } from '../../lib/qcsi-v698.js';

export default [
  {
    id: 'qcsi',
    summary: 'Quick COVID-19 Severity Index (Haimovich 2020): 24-hour risk of respiratory decompensation in admitted COVID-19. Respiratory rate (<=22=0, 23-28=1, >28=2), SpO2 (>92=0, 89-92=2, <=88=5), O2 flow L/min (<=2=0, 3-4=4, >=5=5). Total 0-12; approx 24h risk 0-3 ~4%, 4-6 ~30%, 7-9 ~44%, 10-12 ~57%; >3 commonly elevated.',
    compute: qcsi,
    fields: [
      { dom: 'qcsi-rr', arg: 'respiratoryRate', kind: 'number', unit: 'breaths/min', required: true, label: 'Respiratory rate (breaths/min)' },
      { dom: 'qcsi-spo2', arg: 'spo2', kind: 'number', unit: '%', required: true, label: 'Pulse oximetry SpO2 (%)' },
      { dom: 'qcsi-o2', arg: 'o2Flow', kind: 'number', unit: 'L/min', required: true, label: 'Oxygen flow rate (L/min, 0 = room air)' },
    ],
  },
];
