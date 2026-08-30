// spec-v932 MCP adapter: the hepatic iron index in lib/hepatic-iron-index-v932.js. The dom keys
// mirror the browser renderer (views/group-v932.js) and META['hepatic-iron-index'].example.
//
// The unit is required in substance: the index is defined on micromoles per gram and a microgram
// figure taken as micromolar overstates it fifty-six-fold. Clinical domain.

import { hepaticIronIndex } from '../../lib/hepatic-iron-index-v932.js';

export default [
  {
    id: 'hepatic-iron-index',
    summary: 'Computes the hepatic iron index: hepatic iron concentration in micromoles per gram dry weight, divided by the age in years. At or above 1.9 is the level Bassett associated with homozygous hemochromatosis. THE UNITS ARE THE TRAP: laboratories report the concentration in micromoles per gram OR in micrograms per gram, the index is defined on the micromolar figure, and iron weighs 55.845 micrograms per micromole -- so a microgram figure used directly overstates the index about fifty-six-fold and a normal liver reads as florid hemochromatosis. Say which unit the number is in and this converts, then reports which one it used and what the other would have given. IT DIVIDES BY AGE ON PURPOSE, because a homozygote accumulates iron progressively, so a young homozygote can sit below the threshold. IT HAS LARGELY BEEN SUPERSEDED by HFE genotyping and MRI iron quantification, and a value below the threshold does not exclude iron overload from another cause.',
    compute: hepaticIronIndex,
    fields: [
      { dom: 'hii-conc', arg: 'hepaticIronConcentration', kind: 'number', required: true, label: 'Hepatic iron concentration, dry weight' },
      { dom: 'hii-unit', arg: 'concentrationUnit', kind: 'enum', required: true, label: 'Unit the laboratory reported it in', values: ['umol', 'ug'] },
      { dom: 'hii-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
    ],
  },
];
