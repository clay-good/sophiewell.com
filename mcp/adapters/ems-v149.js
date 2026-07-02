// spec-v183 MCP wave 14: adapters for the three lib/ems-v149.js bedside /
// prehospital pediatric tiles. dom keys mirror views/group-v149.js and
// META.example.fields; arg names mirror the lib signatures.

import * as F from '../../lib/ems-v149.js';

export default [
  {
    id: 'peds-weight-est',
    summary: 'Pediatric weight estimate (APLS): a resuscitation-planning weight from age when no scale is available. Months (0–12) takes precedence over years (1–14).',
    compute: F.pedsWeightEst,
    fields: [
      { dom: 'pw-months', arg: 'months', kind: 'number', label: 'Age in months (0–12)' },
      { dom: 'pw-years', arg: 'years', kind: 'number', label: 'Age in years (1–14)' },
    ],
  },
  {
    id: 'peds-vitals',
    summary: 'Pediatric vital-sign reference (AHA PALS 2020): age-band normal heart rate, respiratory rate, and systolic-BP ranges plus the PALS hypotension threshold.',
    compute: F.pedsVitals,
    fields: [
      { dom: 'pv-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age in years (0–18)' },
    ],
  },
  {
    id: 'dose-volume',
    summary: 'Draw-up volume: volume to draw (mL) = ordered dose (mg) / stock concentration (mg/mL). The dose may be entered directly or derived from weight × per-kg dose.',
    compute: F.doseVolume,
    fields: [
      { dom: 'dv-dose', arg: 'doseMg', kind: 'number', label: 'Ordered dose (mg)' },
      { dom: 'dv-conc', arg: 'concentration', kind: 'number', label: 'Stock concentration (mg/mL)' },
      { dom: 'dv-weight', arg: 'weightKg', kind: 'number', label: 'Weight (kg) — optional' },
      { dom: 'dv-perkg', arg: 'doseMgPerKg', kind: 'number', label: 'Per-kg dose (mg/kg) — optional' },
    ],
  },
];
