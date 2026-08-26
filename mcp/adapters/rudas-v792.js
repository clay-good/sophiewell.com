// spec-v792 MCP adapter: RUDAS in lib/rudas-v792.js.
// The dom keys mirror the browser renderer (views/group-v792.js) and META['rudas'].example.
// Six numbers with DIFFERENT maxima summing to 30. Clinical domain.

import { rudas } from '../../lib/rudas-v792.js';

export default [
  {
    id: 'rudas',
    summary: 'RUDAS, the Rowland Universal Dementia Assessment Scale (Storey 2004): a cognitive screen designed to be minimally affected by culture, language and education, and free to use. Six items with different maxima summing to exactly 30 - memory 8, body orientation 5, praxis 2, drawing 3, judgement 4, language 8. Higher is better. A total of 22 or less is possible cognitive impairment; at that cut point the original validation reported about 89% sensitivity and 98% specificity.',
    compute: rudas,
    fields: [
      { dom: 'rudas-memory', arg: 'memory', kind: 'number', required: true, label: 'Memory (0-8)' },
      { dom: 'rudas-body', arg: 'bodyOrientation', kind: 'number', required: true, label: 'Body orientation (0-5)' },
      { dom: 'rudas-praxis', arg: 'praxis', kind: 'number', required: true, label: 'Praxis (0-2)' },
      { dom: 'rudas-drawing', arg: 'drawing', kind: 'number', required: true, label: 'Drawing (0-3)' },
      { dom: 'rudas-judgement', arg: 'judgement', kind: 'number', required: true, label: 'Judgement (0-4)' },
      { dom: 'rudas-language', arg: 'language', kind: 'number', required: true, label: 'Language (0-8)' },
    ],
  },
];
