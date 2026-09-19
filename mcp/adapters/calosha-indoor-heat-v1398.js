// spec-v1398: MCP adapter. The dom keys mirror views/group-v1398.js and this tile's META example.

import * as IH from '../../lib/calosha-indoor-heat-v1398.js';

export default [
  {
    id: 'calosha-indoor-heat',
    summary: 'Checks whether California\'s indoor heat standard (8 CCR 3396) applies to a work area, and whether control measures are required. It applies at 82F or more, except for incidental exposure under 15 minutes in any hour below 95F. Controls are required at 87F temperature or heat index, or at 82F with heat-restricting clothing or radiant heat.',
    compute: IH.caloshaIndoorHeat,
    fields: [
      { dom: 'ih-temp', arg: 'tempF', kind: 'number', required: true, label: 'Indoor temperature (F)' },
      { dom: 'ih-hi', arg: 'heatIndexF', kind: 'number', label: 'Heat index (F)' },
      { dom: 'ih-clothing', arg: 'clothing', kind: 'enum', required: true, label: 'Clothing that restricts heat removal', values: ['yes', 'no'] },
      { dom: 'ih-radiant', arg: 'radiant', kind: 'enum', required: true, label: 'High radiant heat area', values: ['yes', 'no'] },
      { dom: 'ih-minutes', arg: 'minutesPerHour', kind: 'number', label: 'Minutes of exposure in any 60' },
      { dom: 'ih-vehicle', arg: 'vehicleOrContainer', kind: 'enum', label: 'Unairconditioned vehicle, or container being loaded', values: ['yes', 'no'] },
    ],
  },
];
