// spec-v825 MCP adapter: 2020 revised comprehensive diagnostic criteria for IgG4-RD in
// lib/igg4-rd-2020-v825.js. The dom keys mirror the browser renderer (views/group-v825.js)
// and META['igg4-rd-2020'].example. Clinical domain.

import { igg4Rd2020 } from '../../lib/igg4-rd-2020-v825.js';

export default [
  {
    id: 'igg4-rd-2020',
    summary: 'Applies the 2020 revised comprehensive diagnostic criteria for IgG4-related disease. Definite is items 1+2+3, probable 1+3, possible 1+2. The pathological item needs TWO of three sub-items - the 2020 revision added storiform fibrosis or obliterative phlebitis so a biopsy with poor IgG4 immunostaining can still carry it. "Possible" is the WEAKEST category, resting on swelling plus a raised serum level with no tissue.',
    compute: igg4Rd2020,
    fields: [
      { dom: 'ig4-organ', arg: 'organSwelling', kind: 'boolean', required: false, label: 'Characteristic organ swelling, mass or nodule' },
      { dom: 'ig4-nodes', arg: 'lymphNodesOnly', kind: 'boolean', required: false, label: 'Lymph node swelling only, single organ' },
      { dom: 'ig4-serum', arg: 'serumIgg4', kind: 'number', required: false, label: 'Serum IgG4, mg/dL' },
      { dom: 'ig4-infiltrate', arg: 'denseInfiltrate', kind: 'boolean', required: false, label: 'Dense lymphoplasmacytic infiltration with fibrosis' },
      { dom: 'ig4-ratio', arg: 'igg4Ratio', kind: 'boolean', required: false, label: 'IgG4+/IgG+ ratio above 40 percent and over 10 per HPF' },
      { dom: 'ig4-storiform', arg: 'storiformFibrosis', kind: 'boolean', required: false, label: 'Storiform fibrosis or obliterative phlebitis' },
    ],
  },
];
