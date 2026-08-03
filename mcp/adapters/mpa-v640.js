// spec-v640 MCP adapter: 2022 ACR/EULAR Classification Criteria for Microscopic
// Polyangiitis (MPA) in lib/mpa-v640.js. The dom keys mirror the browser renderer
// (views/group-v640.js) and META['mpa-acr-eular-2022'].example. THREE items are
// NEGATIVE (mpa-nasal -3, mpa-canca -1, mpa-eos -4): nasal involvement and cANCA/PR3
// point toward GPA, eosinophilia toward EGPA. Every input is optional; absent items
// score 0, so empty inputs return a valid score of 0 (not classified). Clinical domain.

import { mpaAcrEular2022 } from '../../lib/mpa-v640.js';

export default [
  {
    id: 'mpa-acr-eular-2022',
    summary: '2022 ACR/EULAR microscopic-polyangiitis classification (weighted, three items negative, range -8 to +12); a cumulative score ≥ 5 classifies as MPA, applied only after a small/medium-vessel-vasculitis diagnosis with mimics excluded.',
    compute: mpaAcrEular2022,
    fields: [
      { dom: 'mpa-panca', arg: 'pAncaMpo', kind: 'bool', required: false, label: 'Positive pANCA or anti-MPO antibody (+6)' },
      { dom: 'mpa-gn', arg: 'pauciGn', kind: 'bool', required: false, label: 'Pauci-immune glomerulonephritis on biopsy (+3)' },
      { dom: 'mpa-ild', arg: 'fibrosisIld', kind: 'bool', required: false, label: 'Fibrosis or interstitial lung disease on chest imaging (+3)' },
      { dom: 'mpa-nasal', arg: 'nasal', kind: 'bool', required: false, label: 'Nasal involvement — bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation (-3)' },
      { dom: 'mpa-canca', arg: 'cAncaPr3', kind: 'bool', required: false, label: 'Positive cANCA or anti-PR3 antibody (-1)' },
      { dom: 'mpa-eos', arg: 'eosinophilia', kind: 'bool', required: false, label: 'Blood eosinophil count ≥ 1 x10^9/L (-4)' },
    ],
  },
];
