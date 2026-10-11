// spec-v1629 MCP adapter: capsule-fill in lib/capsule-fill-v1629.js. The dom keys mirror
// views/group-v1629.js and META['capsule-fill'].example. Arithmetic identity; administrative domain.
// Fill weights, capsule volume and densities are reader input; no capsule-size table ships.

import * as CF from '../../lib/capsule-fill-v1629.js';

export default [
  {
    id: 'capsule-fill',
    summary: 'Diluent and fill weight per capsule and per batch, from measured fill weights or capsule volume and tapped densities. An active that overfills the capsule is reported as not fitting that size.',
    compute: CF.capsuleFill,
    fields: [
      { dom: 'cf-method', arg: 'method', kind: 'enum', required: true, values: CF.METHODS.map((m) => m.value), label: 'Method: measured fill weights of each powder alone (weights), or capsule volume and tapped densities (densities)' },
      { dom: 'cf-count', arg: 'capsules', kind: 'number', required: true, label: 'Number of capsules' },
      { dom: 'cf-extra', arg: 'overage', kind: 'number', required: false, label: 'Extra capsules to allow for loss (optional)' },
      { dom: 'cf-active', arg: 'activeMg', kind: 'number', required: true, label: 'Active per capsule', unit: 'mg' },
      { dom: 'cf-afill', arg: 'activeFillMg', kind: 'number', required: false, label: 'Weights method: active alone that fills one capsule', unit: 'mg' },
      { dom: 'cf-dfill', arg: 'diluentFillMg', kind: 'number', required: false, label: 'Weights method: diluent alone that fills one capsule', unit: 'mg' },
      { dom: 'cf-vol', arg: 'capsuleVolumeMl', kind: 'number', required: false, label: 'Densities method: capsule body volume, from the capsule maker\'s sheet', unit: 'mL' },
      { dom: 'cf-adens', arg: 'activeDensity', kind: 'number', required: false, label: 'Densities method: tapped density of the active', unit: 'g/mL' },
      { dom: 'cf-ddens', arg: 'diluentDensity', kind: 'number', required: false, label: 'Densities method: tapped density of the diluent', unit: 'g/mL' },
    ],
  },
];
