// spec-v183 MCP wave 10: adapters for lib/ltcga-v173.js — cognition screening & dementia staging — BIMS (MDS 3.0 §C), the AD8 informant screen, and the CDR Sum of Boxes.
// dom keys mirror views/group-v173.js; the compute arg names are the
// verbatim keys those renderers pass. Kind is number for graded / free-numeric
// inputs and enum for the yes/no and sex selects. Default makeToArgs round-trips.

import * as F from '../../lib/ltcga-v173.js';

export default [
  {
    id: 'bims',
    summary: 'Brief Interview for Mental Status (MDS 3.0 Section C): word repetition, temporal orientation (year/month/day), and delayed recall of three words. Summary 0–15; 13–15 intact, 8–12 moderate, 0–7 severe impairment.',
    compute: F.bims,
    fields: [
    { dom: 'bims-rep', arg: 'repetition', kind: 'number', required: true, label: 'Repetition' },
    { dom: 'bims-year', arg: 'year', kind: 'number', required: true, label: 'Year' },
    { dom: 'bims-month', arg: 'month', kind: 'number', required: true, label: 'Month' },
    { dom: 'bims-day', arg: 'day', kind: 'number', required: true, label: 'Day' },
    { dom: 'bims-sock', arg: 'recallSock', kind: 'number', required: true, label: 'Recall Sock' },
    { dom: 'bims-blue', arg: 'recallBlue', kind: 'number', required: true, label: 'Recall Blue' },
    { dom: 'bims-bed', arg: 'recallBed', kind: 'number', required: true, label: 'Recall Bed' },
    ],
  },
  {
    id: 'ad8',
    summary: 'AD8 Dementia Screening Interview: eight informant yes/no items on change due to thinking/memory problems. Total 0–8; ≥ 2 suggests cognitive impairment.',
    compute: F.ad8,
    fields: [
    { dom: 'ad8-judgment', arg: 'judgment', kind: 'enum', values: ["yes","no"], required: true, label: 'Judgment' },
    { dom: 'ad8-interest', arg: 'interest', kind: 'enum', values: ["yes","no"], required: true, label: 'Interest' },
    { dom: 'ad8-repeating', arg: 'repeating', kind: 'enum', values: ["yes","no"], required: true, label: 'Repeating' },
    { dom: 'ad8-learningTool', arg: 'learningTool', kind: 'enum', values: ["yes","no"], required: true, label: 'Learning Tool' },
    { dom: 'ad8-dateRecall', arg: 'dateRecall', kind: 'enum', values: ["yes","no"], required: true, label: 'Date Recall' },
    { dom: 'ad8-finances', arg: 'finances', kind: 'enum', values: ["yes","no"], required: true, label: 'Finances' },
    { dom: 'ad8-appointments', arg: 'appointments', kind: 'enum', values: ["yes","no"], required: true, label: 'Appointments' },
    { dom: 'ad8-dailyThinking', arg: 'dailyThinking', kind: 'enum', values: ["yes","no"], required: true, label: 'Daily Thinking' },
    ],
  },
  {
    id: 'cdr-sob',
    summary: 'Clinical Dementia Rating — Sum of Boxes: six boxes (memory, orientation, judgment, community, home & hobbies 0/0.5/1/2/3; personal care 0/1/2/3) summed 0–18, with O\'Bryant global-CDR staging.',
    compute: F.cdrSob,
    fields: [
    { dom: 'cdr-memory', arg: 'memory', kind: 'number', required: true, label: 'Memory' },
    { dom: 'cdr-orientation', arg: 'orientation', kind: 'number', required: true, label: 'Orientation' },
    { dom: 'cdr-judgment', arg: 'judgment', kind: 'number', required: true, label: 'Judgment' },
    { dom: 'cdr-community', arg: 'community', kind: 'number', required: true, label: 'Community' },
    { dom: 'cdr-home', arg: 'home', kind: 'number', required: true, label: 'Home' },
    { dom: 'cdr-personalCare', arg: 'personalCare', kind: 'number', required: true, label: 'Personal Care' },
    ],
  },
];
