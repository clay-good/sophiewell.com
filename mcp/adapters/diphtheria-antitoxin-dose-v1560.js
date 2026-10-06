// spec-v1560 MCP adapter: diphtheria-antitoxin-dose in lib/diphtheria-antitoxin-dose-v1560.js.
// The dom keys mirror views/group-v1560b.js and META['diphtheria-antitoxin-dose'].example. Clinical domain.

import * as M from '../../lib/diphtheria-antitoxin-dose-v1560.js';

export default [
  {
    id: 'diphtheria-antitoxin-dose',
    summary: 'Gives the WHO 2024 diphtheria antitoxin dose by disease. A single 20,000, 40,000 or 80,000 IU dose by site, time, neck swelling and severity, with the macrolide antibiotic by weight.',
    compute: M.diphtheriaAntitoxinDose,
    fields: [
      { dom: 'dat-site', arg: 'site', kind: 'enum', required: true, label: 'Site of disease', values: M.SITE_OPTIONS.map((d) => d.value) },
      { dom: 'dat-duration', arg: 'duration', kind: 'enum', required: true, label: 'Time since symptoms began', values: M.DURATION_OPTIONS.map((d) => d.value) },
      { dom: 'dat-neck', arg: 'neck', kind: 'enum', required: true, label: 'Diffuse swelling of the neck', values: M.YES_NO.map((d) => d.value) },
      { dom: 'dat-severe', arg: 'severe', kind: 'enum', required: true, label: 'Severe disease (breathing difficulty or shock)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'dat-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (for the antibiotic)', min: 1, max: 250 },
    ],
  },
];
