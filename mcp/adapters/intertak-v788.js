// spec-v788 MCP adapter: InterTAK Diagnostic Score in lib/intertak-v788.js.
// The dom keys mirror the browser renderer (views/group-v788.js) and META['intertak'].example.
// Seven weighted booleans summing to exactly 100. Clinical domain.

import { interTak } from '../../lib/intertak-v788.js';

export default [
  {
    id: 'intertak',
    summary: 'InterTAK Diagnostic Score (Ghadri 2017): separates takotsubo syndrome from acute coronary syndrome. Seven weighted features summing to exactly 100 - female sex 25, emotional trigger 24, physical trigger 13, absence of ST-segment depression except aVR 12, psychiatric disorder 11, neurologic disorder 9, QT prolongation 6. Expert consensus: about 18% probability at 50 points, about 90% above 70; 70 or more is high probability, which redirects the workup toward echocardiography rather than angiography.',
    compute: interTak,
    fields: [
      { dom: 'itk-female', arg: 'femaleSex', kind: 'boolean', required: false, label: 'Female sex (25)' },
      { dom: 'itk-emotional', arg: 'emotionalTrigger', kind: 'boolean', required: false, label: 'Emotional trigger (24)' },
      { dom: 'itk-physical', arg: 'physicalTrigger', kind: 'boolean', required: false, label: 'Physical trigger (13)' },
      { dom: 'itk-nostdep', arg: 'noStDepression', kind: 'boolean', required: false, label: 'No ST depression, bar aVR (12)' },
      { dom: 'itk-psych', arg: 'psychiatricDisorder', kind: 'boolean', required: false, label: 'Psychiatric disorder (11)' },
      { dom: 'itk-neuro', arg: 'neurologicDisorder', kind: 'boolean', required: false, label: 'Neurologic disorder (9)' },
      { dom: 'itk-qt', arg: 'qtProlongation', kind: 'boolean', required: false, label: 'QT prolongation (6)' },
    ],
  },
];
