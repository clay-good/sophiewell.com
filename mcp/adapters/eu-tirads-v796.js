// spec-v796 MCP adapter: EU-TIRADS in lib/eu-tirads-v796.js.
// The dom keys mirror the browser renderer (views/group-v796.js) and META['eu-tirads'].example.
// Any high-risk boolean overrides the appearance enum to category 5. Clinical domain.

import { euTirads } from '../../lib/eu-tirads-v796.js';

export default [
  {
    id: 'eu-tirads',
    summary: 'EU-TIRADS (Russ 2017, European Thyroid Association): ultrasound risk category for a thyroid nodule and the size at which a needle is indicated. Any ONE of taller-than-wide shape, irregular margins, microcalcifications or marked hypoechogenicity makes it category 5 regardless of appearance. Otherwise: pure cyst or entirely spongiform = 2, ovoid smooth iso/hyperechoic = 3, ovoid smooth mildly hypoechoic = 4. FNA above 20 mm in category 3, above 15 mm in 4, above 10 mm in 5; not indicated on ultrasound grounds in 2.',
    compute: euTirads,
    fields: [
      { dom: 'eutr-appearance', arg: 'appearance', kind: 'enum', values: ['no-nodule', 'benign', 'iso-hyperechoic', 'mildly-hypoechoic'], required: false, label: 'Basic appearance' },
      { dom: 'eutr-taller', arg: 'tallerThanWide', kind: 'boolean', required: false, label: 'Taller-than-wide shape' },
      { dom: 'eutr-margins', arg: 'irregularMargins', kind: 'boolean', required: false, label: 'Irregular margins' },
      { dom: 'eutr-microcalc', arg: 'microcalcifications', kind: 'boolean', required: false, label: 'Microcalcifications' },
      { dom: 'eutr-hypo', arg: 'markedHypoechogenicity', kind: 'boolean', required: false, label: 'Marked hypoechogenicity' },
      { dom: 'eutr-size', arg: 'sizeMm', kind: 'number', required: false, label: 'Largest diameter', unit: 'mm' },
    ],
  },
];
