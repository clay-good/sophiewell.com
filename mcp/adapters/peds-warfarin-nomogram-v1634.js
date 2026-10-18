// spec-v1634 MCP adapter: peds-warfarin-nomogram in lib/peds-warfarin-nomogram-v1634.js. The dom keys mirror
// views/group-v1634.js and META['peds-warfarin-nomogram'].example. Clinical domain.

import * as PW from '../../lib/peds-warfarin-nomogram-v1634.js';

export default [
  {
    id: 'peds-warfarin-nomogram',
    summary: 'Pediatric warfarin protocol for a target INR of 2.0 to 3.0 (CHEST 2012 with the 2024 ASH/ISTH guideline). It gives the day 1 dose by weight, then the loading-day or maintenance dose for an INR.',
    compute: PW.pedsWarfarinNomogram,
    fields: [
      { dom: 'pwn-phase', arg: 'phase', kind: 'enum', required: true, values: PW.PHASES.map((x) => x.value), label: 'Phase' },
      { dom: 'pwn-inr', arg: 'inr', kind: 'number', required: true, label: 'INR (baseline on day 1)' },
      { dom: 'pwn-start', arg: 'start', kind: 'enum', values: PW.STARTS.map((x) => x.value), label: 'Day 1 start' },
      { dom: 'pwn-wt', arg: 'weightKg', kind: 'number', label: 'Weight (day 1)', unit: 'kg' },
      { dom: 'pwn-dose', arg: 'doseMg', kind: 'number', label: 'Loading dose or current dose', unit: 'mg' },
    ],
  },
];
