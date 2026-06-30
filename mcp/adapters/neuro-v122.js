// spec-v183 MCP wave 6: adapters for the three lib/neuro-v122.js neurology
// instruments (the Hachinski ischemic score, the Modified Ashworth spasticity
// grade, and the Bickerstaff brainstem-encephalitis checklist). dom keys mirror
// views/group-v122.js; checkbox items are booleans, the Ashworth grade is a
// single ordinal select.

import * as F from '../../lib/neuro-v122.js';

export default [
  {
    id: 'hachinski',
    summary: 'Hachinski Ischemic Score (Hachinski 1975): a 0-18 bedside score separating vascular (multi-infarct) from degenerative dementia; >= 7 favors vascular, <= 4 favors Alzheimer-type.',
    compute: F.hachinski,
    fields: [
      { dom: 'ha-abrupt', arg: 'abruptOnset', kind: 'bool', label: 'Abrupt onset (+2)' },
      { dom: 'ha-step', arg: 'stepwise', kind: 'bool', label: 'Stepwise deterioration (+1)' },
      { dom: 'ha-fluct', arg: 'fluctuating', kind: 'bool', label: 'Fluctuating course (+2)' },
      { dom: 'ha-noct', arg: 'nocturnal', kind: 'bool', label: 'Nocturnal confusion (+1)' },
      { dom: 'ha-pers', arg: 'preservedPersonality', kind: 'bool', label: 'Relative preservation of personality (+1)' },
      { dom: 'ha-depr', arg: 'depression', kind: 'bool', label: 'Depression (+1)' },
      { dom: 'ha-soma', arg: 'somatic', kind: 'bool', label: 'Somatic complaints (+1)' },
      { dom: 'ha-emot', arg: 'emotionalIncontinence', kind: 'bool', label: 'Emotional incontinence (+1)' },
      { dom: 'ha-htn', arg: 'hypertension', kind: 'bool', label: 'History of hypertension (+1)' },
      { dom: 'ha-stroke', arg: 'strokeHistory', kind: 'bool', label: 'History of strokes (+2)' },
      { dom: 'ha-ather', arg: 'atherosclerosis', kind: 'bool', label: 'Associated atherosclerosis (+1)' },
      { dom: 'ha-fsym', arg: 'focalSymptoms', kind: 'bool', label: 'Focal neurological symptoms (+2)' },
      { dom: 'ha-fsign', arg: 'focalSigns', kind: 'bool', label: 'Focal neurological signs (+2)' },
    ],
  },
  {
    id: 'modified-ashworth',
    summary: 'Modified Ashworth Scale (Bohannon & Smith 1987): the ordinal 0 / 1 / 1+ / 2 / 3 / 4 grade of muscle-tone increase on passive movement.',
    compute: F.modifiedAshworth,
    fields: [
      { dom: 'ma-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '1plus', '2', '3', '4'], required: true, label: 'Resistance to passive movement' },
    ],
  },
  {
    id: 'bickerstaff',
    summary: 'Bickerstaff brainstem-encephalitis checklist (Odaka 2003): a verdict on whether the required core (progressive ophthalmoplegia, ataxia, and a central feature) plus supportive findings (anti-GQ1b IgG, brainstem MRI lesion, CSF dissociation) are consistent with BBE.',
    compute: F.bickerstaff,
    fields: [
      { dom: 'bi-oph', arg: 'ophthalmoplegia', kind: 'bool', label: 'Progressive, symmetric external ophthalmoplegia' },
      { dom: 'bi-atax', arg: 'ataxia', kind: 'bool', label: 'Ataxia' },
      { dom: 'bi-cons', arg: 'consciousness', kind: 'bool', label: 'Altered consciousness (drowsiness / stupor / coma)' },
      { dom: 'bi-hyper', arg: 'hyperreflexia', kind: 'bool', label: 'Hyperreflexia' },
      { dom: 'bi-gq1b', arg: 'gq1b', kind: 'bool', label: 'Supportive: anti-GQ1b IgG antibody' },
      { dom: 'bi-mri', arg: 'mri', kind: 'bool', label: 'Supportive: brainstem MRI lesion' },
      { dom: 'bi-csf', arg: 'csf', kind: 'bool', label: 'Supportive: CSF albuminocytologic dissociation' },
    ],
  },
];
