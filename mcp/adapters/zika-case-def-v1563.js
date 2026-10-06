// spec-v1563 MCP adapter: zika-case-def in lib/zika-case-def-v1563.js.
// The dom keys mirror views/group-v1563.js and META['zika-case-def'].example. Clinical domain.

import * as M from '../../lib/zika-case-def-v1563.js';

export default [
  {
    id: 'zika-case-def',
    summary: 'Classifies a Zika case by WHO interim 2016 definitions: suspected (rash or fever with joint or eye signs), probable (IgM and an epidemiological link) or confirmed (RNA, antigen or PRNT).',
    compute: M.zikaCaseDef,
    fields: [
      { dom: 'zk-rash', arg: 'rash', kind: 'enum', label: 'Rash', values: M.YES_NO.map((d) => d.value) },
      { dom: 'zk-fever', arg: 'fever', kind: 'enum', label: 'Fever', values: M.YES_NO.map((d) => d.value) },
      { dom: 'zk-signs', arg: 'signs', kind: 'enum', label: 'Arthralgia, arthritis or non-purulent conjunctivitis', values: M.YES_NO.map((d) => d.value) },
      { dom: 'zk-igm', arg: 'igm', kind: 'enum', label: 'Zika IgM positive (no evidence of other flaviviruses)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'zk-epi', arg: 'epi', kind: 'enum', label: 'Epidemiological link (confirmed contact, or local transmission area within 2 weeks)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'zk-rna', arg: 'rna', kind: 'enum', label: 'Zika RNA or antigen detected', values: M.YES_NO.map((d) => d.value) },
      { dom: 'zk-prnt', arg: 'prnt', kind: 'enum', label: 'IgM with PRNT90 titer 20 or more, 4 times other flaviviruses, others excluded', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
