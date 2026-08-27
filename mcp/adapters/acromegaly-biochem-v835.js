// spec-v835 MCP adapter: biochemical diagnosis of acromegaly in
// lib/acromegaly-biochem-v835.js. The dom keys mirror the browser renderer
// (views/group-v835.js) and META['acromegaly-biochem'].example.
//
// igf1TimesUln is a MULTIPLE of the age- and sex-matched upper limit, not a raw
// concentration: assays and reference ranges differ enormously and the criterion is itself
// expressed as a multiple. Clinical domain.

import { acromegalyBiochem } from '../../lib/acromegaly-biochem-v835.js';

export default [
  {
    id: 'acromegaly-biochem',
    summary: 'Interprets the biochemical tests for acromegaly. IGF-1 above 1.3 times the age- and sex-matched upper limit with typical features is confirmatory; a normal IGF-1 with a suppressed OGTT growth hormone nadir excludes it. The nadir threshold DEPENDS ON THE ASSAY - 1.0 conventional, 0.4 ultrasensitive. A random growth hormone is not a diagnostic test and can contribute only to exclusion.',
    compute: acromegalyBiochem,
    fields: [
      { dom: 'acro-igf1', arg: 'igf1TimesUln', kind: 'number', required: false, label: 'IGF-1 as a multiple of the age- and sex-matched upper limit' },
      { dom: 'acro-matched', arg: 'ageAndSexMatched', kind: 'boolean', required: false, label: 'IGF-1 interpreted against an age- and sex-matched range' },
      { dom: 'acro-features', arg: 'typicalFeatures', kind: 'boolean', required: false, label: 'Typical clinical features present' },
      { dom: 'acro-nadir', arg: 'ogttGhNadir', kind: 'number', required: false, label: 'OGTT growth hormone nadir, micrograms/L' },
      { dom: 'acro-assay', arg: 'assay', kind: 'enum', required: false, label: 'Growth hormone assay', values: ['conventional', 'ultrasensitive'] },
      { dom: 'acro-random', arg: 'randomGh', kind: 'number', required: false, label: 'Random growth hormone, micrograms/L' },
    ],
  },
];
