// spec-v1636 MCP adapter: passive-immunization-dose in lib/passive-immunization-dose-v1636.js. The dom
// keys mirror views/group-v1636.js and META['passive-immunization-dose'].example. Clinical domain.

import * as PI from '../../lib/passive-immunization-dose-v1636.js';

export default [
  {
    id: 'passive-immunization-dose',
    summary: 'Hepatitis B, varicella and tetanus immune globulin doses from the labels. Hepatitis B immune globulin 0.06 mL/kg after an exposure, or 0.5 mL for the newborn of an HBsAg-positive mother; VARIZIG units, vials and mL by the label\'s weight table; tetanus immune globulin 250 units, with both of the label\'s options under 7 years. It does not decide whether immune globulin is indicated.',
    compute: (args) => PI.passiveImmunizationDose(args, new Date()),
    fields: [
      { dom: 'pid-product', arg: 'product', kind: 'enum', required: true, values: PI.PRODUCTS.map((x) => x.value), label: 'Product and situation' },
      { dom: 'pid-weight', arg: 'weight', kind: 'number', label: 'Weight (hepatitis B after exposure, VARIZIG, and tetanus under 7 years)', unit: 'kg' },
      { dom: 'pid-age', arg: 'age', kind: 'number', label: 'Age (tetanus immune globulin)', unit: 'years' },
    ],
  },
];
