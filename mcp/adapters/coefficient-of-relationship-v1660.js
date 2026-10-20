// spec-v1660 MCP adapter: coefficient-of-relationship in lib/coefficient-of-relationship-v1660.js. The dom keys mirror views/group-v1660.js and
// META['coefficient-of-relationship'].example.

import * as COR from '../../lib/coefficient-of-relationship-v1660.js';

export default [
  {
    id: 'coefficient-of-relationship',
    summary: 'Inbreeding and relationship coefficients for a related couple by Wright\'s path rule, with the recessive risk to a child. Covers first cousins, uncle-niece and others, or your own paths.',
    compute: COR.coefficientOfRelationship,
    fields: [
      { dom: 'cor-rel', arg: 'relationship', kind: 'enum', values: COR.RELATIONSHIP_OPTIONS.map((x) => x.value), required: true, label: 'Relationship' },
      { dom: 'cor-paths', arg: 'paths', kind: 'string', required: false, label: 'Own paths, one per common ancestor: generations from each partner' },
      { dom: 'cor-q', arg: 'alleleFrequency', kind: 'string', required: false, label: 'Allele frequency of a recessive condition (optional)' },
    ]
  },
];
