// spec-v1629 MCP adapter: buffer-ph in lib/buffer-ph-v1629.js. The dom keys mirror
// views/group-v1629.js and META['buffer-ph'].example. Physical chemistry; administrative domain.

import * as BP from '../../lib/buffer-ph-v1629.js';

export default [
  {
    id: 'buffer-ph',
    summary: 'Buffer pH from a weak acid or base and its salt, or the composition for a target pH (Henderson-Hasselbalch). The pKa is supplied by the reader; a ratio beyond 10 to 1 is flagged as outside the useful range.',
    compute: BP.bufferPh,
    fields: [
      { dom: 'bp-pair', arg: 'pair', kind: 'enum', required: true, values: BP.PAIRS.map((p) => p.value), label: 'Buffer pair: a weak acid and its salt, or a weak base and its salt' },
      { dom: 'bp-mode', arg: 'mode', kind: 'enum', required: true, values: BP.BUFFER_MODES.map((m) => m.value), label: 'What to work out: the pH from two concentrations (ph), or the composition for a target pH (compose)' },
      { dom: 'bp-pka', arg: 'pKa', kind: 'number', required: true, label: 'pKa at the working temperature (for a weak base, of its conjugate acid)' },
      { dom: 'bp-acceptor', arg: 'acceptor', kind: 'number', required: false, label: 'pH mode: concentration of the salt (acid pair) or of the base (base pair)', unit: 'mol/L' },
      { dom: 'bp-donor', arg: 'donor', kind: 'number', required: false, label: 'pH mode: concentration of the acid (acid pair) or of the salt (base pair)', unit: 'mol/L' },
      { dom: 'bp-target', arg: 'targetPh', kind: 'number', required: false, label: 'Compose mode: target pH' },
      { dom: 'bp-total', arg: 'total', kind: 'number', required: false, label: 'Compose mode: total buffer concentration', unit: 'mol/L' },
      { dom: 'bp-vol', arg: 'volumeMl', kind: 'number', required: false, label: 'Compose mode: volume, for grams (optional)', unit: 'mL' },
      { dom: 'bp-mwa', arg: 'acceptorMw', kind: 'number', required: false, label: 'Compose mode: molecular weight of the salt (acid pair) or of the base (base pair), for grams', unit: 'g/mol' },
      { dom: 'bp-mwd', arg: 'donorMw', kind: 'number', required: false, label: 'Compose mode: molecular weight of the acid (acid pair) or of the salt (base pair), for grams', unit: 'g/mol' },
    ],
  },
];
