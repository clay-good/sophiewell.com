// spec-v815 MCP adapter: ICHD-3 migraine criteria in lib/migraine-ichd3-v815.js.
// The dom keys mirror the browser renderer (views/group-v815.js) and
// META['migraine-ichd3'].example. photophobia and phonophobia are SEPARATE args because
// criterion D of 1.1 counts them only together. Clinical domain.

import { migraineIchd3 } from '../../lib/migraine-ichd3-v815.js';

export default [
  {
    id: 'migraine-ichd3',
    summary: 'Applies the ICHD-3 migraine criteria. Both 1.1 without aura and 1.2 with aura are assessed together, since neither set contains the other. 1.1 needs 5 attacks of 4-72 h with 2 of 4 headache characteristics and an associated symptom; 1.2 needs only 2 attacks, one reversible aura symptom and 3 of 6 aura characteristics. Note photophobia and phonophobia satisfy 1.1 only TOGETHER, and the attack thresholds differ between the sets.',
    compute: migraineIchd3,
    fields: [
      { dom: 'mig-attacks', arg: 'attackCount', kind: 'number', required: false, label: 'Number of attacks' },
      { dom: 'mig-hours', arg: 'headacheHours', kind: 'number', required: false, label: 'Headache duration untreated, hours' },
      { dom: 'mig-unilateral', arg: 'unilateral', kind: 'boolean', required: false, label: 'One-sided location' },
      { dom: 'mig-pulsating', arg: 'pulsating', kind: 'boolean', required: false, label: 'Pulsating quality' },
      { dom: 'mig-severity', arg: 'moderateOrSevere', kind: 'boolean', required: false, label: 'Moderate or severe intensity' },
      { dom: 'mig-activity', arg: 'worseWithActivity', kind: 'boolean', required: false, label: 'Worse with routine activity' },
      { dom: 'mig-nausea', arg: 'nauseaVomiting', kind: 'boolean', required: false, label: 'Nausea and/or vomiting' },
      { dom: 'mig-photophobia', arg: 'photophobia', kind: 'boolean', required: false, label: 'Photophobia' },
      { dom: 'mig-phonophobia', arg: 'phonophobia', kind: 'boolean', required: false, label: 'Phonophobia' },
      { dom: 'mig-aura-visual', arg: 'auraVisual', kind: 'boolean', required: false, label: 'Visual aura' },
      { dom: 'mig-aura-sensory', arg: 'auraSensory', kind: 'boolean', required: false, label: 'Sensory aura' },
      { dom: 'mig-aura-speech', arg: 'auraSpeech', kind: 'boolean', required: false, label: 'Speech or language aura' },
      { dom: 'mig-aura-motor', arg: 'auraMotor', kind: 'boolean', required: false, label: 'Motor aura' },
      { dom: 'mig-aura-brainstem', arg: 'auraBrainstem', kind: 'boolean', required: false, label: 'Brainstem aura' },
      { dom: 'mig-aura-retinal', arg: 'auraRetinal', kind: 'boolean', required: false, label: 'Retinal aura' },
      { dom: 'mig-aura-spread', arg: 'auraSpreadsGradually', kind: 'boolean', required: false, label: 'Aura spreads over 5 min or more' },
      { dom: 'mig-aura-succession', arg: 'auraInSuccession', kind: 'boolean', required: false, label: 'Two or more auras in succession' },
      { dom: 'mig-aura-duration', arg: 'auraLasts5to60', kind: 'boolean', required: false, label: 'Each aura lasts 5 to 60 minutes' },
      { dom: 'mig-aura-unilateral', arg: 'auraUnilateral', kind: 'boolean', required: false, label: 'At least one aura is one-sided' },
      { dom: 'mig-aura-positive', arg: 'auraPositive', kind: 'boolean', required: false, label: 'At least one aura is positive' },
      { dom: 'mig-aura-headache', arg: 'auraWithHeadache', kind: 'boolean', required: false, label: 'Headache with or within 60 min' },
      { dom: 'mig-noother', arg: 'noBetterExplanation', kind: 'boolean', required: false, label: 'No better ICHD-3 explanation' },
    ],
  },
];
