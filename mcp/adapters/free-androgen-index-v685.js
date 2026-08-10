// spec-v685 MCP adapter: Free Androgen Index in lib/free-androgen-index-v685.js.
// The dom keys mirror the browser renderer (views/group-v685.js) and
// META['free-androgen-index'].example. A sex enum and two nmol/L numbers; a ratio returns
// the FAI. Clinical domain.

import { freeAndrogenIndex } from '../../lib/free-androgen-index-v685.js';

export default [
  {
    id: 'free-androgen-index',
    summary: 'Free Androgen Index (FAI) = 100 x (total testosterone / SHBG), both in nmol/L (US total testosterone ng/dL / 28.84 = nmol/L). Sex-specific advisory: women ~<=5 normal, >5 supports androgen excess (PCOS, hirsutism); men ~30-150 typical. Unreliable at SHBG extremes; not a stand-alone free-testosterone measure in men.',
    compute: freeAndrogenIndex,
    fields: [
      { dom: 'fai-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex (interpretation is sex-specific)' },
      { dom: 'fai-t', arg: 'testosterone', kind: 'number', unit: 'nmol/L', required: true, label: 'Total testosterone (nmol/L)' },
      { dom: 'fai-shbg', arg: 'shbg', kind: 'number', unit: 'nmol/L', required: true, label: 'SHBG (nmol/L)' },
    ],
  },
];
