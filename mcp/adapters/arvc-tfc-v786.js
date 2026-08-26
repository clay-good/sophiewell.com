// spec-v786 MCP adapter: 2010 ARVC Task Force Criteria in lib/arvc-tfc-v786.js.
// The dom keys mirror the browser renderer (views/group-v786.js) and META['arvc-tfc'].example.
// Six none/minor/major enums, one per category - the shape enforces the at-most-one-per-
// category rule. Clinical domain.

import { arvcTfc } from '../../lib/arvc-tfc-v786.js';

const LEVEL = ['none', 'minor', 'major'];

export default [
  {
    id: 'arvc-tfc',
    summary: '2010 Task Force Criteria for arrhythmogenic right ventricular cardiomyopathy (Marcus 2010). Six categories - structure/function, tissue, repolarization, depolarization, arrhythmias, family history - and within EACH a patient meets a major criterion, a minor one, or neither, never both. Major = 2 points, minor = 1. Definite is 4 or more points (2 major, or 1 major + 2 minor, or 4 minor); borderline is 3; possible is 2.',
    compute: arvcTfc,
    fields: [
      { dom: 'arvc-structural', arg: 'structural', kind: 'enum', values: LEVEL, required: false, label: 'I. Structure and function' },
      { dom: 'arvc-tissue', arg: 'tissue', kind: 'enum', values: LEVEL, required: false, label: 'II. Tissue on biopsy' },
      { dom: 'arvc-repol', arg: 'repolarization', kind: 'enum', values: LEVEL, required: false, label: 'III. Repolarization' },
      { dom: 'arvc-depol', arg: 'depolarization', kind: 'enum', values: LEVEL, required: false, label: 'IV. Depolarization' },
      { dom: 'arvc-arrhythmia', arg: 'arrhythmias', kind: 'enum', values: LEVEL, required: false, label: 'V. Arrhythmias' },
      { dom: 'arvc-family', arg: 'family', kind: 'enum', values: LEVEL, required: false, label: 'VI. Family history' },
    ],
  },
];
