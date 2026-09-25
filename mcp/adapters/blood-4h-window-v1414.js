// spec-v1414: MCP adapter. The dom keys mirror views/group-v1414.js and this tile's META example.

import * as BW from '../../lib/blood-4h-window-v1414.js';

export default [
  {
    id: 'blood-4h-window',
    summary: 'Checks whether a blood component will finish within 4 hours of the bag being spiked, and gives the slowest pump rate that does. The 4-hour limit is the Circular of Information\'s, which also says to order smaller aliquots when a unit must run slower than that.',
    compute: BW.blood4hWindow,
    fields: [
      { dom: 'b4-vol', arg: 'volumeMl', kind: 'number', required: true, label: 'Volume left in the bag', unit: 'mL' },
      { dom: 'b4-elapsed', arg: 'elapsedMin', kind: 'number', label: 'Minutes since the bag was spiked', unit: 'min' },
      { dom: 'b4-rate', arg: 'rateMlHr', kind: 'number', label: 'Pump rate', unit: 'mL/h' },
    ],
  },
];
