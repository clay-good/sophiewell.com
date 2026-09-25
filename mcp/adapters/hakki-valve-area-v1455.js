// spec-v1455: MCP adapter. The dom keys mirror views/group-v1455.js and this tile's META example.

import * as HK from '../../lib/hakki-valve-area-v1455.js';

export default [
  {
    id: 'hakki-valve-area',
    summary: 'Estimates a stenotic aortic or mitral valve area with the Hakki formula, a bedside simplification of the Gorlin equation. The area is cardiac output divided by the square root of the pressure gradient.',
    compute: HK.hakkiValveArea,
    fields: [
      { dom: 'hak-valve', arg: 'valve', kind: 'enum', required: true, label: 'Valve', values: HK.HAKKI_VALVES.map((x) => x.value) },
      { dom: 'hak-co', arg: 'co', kind: 'number', required: true, label: 'Cardiac output', unit: 'L/min' },
      { dom: 'hak-grad', arg: 'grad', kind: 'number', required: true, label: 'Pressure gradient across the valve', unit: 'mmHg' },
    ],
  },
];
