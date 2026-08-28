// spec-v841 MCP adapter: ADA diabetes diagnostic thresholds in
// lib/diabetes-diagnosis-v841.js. The dom keys mirror the browser renderer
// (views/group-v841.js) and META['diabetes-diagnosis'].example.
//
// confirmedOnRepeat is first-class because confirmation is part of the definition: without
// unequivocal hyperglycemia a single abnormal result is not a diagnosis. Clinical domain.

import { diabetesDiagnosis } from '../../lib/diabetes-diagnosis-v841.js';

export default [
  {
    id: 'diabetes-diagnosis',
    summary: 'Applies the American Diabetes Association diagnostic thresholds. Diabetes: A1C 6.5 or more, fasting glucose 126 or more, 2-hour glucose 200 or more, or a random glucose 200 or more WITH classic symptoms. Prediabetes: A1C 5.7-6.4, fasting 100-125, 2-hour 140-199. Without unequivocal hyperglycemia the diagnosis requires TWO abnormal results, so a single raised value is not a diagnosis.',
    compute: diabetesDiagnosis,
    fields: [
      { dom: 'dxd-a1c', arg: 'a1c', kind: 'number', required: false, label: 'A1C, percent' },
      { dom: 'dxd-a1cconfound', arg: 'a1cConfounder', kind: 'boolean', required: false, label: 'Condition that alters the A1C' },
      { dom: 'dxd-fpg', arg: 'fastingGlucose', kind: 'number', required: false, label: 'Fasting plasma glucose, mg/dL' },
      { dom: 'dxd-ogtt', arg: 'twoHourGlucose', kind: 'number', required: false, label: '2-hour plasma glucose, mg/dL' },
      { dom: 'dxd-carbrestrict', arg: 'carbRestrictedBeforeOgtt', kind: 'boolean', required: false, label: 'Carbohydrate restricted before the tolerance test' },
      { dom: 'dxd-random', arg: 'randomGlucose', kind: 'number', required: false, label: 'Random plasma glucose, mg/dL' },
      { dom: 'dxd-symptoms', arg: 'classicSymptoms', kind: 'boolean', required: false, label: 'Classic symptoms or hyperglycemic crisis' },
      { dom: 'dxd-confirmed', arg: 'confirmedOnRepeat', kind: 'boolean', required: false, label: 'Confirmed by repeating the same test' },
    ],
  },
];
