// spec-v716 MCP adapter: DMFT caries index in lib/dmft-caries-v716.js.
// The dom keys mirror the browser renderer (views/group-v716.js) and META['dmft-caries'].example.
// Three counts (D, M, F); the sum 0-32 maps to a population caries-severity level. Clinical domain.

import { dmftCaries } from '../../lib/dmft-caries-v716.js';

export default [
  {
    id: 'dmft-caries',
    summary: 'DMFT index of dental caries experience (Klein 1938; WHO severity levels): DMFT = D (decayed) + M (missing due to caries) + F (filled) permanent teeth, range 0-32. Population caries-severity levels by mean DMFT: 0-1.1 very low, 1.2-2.6 low, 2.7-4.4 moderate, 4.5-6.5 high, >=6.6 very high. A descriptive caries-experience count.',
    compute: dmftCaries,
    fields: [
      { dom: 'dmft-d', arg: 'decayed', kind: 'number', required: true, label: 'D - decayed permanent teeth (0-32)' },
      { dom: 'dmft-m', arg: 'missing', kind: 'number', required: true, label: 'M - permanent teeth missing due to caries (0-32)' },
      { dom: 'dmft-f', arg: 'filled', kind: 'number', required: true, label: 'F - filled permanent teeth (0-32)' },
    ],
  },
];
