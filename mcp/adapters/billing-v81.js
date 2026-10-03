// spec-v629 wave 6: adapters for the lib/billing-v81.js drug / infusion billing
// calculators (non-clinical / administrative). No money math here (units, vials,
// and infusion codes), so no withUsd. infusion-hierarchy parses a multiline
// "type, minutes[, concurrent]" list into the lib's administrations array,
// replicating the browser view.

import * as C from '../../lib/billing-v81.js';
import * as XW from '../../lib/ndc-crosswalk.js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// spec-v1505 backfill: the crosswalk is the data/asp-ndc shards the website ships, read from disk.
const XW_DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'asp-ndc');
function xwLookupFromDisk(raw) {
  const ndc = XW.normalizeNdc(raw).ndc;
  if (!ndc) return undefined;
  try {
    const file = join(XW_DATA, 'shards', XW.shardName(ndc));
    const rows = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
    return XW.xwLookup({ ndc, manifest: JSON.parse(readFileSync(join(XW_DATA, 'manifest.json'), 'utf8')), rows });
  } catch {
    return { status: 'unavailable' };
  }
}

export default [
  {
    id: 'ndc-hcpcs-units',
    summary: 'Convert an administered dose to HCPCS/J-code billing units by the code descriptor unit size, with the rounding rule and a clean-multiple check. Given an NDC, the code and unit come from the CMS ASP NDC-HCPCS crosswalk.',
    compute: (a) => {
      if (String(a.ndc ?? '').trim()) return XW.ndcUnits({ ...a, lookup: xwLookupFromDisk(a.ndc) });
      if (!String(a.unitSize ?? '').trim() || !String(a.unitUnit ?? '').trim()) return { valid: false, message: 'Enter the billing-unit size and measure, or the NDC.' };
      return C.ndcHcpcsUnits(a);
    },
    fields: [
      { dom: 'nh-ndc', arg: 'ndc', kind: 'string', required: false, label: 'NDC (reads the code and unit from the CMS crosswalk)' },
      { dom: 'nh-code', arg: 'code', kind: 'string', required: false, label: 'HCPCS code, when the NDC bills under more than one' },
      { dom: 'nh-dose', arg: 'dose', kind: 'number', required: true, label: 'Administered dose' },
      { dom: 'nh-dose-unit', arg: 'doseUnit', kind: 'enum', values: ['mg', 'mcg', 'g', 'units', 'ml'], required: true, label: 'Dose unit' },
      { dom: 'nh-unitsize', arg: 'unitSize', kind: 'number', required: false, label: 'Billing unit size per the HCPCS descriptor (not needed with an NDC)' },
      { dom: 'nh-unit-unit', arg: 'unitUnit', kind: 'enum', values: ['mg', 'mcg', 'g', 'units', 'ml'], required: false, label: 'Billing unit measure (not needed with an NDC)' },
      { dom: 'nh-round', arg: 'rounding', kind: 'enum', values: ['up', 'nearest', 'down'], label: 'Rounding: up, down, or nearest (default up)' },
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
      { dom: 'dw-dose-unit', arg: 'doseUnit', kind: 'enum', values: ['mg', 'mcg', 'g', 'units', 'ml'], required: true, label: 'Dose unit' },
      { dom: 'dw-unitsize', arg: 'unitSize', kind: 'number', required: true, label: 'Billing unit size per the HCPCS descriptor' },
      { dom: 'dw-unit-unit', arg: 'unitUnit', kind: 'enum', values: ['mg', 'mcg', 'g', 'units', 'ml'], required: true, label: 'Billing unit measure' },
      { dom: 'dw-type', arg: 'vialType', kind: 'enum', values: ['single', 'multi'], required: true, label: 'Vial type: single-dose or multi-dose' },
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
