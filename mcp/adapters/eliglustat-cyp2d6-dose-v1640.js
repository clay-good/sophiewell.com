// spec-v1640 MCP adapter: eliglustat-cyp2d6-dose in lib/eliglustat-cyp2d6-dose-v1640.js. The dom keys
// mirror views/group-v1640.js and META['eliglustat-cyp2d6-dose'].example. Clinical domain. One label row.

import * as EG from '../../lib/eliglustat-cyp2d6-dose-v1640.js';

export default [
  {
    id: 'eliglustat-cyp2d6-dose',
    summary: 'The Cerdelga label dosage for a CYP2D6 status. It applies the label in order: limitations of use, section 4 contraindications, the renal "avoid" rows, Table 5 interactions, then 84 mg once or twice daily from Tables 1 and 2. Hepatic and renal function and inhibitor strengths are entries; no drug is classified.',
    compute: (args) => EG.eliglustatCyp2d6Dose(args, new Date()),
    fields: [
      { dom: 'elg-status', arg: 'status', kind: 'enum', required: true, values: EG.STATUSES.map((x) => x.value), label: 'CYP2D6 metabolizer status' },
      { dom: 'elg-hepatic', arg: 'hepatic', kind: 'enum', values: EG.HEPATIC.map((x) => x.value), label: 'Hepatic impairment' },
      { dom: 'elg-renal', arg: 'renal', kind: 'enum', values: EG.RENAL.map((x) => x.value), label: 'Renal function' },
      { dom: 'elg-2d6', arg: 'cyp2d6Inhibitor', kind: 'enum', values: EG.STRENGTHS.map((x) => x.value), label: 'Concomitant CYP2D6 inhibitor' },
      { dom: 'elg-3a', arg: 'cyp3aInhibitor', kind: 'enum', values: EG.STRENGTHS.map((x) => x.value), label: 'Concomitant CYP3A inhibitor' },
    ],
  },
];
