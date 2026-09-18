// spec-v1400: MCP adapter. The dom keys mirror views/group-v1400.js and this tile's META example.

import * as SY from '../../lib/syphilis-serology-sequence-v1400.js';

export default [
  {
    id: 'syphilis-serology-sequence',
    summary: 'Syphilis serology interpreter for both CDC testing sequences (CDC 2024 laboratory recommendations). Traditional: a reactive nontreponemal test (RPR or VDRL) is confirmed with a treponemal test, and reactive nontreponemal with nonreactive treponemal is a biologic false positive. Reverse sequence: a reactive treponemal immunoassay (EIA/CIA) gets a quantitative nontreponemal test; if that is nonreactive the result is discordant and goes to a second, different treponemal assay such as TP-PA, reactive meaning past or present syphilis and nonreactive meaning syphilis is unlikely. It will not call a reactive EIA with a nonreactive RPR a false positive before the TP-PA. With a prior titer from the same test, a fourfold (two-dilution) change is flagged as clinically significant.',
    compute: SY.syphilisSerologySequence,
    fields: [
      { dom: 'syq-algorithm', arg: 'algorithm', kind: 'enum', required: true, label: 'Testing sequence', values: SY.ALGORITHMS.map((a) => a.value) },
      { dom: 'syq-treponemal', arg: 'treponemal', kind: 'enum', label: 'Treponemal test result', values: SY.REACTIVITY_OR_NOT_DONE.map((a) => a.value) },
      { dom: 'syq-nontreponemal', arg: 'nontreponemal', kind: 'enum', label: 'Nontreponemal test result (RPR or VDRL)', values: SY.REACTIVITY_OR_NOT_DONE.map((a) => a.value) },
      { dom: 'syq-second', arg: 'secondTreponemal', kind: 'enum', label: 'Second, different treponemal test (TP-PA)', values: SY.REACTIVITY_OR_NOT_DONE.map((a) => a.value) },
      { dom: 'syq-titer', arg: 'titer', kind: 'number', label: 'Current nontreponemal titer, the number after 1:' },
      { dom: 'syq-prior', arg: 'priorTiter', kind: 'number', label: 'Prior nontreponemal titer, the number after 1:' },
      { dom: 'syq-same', arg: 'priorSameTest', kind: 'enum', label: 'Prior titer from the same nontreponemal test', values: ['yes', 'no'] },
    ],
  },
];
