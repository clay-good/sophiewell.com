// spec-v183 MCP wave 11: adapters for the five lib/tox-v110.js toxicology dosing
// and dialysis-decision instruments (digoxin-immune-Fab dosing, N-acetylcysteine
// regimens, high-dose insulin euglycemia therapy, TCA sodium-bicarbonate
// threshold, and the EXTRIP lithium extracorporeal-treatment recommendation).
// dom keys mirror views/group-v35.js; the compute arg names are the verbatim keys
// that renderer passes. optNum inputs are 'number', chk inputs 'bool', and the
// mode / regimen selects 'enum'. Default makeToArgs round-trips every example.

import * as F from '../../lib/tox-v110.js';

export default [
  {
    id: 'digifab-dosing',
    summary: 'Digoxin-immune-Fab (DigiFab) dosing: computes vials from a steady-state serum level and weight, a known amount ingested, or an empiric acute/chronic estimate.',
    compute: F.digifabDosing,
    fields: [
      { dom: 'dg-mode', arg: 'mode', kind: 'enum', values: ['level', 'amount', 'empiric'], required: true, label: 'Dosing basis' },
      { dom: 'dg-level', arg: 'level', kind: 'number', label: 'Steady-state serum digoxin level (ng/mL)' },
      { dom: 'dg-weight', arg: 'weight', kind: 'number', label: 'Body weight (kg)' },
      { dom: 'dg-amount', arg: 'amount', kind: 'number', label: 'Known amount ingested (mg)' },
      { dom: 'dg-timing', arg: 'timing', kind: 'enum', values: ['acute', 'chronic'], label: 'Empiric setting' },
    ],
  },
  {
    id: 'nac-dosing',
    summary: 'N-acetylcysteine dosing for acetaminophen poisoning: computes the per-bag milligrams for the three-bag (21 h) or two-bag (SNAP) IV regimen, capping dosing weight at 110 kg.',
    compute: F.nacDosing,
    fields: [
      { dom: 'nc-weight', arg: 'weight', kind: 'number', required: true, label: 'Body weight (kg)' },
      { dom: 'nc-reg', arg: 'regimen', kind: 'enum', values: ['three-bag', 'two-bag'], required: true, label: 'IV NAC regimen' },
    ],
  },
  {
    id: 'hiet-dosing',
    summary: 'High-dose insulin euglycemia therapy (HIET) dosing for calcium-channel-blocker / beta-blocker poisoning: bolus, starting infusion, and titration ceiling from weight.',
    compute: F.hietDosing,
    fields: [
      { dom: 'hi-weight', arg: 'weight', kind: 'number', required: true, label: 'Body weight (kg)' },
      { dom: 'hi-bolus', arg: 'bolus', kind: 'number', label: 'Bolus dose override (units/kg)' },
      { dom: 'hi-rate', arg: 'rate', kind: 'number', label: 'Starting infusion override (units/kg/hr)' },
    ],
  },
  {
    id: 'tca-bicarbonate',
    summary: 'Tricyclic-antidepressant sodium-bicarbonate threshold: flags QRS >= 100 ms seizure/arrhythmia risk and computes the 1-2 mEq/kg bicarbonate bolus from weight.',
    compute: F.tcaBicarbonate,
    fields: [
      { dom: 'tc-qrs', arg: 'qrs', kind: 'number', required: true, label: 'QRS duration (ms)' },
      { dom: 'tc-weight', arg: 'weight', kind: 'number', required: true, label: 'Body weight (kg)' },
    ],
  },
  {
    id: 'lithium-extrip',
    summary: 'EXTRIP lithium extracorporeal-treatment recommendation (Decker 2015): whether hemodialysis is recommended from the lithium level plus renal, neurologic, and clearance factors.',
    compute: F.lithiumExtrip,
    fields: [
      { dom: 'le-level', arg: 'level', kind: 'number', required: true, label: 'Serum lithium level (mmol/L)' },
      { dom: 'le-renal', arg: 'renalImpaired', kind: 'bool', label: 'Impaired kidney function' },
      { dom: 'le-conc', arg: 'decreasedConsciousness', kind: 'bool', label: 'Decreased level of consciousness' },
      { dom: 'le-seiz', arg: 'seizures', kind: 'bool', label: 'Seizures' },
      { dom: 'le-dys', arg: 'dysrhythmias', kind: 'bool', label: 'Life-threatening dysrhythmias' },
      { dom: 'le-conf', arg: 'confusion', kind: 'bool', label: 'Confusion' },
      { dom: 'le-slow', arg: 'slowClearance', kind: 'bool', label: 'Expected slow clearance' },
    ],
  },
];
