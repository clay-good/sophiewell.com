// spec-v1637 MCP adapter: pppa-special-packaging-check in
// lib/pppa-special-packaging-check-v1637.js. The dom keys mirror views/group-v1637.js and
// META['pppa-special-packaging-check'].example. Administrative domain. No clock.

import * as PP from '../../lib/pppa-special-packaging-check-v1637.js';

export default [
  {
    id: 'pppa-special-packaging-check',
    summary: 'Whether a drug package needs child-resistant packaging under 16 CFR 1700.14(a). Tests one substance row at its own threshold and wording (acetaminophen more than 1 g, ibuprofen 1 g or more, iron, lidocaine and others), the prescription exemptions by package content, and the exception when the prescriber or purchaser asks.',
    compute: PP.pppaSpecialPackagingCheck,
    fields: [
      { dom: 'psp-substance', arg: 'substance', kind: 'enum', required: true, values: PP.SUBSTANCES.map((k) => k.value), label: 'Substance or kind of product' },
      { dom: 'psp-amount', arg: 'amount', kind: 'number', label: 'Total amount in the package, in the unit the row names' },
      { dom: 'psp-percent', arg: 'percent', kind: 'number', label: 'Iron or fluoride, the concentration of the element', unit: 'percent' },
      { dom: 'psp-form', arg: 'form', kind: 'enum', values: PP.FORMS.map((k) => k.value), label: 'Iron, the form of the product' },
      { dom: 'psp-other', arg: 'noOtherSubstance', kind: 'enum', values: ['yes', 'no'], label: 'The package contains no other substance subject to the section' },
      { dom: 'psp-before', arg: 'approvedBefore2002', kind: 'enum', values: ['yes', 'no'], label: 'Every active ingredient was approved over the counter on an application before January 29, 2002' },
      { dom: 'psp-request', arg: 'request', kind: 'enum', values: PP.REQUESTS.map((k) => k.value), label: 'For a prescription, a request for a non-child-resistant package' },
    ],
  },
];
