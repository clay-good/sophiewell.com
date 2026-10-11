// spec-v1629 MCP adapter: ethanol-proof in lib/ethanol-proof-v1629.js. The dom keys mirror
// views/group-v1629.js and META['ethanol-proof'].example. Administrative domain: 27 CFR part 30 and
// 26 U.S.C. 5001. The Table 6 water values and the tax rate are reader input.

import * as EP from '../../lib/ethanol-proof-v1629.js';

export default [
  {
    id: 'ethanol-proof',
    summary: 'Alcohol proof, proof gallons, the federal excise tax, and the water to add to reduce proof (federal gauging rule). Reduction uses the Table 6 method of 27 CFR 30.66. The Table 6 water values and the tax rate are entered by the reader.',
    compute: EP.ethanolProof,
    fields: [
      { dom: 'ep-mode', arg: 'mode', kind: 'enum', required: true, values: EP.MODES.map((m) => m.value), label: 'What to work out: percent and proof (convert), proof gallons (gallons), tax, or water to add to reduce proof (reduce)' },
      { dom: 'ep-pct', arg: 'percent', kind: 'number', required: false, label: 'Convert: percent ethanol by volume (give this or the proof)' },
      { dom: 'ep-proof', arg: 'proof', kind: 'number', required: false, label: 'Convert or gallons: proof' },
      { dom: 'ep-vol', arg: 'volume', kind: 'number', required: false, label: 'Gallons: volume of spirits' },
      { dom: 'ep-vunit', arg: 'volumeUnit', kind: 'enum', required: false, values: EP.VOLUME_UNITS.map((u) => u.value), label: 'Gallons: unit of the volume (wine gallons or liters)' },
      { dom: 'ep-pg', arg: 'proofGallons', kind: 'number', required: false, label: 'Tax: proof gallons' },
      { dom: 'ep-rate', arg: 'rate', kind: 'number', required: false, label: 'Tax: rate in dollars per proof gallon (26 U.S.C. 5001; which rate applies is the reader\'s to say)' },
      { dom: 'ep-from', arg: 'fromProof', kind: 'number', required: false, label: 'Reduce: starting proof' },
      { dom: 'ep-to', arg: 'toProof', kind: 'number', required: false, label: 'Reduce: wanted proof' },
      { dom: 'ep-gal', arg: 'gallons', kind: 'number', required: false, label: 'Reduce: wine gallons on hand' },
      { dom: 'ep-w1', arg: 'waterFrom', kind: 'number', required: false, label: 'Reduce: parts water at the starting proof, from Table 6 of 27 CFR 30.66' },
      { dom: 'ep-w2', arg: 'waterTo', kind: 'number', required: false, label: 'Reduce: parts water at the wanted proof, from Table 6' },
    ],
  },
];
