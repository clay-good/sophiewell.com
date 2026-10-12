// spec-v1636 MCP adapter: pralidoxime-dose in lib/pralidoxime-dose-v1636.js. The dom keys mirror
// views/group-v1636.js and META['pralidoxime-dose'].example. Clinical domain. Two label rows.

import * as PX from '../../lib/pralidoxime-dose-v1636.js';

export default [
  {
    id: 'pralidoxime-dose',
    summary: 'Pralidoxime and DuoDote doses for organophosphate or nerve agent poisoning, as the labels state them: adult and pediatric intravenous ranges, the intramuscular series by mild or severe symptoms (15 mg/kg per injection under 40 kg), and the DuoDote autoinjector count for patients over 41 kg. Severity is the reader\'s finding. Atropine and supportive care are not covered.',
    compute: (args) => PX.pralidoximeDose(args, new Date()),
    fields: [
      { dom: 'pxd-patient', arg: 'patient', kind: 'enum', required: true, values: PX.PATIENTS.map((x) => x.value), label: 'Patient' },
      { dom: 'pxd-route', arg: 'route', kind: 'enum', required: true, values: PX.ROUTES.map((x) => x.value), label: 'Route or product' },
      { dom: 'pxd-severity', arg: 'severity', kind: 'enum', values: PX.SEVERITIES.map((x) => x.value), label: 'Severity (intramuscular and DuoDote)' },
      { dom: 'pxd-weight', arg: 'weight', kind: 'number', label: 'Weight (pediatric patients, and DuoDote)', unit: 'kg' },
    ],
  },
];
