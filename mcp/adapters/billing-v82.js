// spec-v629 wave 7: adapters for the lib/billing-v82.js patient-responsibility
// calculators (non-clinical / administrative). All take dollars (scaled to cents)
// and return cents; withUsd surfaces a dollar sibling for every *Cents field.

import * as C from '../../lib/billing-v82.js';

const withUsd = (raw) => {
  const out = { ...raw };
  for (const [k, v] of Object.entries(raw)) {
    if (k.endsWith('Cents') && typeof v === 'number' && Number.isFinite(v)) {
      out[`${k.slice(0, -'Cents'.length)}Usd`] = Math.round(v) / 100;
    }
  }
  return out;
};

const usd = (v) => Math.round(v * 100);

export default [
  {
    id: 'medicare-cost-share',
    summary: 'Medicare patient cost-share: Part B deductible then coinsurance (or Part A deductible/coinsurance days) on the allowed amount, before any Medigap/secondary.',
    // Also surface the amount subject to coinsurance (allowed minus deductible).
    compute: (a) => {
      const r = C.medicareCostShare(a);
      return (typeof r.allowedCents === 'number' && typeof r.deductibleAppliedCents === 'number')
        ? { ...r, coinsuranceBaseCents: r.allowedCents - r.deductibleAppliedCents }
        : r;
    },
    formatResult: withUsd,
    fields: [
      { dom: 'mc-part', arg: 'part', kind: 'string', required: true, label: 'Medicare part: A or B' },
      { dom: 'mc-allowed', arg: 'allowedCents', kind: 'number', required: true, label: 'Medicare-allowed amount', unit: '$', to: usd },
      { dom: 'mc-ded', arg: 'deductibleRemainingCents', kind: 'number', label: 'Remaining deductible (defaults to the current Part B deductible)', unit: '$', to: usd },
    ],
  },
  {
    id: 'cob-calc',
    summary: 'Coordination of benefits: what the secondary payer pays under the chosen method (lesser-of, come-out-whole, etc.) and the patient residual after both payers.',
    compute: C.cobCalc,
    formatResult: withUsd,
    fields: [
      { dom: 'cob-method', arg: 'method', kind: 'string', required: true, label: 'COB method (e.g. lesser-of, come-out-whole)' },
      { dom: 'cob-charge', arg: 'billedChargeCents', kind: 'number', required: true, label: 'Billed charge', unit: '$', to: usd },
      { dom: 'cob-pri-allowed', arg: 'primaryAllowedCents', kind: 'number', required: true, label: 'Primary allowed amount', unit: '$', to: usd },
      { dom: 'cob-pri-paid', arg: 'primaryPaidCents', kind: 'number', required: true, label: 'Primary paid amount', unit: '$', to: usd },
      { dom: 'cob-sec-allowed', arg: 'secondaryAllowedCents', kind: 'number', required: true, label: 'Secondary allowed amount', unit: '$', to: usd },
      { dom: 'cob-sec-would', arg: 'secondaryWouldPayCents', kind: 'number', label: 'What the secondary would pay as primary', unit: '$', to: usd },
    ],
  },
  {
    id: 'allowed-amount',
    summary: 'Allowed-amount split: contractual write-off, patient responsibility (deductible + coinsurance + copay), and payer payment for an in- or out-of-network claim.',
    compute: C.allowedAmount,
    formatResult: withUsd,
    fields: [
      { dom: 'aa-charge', arg: 'billedChargeCents', kind: 'number', required: true, label: 'Billed charge', unit: '$', to: usd },
      { dom: 'aa-allowed', arg: 'allowedCents', kind: 'number', required: true, label: 'Allowed amount', unit: '$', to: usd },
      { dom: 'aa-ded', arg: 'deductibleRemainingCents', kind: 'number', label: 'Remaining deductible', unit: '$', to: usd },
      { dom: 'aa-coins', arg: 'coinsurancePct', kind: 'number', label: 'Coinsurance percentage' },
    ],
  },
  {
    id: 'nsa-cost-share',
    summary: 'No Surprises Act cost-share: the protected patient cost-share on the QPA and the prohibited balance-bill amount for an emergency/out-of-network claim.',
    // Echo the coinsurance percentage applied (the lib returns only the amounts).
    compute: (a) => ({ ...C.nsaCostShare(a), coinsurancePct: a.coinsurancePct }),
    formatResult: withUsd,
    fields: [
      { dom: 'nsa-cat', arg: 'serviceCategory', kind: 'string', required: true, label: 'Service category (e.g. emergency, non-emergency, air-ambulance)' },
      { dom: 'nsa-qpa', arg: 'qpaCents', kind: 'number', required: true, label: 'Qualifying Payment Amount (QPA)', unit: '$', to: usd },
      { dom: 'nsa-charge', arg: 'billedChargeCents', kind: 'number', required: true, label: 'Billed charge', unit: '$', to: usd },
      { dom: 'nsa-coins', arg: 'coinsurancePct', kind: 'number', label: 'In-network coinsurance percentage' },
    ],
  },
];
