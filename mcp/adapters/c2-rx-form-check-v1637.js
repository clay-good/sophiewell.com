// spec-v1637 MCP adapter: c2-rx-form-check in lib/c2-rx-form-check-v1637.js. The dom keys mirror
// views/group-v1637.js and META['c2-rx-form-check'].example. Administrative domain. No clock.

import * as C2 from '../../lib/c2-rx-form-check-v1637.js';

export default [
  {
    id: 'c2-rx-form-check',
    summary: 'Which form of a Schedule II prescription a pharmacist may dispense from. A signed paper or compliant electronic prescription: yes. A fax: for review only, except a narcotic compounded for infusion, a long-term care resident, or a hospice patient. An oral order: emergencies only, with a written prescription within 7 days (21 CFR 1306.11).',
    compute: C2.c2RxFormCheck,
    fields: [
      { dom: 'c2f-arrived', arg: 'arrived', kind: 'enum', required: true, values: C2.ARRIVED.map((k) => k.value), label: 'How the prescription arrived' },
      { dom: 'c2f-fax', arg: 'faxCase', kind: 'enum', values: C2.FAX_CASES.map((k) => k.value), label: 'For a fax, does one of these apply?' },
      { dom: 'c2f-hospice', arg: 'hospiceNoted', kind: 'enum', values: C2.HOSPICE_NOTED.map((k) => k.value), label: 'For a hospice patient, is the status noted on the prescription?' },
      { dom: 'c2f-emergency', arg: 'emergency', kind: 'enum', values: C2.EMERGENCY.map((k) => k.value), label: 'For an oral order, is this an emergency situation?' },
      { dom: 'c2f-pharmacy', arg: 'pharmacy', kind: 'enum', values: C2.PHARMACY.map((k) => k.value), label: 'For an oral order, the kind of pharmacy' },
      { dom: 'c2f-date', arg: 'authorizedOn', kind: 'string', label: 'For an oral order, the date of the authorization (YYYY-MM-DD)' },
    ],
  },
];
