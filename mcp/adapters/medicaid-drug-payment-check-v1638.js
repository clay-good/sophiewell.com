// spec-v1638 MCP adapter: medicaid-drug-payment-check in lib/medicaid-drug-payment-check-v1638.js.
// The dom keys mirror views/group-v1638.js and META['medicaid-drug-payment-check'].example.
// Administrative domain. No clock.

import { medicaidDrugPaymentCheck } from '../../lib/medicaid-drug-payment-check-v1638.js';

export default [
  {
    id: 'medicaid-drug-payment-check',
    summary: 'Medicaid fee-for-service payment for a drug as the lowest of several amounts. Compares acquisition cost plus the professional dispensing fee, the usual and customary charge, and the federal upper limit or state maximum allowable cost when entered (42 CFR 447.512, 447.514). Shows which sets the payment. The state plan governs.',
    compute: medicaidDrugPaymentCheck,
    fields: [
      { dom: 'mdp-aac', arg: 'aacPerUnit', kind: 'number', required: true, label: 'State actual acquisition cost, per unit', unit: 'dollars' },
      { dom: 'mdp-qty', arg: 'quantity', kind: 'number', required: true, label: 'Quantity', unit: 'units' },
      { dom: 'mdp-fee', arg: 'dispensingFee', kind: 'number', required: true, label: 'State professional dispensing fee', unit: 'dollars' },
      { dom: 'mdp-uc', arg: 'usualAndCustomary', kind: 'number', required: true, label: 'Usual and customary charge for the prescription', unit: 'dollars' },
      { dom: 'mdp-ful', arg: 'fulPerUnit', kind: 'number', label: 'Federal upper limit, per unit, if the drug has one', unit: 'dollars' },
      { dom: 'mdp-mac', arg: 'stateMacPerUnit', kind: 'number', label: 'State maximum allowable cost, per unit, if any', unit: 'dollars' },
      { dom: 'mdp-paid', arg: 'amountPaid', kind: 'number', label: 'Amount paid', unit: 'dollars' },
    ],
  },
];
