// spec-v1506: MCP adapter for the Medicare negotiated price check. The dom keys mirror views/group-v1506.js.

import * as MF from '../../lib/mfp-prices-v1506.js';

export default [
  {
    id: 'partd-mfp-price-check',
    summary: 'Whether a drug has a Medicare negotiated price on a date. Reads the CMS negotiated-prices file: the price per 30-day supply, the next one, or deselection.',
    compute: MF.mfpPriceCheck,
    fields: [
      { dom: 'mfp-drug', arg: 'drug', kind: 'enum', required: true, values: MF.DRUGS.map((d) => d.value), label: 'Drug selected for negotiation' },
      { dom: 'mfp-date', arg: 'date', kind: 'string', required: false, label: 'Date of service (YYYY-MM-DD; blank for today)' },
    ],
  },
];
