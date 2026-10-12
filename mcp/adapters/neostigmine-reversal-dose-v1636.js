// spec-v1636 MCP adapter: neostigmine-reversal-dose in lib/neostigmine-reversal-dose-v1636.js. The dom
// keys mirror views/group-v1636.js and META['neostigmine-reversal-dose'].example. Clinical domain.

import * as NS from '../../lib/neostigmine-reversal-dose-v1636.js';

export default [
  {
    id: 'neostigmine-reversal-dose',
    summary: 'Neostigmine dose to reverse neuromuscular blockade, as the BLOXIVERZ label states it. It gives 0.03 or 0.07 mg/kg by the train-of-four response and the blocker\'s half-life, the mL to draw, and the label maximum (0.07 mg/kg or 5 mg, whichever is less). When the two criteria point to different rows both doses are shown. Under 10% first twitch it gives no dose.',
    compute: (args) => NS.neostigmineReversalDose(args, new Date()),
    fields: [
      { dom: 'nrd-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'nrd-twitch', arg: 'twitch', kind: 'enum', required: true, values: NS.TWITCH.map((x) => x.value), label: 'Train-of-four response' },
      { dom: 'nrd-half-life', arg: 'halfLife', kind: 'enum', required: true, values: NS.HALF_LIFE.map((x) => x.value), label: 'Half-life class of the blocker' },
      { dom: 'nrd-conc', arg: 'concentration', kind: 'enum', required: true, values: NS.CONCENTRATIONS.map((x) => x.value), label: 'Concentration' },
      { dom: 'nrd-prior', arg: 'priorDose', kind: 'number', label: 'Neostigmine already given (optional)', unit: 'mg' },
    ],
  },
];
