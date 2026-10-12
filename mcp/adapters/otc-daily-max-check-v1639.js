// spec-v1639 MCP adapter: otc-daily-max-check in lib/otc-daily-max-check-v1639.js. The dom keys mirror
// views/group-v1639.js and META['otc-daily-max-check'].example. Clinical domain. Six label rows (Advil,
// Aleve, Bayer aspirin, Imodium A-D, Delsym, MiraLAX); the rest are FDA monograph doses.

import * as DM from '../../lib/otc-daily-max-check-v1639.js';

export default [
  {
    id: 'otc-daily-max-check',
    summary: 'An OTC 24-hour total against the maximum the label or FDA monograph states. Ibuprofen 200 mg (1,200 mg), naproxen sodium 220 mg (660 mg), aspirin 325 mg (3,900 mg), loperamide (8 mg), diphenhydramine (300 mg), dextromethorphan (120 mg), guaifenesin (2,400 mg), pseudoephedrine (240 mg) and MiraLAX. Checks the single dose and interval too. States the limit; never says a total is safe. Nothing is computed for cough and cold drugs under age 6.',
    compute: DM.otcDailyMaxCheck,
    fields: [
      { dom: 'odm-ingredient', arg: 'ingredient', kind: 'enum', required: true, values: DM.INGREDIENTS.map((i) => i.value), label: 'Active ingredient' },
      { dom: 'odm-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'odm-amount', arg: 'amount24h', kind: 'number', label: 'Units taken or planned in 24 hours (capsules, tablets, caplets, mL, or 17 g doses)' },
      { dom: 'odm-unitmg', arg: 'unitMg', kind: 'number', label: 'Monograph ingredients: milligrams in each unit', unit: 'mg' },
      { dom: 'odm-single', arg: 'singleDose', kind: 'number', label: 'Units in one dose (optional)' },
      { dom: 'odm-interval', arg: 'intervalHours', kind: 'number', label: 'Hours between doses (optional)', unit: 'hours' },
      { dom: 'odm-days', arg: 'days', kind: 'number', label: 'MiraLAX: days of use (optional)', unit: 'days' },
    ],
  },
];
