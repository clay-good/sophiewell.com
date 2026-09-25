// spec-v1480: MCP adapter. The dom keys mirror views/group-v1480.js and this tile's META example.

import * as PD from '../../lib/periodontitis-stage-grade-v1480.js';

export default [
  {
    id: 'periodontitis-stage-grade',
    summary: 'Periodontitis stage I to IV and grade A to C under the 2017 World Workshop classification. The stage comes from attachment or bone loss, tooth loss and complexity; the grade from progression, smoking and HbA1c.',
    compute: PD.periodontitisStageGrade,
    fields: [
      { dom: 'pd-cal', arg: 'cal', kind: 'number', required: false, label: 'Interdental attachment loss at the site of greatest loss', unit: 'mm' },
      { dom: 'pd-rbl', arg: 'rbl', kind: 'enum', required: false, values: ['coronal-lt15', 'coronal-15-33', 'middle-apical'], label: 'Radiographic bone loss, if no attachment loss is available' },
      { dom: 'pd-teeth', arg: 'toothLoss', kind: 'number', required: true, label: 'Teeth lost to periodontitis (0 if none)' },
      { dom: 'pd-maxpd', arg: 'maxPd', kind: 'number', required: false, label: 'Maximum probing depth', unit: 'mm' },
      { dom: 'pd-vertical', arg: 'verticalBoneLoss', kind: 'bool', required: false, label: 'Vertical bone loss of 3 mm or more' },
      { dom: 'pd-furcation', arg: 'furcation', kind: 'bool', required: false, label: 'Furcation involvement, class II or III' },
      { dom: 'pd-ridge', arg: 'ridgeDefect', kind: 'bool', required: false, label: 'Moderate ridge defect' },
      { dom: 'pd-rehab', arg: 'complexRehab', kind: 'bool', required: false, label: 'Needs complex rehabilitation (stage IV complexity)' },
      { dom: 'pd-extent', arg: 'extent', kind: 'enum', required: false, values: ['localized', 'generalized', 'molar-incisor'], label: 'Extent' },
      { dom: 'pd-direct', arg: 'direct', kind: 'enum', required: false, values: ['none', 'lt2', 'ge2'], label: 'Direct evidence of progression over 5 years' },
      { dom: 'pd-bonepct', arg: 'boneLossPct', kind: 'number', required: false, label: 'Bone loss at the worst site', unit: '%' },
      { dom: 'pd-age', arg: 'age', kind: 'number', required: false, label: 'Age', unit: 'years' },
      { dom: 'pd-smoking', arg: 'smoking', kind: 'enum', required: false, values: ['non', 'lt10', 'ge10'], label: 'Smoking' },
      { dom: 'pd-diabetes', arg: 'diabetes', kind: 'enum', required: false, values: ['none', 'lt7', 'ge7'], label: 'Diabetes and HbA1c' },
    ],
  },
];
