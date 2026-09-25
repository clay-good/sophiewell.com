// spec-v1426: MCP adapter. The dom keys mirror views/group-v1426.js and this tile's META example.

import * as IM from '../../lib/isakos-meniscal-v1426.js';

export default [
  {
    id: 'isakos-meniscal',
    summary: 'Writes the ISAKOS arthroscopic record of a meniscal tear and derives its Cooper rim-width zone from the findings. Depth, rim width, radial location, popliteal hiatus (lateral tears), predominant pattern and tissue quality become one standard sentence; tear length and the percentage excised are recorded at surgery.',
    compute: IM.isakosMeniscal,
    fields: [
      { dom: 'isk-meniscus', arg: 'meniscus', kind: 'enum', required: true, label: 'Meniscus', values: IM.ISK_MENISCUS.map((x) => x.value) },
      { dom: 'isk-depth', arg: 'depth', kind: 'enum', required: true, label: 'Tear depth', values: IM.ISK_DEPTH.map((x) => x.value) },
      { dom: 'isk-rim', arg: 'rim', kind: 'enum', required: true, label: 'Rim width at the outermost zone reached', values: IM.ISK_RIM.map((x) => x.value) },
      { dom: 'isk-radial', arg: 'radial', kind: 'enum', required: true, label: 'Radial location', values: IM.ISK_RADIAL.map((x) => x.value) },
      { dom: 'isk-hiatus', arg: 'hiatus', kind: 'enum', label: 'Popliteal hiatus (lateral meniscus only)', values: IM.ISK_HIATUS.map((x) => x.value) },
      { dom: 'isk-pattern', arg: 'pattern', kind: 'enum', required: true, label: 'Tear pattern (predominant)', values: IM.ISK_PATTERN.map((x) => x.value) },
      { dom: 'isk-tissue', arg: 'tissue', kind: 'enum', required: true, label: 'Tissue quality', values: IM.ISK_TISSUE.map((x) => x.value) },
    ],
  },
];
