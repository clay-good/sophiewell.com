// spec-v1509: MCP adapters for hospital 340B eligibility and the orphan-drug exclusion. The dom keys mirror views/group-v1509.js.

import * as E3 from '../../lib/entity-340b-v1509.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: '340b-entity-eligibility',
    summary: 'Whether a hospital meets the 340B statutory tests, and which restrictions apply. Ownership, the disproportionate share percentage and the purchasing ban (42 U.S.C. 256b(a)(4)).',
    compute: E3.entityEligibility340b,
    fields: [
      { dom: 'e3-type', arg: 'type', kind: 'enum', required: true, values: vals(E3.HOSPITAL_TYPES), label: 'Hospital type' },
      { dom: 'e3-own', arg: 'ownership', kind: 'enum', required: true, values: vals(E3.OWNERSHIP), label: 'Ownership or government contract' },
      { dom: 'e3-pct', arg: 'dshPercent', kind: 'number', required: false, label: 'Disproportionate share adjustment percentage (not needed for a critical access hospital)', unit: '%' },
      { dom: 'e3-pickle', arg: 'pickle', kind: 'enum', required: false, values: vals(E3.YES_NO), label: 'Described in Social Security Act 1886(d)(5)(F)(i)(II)' },
      { dom: 'e3-gpo', arg: 'usesGpo', kind: 'enum', required: false, values: vals(E3.YES_NO), label: 'Buys covered outpatient drugs through a group purchasing organization' },
    ],
  },
  {
    id: '340b-orphan-exclusion',
    summary: 'Whether an orphan-designated drug is excluded from 340B pricing for an entity. Applies 42 U.S.C. 256b(e) whatever the drug is used for.',
    compute: E3.orphanExclusion340b,
    fields: [
      { dom: 'oe-type', arg: 'type', kind: 'enum', required: true, values: vals(E3.ORPHAN_ENTITY_TYPES), label: 'Covered entity type' },
      { dom: 'oe-orphan', arg: 'orphan', kind: 'enum', required: true, values: vals(E3.YES_NO), label: 'The drug has an FDA orphan designation' },
    ],
  },
  {
    id: '340b-patient-check',
    summary: 'Whether a person is a 340B patient for a prescription. Tests the three parts of HRSA\'s 1996 patient definition and the dispensing-only rule.',
    compute: E3.patientCheck340b,
    fields: [
      { dom: 'pc3-entity', arg: 'entity', kind: 'enum', required: true, values: vals(E3.ENTITY_KINDS), label: 'Covered entity kind' },
      { dom: 'pc3-records', arg: 'records', kind: 'enum', required: true, values: vals(E3.YES_NO), label: 'The entity keeps the person\'s health care records' },
      { dom: 'pc3-provider', arg: 'provider', kind: 'enum', required: true, values: vals(E3.YES_NO), label: 'Prescriber employed by the entity or under its arrangement' },
      { dom: 'pc3-scope', arg: 'scope', kind: 'enum', required: false, values: vals(E3.YES_NO), label: 'Grantees: the care is within the grant scope' },
      { dom: 'pc3-disp', arg: 'dispensingOnly', kind: 'enum', required: true, values: vals(E3.YES_NO), label: 'Dispensing is the only service the entity provides the person' },
    ],
  },
  {
    id: '340b-duplicate-discount',
    summary: 'What a 340B claim must carry and whether 340B stock may be used, by payer. The TB modifier, the Part D repository and the Medicaid Exclusion File.',
    compute: E3.duplicateDiscount340b,
    fields: [
      { dom: 'dd-payer', arg: 'payer', kind: 'enum', required: true, values: vals(E3.PAYERS_340B), label: 'Payer' },
      { dom: 'dd-mef', arg: 'mef', kind: 'enum', required: false, values: vals(E3.MEF_STATUS), label: 'Medicaid Exclusion File status (Medicaid fee-for-service)' },
      { dom: 'dd-change', arg: 'changeApproved', kind: 'string', required: false, label: 'Date a carve-in or carve-out change was approved (YYYY-MM-DD)' },
      { dom: 'dd-state', arg: 'stateRule', kind: 'string', required: false, label: 'The state\'s 340B identifier rule for Medicaid managed care' },
      { dom: 'dd-dos', arg: 'serviceDate', kind: 'string', required: false, label: 'Date of service (YYYY-MM-DD)' },
    ],
  },
  {
    id: '340b-ceiling-price',
    summary: 'A drug\'s 340B ceiling price and Medicaid unit rebate amount. AMP minus the basic and inflation rebates, with penny pricing (42 CFR 10.10).',
    compute: E3.ceilingPrice340b,
    fields: [
      { dom: 'cp3-cat', arg: 'category', kind: 'enum', required: true, values: vals(E3.DRUG_CATEGORIES), label: 'Drug category' },
      { dom: 'cp3-amp', arg: 'amp', kind: 'number', required: true, label: 'Average manufacturer price per unit, prior quarter', unit: 'USD' },
      { dom: 'cp3-bp', arg: 'bestPrice', kind: 'number', required: false, label: 'Best price per unit (brand drugs)', unit: 'USD' },
      { dom: 'cp3-bamp', arg: 'baselineAmp', kind: 'number', required: false, label: 'Baseline AMP per unit', unit: 'USD' },
      { dom: 'cp3-bcpi', arg: 'baselineCpi', kind: 'number', required: false, label: 'Baseline CPI-U' },
      { dom: 'cp3-ccpi', arg: 'currentCpi', kind: 'number', required: false, label: 'CPI-U for the month before the quarter' },
      { dom: 'cp3-year', arg: 'year', kind: 'number', required: false, label: 'Year of the rebate quarter' },
      { dom: 'cp3-units', arg: 'unitsPerPackage', kind: 'number', required: false, label: 'Units per package' },
    ],
  },
];
