// spec-v875 MCP adapter: the NHSN CAUTI definition in lib/cauti-nhsn-v875.js. The dom keys mirror
// the browser renderer (views/group-v875.js) and META['cauti-nhsn'].example.
//
// It returns a surveillance attribution, not a clinical diagnosis. Clinical domain.

import { cautiNhsn } from '../../lib/cauti-nhsn-v875.js';

export default [
  {
    id: 'cauti-nhsn',
    summary: 'Applies the NHSN catheter-associated urinary tract infection definition: a device, a symptom and a culture criterion, all three. The catheter must have been in place more than two consecutive calendar days, counting the day of insertion as day one, and be either still in place that day or removed the day before. There must be at least one of fever above 100.4 F, suprapubic tenderness, costovertebral angle pain or tenderness, urinary urgency, urinary frequency, or dysuria. The culture must grow no more than two species with at least one bacterium at 100,000 CFU/mL or more. URGENCY, FREQUENCY AND DYSURIA ARE NOT COUNTED WHILE THE CATHETER IS IN PLACE. MORE THAN TWO SPECIES EXCLUDES THE EVENT, and YEAST IS NOT A BACTERIUM. It is a surveillance definition, not a clinical diagnosis.',
    compute: cautiNhsn,
    fields: [
      { dom: 'cau-catheterdays', arg: 'catheterDays', kind: 'number', required: false, label: 'Consecutive calendar days the indwelling catheter has been in place, counting the day of insertion as day 1' },
      { dom: 'cau-catheterstillinplace', arg: 'catheterStillInPlace', kind: 'boolean', required: false, label: 'Catheter still in place on the date of event (this is also what discounts urgency, frequency and dysuria)' },
      { dom: 'cau-catheterremoveddaybefore', arg: 'catheterRemovedDayBefore', kind: 'boolean', required: false, label: 'Catheter removed the day before the date of event' },
      { dom: 'cau-fever', arg: 'fever', kind: 'boolean', required: false, label: 'Fever above 100.4 F (38.0 C)' },
      { dom: 'cau-suprapubictenderness', arg: 'suprapubicTenderness', kind: 'boolean', required: false, label: 'Suprapubic tenderness' },
      { dom: 'cau-cvatenderness', arg: 'cvaTenderness', kind: 'boolean', required: false, label: 'Costovertebral angle pain or tenderness' },
      { dom: 'cau-urgency', arg: 'urgency', kind: 'boolean', required: false, label: 'Urinary urgency (counted only once the catheter is out)' },
      { dom: 'cau-frequency', arg: 'frequency', kind: 'boolean', required: false, label: 'Urinary frequency (counted only once the catheter is out)' },
      { dom: 'cau-dysuria', arg: 'dysuria', kind: 'boolean', required: false, label: 'Dysuria (counted only once the catheter is out)' },
      { dom: 'cau-culture', arg: 'culture', kind: 'enum', required: false, label: 'Urine culture result', values: ['none', 'bacterium-threshold', 'yeast-only', 'below-threshold', 'more-than-two-species'] },
    ],
  },
];
