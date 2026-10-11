// spec-v1629 MCP adapter: molecular-weight in lib/molecular-weight-v1629.js. The dom keys mirror
// views/group-v1629.js and META['molecular-weight'].example. IUPAC CIAAW 2024 atomic weights;
// administrative domain. The tool never maps a drug name to a formula.

import * as MWT from '../../lib/molecular-weight-v1629.js';

export default [
  {
    id: 'molecular-weight',
    summary: 'Molecular weight from a chemical formula, with brackets and hydrates, from the IUPAC 2024 abridged atomic weights. Gives each element\'s share and the water of hydration; an unknown symbol is refused, never skipped, and no drug is looked up by name.',
    compute: MWT.molecularWeight,
    fields: [
      { dom: 'mwt-formula', arg: 'formula', kind: 'string', required: true, label: 'Chemical formula as written, e.g. CaCl2.2H2O or Mg(OH)2 (a charge only after a caret: SO4^2-)' },
    ],
  },
];
