// spec-v639 MCP adapter: 2022 ACR/EULAR Classification Criteria for
// Granulomatosis with Polyangiitis (GPA) in lib/gpa-v639.js. The dom keys mirror
// the browser renderer (views/group-v639.js) and META['gpa-acr-eular-2022'].example.
// TWO items are NEGATIVE (gpa-panca -1, gpa-eos -4): a positive pANCA/MPO or blood
// eosinophilia >= 1 x10^9/L subtracts, because those findings point toward MPA and
// EGPA. Every input is optional; absent items score 0, so empty inputs return a
// valid score of 0 (not classified). Clinical domain.

import { gpaAcrEular2022 } from '../../lib/gpa-v639.js';

export default [
  {
    id: 'gpa-acr-eular-2022',
    summary: '2022 ACR/EULAR granulomatosis-with-polyangiitis classification (weighted, two items negative, range -5 to +17); a cumulative score ≥ 5 classifies as GPA, applied only after a small/medium-vessel-vasculitis diagnosis with mimics excluded.',
    compute: gpaAcrEular2022,
    fields: [
      { dom: 'gpa-nasal', arg: 'nasal', kind: 'bool', required: false, label: 'Nasal involvement — bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation (+3)' },
      { dom: 'gpa-cartilage', arg: 'cartilage', kind: 'bool', required: false, label: 'Cartilaginous involvement — ear/nose cartilage, hoarse voice/stridor, endobronchial, or saddle nose (+2)' },
      { dom: 'gpa-hearing', arg: 'hearingLoss', kind: 'bool', required: false, label: 'Conductive or sensorineural hearing loss (+1)' },
      { dom: 'gpa-canca', arg: 'cAnca', kind: 'bool', required: false, label: 'Positive cANCA or anti-PR3 antibody (+5)' },
      { dom: 'gpa-pulm', arg: 'pulmNodule', kind: 'bool', required: false, label: 'Pulmonary nodules, mass, or cavitation on chest imaging (+2)' },
      { dom: 'gpa-granuloma', arg: 'granuloma', kind: 'bool', required: false, label: 'Granuloma, extravascular granulomatous inflammation, or giant cells on biopsy (+2)' },
      { dom: 'gpa-sinus', arg: 'sinus', kind: 'bool', required: false, label: 'Nasal/paranasal sinus inflammation, consolidation, or effusion, or mastoiditis on imaging (+1)' },
      { dom: 'gpa-gn', arg: 'pauciGn', kind: 'bool', required: false, label: 'Pauci-immune glomerulonephritis on biopsy (+1)' },
      { dom: 'gpa-panca', arg: 'pAnca', kind: 'bool', required: false, label: 'Positive pANCA or anti-MPO antibody (-1)' },
      { dom: 'gpa-eos', arg: 'eosinophilia', kind: 'bool', required: false, label: 'Blood eosinophil count ≥ 1 x10^9/L (-4)' },
    ],
  },
];
