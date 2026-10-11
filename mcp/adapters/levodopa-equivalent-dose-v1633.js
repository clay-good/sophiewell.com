// spec-v1633 MCP adapter: levodopa-equivalent-dose in lib/levodopa-equivalent-dose-v1633.js. The dom
// keys mirror views/group-v1633.js and META['levodopa-equivalent-dose'].example. Clinical domain.
// Every drug field is optional; at least one must be given.

import * as LE from '../../lib/levodopa-equivalent-dose-v1633.js';

export default [
  {
    id: 'levodopa-equivalent-dose',
    summary: 'The levodopa equivalent daily dose of a Parkinson\'s disease regimen, by the 2023 factors. Each drug\'s total daily dose is multiplied by the factor in Jost 2023, with the paper\'s rules for COMT inhibitors, istradefylline, safinamide, zonisamide and anticholinergics, and every contribution is listed. It is a comparison measure with no interpretation bands, not a dose to switch to.',
    compute: LE.levodopaEquivalentDose,
    fields: [
      ...LE.DRUGS.map((d) => ({ dom: `led-${d.dom}`, arg: d.arg, kind: 'number', label: `${d.text}, total a day`, unit: 'mg' })),
      { dom: 'led-comt', arg: 'comt', kind: 'enum', values: LE.COMT.map((c) => c.value), label: 'COMT inhibitor' },
      { dom: 'led-comt-covered', arg: 'comtCoveredLed', kind: 'number', label: 'Levodopa equivalent covered by entacapone or tolcapone', unit: 'mg' },
      { dom: 'led-istradefylline', arg: 'istradefylline', kind: 'enum', values: ['no', 'yes'], label: 'Istradefylline' },
      { dom: 'led-safinamide', arg: 'safinamide', kind: 'enum', values: ['no', 'yes'], label: 'Safinamide 50 or 100 mg a day' },
      { dom: 'led-zonisamide', arg: 'zonisamide', kind: 'enum', values: ['no', 'yes'], label: 'Zonisamide 25 or 50 mg a day' },
      { dom: 'led-anticholinergic', arg: 'anticholinergicDoses', kind: 'number', label: 'Clinically effective anticholinergic single doses a day' },
    ],
  },
];
