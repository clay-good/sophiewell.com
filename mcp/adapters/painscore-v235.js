// spec-v183 MCP wave: adapters for the four pain / disability screening
// instruments in lib/painscore-v235.js — the DN4 neuropathic-pain screen, the
// LANSS pain scale, the Roland-Morris Disability Questionnaire, and the Neck
// Disability Index. dom keys mirror views/group-v235.js; DN4 and LANSS items are
// checkboxes (bool), the questionnaires take numeric section scores.

import * as F from '../../lib/painscore-v235.js';

export default [
  {
    id: 'dn4-neuropathic-pain',
    summary: 'DN4 (Bouhassira 2005): 7 interview items and 3 exam items, each 1 point; total 0-10 and a score >= 4 suggests neuropathic pain.',
    compute: F.dn4,
    fields: [
      { dom: 'dn4-burn', arg: 'burning', kind: 'bool', required: true, label: 'Burning' },
      { dom: 'dn4-cold', arg: 'cold', kind: 'bool', required: true, label: 'Painful cold' },
      { dom: 'dn4-shock', arg: 'shocks', kind: 'bool', required: true, label: 'Electric shocks' },
      { dom: 'dn4-tingle', arg: 'tingling', kind: 'bool', required: true, label: 'Tingling' },
      { dom: 'dn4-pins', arg: 'pins', kind: 'bool', required: true, label: 'Pins and needles' },
      { dom: 'dn4-numb', arg: 'numbness', kind: 'bool', required: false, label: 'Numbness' },
      { dom: 'dn4-itch', arg: 'itching', kind: 'bool', required: false, label: 'Itching' },
      { dom: 'dn4-htouch', arg: 'hypoTouch', kind: 'bool', required: false, label: 'Exam: hypoesthesia to touch' },
      { dom: 'dn4-hpin', arg: 'hypoPinprick', kind: 'bool', required: false, label: 'Exam: hypoesthesia to pinprick' },
      { dom: 'dn4-brush', arg: 'brushAllodynia', kind: 'bool', required: false, label: 'Exam: brush allodynia' },
    ],
  },
  {
    id: 'lanss-pain-scale',
    summary: 'LANSS pain scale (Bennett 2001): weighted symptom and exam items totaling 0-24; a score >= 12 suggests pain of predominantly neuropathic origin.',
    compute: F.lanss,
    fields: [
      { dom: 'lanss-dys', arg: 'dysesthesia', kind: 'bool', required: true, label: 'Dysesthesia — pricking/tingling/pins-and-needles (5)' },
      { dom: 'lanss-auto', arg: 'autonomic', kind: 'bool', required: true, label: 'Skin looks different — mottled/red (5)' },
      { dom: 'lanss-allo', arg: 'allodyniaReport', kind: 'bool', required: false, label: 'Abnormally sensitive to touch (3)' },
      { dom: 'lanss-par', arg: 'paroxysmal', kind: 'bool', required: false, label: 'Sudden electric-shock bursts (2)' },
      { dom: 'lanss-therm', arg: 'thermal', kind: 'bool', required: false, label: 'Feels hot/burning (1)' },
      { dom: 'lanss-brush', arg: 'brushAllodynia', kind: 'bool', required: true, label: 'Exam: brush allodynia (5)' },
      { dom: 'lanss-pin', arg: 'pinprick', kind: 'bool', required: false, label: 'Exam: altered pin-prick threshold (3)' },
    ],
  },
  {
    id: 'roland-morris-disability',
    summary: 'Roland-Morris Disability Questionnaire (Roland & Morris 1983): count of applicable low-back disability statements (0-24); higher = more disability.',
    compute: F.rolandMorris,
    fields: [
      { dom: 'rmdq-count', arg: 'count', kind: 'number', required: true, label: 'Number of applicable statements (0-24)' },
    ],
  },
  {
    id: 'neck-disability-index',
    summary: 'Neck Disability Index (Vernon & Mior 1991): 10 sections each 0-5, raw 0-50 reported as a percentage (raw x 2), grading none to complete disability.',
    compute: F.neckDisabilityIndex,
    fields: [
      { dom: 'ndi-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain intensity (0-5)' },
      { dom: 'ndi-care', arg: 'care', kind: 'number', required: true, label: 'Personal care (0-5)' },
      { dom: 'ndi-lift', arg: 'lifting', kind: 'number', required: true, label: 'Lifting (0-5)' },
      { dom: 'ndi-read', arg: 'reading', kind: 'number', required: true, label: 'Reading (0-5)' },
      { dom: 'ndi-head', arg: 'headaches', kind: 'number', required: true, label: 'Headaches (0-5)' },
      { dom: 'ndi-conc', arg: 'concentration', kind: 'number', required: true, label: 'Concentration (0-5)' },
      { dom: 'ndi-work', arg: 'work', kind: 'number', required: true, label: 'Work (0-5)' },
      { dom: 'ndi-drive', arg: 'driving', kind: 'number', required: true, label: 'Driving (0-5)' },
      { dom: 'ndi-sleep', arg: 'sleeping', kind: 'number', required: true, label: 'Sleeping (0-5)' },
      { dom: 'ndi-rec', arg: 'recreation', kind: 'number', required: true, label: 'Recreation (0-5)' },
    ],
  },
];
