// spec-v1508: MCP adapters for the hospital financial assistance and self-pay estimate tools. The dom keys mirror views/group-v1508.js.

import * as HF from '../../lib/hospital-fap-v1508.js';

const vals = (xs) => xs.map((x) => x.value);
const usd = (dom, arg, label, required = false) => ({ dom, arg, kind: 'number', required, label, unit: 'USD' });

export default [
  {
    id: 'agb-percentage',
    summary: 'A hospital\'s amounts generally billed percentage. Allowed amounts over gross charges by the look-back method (26 CFR 1.501(r)-5).',
    compute: HF.agbPercentage,
    fields: [
      usd('agb-allowed', 'allowed', 'Total allowed amounts for the 12-month period', true),
      usd('agb-gross', 'gross', 'Total gross charges for those claims', true),
      { dom: 'agb-basis', arg: 'basis', kind: 'enum', required: false, values: vals(HF.AGB_BASES), label: 'Payers included' },
      { dom: 'agb-end', arg: 'periodEnd', kind: 'string', required: false, label: 'End of the 12-month period (YYYY-MM-DD)' },
      usd('agb-bill', 'bill', 'A patient\'s gross charges'),
    ],
  },
  {
    id: 'fap-collection-clock',
    summary: 'When a nonprofit hospital may start extraordinary collection actions. The 120-day, 30-day notice and 240-day application rules (26 CFR 1.501(r)-6).',
    compute: HF.fapCollectionClock,
    fields: [
      { dom: 'fcc-bill', arg: 'firstBill', kind: 'string', required: true, label: 'First post-discharge bill (YYYY-MM-DD)' },
      { dom: 'fcc-notice', arg: 'notice', kind: 'string', required: false, label: 'Written notice sent (YYYY-MM-DD)' },
      { dom: 'fcc-app', arg: 'application', kind: 'string', required: false, label: 'Financial assistance application (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'fap-discount',
    summary: 'A hospital financial assistance discount from its own sliding scale. Places income on the poverty guidelines and caps the result at AGB.',
    compute: HF.fapDiscount,
    fields: [
      { dom: 'fd-size', arg: 'size', kind: 'number', required: true, label: 'Household size' },
      usd('fd-income', 'income', 'Annual household income', true),
      { dom: 'fd-region', arg: 'region', kind: 'enum', required: true, values: vals(HF.REGIONS), label: 'Where the household lives' },
      { dom: 'fd-year', arg: 'year', kind: 'number', required: false, label: 'Guideline year (blank for this year)' },
      usd('fd-gross', 'gross', 'Gross charges', true),
      { dom: 'fd-t1l', arg: 'tier1Limit', kind: 'number', required: true, label: 'Tier 1: income up to (% of poverty)' },
      { dom: 'fd-t1d', arg: 'tier1Discount', kind: 'number', required: true, label: 'Tier 1: discount (%)' },
      { dom: 'fd-t2l', arg: 'tier2Limit', kind: 'number', required: false, label: 'Tier 2: income up to (% of poverty)' },
      { dom: 'fd-t2d', arg: 'tier2Discount', kind: 'number', required: false, label: 'Tier 2: discount (%)' },
      { dom: 'fd-t3l', arg: 'tier3Limit', kind: 'number', required: false, label: 'Tier 3: income up to (% of poverty)' },
      { dom: 'fd-t3d', arg: 'tier3Discount', kind: 'number', required: false, label: 'Tier 3: discount (%)' },
      { dom: 'fd-agb', arg: 'agb', kind: 'number', required: false, label: 'Hospital AGB percentage' },
    ],
  },
  {
    id: 'gfe-deadline',
    summary: 'When a good faith estimate is due to an uninsured or self-pay patient. Counts federal business days under 45 CFR 149.610.',
    compute: HF.gfeDeadline,
    fields: [
      { dom: 'gfe-sched', arg: 'scheduled', kind: 'string', required: false, label: 'Date scheduled (YYYY-MM-DD)' },
      { dom: 'gfe-svc', arg: 'serviceDate', kind: 'string', required: false, label: 'Service date (YYYY-MM-DD)' },
      { dom: 'gfe-req', arg: 'requested', kind: 'string', required: false, label: 'Date the patient asked for an estimate (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'ppdr-eligibility',
    summary: 'Whether a self-pay bill can go to patient-provider dispute resolution. Tests each provider against its own estimate line ($400 rule, 45 CFR 149.620).',
    compute: HF.ppdrEligibility,
    fields: [
      usd('pp-e1', 'est1', 'Provider 1: amount on the estimate', true),
      usd('pp-b1', 'billed1', 'Provider 1: total billed', true),
      usd('pp-e2', 'est2', 'Provider 2: amount on the estimate'),
      usd('pp-b2', 'billed2', 'Provider 2: total billed'),
      usd('pp-e3', 'est3', 'Provider 3: amount on the estimate'),
      usd('pp-b3', 'billed3', 'Provider 3: total billed'),
      { dom: 'pp-first', arg: 'firstBill', kind: 'string', required: false, label: 'First bill received (YYYY-MM-DD)' },
    ],
  },
];
