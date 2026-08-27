// spec-v824 MCP adapter: Graus 2016 autoimmune encephalitis criteria in
// lib/autoimmune-encephalitis-v824.js. The dom keys mirror the browser renderer
// (views/group-v824.js) and META['autoimmune-encephalitis'].example.
//
// There is deliberately NO antibody field: neither criteria set includes one, and offering
// it would invite an agent to withhold a result pending serology the criteria do not want
// waited for. Clinical domain.

import { autoimmuneEncephalitis } from '../../lib/autoimmune-encephalitis-v824.js';

export default [
  {
    id: 'autoimmune-encephalitis',
    summary: 'Applies the Graus 2016 criteria for possible autoimmune encephalitis and definite autoimmune limbic encephalitis. Neither set includes an antibody result, by design. Possible AE needs subacute onset under 3 months, one of four supporting features, and exclusion. Definite limbic encephalitis additionally requires bilateral medial temporal T2-FLAIR change, so a normal scan leaves the first open and rules the second out.',
    compute: autoimmuneEncephalitis,
    fields: [
      { dom: 'ae-subacute', arg: 'subacuteOnset', kind: 'boolean', required: false, label: 'Subacute onset under 3 months' },
      { dom: 'ae-limbic', arg: 'limbicPresentation', kind: 'boolean', required: false, label: 'Presentation suggests limbic involvement' },
      { dom: 'ae-focal', arg: 'focalCnsFindings', kind: 'boolean', required: false, label: 'New focal CNS findings' },
      { dom: 'ae-seizures', arg: 'newSeizures', kind: 'boolean', required: false, label: 'Seizures not previously explained' },
      { dom: 'ae-csf', arg: 'csfWhiteCells', kind: 'number', required: false, label: 'CSF white cells per mm3' },
      { dom: 'ae-mri', arg: 'mriSuggestive', kind: 'boolean', required: false, label: 'MRI suggestive of encephalitis' },
      { dom: 'ae-mtl', arg: 'bilateralMedialTemporal', kind: 'boolean', required: false, label: 'Bilateral medial temporal T2-FLAIR change' },
      { dom: 'ae-eeg', arg: 'temporalEeg', kind: 'boolean', required: false, label: 'Temporal epileptic or slow-wave EEG' },
      { dom: 'ae-excluded', arg: 'alternativesExcluded', kind: 'boolean', required: false, label: 'Alternative causes excluded' },
    ],
  },
];
