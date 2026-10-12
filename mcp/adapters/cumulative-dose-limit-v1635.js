// spec-v1635 MCP adapter: cumulative-dose-limit in lib/cumulative-dose-limit-v1635.js. The dom keys
// mirror views/group-v1635.js and META['cumulative-dose-limit'].example. Clinical domain. Six label
// rows: doxorubicin, ELLENCE, daunorubicin, IDAMYCIN PFS, mitoxantrone, bleomycin.

import * as CD from '../../lib/cumulative-dose-limit-v1635.js';

export default [
  {
    id: 'cumulative-dose-limit',
    summary: 'Lifetime cumulative dose of an anthracycline, mitoxantrone or bleomycin set beside the figure its label states. It sums the prior doses, gives the percent of the label figure and what remains below it, and quotes the label sentence. Totals are per agent: no label gives a conversion ratio between agents, so none is applied. The figures are not safe limits.',
    compute: (args) => CD.cumulativeDoseLimit(args, new Date()),
    fields: [
      { dom: 'cdl-agent', arg: 'agent', kind: 'enum', required: true, values: CD.AGENTS.map((x) => x.value), label: 'Agent' },
      { dom: 'cdl-doses', arg: 'doses', kind: 'string', required: true, label: 'Prior doses, one per line: mg/m² (bleomycin: units; daunorubicin under 2 years: mg/kg), or the dose in mg, a comma, and the body surface area (or weight) at that dose' },
      { dom: 'cdl-dauno-group', arg: 'daunorubicinGroup', kind: 'enum', values: CD.DAUNORUBICIN_GROUPS.map((x) => x.value), label: 'Daunorubicin: age group' },
      { dom: 'cdl-radiation', arg: 'heartRadiation', kind: 'enum', values: CD.HEART_RADIATION.map((x) => x.value), label: 'Daunorubicin, adult: radiation therapy that encompassed the heart' },
      { dom: 'cdl-mito-use', arg: 'mitoxantroneUse', kind: 'enum', values: CD.MITOXANTRONE_USES.map((x) => x.value), label: 'Mitoxantrone: used for' },
      { dom: 'cdl-other', arg: 'otherEquivalent', kind: 'number', label: 'Prior other anthracyclines or anthracenediones, already converted by you to this agent (optional)' },
    ],
  },
];
