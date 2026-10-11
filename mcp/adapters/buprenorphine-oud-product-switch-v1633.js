// spec-v1633 MCP adapter: buprenorphine-oud-product-switch in
// lib/buprenorphine-oud-product-switch-v1633.js. The dom keys mirror views/group-v1633.js and
// META['buprenorphine-oud-product-switch'].example. Clinical domain. Three label rows: Zubsolv,
// Brixadi and Sublocade.

import * as BS from '../../lib/buprenorphine-oud-product-switch-v1633.js';

export default [
  {
    id: 'buprenorphine-oud-product-switch',
    summary: 'The corresponding dose when a patient with opioid use disorder moves between buprenorphine products, by each label\'s table. Suboxone tablets and Zubsolv in either direction; sublingual buprenorphine to weekly or monthly Brixadi, and Brixadi weekly to monthly or back; transmucosal buprenorphine to Sublocade. With a first injection date it gives the next dates. A dose the table does not list is reported as not in the table.',
    compute: BS.buprenorphineOudProductSwitch,
    fields: [
      { dom: 'bps-switch', arg: 'switch', kind: 'enum', required: true, values: BS.SWITCHES.map((d) => d.value), label: 'From which product to which' },
      { dom: 'bps-dose', arg: 'dose', kind: 'number', required: true, label: 'Current dose: mg of buprenorphine a day (or the Brixadi weekly or monthly dose)', unit: 'mg' },
      { dom: 'bps-first', arg: 'firstInjection', kind: 'string', label: 'Date of the first injection (YYYY-MM-DD, optional)' },
    ],
  },
];
