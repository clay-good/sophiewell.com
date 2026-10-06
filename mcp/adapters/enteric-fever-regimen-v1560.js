// spec-v1560 MCP adapter: enteric-fever-regimen in lib/enteric-fever-regimen-v1560.js.
// The dom keys mirror views/group-v1560b.js and META['enteric-fever-regimen'].example. Clinical domain.

import * as M from '../../lib/enteric-fever-regimen-v1560.js';

export default [
  {
    id: 'enteric-fever-regimen',
    summary: 'Gives the WHO AWaRe empiric antibiotic for typhoid by severity and local resistance. Ciprofloxacin where fluoroquinolone resistance is low, azithromycin or ceftriaxone where high, child doses by weight, 7 or 10 days.',
    compute: M.entericFeverRegimen,
    fields: [
      { dom: 'ef-severity', arg: 'severity', kind: 'enum', required: true, label: 'Severity', values: M.SEVERITY_OPTIONS.map((d) => d.value) },
      { dom: 'ef-resistance', arg: 'resistance', kind: 'enum', required: true, label: 'Local fluoroquinolone resistance risk', values: M.RESISTANCE_OPTIONS.map((d) => d.value) },
      { dom: 'ef-age', arg: 'ageGroup', kind: 'enum', required: true, label: 'Adult or child', values: M.AGE_OPTIONS.map((d) => d.value) },
      { dom: 'ef-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (child)', min: 3, max: 120 },
    ],
  },
];
