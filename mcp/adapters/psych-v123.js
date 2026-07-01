// spec-v183 MCP wave 11: adapters for the five lib/psych-v123.js public-domain
// psychiatry instruments (AIMS tardive-dyskinesia exam, Bush-Francis catatonia,
// Barnes akathisia, SCOFF, CES-D). dom keys mirror views/group-v123.js; the
// compute arg names are the verbatim payload keys those renderers build. Graded
// selects are 'enum', SCOFF checkboxes 'bool'. Each compute reads missing items
// as 0 (its own lvl() helper), so the default makeToArgs round-trips every
// documented example even when it lists only the non-default items.

import * as F from '../../lib/psych-v123.js';

const G04 = ['0', '1', '2', '3', '4'];
const G03 = ['0', '1', '2', '3'];
const G03BIN = ['0', '3'];

// BFCRS 23 items in published order: [dom, arg, binary?]. The six binary items
// (waxy flexibility, Mitgehen, Gegenhalten, ambitendency, grasp, perseveration)
// are scored 0 or 3 only.
const BFCRS = [
  ['bf-immob', 'immobility', false], ['bf-mutism', 'mutism', false], ['bf-staring', 'staring', false],
  ['bf-posturing', 'posturing', false], ['bf-grimacing', 'grimacing', false], ['bf-echo', 'echo', false],
  ['bf-stereotypy', 'stereotypy', false], ['bf-mannerisms', 'mannerisms', false], ['bf-verbig', 'verbigeration', false],
  ['bf-rigidity', 'rigidity', false], ['bf-negativism', 'negativism', false], ['bf-waxy', 'waxy', true],
  ['bf-withdrawal', 'withdrawal', false], ['bf-excitement', 'excitement', false], ['bf-impuls', 'impulsivity', false],
  ['bf-autoob', 'autoObedience', false], ['bf-mitgehen', 'mitgehen', true], ['bf-gegen', 'gegenhalten', true],
  ['bf-ambi', 'ambitendency', true], ['bf-grasp', 'grasp', true], ['bf-persev', 'perseveration', true],
  ['bf-combat', 'combativeness', false], ['bf-autonomic', 'autonomic', false],
];

export default [
  {
    id: 'aims-tardive',
    summary: 'Abnormal Involuntary Movement Scale (Guy 1976): the 7-area involuntary-movement total (0-28) plus a global severity, screening for tardive dyskinesia.',
    compute: F.aimsTardive,
    fields: [
      { dom: 'ai-face', arg: 'face', kind: 'enum', values: G04, label: 'Facial expression muscles (0-4)' },
      { dom: 'ai-lips', arg: 'lips', kind: 'enum', values: G04, label: 'Lips and perioral area (0-4)' },
      { dom: 'ai-jaw', arg: 'jaw', kind: 'enum', values: G04, label: 'Jaw (0-4)' },
      { dom: 'ai-tongue', arg: 'tongue', kind: 'enum', values: G04, label: 'Tongue (0-4)' },
      { dom: 'ai-upper', arg: 'upper', kind: 'enum', values: G04, label: 'Upper extremity (0-4)' },
      { dom: 'ai-lower', arg: 'lower', kind: 'enum', values: G04, label: 'Lower extremity (0-4)' },
      { dom: 'ai-trunk', arg: 'trunk', kind: 'enum', values: G04, label: 'Trunk (0-4)' },
      { dom: 'ai-global', arg: 'global', kind: 'enum', values: G04, label: 'Global severity (0-4)' },
    ],
  },
  {
    id: 'bfcrs',
    summary: 'Bush-Francis Catatonia Rating Scale (Bush 1996): the 23-item catatonia severity total (0-69); the first 14 items form the present/absent screen.',
    compute: F.bfcrs,
    fields: BFCRS.map(([dom, arg, bin]) => ({ dom, arg, kind: 'enum', values: bin ? G03BIN : G03, label: arg })),
  },
  {
    id: 'bars-akathisia',
    summary: 'Barnes Akathisia Rating Scale (Barnes 1989): the objective, awareness, and distress items plus a 0-5 global clinical rating of drug-induced akathisia.',
    compute: F.barsAkathisia,
    fields: [
      { dom: 'ba-obj', arg: 'objective', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'Objective akathisia (0-3)' },
      { dom: 'ba-aware', arg: 'awareness', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'Subjective awareness of restlessness (0-3)' },
      { dom: 'ba-distress', arg: 'distress', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'Subjective distress from restlessness (0-3)' },
      { dom: 'ba-global', arg: 'global', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'Global clinical rating (0-5)' },
    ],
  },
  {
    id: 'scoff',
    summary: 'SCOFF questionnaire (Morgan 1999): the five-question eating-disorder screen; 2 or more positive answers flags a likely eating disorder.',
    compute: F.scoff,
    fields: [
      { dom: 'sc-sick', arg: 'sick', kind: 'bool', label: 'Sick: make yourself sick when uncomfortably full' },
      { dom: 'sc-control', arg: 'control', kind: 'bool', label: 'Control: worry about lost control over eating' },
      { dom: 'sc-stone', arg: 'oneStone', kind: 'bool', label: 'One stone: lost >6.35 kg in 3 months' },
      { dom: 'sc-fat', arg: 'fat', kind: 'bool', label: 'Fat: believe yourself fat when others say thin' },
      { dom: 'sc-food', arg: 'food', kind: 'bool', label: 'Food: food dominates your life' },
    ],
  },
  {
    id: 'ces-d',
    summary: 'Center for Epidemiologic Studies Depression Scale (Radloff 1977): the 20-item self-report total (0-60); 16 or more flags clinically significant depressive symptoms.',
    compute: F.cesD,
    fields: Array.from({ length: 20 }, (_, i) => ({ dom: `cd-q${i + 1}`, arg: `q${i + 1}`, kind: 'enum', values: G03, label: `Item ${i + 1} (0-3)` })),
  },
];
