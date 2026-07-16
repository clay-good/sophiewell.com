// spec-v328 MCP wave: adapter for the Montreal classification of IBD in
// lib/montreal-ibd-v328.js. The dom keys mirror the browser renderer (views/group-v328.js)
// and META['montreal-ibd'].example. `disease` is an enum (crohn / uc, defaulting to crohn);
// the Crohn's axes (crohnAge A1-A3, crohnLocation L1-L3, crohnBehavior B1-B3) and UC axes
// (ucExtent E1-E3, ucSeverity S0-S3) are enums; crohnUpperGI (+L4) and crohnPerianal (p) are
// booleans. Each field is optional -- the compute requires the relevant axes for the chosen
// disease and returns valid:false otherwise. The example sets the Crohn's A2/L3/B2 axes (a
// crohn case, since disease defaults to crohn); its band carries the "17-40" example numbers,
// so it round-trips through the default makeToArgs with no custom toArgs.

import * as M from '../../lib/montreal-ibd-v328.js';

export default [
  {
    id: 'montreal-ibd',
    summary: 'Montreal classification of inflammatory bowel disease (Silverberg 2005). Crohn’s disease: age at diagnosis A1 (<= 16 y) / A2 (17-40 y) / A3 (> 40 y); location L1 ileal / L2 colonic / L3 ileocolonic, with +L4 for isolated upper-GI disease; behavior B1 non-stricturing non-penetrating / B2 stricturing / B3 penetrating, with a p suffix for perianal disease. Ulcerative colitis: extent E1 proctitis / E2 left-sided / E3 extensive; severity S0 remission / S1 mild / S2 moderate / S3 severe. Composes the phenotype (e.g. A2 L3 B2 or E3 S2), a classification, not a diagnosis or a treatment order.',
    compute: M.montrealIbd,
    fields: [
      { dom: 'mibd-disease', arg: 'disease', kind: 'enum', values: ['crohn', 'uc'], label: 'Disease (crohn / uc; defaults to crohn)' },
      { dom: 'mibd-age', arg: 'crohnAge', kind: 'enum', values: ['A1', 'A2', 'A3'], label: 'Crohn age at diagnosis (A1-A3)' },
      { dom: 'mibd-loc', arg: 'crohnLocation', kind: 'enum', values: ['L1', 'L2', 'L3'], label: 'Crohn location (L1-L3)' },
      { dom: 'mibd-l4', arg: 'crohnUpperGI', kind: 'bool', label: 'Isolated upper-GI disease (+L4)' },
      { dom: 'mibd-beh', arg: 'crohnBehavior', kind: 'enum', values: ['B1', 'B2', 'B3'], label: 'Crohn behavior (B1-B3)' },
      { dom: 'mibd-p', arg: 'crohnPerianal', kind: 'bool', label: 'Perianal disease (p)' },
      { dom: 'mibd-ext', arg: 'ucExtent', kind: 'enum', values: ['E1', 'E2', 'E3'], label: 'UC extent (E1-E3)' },
      { dom: 'mibd-sev', arg: 'ucSeverity', kind: 'enum', values: ['S0', 'S1', 'S2', 'S3'], label: 'UC severity (S0-S3)' },
    ],
  },
];
