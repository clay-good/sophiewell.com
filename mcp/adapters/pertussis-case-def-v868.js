// spec-v868 MCP adapter: the CDC/CSTE pertussis case definition in
// lib/pertussis-case-def-v868.js. The dom keys mirror the browser renderer
// (views/group-v868.js) and META['pertussis-case-def'].example.
//
// It classifies a case for surveillance. It is not a treatment threshold. Clinical domain.

import { pertussisCaseDefinition } from '../../lib/pertussis-case-def-v868.js';

export default [
  {
    id: 'pertussis-case-def',
    summary: 'Classifies a case as confirmed, probable, or not meeting the CDC and CSTE pertussis surveillance case definition of 2020. The clinical criteria are, absent a more likely diagnosis, a cough illness of at least two weeks with paroxysms, an inspiratory whoop, post-tussive vomiting, or apnea in an infant under one year. Confirmed by a positive culture with a cough illness of any duration, or by the clinical criteria with a positive PCR or an epidemiologic link to a laboratory-confirmed case; probable when the clinical criteria stand alone. IT IS A SURVEILLANCE DEFINITION, NOT A TREATMENT THRESHOLD, so treatment and post-exposure prophylaxis are decided on clinical suspicion. A NEGATIVE TEST DOES NOT MOVE A CASE OUT OF PROBABLE, because yield falls after three to four weeks of cough or once antibiotics have started. SEROLOGY IS IN NO BRANCH of the definition.',
    compute: pertussisCaseDefinition,
    fields: [
      { dom: 'pcd-age', arg: 'age', kind: 'enum', required: false, label: 'Age group', values: ['older', 'infant'] },
      { dom: 'pcd-coughweeks', arg: 'coughWeeks', kind: 'number', required: false, label: 'Duration of the cough illness, in weeks' },
      { dom: 'pcd-paroxysms', arg: 'paroxysms', kind: 'boolean', required: false, label: 'Paroxysms of coughing' },
      { dom: 'pcd-whoop', arg: 'whoop', kind: 'boolean', required: false, label: 'Inspiratory whoop' },
      { dom: 'pcd-posttussivevomiting', arg: 'postTussiveVomiting', kind: 'boolean', required: false, label: 'Post-tussive vomiting' },
      { dom: 'pcd-apnea', arg: 'apnea', kind: 'boolean', required: false, label: 'Apnea, with or without cyanosis (counts only in an infant under one year)' },
      { dom: 'pcd-morelikelydiagnosis', arg: 'moreLikelyDiagnosis', kind: 'boolean', required: false, label: 'A more likely diagnosis has been made' },
      { dom: 'pcd-lab', arg: 'lab', kind: 'enum', required: false, label: 'Laboratory result', values: ['none', 'culture', 'pcr'] },
      { dom: 'pcd-epilink', arg: 'epiLink', kind: 'boolean', required: false, label: 'Epidemiologic link to a laboratory-confirmed case' },
    ],
  },
];
