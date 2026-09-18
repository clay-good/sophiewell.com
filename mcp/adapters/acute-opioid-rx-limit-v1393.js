// spec-v1393: MCP adapter. The dom keys mirror views/group-v1393.js and this tile's META example.

import * as LIM from '../../lib/acute-opioid-rx-limit-v1393.js';

export default [
  {
    id: 'acute-opioid-rx-limit',
    summary: "The day limit on an opioid prescription for acute pain in New York, New Jersey, or Texas, with each state's exceptions. New York (Public Health Law 3331(5)) allows a 7-day supply on the initial consultation for acute pain. New Jersey (N.J.A.C. 13:35-7.6) allows 5 days of an immediate-release opioid on the initial prescription, and a subsequent one no less than four days later after consultation, up to 30 days. Texas (Health and Safety Code 481.07636) allows 10 days and no refill on every acute-pain opioid prescription. Chronic pain, cancer, hospice, and palliative care are outside the limits, and each state adds its own. California has no general adult day limit in statute and is not offered.",
    compute: LIM.acuteOpioidRxLimit,
    fields: [
      { dom: 'lim-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: LIM.RX_LIMIT_STATES.map((s) => s.value) },
      { dom: 'lim-category', arg: 'category', kind: 'enum', required: true, label: 'What the opioid is for', values: LIM.CATEGORIES.map((s) => s.value) },
      { dom: 'lim-days', arg: 'days', kind: 'number', required: true, label: 'Days supplied' },
      { dom: 'lim-initial', arg: 'initial', kind: 'enum', required: true, label: 'Initial prescription for this pain', values: ['yes', 'no'] },
      { dom: 'lim-refills', arg: 'refills', kind: 'enum', label: 'Refills ordered (Texas)', values: ['yes', 'no'] },
      { dom: 'lim-er', arg: 'extendedRelease', kind: 'enum', label: 'Extended-release or long-acting (New Jersey)', values: ['yes', 'no'] },
      { dom: 'lim-previous', arg: 'previous', kind: 'string', label: 'Initial prescription date (YYYY-MM-DD)' },
      { dom: 'lim-today', arg: 'today', kind: 'string', label: "Today's date (YYYY-MM-DD)" },
    ],
  },
];
