// spec-v649 MCP adapter: Nottingham histologic grade in lib/nottingham-grade-v649.js.
// The dom keys mirror the browser renderer (views/group-v649.js) and
// META['nottingham-grade'].example. Three components, each a required 1-3 enum; sum
// 3-9 maps to grade 1 (3-5), grade 2 (6-7), grade 3 (8-9). The mitotic component is
// the pathologist's 1-3 SCORE (its raw-count thresholds are field-diameter-dependent),
// entered directly. This is the grade, not the Nottingham Prognostic Index. Clinical domain.

import { nottinghamGrade } from '../../lib/nottingham-grade-v649.js';

export default [
  {
    id: 'nottingham-grade',
    summary: 'Nottingham histologic grade for breast cancer (Elston-Ellis modified Scarff-Bloom-Richardson): three components (tubule formation, nuclear pleomorphism, mitotic count), each 1-3, summed to 3-9. Grade 1 (3-5) well differentiated, grade 2 (6-7) moderately, grade 3 (8-9) poorly. This is the grade, not the Nottingham Prognostic Index.',
    compute: nottinghamGrade,
    fields: [
      { dom: 'nott-tubules', arg: 'tubules', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Tubule/gland formation: 1 = > 75%, 2 = 10-75%, 3 = < 10%' },
      { dom: 'nott-pleo', arg: 'pleomorphism', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Nuclear pleomorphism: 1 = small/uniform, 2 = moderate variation, 3 = marked variation' },
      { dom: 'nott-mitoses', arg: 'mitoses', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Mitotic count score 1-3 (entered directly; thresholds are field-diameter-dependent)' },
    ],
  },
];
