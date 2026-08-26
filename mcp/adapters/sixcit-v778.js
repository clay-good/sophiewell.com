// spec-v778 MCP adapter: 6CIT in lib/sixcit-v778.js.
// The dom keys mirror the browser renderer (views/group-v778.js) and META['sixcit'].example.
// Three booleans and three error-count enums; an inverse weighted total 0-28. Clinical domain.

import { sixcit } from '../../lib/sixcit-v778.js';

export default [
  {
    id: 'sixcit',
    summary: '6CIT (Six-item Cognitive Impairment Test, Kingshill Version 2000; Brooke and Bullock 1999): brief primary-care dementia screen. An INVERSE score - points are earned for errors, so higher is worse. Weights: year 4, month 3, time 3, counting backward 20-1 up to 4, months in reverse up to 4, five-part address recall 2 per component missed up to 10; maximum 28. Bands: 0-7 normal, 8-9 consider referral, 10-28 refer.',
    compute: sixcit,
    fields: [
      { dom: 'sixcit-year', arg: 'yearWrong', kind: 'boolean', required: false, label: 'Year named incorrectly (4)' },
      { dom: 'sixcit-month', arg: 'monthWrong', kind: 'boolean', required: false, label: 'Month named incorrectly (3)' },
      { dom: 'sixcit-time', arg: 'timeWrong', kind: 'boolean', required: false, label: 'Time wrong by over an hour (3)' },
      { dom: 'sixcit-count', arg: 'countErrors', kind: 'enum', values: ['0', '1', '2'], required: false, label: 'Counting backward errors' },
      { dom: 'sixcit-months', arg: 'monthsErrors', kind: 'enum', values: ['0', '1', '2'], required: false, label: 'Months in reverse errors' },
      { dom: 'sixcit-address', arg: 'addressErrors', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], required: false, label: 'Address parts missed' },
    ],
  },
];
