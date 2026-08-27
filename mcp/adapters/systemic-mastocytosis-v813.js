// spec-v813 MCP adapter: WHO systemic mastocytosis criteria in
// lib/systemic-mastocytosis-v813.js. The dom keys mirror the browser renderer
// (views/group-v813.js) and META['systemic-mastocytosis'].example. Clinical domain.

import { systemicMastocytosis } from '../../lib/systemic-mastocytosis-v813.js';

export default [
  {
    id: 'systemic-mastocytosis',
    summary: 'Applies the WHO criteria for systemic mastocytosis: one major plus one minor, or three minor. Major is multifocal dense mast cell infiltrates of 15 or more in aggregates. Minors are atypical morphology above 25 percent, an activating KIT mutation, aberrant CD2/CD25/CD30, and baseline tryptase above 20 ng/mL. Pass the MEASURED tryptase - the hereditary alpha-tryptasemia correction (divide by 1 plus extra alpha copies) is applied here.',
    compute: systemicMastocytosis,
    fields: [
      { dom: 'sm-major', arg: 'multifocalInfiltrates', kind: 'boolean', required: false, label: 'Multifocal dense infiltrates' },
      { dom: 'sm-morphology', arg: 'atypicalMorphology', kind: 'boolean', required: false, label: 'Atypical morphology above 25 percent' },
      { dom: 'sm-kit', arg: 'kitMutation', kind: 'boolean', required: false, label: 'Activating KIT mutation' },
      { dom: 'sm-markers', arg: 'aberrantMarkers', kind: 'boolean', required: false, label: 'Aberrant CD2, CD25 or CD30' },
      { dom: 'sm-tryptase', arg: 'tryptase', kind: 'number', required: false, label: 'Measured baseline tryptase, ng/mL' },
      { dom: 'sm-copies', arg: 'extraAlphaCopies', kind: 'number', required: false, label: 'Extra alpha-tryptase gene copies' },
      { dom: 'sm-ahn', arg: 'associatedMyeloidNeoplasm', kind: 'boolean', required: false, label: 'Associated myeloid neoplasm present' },
    ],
  },
];
