// spec-v307 MCP wave: adapter for the diabetic macular edema (DME) severity scale
// in lib/dme-v307.js. The dom keys mirror the browser renderer (views/group-v307.js)
// and META['dme-severity'].example. `present` is a boolean and `location` is an
// enum; both are optional (the compute defaults to "DME apparently absent" when
// present is false). The compute returns the DME level and the center-involving
// flag. The `band` carries the "Severe DME" example, so it round-trips through the
// default makeToArgs with no custom toArgs.

import * as D from '../../lib/dme-v307.js';

export default [
  {
    id: 'dme-severity',
    summary: 'International Clinical diabetic macular edema (DME) severity scale (Wilkinson 2003), the companion to the ICDR retinopathy grade: given whether retinal thickening / hard exudates are present in the posterior pole and their location relative to the center of the macula (distant / approaching / involving), reports the DME level - absent, mild, moderate, or severe (center-involving = vision-threatening). Reports the classification level, not a diagnosis or a treatment decision.',
    compute: D.dmeSeverity,
    fields: [
      { dom: 'dme-present', arg: 'present', kind: 'bool', required: false, label: 'Retinal thickening or hard exudates in the posterior pole' },
      { dom: 'dme-location', arg: 'location', kind: 'enum', required: false, values: ['distant', 'approaching', 'involving'], label: 'Location relative to the center of the macula' },
    ],
  },
];
