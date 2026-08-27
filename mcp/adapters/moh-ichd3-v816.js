// spec-v816 MCP adapter: ICHD-3 medication-overuse headache in lib/moh-ichd3-v816.js.
// The dom keys mirror the browser renderer (views/group-v816.js) and
// META['moh-ichd3'].example. One field per drug class, because the overuse threshold
// differs by class. Clinical domain.

import { mohIchd3 } from '../../lib/moh-ichd3-v816.js';

export default [
  {
    id: 'moh-ichd3',
    summary: 'Applies the ICHD-3 criteria for medication-overuse headache. Needs headache on 15 or more days a month, regular overuse for more than 3 months, and no better explanation. The overuse threshold DIFFERS by class: 10 days a month for ergotamine, triptans, opioids and combination analgesics, but 15 for simple analgesics. A patient overusing no single class but reaching 10 total days across classes is 8.2.6.',
    compute: mohIchd3,
    fields: [
      { dom: 'moh-headache-days', arg: 'headacheDays', kind: 'number', required: false, label: 'Headache days per month' },
      { dom: 'moh-months', arg: 'overuseMonths', kind: 'number', required: false, label: 'Months of regular overuse' },
      { dom: 'moh-triptan', arg: 'triptanDays', kind: 'number', required: false, label: 'Triptan days per month' },
      { dom: 'moh-ergotamine', arg: 'ergotamineDays', kind: 'number', required: false, label: 'Ergotamine days per month' },
      { dom: 'moh-opioid', arg: 'opioidDays', kind: 'number', required: false, label: 'Opioid days per month' },
      { dom: 'moh-combination', arg: 'combinationDays', kind: 'number', required: false, label: 'Combination analgesic days per month' },
      { dom: 'moh-acetaminophen', arg: 'paracetamolDays', kind: 'number', required: false, label: 'Acetaminophen days per month' },
      { dom: 'moh-nsaid', arg: 'nsaidDays', kind: 'number', required: false, label: 'Aspirin or NSAID days per month' },
      { dom: 'moh-total-days', arg: 'totalMedicationDays', kind: 'number', required: false, label: 'Total acute medication days per month' },
      { dom: 'moh-noother', arg: 'noBetterExplanation', kind: 'boolean', required: false, label: 'No better ICHD-3 explanation' },
    ],
  },
];
