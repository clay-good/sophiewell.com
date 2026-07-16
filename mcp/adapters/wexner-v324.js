// spec-v324 MCP wave: adapter for the Wexner (Cleveland Clinic) fecal incontinence score in
// lib/wexner-v324.js. The dom keys mirror the browser renderer (views/group-v324.js) and
// META['wexner'].example. `solid`, `liquid`, `gas`, `pad`, and `lifestyle` are numbers 0-4
// (each optional -- the compute defaults a missing item to 0). The compute sums them into
// the 0-20 total. The example sets 0/2/3/1/1 (total 7); its band carries the "7" and "20"
// example numbers, so it round-trips through the default makeToArgs with no custom toArgs.

import * as W from '../../lib/wexner-v324.js';

export default [
  {
    id: 'wexner',
    summary: 'Wexner (Cleveland Clinic) fecal incontinence score (Jorge & Wexner 1993). Five items -- incontinence to solid stool, liquid stool, and gas, plus wearing a pad and lifestyle alteration -- each on a 0-4 frequency scale (0 never; 1 rarely, < 1/month; 2 sometimes, >= 1/month and < 1/week; 3 usually, >= 1/week and < 1/day; 4 always, >= 1/day). Total 0-20: 0 is perfect continence and 20 is complete incontinence; >= 9 is a commonly cited (not fixed) threshold for clinically significant incontinence. Reports the cited severity score, not a diagnosis or a treatment order.',
    compute: W.wexner,
    fields: [
      { dom: 'wex-solid', arg: 'solid', kind: 'number', label: 'Incontinence to solid stool (0-4)' },
      { dom: 'wex-liquid', arg: 'liquid', kind: 'number', label: 'Incontinence to liquid stool (0-4)' },
      { dom: 'wex-gas', arg: 'gas', kind: 'number', label: 'Incontinence to gas (0-4)' },
      { dom: 'wex-pad', arg: 'pad', kind: 'number', label: 'Wears a pad (0-4)' },
      { dom: 'wex-lifestyle', arg: 'lifestyle', kind: 'number', label: 'Lifestyle alteration (0-4)' },
    ],
  },
];
