// spec-v183 MCP wave: adapters for the diving / hyperbaric-medicine formulas in
// lib/dive-v257.js — the nitrox maximum operating depth (MOD), the equivalent air
// depth (EAD), and the pulmonary oxygen-toxicity units (OTU). dom keys mirror
// views/group-v257.js; all inputs are numeric.

import * as F from '../../lib/dive-v257.js';

export default [
  {
    id: 'maximum-operating-depth',
    summary: 'Nitrox maximum operating depth = 10 x (PO2max / FO2 - 1) metres of sea water; below the MOD the inspired PO2 exceeds the CNS oxygen-toxicity limit.',
    compute: F.maximumOperatingDepth,
    fields: [
      { dom: 'mod-fo2', arg: 'fo2', kind: 'number', required: true, label: 'Oxygen fraction FO2 (e.g. 0.32 for EAN32)' },
      { dom: 'mod-po2', arg: 'po2max', kind: 'number', required: true, label: 'PO2 limit', unit: 'bar' },
    ],
  },
  {
    id: 'equivalent-air-depth',
    summary: 'Nitrox equivalent air depth = (depth + 10) x (FN2 / 0.79) - 10 metres, FN2 = 1 - FO2; the air depth giving the same inspired nitrogen partial pressure for air decompression tables.',
    compute: F.equivalentAirDepth,
    fields: [
      { dom: 'ead-depth', arg: 'depth', kind: 'number', required: true, label: 'Actual depth', unit: 'm' },
      { dom: 'ead-fo2', arg: 'fo2', kind: 'number', required: true, label: 'Oxygen fraction FO2 (e.g. 0.32)' },
    ],
  },
  {
    id: 'oxygen-toxicity-units',
    summary: 'Pulmonary oxygen-toxicity units = t x [(PO2 - 0.5) / 0.5]^0.83 (t minutes, PO2 in ATA); a single-dive limit of ~615 OTU is commonly used.',
    compute: F.oxygenToxicityUnits,
    fields: [
      { dom: 'otu-po2', arg: 'po2', kind: 'number', required: true, label: 'Oxygen partial pressure PO2', unit: 'ATA' },
      { dom: 'otu-time', arg: 'time', kind: 'number', required: true, label: 'Exposure time', unit: 'minutes' },
    ],
  },
];
