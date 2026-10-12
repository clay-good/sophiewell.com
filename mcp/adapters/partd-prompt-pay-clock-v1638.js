// spec-v1638 MCP adapter: partd-prompt-pay-clock in lib/partd-prompt-pay-clock-v1638.js. The dom keys mirror
// views/group-v1638.js and META['partd-prompt-pay-clock'].example. Administrative domain. No clock.

import * as PP from '../../lib/partd-prompt-pay-clock-v1638.js';

export default [
  {
    id: 'partd-prompt-pay-clock',
    summary: 'When a Part D plan must pay a retail network pharmacy\'s clean claim. Due 14 days after an electronic claim is received, or 30 days for any other; late payment bears interest at the 3-month Treasury rate plus 0.1 point (42 CFR 423.520). Mail-order and long-term care pharmacies are outside the rule.',
    compute: PP.partdPromptPayClock,
    fields: [
      { dom: 'ppp-pharmacy', arg: 'pharmacy', kind: 'enum', required: true, values: PP.PHARMACIES.map((k) => k.value), label: 'Pharmacy type' },
      { dom: 'ppp-claim', arg: 'claim', kind: 'enum', values: PP.CLAIMS.map((k) => k.value), label: 'Kind of claim' },
      { dom: 'ppp-sent', arg: 'sent', kind: 'string', label: 'Date transferred, or the postmark date (YYYY-MM-DD)' },
      { dom: 'ppp-notice', arg: 'deficiencyNotice', kind: 'string', label: 'Date of any deficiency notice (YYYY-MM-DD)' },
      { dom: 'ppp-info', arg: 'additionalInfo', kind: 'string', label: 'Date additional information was received (YYYY-MM-DD)' },
      { dom: 'ppp-paid', arg: 'paid', kind: 'string', label: 'Date paid (YYYY-MM-DD)' },
      { dom: 'ppp-amount', arg: 'amount', kind: 'number', label: 'Claim amount', unit: 'dollars' },
      { dom: 'ppp-rate', arg: 'treasuryRatePercent', kind: 'number', label: '3-month Treasury rate for the period', unit: 'percent' },
    ],
  },
];
