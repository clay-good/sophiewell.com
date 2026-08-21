// spec-v629 wave 3: adapters for the lib/billing-v78.js MPFS payment calculators
// (non-clinical / administrative). The lib returns money as integer cents; the
// browser view formats it to dollars. `withUsd` surfaces a dollar sibling for
// every *Cents field so agents get dollars directly (and the worked examples,
// which cite dollars, round-trip). Dollar inputs are scaled to cents via `to`.
// mppr is intentionally not here: its input is a variable number of fee rows,
// which does not fit the flat field contract; it needs bespoke handling.

import * as C from '../../lib/billing-v78.js';

// Add a `<name>Usd` = <name>Cents / 100 sibling for every integer-cents field.
const withUsd = (raw) => {
  const out = { ...raw };
  for (const [k, v] of Object.entries(raw)) {
    if (k.endsWith('Cents') && typeof v === 'number' && Number.isFinite(v)) {
      out[`${k.slice(0, -'Cents'.length)}Usd`] = Math.round(v) / 100;
    }
  }
  return out;
};

export default [
  {
    id: 'rvu-payment',
    summary: 'Medicare PFS payment from RVUs: (work x workGPCI + PE x peGPCI + MP x mpGPCI) x conversion factor x units, non-facility and facility, with the site-of-service differential.',
    compute: C.rvuPayment,
    formatResult: withUsd,
    fields: [
      { dom: 'rvu-work', arg: 'workRvu', kind: 'number', required: true, label: 'Work RVU' },
      { dom: 'rvu-penf', arg: 'peRvuNonFacility', kind: 'number', required: true, label: 'Practice-expense RVU, non-facility' },
      { dom: 'rvu-pef', arg: 'peRvuFacility', kind: 'number', required: true, label: 'Practice-expense RVU, facility' },
      { dom: 'rvu-mp', arg: 'mpRvu', kind: 'number', required: true, label: 'Malpractice RVU' },
      { dom: 'rvu-wg', arg: 'workGpci', kind: 'number', required: true, label: 'Work GPCI' },
      { dom: 'rvu-peg', arg: 'peGpci', kind: 'number', required: true, label: 'Practice-expense GPCI' },
      { dom: 'rvu-mpg', arg: 'mpGpci', kind: 'number', required: true, label: 'Malpractice GPCI' },
      { dom: 'rvu-cf', arg: 'conversionFactor', kind: 'number', required: true, label: 'Conversion factor ($)' },
      { dom: 'rvu-units', arg: 'units', kind: 'number', label: 'Units (default 1)' },
      { dom: 'rvu-loc', arg: 'loc', kind: 'enum', values: ['manual'], label: 'GPCI entry mode (manual)' },
    ],
    // Map the RVU/GPCI/CF inputs; rvu-loc is a view-only mode and is ignored.
    toArgs: (i) => {
      const n = (k) => Number(i[k]);
      const args = {
        workRvu: n('rvu-work'),
        peRvuNonFacility: n('rvu-penf'),
        peRvuFacility: n('rvu-pef'),
        mpRvu: n('rvu-mp'),
        workGpci: n('rvu-wg'),
        peGpci: n('rvu-peg'),
        mpGpci: n('rvu-mpg'),
        conversionFactor: n('rvu-cf'),
      };
      if (i['rvu-units'] !== undefined && i['rvu-units'] !== '') args.units = Number(i['rvu-units']);
      return args;
    },
  },
  {
    id: 'bilateral-pay',
    summary: 'Bilateral-surgery payment by the MPFS bilateral indicator (0/1/2/3): the allowed amount for the bilateral pair as a percentage of the fee schedule.',
    compute: C.bilateralPay,
    formatResult: withUsd,
    fields: [
      { dom: 'bil-fee', arg: 'feeCents', kind: 'number', required: true, label: 'Fee-schedule amount', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'bil-ind', arg: 'indicator', kind: 'number', required: true, label: 'Bilateral indicator (0, 1, 2, or 3)', values: ['1', '2', '3', '0', '9'] },
    ],
  },
  {
    id: 'multi-surgeon-pay',
    summary: 'Co-surgeon / assistant / team payment: the allowed percentage of the primary fee for the surgical role, gated by the MPFS multi-surgeon indicator.',
    compute: C.multiSurgeonPay,
    formatResult: withUsd,
    fields: [
      { dom: 'ms-fee', arg: 'feeCents', kind: 'number', required: true, label: 'Primary fee-schedule amount', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'ms-role', arg: 'role', kind: 'string', required: true, label: 'Surgical role (e.g. assistant, co-surgeon, team)' },
      { dom: 'ms-ind', arg: 'indicator', kind: 'number', required: true, label: 'Multi-surgeon indicator (0, 1, 2, or 9)', values: ['2', '1', '0', '9'] },
    ],
  },
  {
    id: 'sequestration-adjust',
    summary: 'Medicare sequestration: the program payment (allowed minus patient responsibility), the sequestration withhold at the current percentage, and the net Medicare check.',
    compute: C.sequestrationAdjust,
    formatResult: withUsd,
    fields: [
      { dom: 'seq-allowed', arg: 'allowedCents', kind: 'number', required: true, label: 'Allowed amount', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'seq-patient', arg: 'patientResponsibilityCents', kind: 'number', label: 'Patient responsibility (deductible/coinsurance)', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'seq-pct', arg: 'seqPct', kind: 'number', label: 'Sequestration percentage (default 2)' },
    ],
  },
];
