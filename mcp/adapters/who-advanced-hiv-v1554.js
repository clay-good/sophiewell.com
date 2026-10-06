// spec-v1554 MCP adapter: who-advanced-hiv in lib/who-advanced-hiv-v1554.js.
// The dom keys mirror views/group-v1554.js and META['who-advanced-hiv'].example. Clinical domain.

import * as M from '../../lib/who-advanced-hiv-v1554.js';

export default [
  {
    id: 'who-advanced-hiv',
    summary: 'Says whether this is advanced HIV disease by WHO 2025 and lists the package. CD4 200 or less, a stage 3 or 4 event without CD4, or any child under 5 unless stable on ART over a year.',
    compute: M.whoAdvancedHiv,
    fields: [
      { dom: 'ah-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'ah-cd4', arg: 'cd4', kind: 'number', label: 'CD4 count, cells/mm³ (leave blank if not available)', min: 0, max: 5000 },
      { dom: 'ah-stage', arg: 'stage', kind: 'enum', label: 'WHO clinical stage (used when there is no CD4)', values: M.STAGE_OPTIONS.map((d) => d.value) },
      { dom: 'ah-stable', arg: 'stable', kind: 'enum', label: 'Under 5: on ART more than a year and clinically stable', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
