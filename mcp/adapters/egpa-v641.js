// spec-v641 MCP adapter: 2022 ACR/EULAR Classification Criteria for Eosinophilic
// Granulomatosis with Polyangiitis (EGPA) in lib/egpa-v641.js. The dom keys mirror
// the browser renderer (views/group-v641.js) and META['egpa-acr-eular-2022'].example.
// TWO distinctive contrasts with the GPA/MPA tiles: blood eosinophilia is the
// heaviest POSITIVE item here (egpa-eos +5, not -4), and the threshold is >= 6 (not
// >= 5). Two items are negative (egpa-canca -3, egpa-hematuria -1). Every input is
// optional; absent items score 0, so empty inputs return a valid score of 0 (not
// classified). Clinical domain.

import { egpaAcrEular2022 } from '../../lib/egpa-v641.js';

export default [
  {
    id: 'egpa-acr-eular-2022',
    summary: '2022 ACR/EULAR eosinophilic-granulomatosis-with-polyangiitis classification (weighted, two items negative, range -4 to +14); a cumulative score ≥ 6 (higher than the GPA/MPA ≥ 5) classifies as EGPA, applied only after a small/medium-vessel-vasculitis diagnosis with mimics excluded.',
    compute: egpaAcrEular2022,
    fields: [
      { dom: 'egpa-eos', arg: 'eosinophilia', kind: 'bool', required: false, label: 'Maximum blood eosinophil count ≥ 1 x10^9/L (+5)' },
      { dom: 'egpa-airway', arg: 'airwayObstruction', kind: 'bool', required: false, label: 'Obstructive airway disease (+3)' },
      { dom: 'egpa-polyps', arg: 'nasalPolyps', kind: 'bool', required: false, label: 'Nasal polyps (+3)' },
      { dom: 'egpa-extra', arg: 'extravascularEos', kind: 'bool', required: false, label: 'Extravascular eosinophilic-predominant inflammation (+2)' },
      { dom: 'egpa-mono', arg: 'mononeuritis', kind: 'bool', required: false, label: 'Mononeuritis multiplex or motor neuropathy not due to radiculopathy (+1)' },
      { dom: 'egpa-canca', arg: 'cAncaPr3', kind: 'bool', required: false, label: 'Positive cANCA or anti-PR3 antibody (-3)' },
      { dom: 'egpa-hematuria', arg: 'hematuria', kind: 'bool', required: false, label: 'Hematuria (-1)' },
    ],
  },
];
