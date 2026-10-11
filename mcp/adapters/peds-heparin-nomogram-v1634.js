// spec-v1634 MCP adapter: peds-heparin-nomogram in lib/peds-heparin-nomogram-v1634.js. The dom keys
// mirror views/group-v1634.js and META['peds-heparin-nomogram'].example. Clinical domain. Without an
// aPTT it reports the starting doses (age group needed); with one it reports the adjustment (current
// rate needed).

import * as PH from '../../lib/peds-heparin-nomogram-v1634.js';

export default [
  {
    id: 'peds-heparin-nomogram',
    summary: 'The pediatric heparin protocol in the CHEST 2012 guideline, as doses. Without an aPTT it gives the loading dose and starting rate by weight and age group; with an aPTT and the current rate it gives the bolus, hold, new rate and repeat time from the adjustment table. The table assumes an aPTT of 60 to 85 seconds reflects an anti-Xa of 0.35 to 0.70; a local protocol takes precedence.',
    compute: PH.pedsHeparinNomogram,
    fields: [
      { dom: 'phn-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'phn-age', arg: 'age', kind: 'enum', values: PH.AGES.map((a) => a.value), label: 'Age group (for the starting rate)' },
      { dom: 'phn-aptt', arg: 'aptt', kind: 'number', label: 'aPTT, to adjust a running infusion', unit: 'seconds' },
      { dom: 'phn-rate', arg: 'currentRate', kind: 'number', label: 'Current infusion rate (with an aPTT)', unit: 'units/h' },
    ],
  },
];
