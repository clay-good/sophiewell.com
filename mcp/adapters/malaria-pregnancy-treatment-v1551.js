// spec-v1551 MCP adapter: WHO 2026 malaria treatment choice in pregnancy in lib/malaria-pregnancy-treatment-v1551.js.
// The dom keys mirror views/group-v1551.js and META['malaria-pregnancy-treatment'].example. Clinical domain.

import * as MP from '../../lib/malaria-pregnancy-treatment-v1551.js';

export default [
  {
    id: 'malaria-pregnancy-treatment',
    summary: 'Names the antimalarial WHO recommends in pregnancy, by trimester, severity and species. Artemether-lumefantrine in the first trimester, any first-line ACT later, injectable artesunate when severe; for vivax, no primaquine until breastfeeding ends.',
    compute: MP.malariaPregnancyTreatment,
    fields: [
      { dom: 'mp-trimester', arg: 'trimester', kind: 'enum', required: true, label: 'Trimester', values: MP.TRIMESTER_OPTIONS.map((d) => d.value) },
      { dom: 'mp-severity', arg: 'severity', kind: 'enum', required: true, label: 'Severity', values: MP.SEVERITY_OPTIONS.map((d) => d.value) },
      { dom: 'mp-species', arg: 'species', kind: 'enum', required: true, label: 'Species', values: MP.SPECIES_OPTIONS.map((d) => d.value) },
    ],
  },
];
