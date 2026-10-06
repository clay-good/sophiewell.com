// spec-v1550 MCP adapter: WHO deworming dose and frequency in lib/deworming-dose-who-v1550.js.
// The dom keys mirror views/group-v1550.js and META['deworming-dose-who'].example. Clinical domain.

import * as W from '../../lib/deworming-dose-who-v1550.js';

export default [
  {
    id: 'deworming-dose-who',
    summary: 'Gives the WHO deworming dose and how often, by group and local worm prevalence. Albendazole (half dose under 24 months) or mebendazole, yearly at 20% or twice a year over 50%; pregnant women only after the first trimester where both thresholds hold.',
    compute: W.dewormingDoseWho,
    fields: [
      { dom: 'dw-group', arg: 'group', kind: 'enum', required: true, label: 'Group', values: W.GROUP_OPTIONS.map((d) => d.value) },
      { dom: 'dw-age', arg: 'age', kind: 'number', label: 'Age in months (child)', min: 0, max: 228 },
      { dom: 'dw-prev', arg: 'prevalence', kind: 'enum', label: 'Local soil-transmitted helminth prevalence', values: W.PREVALENCE_OPTIONS.map((d) => d.value) },
      { dom: 'dw-trimester', arg: 'trimester', kind: 'enum', label: 'Trimester (pregnant)', values: W.TRIMESTER_OPTIONS.map((d) => d.value) },
      { dom: 'dw-criteria', arg: 'criteria', kind: 'enum', label: 'Hookworm/whipworm 20%+ and anemia 40%+ (pregnant)', values: W.YES_NO.map((d) => d.value) },
    ],
  },
];
