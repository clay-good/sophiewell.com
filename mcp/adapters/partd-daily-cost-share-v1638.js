// spec-v1638 MCP adapter: partd-daily-cost-share in lib/partd-daily-cost-share-v1638.js. The dom keys mirror
// views/group-v1638.js and META['partd-daily-cost-share'].example. Administrative domain. No clock.

import * as DC from '../../lib/partd-daily-cost-share-v1638.js';

export default [
  {
    id: 'partd-daily-cost-share',
    summary: 'Part D cost sharing for a fill shorter than the month\'s supply. The monthly copayment is divided by the days in the month\'s supply, rounded to the cent, then multiplied by the days dispensed (42 CFR 423.153(b)(4)). Coinsurance is applied unchanged. Solid oral doses only, not antibiotics or original-container products.',
    compute: DC.partdDailyCostShare,
    fields: [
      { dom: 'pdc-sharing', arg: 'sharing', kind: 'enum', required: true, values: DC.SHARING.map((k) => k.value), label: 'The plan charges' },
      { dom: 'pdc-copay', arg: 'monthlyCopay', kind: 'number', label: 'Monthly copayment', unit: 'dollars' },
      { dom: 'pdc-pct', arg: 'coinsurancePercent', kind: 'number', label: 'Coinsurance', unit: 'percent' },
      { dom: 'pdc-price', arg: 'priceDispensed', kind: 'number', label: 'Price of the supply actually dispensed, for coinsurance', unit: 'dollars' },
      { dom: 'pdc-month', arg: 'monthDays', kind: 'number', required: true, label: 'Days in the approved one-month supply', unit: 'days' },
      { dom: 'pdc-days', arg: 'daysDispensed', kind: 'number', required: true, label: 'Days actually dispensed', unit: 'days' },
      { dom: 'pdc-solid', arg: 'solidOral', kind: 'enum', required: true, values: ['yes', 'no'], label: 'A solid oral dose' },
      { dom: 'pdc-abx', arg: 'antibiotic', kind: 'enum', required: true, values: ['yes', 'no'], label: 'An antibiotic' },
      { dom: 'pdc-orig', arg: 'originalContainer', kind: 'enum', required: true, values: ['yes', 'no'], label: 'Dispensed in its original container or packaging' },
    ],
  },
];
