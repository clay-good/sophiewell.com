// spec-v822 MCP adapter: 2017 hEDS criteria in lib/heds-2017-v822.js.
// The dom keys mirror the browser renderer (views/group-v822.js) and
// META['heds-2017'].example. `acquiredCtd` is not a footnote: it changes criterion 2 from
// "two of A, B and C" to "A and B, with C not counted". Clinical domain.

import { heds2017 } from '../../lib/heds-2017-v822.js';

export default [
  {
    id: 'heds-2017',
    summary: 'Applies the 2017 international criteria for hypermobile Ehlers-Danlos syndrome. All three must hold: generalized joint hypermobility on an age- and sex-adjusted Beighton cutoff (6 pre-pubertal, 5 to age 50, 4 above 50, with a five-part questionnaire rescue exactly one point below); two of three features; and three exclusion prerequisites. With an ACQUIRED connective-tissue disorder, features A and B are both required and feature C cannot be counted.',
    compute: heds2017,
    fields: [
      { dom: 'heds-beighton', arg: 'beightonScore', kind: 'number', required: false, label: 'Beighton score out of 9' },
      { dom: 'heds-group', arg: 'ageGroup', kind: 'enum', required: false, label: 'Which Beighton cutoff applies', values: ['prepubertal-or-adolescent', 'pubertal-to-50', 'over-50'] },
      { dom: 'heds-q1', arg: 'q1', kind: 'boolean', required: false, label: 'Hands flat on the floor' },
      { dom: 'heds-q2', arg: 'q2', kind: 'boolean', required: false, label: 'Thumb to forearm' },
      { dom: 'heds-q3', arg: 'q3', kind: 'boolean', required: false, label: 'Contorted body as a child' },
      { dom: 'heds-q4', arg: 'q4', kind: 'boolean', required: false, label: 'Shoulder or kneecap dislocated twice' },
      { dom: 'heds-q5', arg: 'q5', kind: 'boolean', required: false, label: 'Considers self double-jointed' },
      { dom: 'heds-a1', arg: 'a1', kind: 'boolean', required: false, label: 'Soft or velvety skin' },
      { dom: 'heds-a2', arg: 'a2', kind: 'boolean', required: false, label: 'Mild skin hyperextensibility' },
      { dom: 'heds-a3', arg: 'a3', kind: 'boolean', required: false, label: 'Unexplained striae' },
      { dom: 'heds-a4', arg: 'a4', kind: 'boolean', required: false, label: 'Piezogenic heel papules' },
      { dom: 'heds-a5', arg: 'a5', kind: 'boolean', required: false, label: 'Recurrent abdominal hernias' },
      { dom: 'heds-a6', arg: 'a6', kind: 'boolean', required: false, label: 'Atrophic scarring, 2+ sites' },
      { dom: 'heds-a7', arg: 'a7', kind: 'boolean', required: false, label: 'Pelvic, rectal or uterine prolapse' },
      { dom: 'heds-a8', arg: 'a8', kind: 'boolean', required: false, label: 'Dental crowding, high palate' },
      { dom: 'heds-a9', arg: 'a9', kind: 'boolean', required: false, label: 'Arachnodactyly, bilateral' },
      { dom: 'heds-a10', arg: 'a10', kind: 'boolean', required: false, label: 'Arm span to height 1.05 or more' },
      { dom: 'heds-a11', arg: 'a11', kind: 'boolean', required: false, label: 'Mitral valve prolapse' },
      { dom: 'heds-a12', arg: 'a12', kind: 'boolean', required: false, label: 'Aortic root Z above 2' },
      { dom: 'heds-family', arg: 'familyHistory', kind: 'boolean', required: false, label: 'First-degree relative meets the criteria' },
      { dom: 'heds-c1', arg: 'c1', kind: 'boolean', required: false, label: 'Limb pain daily for 3 months' },
      { dom: 'heds-c2', arg: 'c2', kind: 'boolean', required: false, label: 'Chronic widespread pain' },
      { dom: 'heds-c3', arg: 'c3', kind: 'boolean', required: false, label: 'Recurrent dislocations or instability' },
      { dom: 'heds-skin', arg: 'noSkinFragility', kind: 'boolean', required: false, label: 'No unusual skin fragility' },
      { dom: 'heds-otherctd', arg: 'otherCtdExcluded', kind: 'boolean', required: false, label: 'Other connective-tissue disorders excluded' },
      { dom: 'heds-alternatives', arg: 'alternativesExcluded', kind: 'boolean', required: false, label: 'Alternative causes excluded' },
      { dom: 'heds-acquired', arg: 'acquiredCtd', kind: 'boolean', required: false, label: 'Patient has an acquired connective-tissue disorder' },
    ],
  },
];
