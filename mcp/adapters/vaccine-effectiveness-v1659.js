// spec-v1659 MCP adapter: vaccine-effectiveness in lib/vaccine-effectiveness-v1659.js. The dom keys mirror views/group-v1659.js and
// META['vaccine-effectiveness'].example.

import * as VE from '../../lib/vaccine-effectiveness-v1659.js';

export default [
  {
    id: 'vaccine-effectiveness',
    summary: 'Vaccine efficacy or effectiveness from the attack rates among vaccinated and unvaccinated people: 1 minus the risk ratio, with its 95% interval. Follows CDC\'s Principles of Epidemiology.',
    compute: VE.vaccineEffectiveness,
    fields: [
      { dom: 'vef-term', arg: 'term', kind: 'enum', values: VE.TERMS.map((x) => x.value), required: false, label: 'Efficacy (trial) or effectiveness (field)' },
      { dom: 'vef-cases-v', arg: 'casesVaccinated', kind: 'number', required: true, label: 'Cases among the vaccinated' },
      { dom: 'vef-vacc', arg: 'vaccinated', kind: 'number', required: true, label: 'Vaccinated persons' },
      { dom: 'vef-cases-u', arg: 'casesUnvaccinated', kind: 'number', required: true, label: 'Cases among the unvaccinated' },
      { dom: 'vef-unvacc', arg: 'unvaccinated', kind: 'number', required: true, label: 'Unvaccinated persons' },
    ]
  },
];
