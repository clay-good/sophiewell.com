// spec-v183 MCP wave: adapters for the four palliative / rehabilitation functional
// measures in lib/rehab-v240.js — the Edmonton Symptom Assessment System (ESAS),
// the Rivermead Mobility Index, the predicted six-minute walk distance
// (Enright-Sherrill), and QuickDASH. dom keys mirror views/group-v240.js; all
// inputs are numeric except the six-minute-walk sex enum.

import * as F from '../../lib/rehab-v240.js';

export default [
  {
    id: 'esas-symptom-assessment',
    summary: 'Edmonton Symptom Assessment System (Bruera E, et al. J Palliat Care 1991): nine symptoms each 0-10 summed to a total symptom-distress score of 0-90, where higher = greater symptom burden.',
    compute: F.esas,
    fields: [
      { dom: 'esas-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain (0-10)' },
      { dom: 'esas-tired', arg: 'tiredness', kind: 'number', required: true, label: 'Tiredness (0-10)' },
      { dom: 'esas-drowsy', arg: 'drowsiness', kind: 'number', required: true, label: 'Drowsiness (0-10)' },
      { dom: 'esas-nausea', arg: 'nausea', kind: 'number', required: true, label: 'Nausea (0-10)' },
      { dom: 'esas-appetite', arg: 'appetite', kind: 'number', required: true, label: 'Lack of appetite (0-10)' },
      { dom: 'esas-dyspnea', arg: 'dyspnea', kind: 'number', required: true, label: 'Shortness of breath (0-10)' },
      { dom: 'esas-depression', arg: 'depression', kind: 'number', required: true, label: 'Depression (0-10)' },
      { dom: 'esas-anxiety', arg: 'anxiety', kind: 'number', required: true, label: 'Anxiety (0-10)' },
      { dom: 'esas-wellbeing', arg: 'wellbeing', kind: 'number', required: true, label: 'Wellbeing (0-10)' },
    ],
  },
  {
    id: 'rivermead-mobility-index',
    summary: 'Rivermead Mobility Index (Collen FM, et al. Int Disabil Stud 1991): a count of the achieved mobility items (each yes = 1) for a total of 0-15, where higher = more independent mobility.',
    compute: F.rivermead,
    fields: [
      { dom: 'rmi-count', arg: 'count', kind: 'number', required: true, label: 'Number of items achieved (0-15)' },
    ],
  },
  {
    id: 'six-minute-walk-predicted',
    summary: 'Predicted six-minute walk distance (Enright PL, Sherrill DL. Am J Respir Crit Care Med 1998): a sex-specific reference value from height, age, and weight, with a lower limit of normal 153 m (men) / 139 m (women) below predicted.',
    compute: F.sixMinuteWalkPredicted,
    fields: [
      { dom: 'smwd-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'smwd-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'smwd-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'smwd-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
    ],
  },
  {
    id: 'quickdash',
    summary: 'QuickDASH (Beaton DE, et al; Institute for Work & Health): 11 items each 1-5 scored as [(mean response) - 1] x 25 for a 0-100 disability score, where higher = greater upper-limb disability.',
    compute: F.quickDash,
    fields: [
      { dom: 'qd-1', arg: 'i1', kind: 'number', required: true, label: '1. Open a tight jar (1-5)' },
      { dom: 'qd-2', arg: 'i2', kind: 'number', required: true, label: '2. Heavy household chores (1-5)' },
      { dom: 'qd-3', arg: 'i3', kind: 'number', required: true, label: '3. Carry a shopping bag (1-5)' },
      { dom: 'qd-4', arg: 'i4', kind: 'number', required: true, label: '4. Wash your back (1-5)' },
      { dom: 'qd-5', arg: 'i5', kind: 'number', required: true, label: '5. Use a knife (1-5)' },
      { dom: 'qd-6', arg: 'i6', kind: 'number', required: true, label: '6. Recreational activities (1-5)' },
      { dom: 'qd-7', arg: 'i7', kind: 'number', required: true, label: '7. Social activities limited (1-5)' },
      { dom: 'qd-8', arg: 'i8', kind: 'number', required: true, label: '8. Work / daily activities limited (1-5)' },
      { dom: 'qd-9', arg: 'i9', kind: 'number', required: true, label: '9. Arm/shoulder/hand pain (1-5)' },
      { dom: 'qd-10', arg: 'i10', kind: 'number', required: true, label: '10. Tingling (1-5)' },
      { dom: 'qd-11', arg: 'i11', kind: 'number', required: true, label: '11. Difficulty sleeping (1-5)' },
    ],
  },
];
