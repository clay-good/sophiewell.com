// spec-v629: adapters for the lib/billing-v83.js identifier validators — the first
// wave of non-clinical (administrative) calculators exposed over MCP. These are
// pure format/check-digit validators (no network, no CMS tables): an agent passes
// the identifier as a string and gets a structured verdict. dom keys mirror
// views/group-b*.js and META.example.fields; arg names mirror the lib signatures
// (each lib fn reads a single named property off its input object).

import * as C from '../../lib/billing-v83.js';

export default [
  {
    id: 'npi-validate',
    summary: 'NPI Luhn check-digit validation (10 digits) or generation from a 9-digit base, per the CMS/ISO 80840 prefix rule.',
    compute: C.npiValidate,
    fields: [
      { dom: 'npi-in', arg: 'npi', kind: 'string', required: true, label: 'NPI (10 digits to validate, or a 9-digit base to generate)' },
    ],
  },
  {
    id: 'mbi-validate',
    summary: 'Medicare Beneficiary Identifier (MBI) format validation: the 11-position CMS grammar and excluded-letter rules.',
    compute: C.mbiValidate,
    fields: [
      { dom: 'mbi-in', arg: 'mbi', kind: 'string', required: true, label: 'Medicare Beneficiary Identifier (11 characters, hyphens optional)' },
    ],
  },
  {
    id: 'icd10-validate',
    summary: 'ICD-10-CM structural and specificity check: category/subcategory grammar and whether a 7th character is required.',
    compute: C.icd10Validate,
    fields: [
      { dom: 'icd-in', arg: 'code', kind: 'string', required: true, label: 'ICD-10-CM code, e.g. M54.5' },
    ],
  },
  // spec-v629 wave 2: the facility-pricing / remittance calculators in the same
  // module. Dollar inputs are scaled to cents to match the lib contract (as the
  // browser view does); the lib defaults every optional field.
  {
    id: 'era-balance',
    summary: '835 / EOB remittance balancing: billed minus paid minus the CO/PR/OA/PI adjustments; flags out-of-balance and the patient responsibility to bill.',
    compute: C.eraBalance,
    fields: [
      { dom: 'era-billed', arg: 'billedCents', kind: 'number', required: true, label: 'Billed charge', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'era-paid', arg: 'paidCents', kind: 'number', required: true, label: 'Paid amount', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'era-co', arg: 'coCents', kind: 'number', label: 'CO contractual-obligation adjustments', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'era-pr', arg: 'prCents', kind: 'number', label: 'PR patient-responsibility adjustments', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'era-oa', arg: 'oaCents', kind: 'number', label: 'OA other adjustments', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'era-pi', arg: 'piCents', kind: 'number', label: 'PI payer-initiated adjustments', unit: '$', to: (v) => Math.round(v * 100) },
    ],
  },
  {
    id: 'drg-payment',
    summary: 'IPPS DRG payment estimate: relative weight x the wage-index-adjusted operating+capital base, with the per-diem transfer reduction. Operating model only.',
    compute: C.drgPayment,
    fields: [
      { dom: 'drg-weight', arg: 'relativeWeight', kind: 'number', required: true, label: 'MS-DRG relative weight' },
      { dom: 'drg-oper', arg: 'operatingBaseCents', kind: 'number', required: true, label: 'Operating base rate', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'drg-cap', arg: 'capitalBaseCents', kind: 'number', label: 'Capital base rate', unit: '$', to: (v) => Math.round(v * 100) },
      { dom: 'drg-wage', arg: 'wageIndex', kind: 'number', label: 'Wage index (default 1.0)' },
      { dom: 'drg-transfer', arg: 'isTransfer', kind: 'bool', label: 'Post-acute transfer (apply the per-diem reduction)' },
      { dom: 'drg-los', arg: 'lengthOfStay', kind: 'number', label: 'Length of stay in days (transfer only)' },
      { dom: 'drg-gmlos', arg: 'gmlos', kind: 'number', label: 'Geometric mean LOS in days (transfer only)' },
      { dom: 'drg-addon', arg: 'addOnCents', kind: 'number', label: 'Entered add-ons (outlier / IME / DSH)', unit: '$', to: (v) => Math.round(v * 100) },
    ],
  },
  {
    id: 'apc-payment',
    // spec-v936: the first sentence is the hub row, and the hub row is cut at about 100
    // characters. Splitting the packaging rules into a second sentence lets the row finish.
    summary: 'OPPS APC payment estimate: relative weight x conversion factor, wage adjusted. Status-indicator packaging applies (status N pays $0), as does the multiple-procedure discount for status-T lines.',
    compute: C.apcPayment,
    fields: [
      { dom: 'apc-list', arg: 'lines', kind: 'string', required: true, label: 'APC lines, one per line as "weight, status indicator" (e.g. "10, T")' },
      { dom: 'apc-cf', arg: 'conversionFactorCents', kind: 'number', required: true, label: 'OPPS conversion factor', unit: '$ per weight unit' },
      { dom: 'apc-wage', arg: 'wageIndex', kind: 'number', label: 'Wage index (default 1.0)' },
      { dom: 'apc-disc', arg: 'discountPct', kind: 'number', label: 'Multiple-procedure discount %, default 50' },
    ],
    // The lib takes a parsed lines array + cents; replicate the view's parse.
    toArgs: (i) => {
      const lines = String(i['apc-list'] == null ? '' : i['apc-list']).split('\n').map((s) => s.trim()).filter(Boolean)
        .map((line) => { const p = line.split(',').map((s) => s.trim()); return { weight: Number(p[0]), statusIndicator: p[1] || 'N' }; });
      const args = { lines, conversionFactorCents: Math.round((Number(i['apc-cf']) || 0) * 100) };
      if (i['apc-wage'] !== undefined && i['apc-wage'] !== '') args.wageIndex = Number(i['apc-wage']);
      if (i['apc-disc'] !== undefined && i['apc-disc'] !== '') args.discountPct = Number(i['apc-disc']);
      return args;
    },
    // Surface dollar figures alongside the cents the lib returns (agent-friendly,
    // and the per-line dollars the source example cites).
    formatResult: (raw) => ({
      ...raw,
      totalUsd: Math.round(raw.totalCents) / 100,
      lines: raw.lines.map((l) => ({ ...l, payUsd: Math.round(l.payCents) / 100 })),
    }),
  },
];
