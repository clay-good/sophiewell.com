// spec-v183 MCP wave 10: adapters for lib/ltcga-v175.js — observational pain scales for nonverbal / cognitively impaired residents — the Abbey Pain Scale and the CNPI.
// dom keys mirror views/group-v175.js; the compute arg names are the
// verbatim keys those renderers pass. Kind is number for graded / free-numeric
// inputs and enum for the yes/no and sex selects. Default makeToArgs round-trips.

import * as F from '../../lib/ltcga-v175.js';

export default [
  {
    id: 'abbey-pain',
    summary: 'Abbey Pain Scale: six observed domains rated 0 (absent) to 3 (severe). Total 0–18; 0–2 none, 3–7 mild, 8–13 moderate, 14+ severe pain.',
    compute: F.abbeyPain,
    fields: [
    { dom: 'abbey-vocal', arg: 'vocalization', kind: 'number', required: true, label: 'Vocalization' },
    { dom: 'abbey-facial', arg: 'facialExpression', kind: 'number', required: true, label: 'Facial Expression' },
    { dom: 'abbey-body', arg: 'bodyLanguage', kind: 'number', required: true, label: 'Body Language' },
    { dom: 'abbey-behavior', arg: 'behavioralChange', kind: 'number', required: true, label: 'Behavioral Change' },
    { dom: 'abbey-physiological', arg: 'physiologicalChange', kind: 'number', required: true, label: 'Physiological Change' },
    { dom: 'abbey-physical', arg: 'physicalChange', kind: 'number', required: true, label: 'Physical Change' },
    ],
  },
  {
    id: 'cnpi',
    summary: 'Checklist of Nonverbal Pain Indicators: six behaviors scored present/absent at rest and with movement. Higher scores indicate more pain behaviors observed.',
    compute: F.cnpi,
    fields: [
    { dom: 'cnpi-nonverbalVocal-rest', arg: 'nonverbalVocalRest', kind: 'number', required: true, label: 'Nonverbal Vocal Rest' },
    { dom: 'cnpi-facialGrimace-rest', arg: 'facialGrimaceRest', kind: 'number', required: true, label: 'Facial Grimace Rest' },
    { dom: 'cnpi-bracing-rest', arg: 'bracingRest', kind: 'number', required: true, label: 'Bracing Rest' },
    { dom: 'cnpi-restlessness-rest', arg: 'restlessnessRest', kind: 'number', required: true, label: 'Restlessness Rest' },
    { dom: 'cnpi-rubbing-rest', arg: 'rubbingRest', kind: 'number', required: true, label: 'Rubbing Rest' },
    { dom: 'cnpi-verbalVocal-rest', arg: 'verbalVocalRest', kind: 'number', required: true, label: 'Verbal Vocal Rest' },
    { dom: 'cnpi-nonverbalVocal-move', arg: 'nonverbalVocalMove', kind: 'number', required: true, label: 'Nonverbal Vocal Move' },
    { dom: 'cnpi-facialGrimace-move', arg: 'facialGrimaceMove', kind: 'number', required: true, label: 'Facial Grimace Move' },
    { dom: 'cnpi-bracing-move', arg: 'bracingMove', kind: 'number', required: true, label: 'Bracing Move' },
    { dom: 'cnpi-restlessness-move', arg: 'restlessnessMove', kind: 'number', required: true, label: 'Restlessness Move' },
    { dom: 'cnpi-rubbing-move', arg: 'rubbingMove', kind: 'number', required: true, label: 'Rubbing Move' },
    { dom: 'cnpi-verbalVocal-move', arg: 'verbalVocalMove', kind: 'number', required: true, label: 'Verbal Vocal Move' },
    ],
  },
];
