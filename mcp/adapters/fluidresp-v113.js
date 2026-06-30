// spec-v183 MCP wave 5: adapters for the three lib/fluidresp-v113.js dynamic
// fluid-responsiveness measures. dom keys mirror views/group-v113.js and
// META.example.fields; arg names mirror the lib signatures. Each is a simple
// variation ratio over two numeric measurements, with a mode enum where the
// threshold depends on ventilation mode / waveform.

import * as F from '../../lib/fluidresp-v113.js';

export default [
  {
    id: 'ivc-fluid-responsiveness',
    summary: 'IVC respiratory variation: distensibility (mechanical ventilation) or collapsibility (spontaneous breathing) from maximum and minimum IVC diameter; ~18% (mechanical) / ~42% (spontaneous) predicts a fluid response.',
    compute: F.ivcFluidResponsiveness,
    fields: [
      { dom: 'iv-mode', arg: 'mode', kind: 'enum', values: ['mechanical', 'spontaneous'], required: true, label: 'Ventilation mode' },
      { dom: 'iv-dmax', arg: 'dmax', kind: 'number', required: true, label: 'Maximum IVC diameter', unit: 'cm' },
      { dom: 'iv-dmin', arg: 'dmin', kind: 'number', required: true, label: 'Minimum IVC diameter', unit: 'cm' },
    ],
  },
  {
    id: 'ppv-svv',
    summary: 'Pulse-pressure / stroke-volume variation: (max - min) / mean x 100 over a respiratory cycle; PPV/SVV > ~13% suggests fluid responsiveness in a sedated, controlled-ventilation patient with adequate tidal volume and regular rhythm.',
    compute: F.ppvSvv,
    fields: [
      { dom: 'pv-mode', arg: 'mode', kind: 'enum', values: ['ppv', 'svv'], required: true, label: 'Variation type' },
      { dom: 'pv-max', arg: 'max', kind: 'number', required: true, label: 'Maximum value' },
      { dom: 'pv-min', arg: 'min', kind: 'number', required: true, label: 'Minimum value' },
    ],
  },
  {
    id: 'passive-leg-raise',
    summary: 'Passive leg raise response: percent change in stroke volume (or surrogate) from baseline to peak; a >= 10-15% rise predicts fluid responsiveness without giving fluid.',
    compute: F.passiveLegRaise,
    fields: [
      { dom: 'plr-base', arg: 'baseline', kind: 'number', required: true, label: 'Baseline stroke volume / surrogate' },
      { dom: 'plr-peak', arg: 'peak', kind: 'number', required: true, label: 'Peak value after leg raise' },
    ],
  },
];
