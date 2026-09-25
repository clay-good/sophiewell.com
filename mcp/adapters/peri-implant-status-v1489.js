// spec-v1489: MCP adapter. The dom keys mirror views/group-v1489.js and this tile's META example.

import * as PI from '../../lib/peri-implant-status-v1489.js';

const YN = ['yes', 'no'];

export default [
  {
    id: 'peri-implant-status',
    summary: 'Peri-implant health, mucositis or peri-implantitis by the 2017 World Workshop case definitions, with or without a baseline record.',
    compute: PI.periImplantStatus,
    fields: [
      { dom: 'pi-bleeding', arg: 'bleeding', kind: 'enum', required: true, values: YN, label: 'Bleeding or suppuration on gentle probing' },
      { dom: 'pi-baseline', arg: 'baseline', kind: 'enum', required: true, values: YN, label: 'Baseline radiograph and probing record available' },
      { dom: 'pi-boneloss', arg: 'boneLoss', kind: 'enum', required: false, values: YN, label: 'With a baseline: bone loss beyond initial remodeling' },
      { dom: 'pi-deeper', arg: 'depthIncrease', kind: 'enum', required: false, values: YN, label: 'With a baseline: probing depth increased' },
      { dom: 'pi-pd', arg: 'probingDepth', kind: 'number', required: false, label: 'Without a baseline: deepest probing depth', unit: 'mm' },
      { dom: 'pi-bone', arg: 'boneLevel', kind: 'number', required: false, label: 'Without a baseline: radiographic bone level', unit: 'mm' },
    ],
  },
];
