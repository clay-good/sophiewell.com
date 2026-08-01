// spec-v629 wave 6: adapters for the lib/billing-v81.js drug / infusion billing
// calculators (non-clinical / administrative). No money math here (units, vials,
// and infusion codes), so no withUsd. infusion-hierarchy parses a multiline
// "type, minutes[, concurrent]" list into the lib's administrations array,
// replicating the browser view.

import * as C from '../../lib/billing-v81.js';

export default [
  {
    id: 'ndc-hcpcs-units',
    summary: 'Convert an administered dose to HCPCS/J-code billing units by the code descriptor unit size, with the rounding rule and a clean-multiple check.',
    compute: C.ndcHcpcsUnits,
    fields: [
      { dom: 'nh-dose', arg: 'dose', kind: 'number', required: true, label: 'Administered dose' },
      { dom: 'nh-dose-unit', arg: 'doseUnit', kind: 'string', required: true, label: 'Dose unit (e.g. mg, mcg, units)' },
      { dom: 'nh-unitsize', arg: 'unitSize', kind: 'number', required: true, label: 'Billing unit size per the HCPCS descriptor' },
      { dom: 'nh-unit-unit', arg: 'unitUnit', kind: 'string', required: true, label: 'Billing unit measure (e.g. mg)' },
      { dom: 'nh-round', arg: 'rounding', kind: 'string', label: 'Rounding: up, down, or nearest (default up)' },
    ],
  },
  {
    id: 'drug-wastage',
    // Echo the dose + vial size into the result so it is self-describing (the lib
    // returns only the derived units); a plain object, no DOM, still deterministic.
    compute: (a) => ({ ...C.drugWastage(a), dose: a.dose, vialSize: a.vialSize, doseUnit: a.doseUnit }),
    summary: 'Single-dose-vial wastage: administered vs discarded units and whether the discard is billable with modifier JW (or JZ for zero waste).',
    fields: [
      { dom: 'dw-vial', arg: 'vialSize', kind: 'number', required: true, label: 'Vial size' },
      { dom: 'dw-dose', arg: 'dose', kind: 'number', required: true, label: 'Administered dose' },
      { dom: 'dw-dose-unit', arg: 'doseUnit', kind: 'string', required: true, label: 'Dose unit (e.g. mg)' },
      { dom: 'dw-unitsize', arg: 'unitSize', kind: 'number', required: true, label: 'Billing unit size per the HCPCS descriptor' },
      { dom: 'dw-unit-unit', arg: 'unitUnit', kind: 'string', required: true, label: 'Billing unit measure (e.g. mg)' },
      { dom: 'dw-type', arg: 'vialType', kind: 'string', required: true, label: 'Vial type: single or multi' },
    ],
  },
  {
    id: 'infusion-hierarchy',
    summary: 'Assign the CPT infusion/injection hierarchy (one initial, then sequential/concurrent/push) across a set of administrations by the primary-service rules.',
    compute: C.infusionHierarchy,
    fields: [
      { dom: 'ih-list', arg: 'administrations', kind: 'string', required: true, label: 'One administration per line: "type, minutes" (e.g. "chemo-infusion, 90"; add ", concurrent" for a concurrent line)' },
    ],
    // Parse the multiline list into the lib's administrations array (view parity).
    toArgs: (i) => ({
      administrations: String(i['ih-list'] == null ? '' : i['ih-list']).split('\n').map((s) => s.trim()).filter(Boolean)
        .map((line) => {
          const parts = line.split(',').map((s) => s.trim());
          return {
            type: parts[0],
            minutes: parts[1] != null && parts[1] !== '' ? Number(parts[1]) : 0,
            concurrent: parts.slice(2).some((p) => p.toLowerCase() === 'concurrent'),
          };
        }),
    }),
  },
];
