// spec-v662 MCP adapter: PUSH tool 3.0 in lib/push-tool-v662.js. The dom keys mirror the
// browser renderer (views/group-v662.js) and META['push-tool'].example. Three subscores
// summed 0-17: surface area from length x width cm2 (binned 0-10), exudate (0-3 enum),
// tissue type (0-4 enum). A trend/monitoring instrument. Clinical domain.

import { pushTool } from '../../lib/push-tool-v662.js';

export default [
  {
    id: 'push-tool',
    summary: 'PUSH tool (Pressure Ulcer Scale for Healing) 3.0: surface area (length x width cm2, scored 0-10), exudate amount (0-3), and tissue type (0-4), summed 0-17. A decreasing total over time indicates healing. Companion to Braden/Norton pressure-ulcer risk tools.',
    compute: pushTool,
    fields: [
      { dom: 'push-length', arg: 'length', kind: 'number', required: true, label: 'Wound length (cm)' },
      { dom: 'push-width', arg: 'width', kind: 'number', required: true, label: 'Wound width (cm); area = length x width, scored 0-10 by category' },
      { dom: 'push-exudate', arg: 'exudate', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Exudate amount: 0 none, 1 light, 2 moderate, 3 heavy' },
      { dom: 'push-tissue', arg: 'tissue', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Tissue type (worst present): 0 closed, 1 epithelial, 2 granulation, 3 slough, 4 necrotic' },
    ],
  },
];
