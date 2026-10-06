// spec-v1549 MCP adapter: f100-rutf-amount in lib/f100-rutf-amount-v1549.js.
// The dom keys mirror views/group-v1549.js and META['f100-rutf-amount'].example. Clinical domain.

import * as M from '../../lib/f100-rutf-amount-v1549.js';

export default [
  {
    id: 'f100-rutf-amount',
    summary: 'Gives F-100 per feed or RUTF sachets a day for a severely malnourished child. F-100 in hospital, RUTF at 100-135 kcal/kg in transition and 150-185 outpatient (WHO 2023), with the 2014 IMCI table beside it.',
    compute: M.f100RutfAmount,
    fields: [
      { dom: 'fr-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1.5, max: 40 },
      { dom: 'fr-phase', arg: 'phase', kind: 'enum', required: true, label: 'Phase', values: M.PHASE_OPTIONS.map((d) => d.value) },
      { dom: 'fr-sachet', arg: 'sachet', kind: 'number', label: 'RUTF sachet energy in kcal (500 if blank)', min: 100, max: 1000 },
    ],
  },
];
