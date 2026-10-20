// spec-v1659 MCP adapter: incidence-prevalence in lib/incidence-prevalence-v1659.js. The dom keys mirror views/group-v1659.js and
// META['incidence-prevalence'].example.

import * as IP from '../../lib/incidence-prevalence-v1659.js';

export default [
  {
    id: 'incidence-prevalence',
    summary: 'Incidence proportion, incidence rate per person-time, and point or period prevalence, as CDC defines them. Each shows its multiplier and unit.',
    compute: IP.incidencePrevalence,
    fields: [
      { dom: 'ipv-measure', arg: 'measure', kind: 'enum', values: IP.MEASURES.map((x) => x.value), required: true, label: 'Measure' },
      { dom: 'ipv-cases', arg: 'cases', kind: 'number', required: true, label: 'New cases, or people with the condition for prevalence' },
      { dom: 'ipv-denominator', arg: 'denominator', kind: 'number', required: true, label: 'Population, or person-time for a rate' },
      { dom: 'ipv-unit', arg: 'timeUnit', kind: 'enum', values: ['person-years', 'person-months', 'person-days'], required: false, label: 'Person-time unit (incidence rate only)' },
      { dom: 'ipv-multiplier', arg: 'multiplier', kind: 'enum', values: ['100', '1000', '10000', '100000'], required: true, label: 'Multiplier' },
    ]
  },
];
