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
];
