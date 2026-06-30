// spec-v183 MCP wave 6: adapters for the four lib/neuro-v121.js neuromuscular
// instruments (Guillain-Barre respiratory / outcome prediction, the Brighton
// case definition, and the MGFA classification with MG-ADL). dom keys mirror
// views/group-v121.js; graded selects are enums the lib lvl()-coerces, and the
// MGFA ADL items default to 0 when absent.

import * as F from '../../lib/neuro-v121.js';

export default [
  {
    id: 'egris',
    summary: 'Erasmus GBS Respiratory Insufficiency Score (Walgaard 2010): a 0-7 estimate of the risk of mechanical ventilation within the first week of Guillain-Barre syndrome, from days between onset and admission, facial/bulbar weakness, and the MRC sum score.',
    compute: F.egris,
    fields: [
      { dom: 'eg-days', arg: 'daysOnset', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Days from onset to admission (>7 / 4-7 / <=3)' },
      { dom: 'eg-fb', arg: 'facialBulbar', kind: 'bool', label: 'Facial and/or bulbar weakness' },
      { dom: 'eg-mrc', arg: 'mrc', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'MRC sum score band' },
    ],
  },
  {
    id: 'megos',
    summary: 'Modified Erasmus GBS Outcome Score (Walgaard 2011): predicts the probability of being unable to walk unaided at 4 and 26 weeks, from age, preceding diarrhea, and the MRC sum score, scored at admission (0-9) or day 7 (0-12).',
    compute: F.megos,
    fields: [
      { dom: 'mg-age', arg: 'age', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Age band (<=40 / 41-60 / >60)' },
      { dom: 'mg-diar', arg: 'diarrhea', kind: 'bool', label: 'Preceding diarrhea' },
      { dom: 'mg-time', arg: 'timing', kind: 'enum', values: ['admission', 'day7'], required: true, label: 'Assessment time point' },
      { dom: 'mg-mrc', arg: 'mrc', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'MRC sum score band' },
    ],
  },
  {
    id: 'brighton-gbs',
    summary: 'Brighton Collaboration GBS case definition (Sejvar 2011): a diagnostic-certainty level 1-4 from bilateral flaccid limb weakness, decreased/absent reflexes, a monophasic course, the absence of an alternative diagnosis, CSF findings, and nerve-conduction studies.',
    compute: F.brightonGbs,
    fields: [
      { dom: 'br-weak', arg: 'weakness', kind: 'bool', label: 'Bilateral flaccid limb weakness' },
      { dom: 'br-aref', arg: 'areflexia', kind: 'bool', label: 'Decreased / absent deep-tendon reflexes' },
      { dom: 'br-mono', arg: 'monophasic', kind: 'bool', label: 'Monophasic course, nadir 12 h-28 d' },
      { dom: 'br-noalt', arg: 'noAltDx', kind: 'bool', label: 'No alternative diagnosis' },
      { dom: 'br-csf', arg: 'csf', kind: 'enum', values: ['not-done', 'dissociation', 'cells-normal-protein'], required: true, label: 'CSF result' },
      { dom: 'br-ncs', arg: 'ncs', kind: 'bool', label: 'Nerve-conduction studies consistent with GBS' },
    ],
  },
  {
    id: 'mgfa',
    summary: 'MGFA clinical classification with the MG-ADL scale (Jaretzki 2000; Wolfe 1999): assigns the myasthenia gravis class I-V (with a/b ocular vs generalized subtype) and the 0-24 MG-ADL symptom score.',
    compute: F.mgfa,
    fields: [
      { dom: 'mf-sev', arg: 'severity', kind: 'enum', values: ['ocular', 'mild', 'moderate', 'severe', 'intubation'], required: true, label: 'Maximal weakness severity' },
      { dom: 'mf-sub', arg: 'subtype', kind: 'enum', values: ['a', 'b'], label: 'Subtype (a limb/axial, b oropharyngeal/respiratory)' },
      { dom: 'mf-talk', arg: 'talking', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: talking' },
      { dom: 'mf-chew', arg: 'chewing', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: chewing' },
      { dom: 'mf-swal', arg: 'swallowing', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: swallowing' },
      { dom: 'mf-breath', arg: 'breathing', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: breathing' },
      { dom: 'mf-hyg', arg: 'hygiene', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: brushing teeth / combing hair' },
      { dom: 'mf-rise', arg: 'rising', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: rising from a chair' },
      { dom: 'mf-dip', arg: 'diplopia', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: double vision' },
      { dom: 'mf-pto', arg: 'ptosis', kind: 'enum', values: ['0', '1', '2', '3'], label: 'MG-ADL: eyelid droop' },
    ],
  },
];
