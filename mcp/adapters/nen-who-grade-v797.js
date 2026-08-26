// spec-v797 MCP adapter: WHO 2022 neuroendocrine neoplasm grade in
// lib/nen-who-grade-v797.js. The dom keys mirror the browser renderer (views/group-v797.js)
// and META['nen-who-grade'].example. The HIGHER proliferation index sets the grade.
// Clinical domain.

import { nenWhoGrade } from '../../lib/nen-who-grade-v797.js';

export default [
  {
    id: 'nen-who-grade',
    summary: 'WHO 2022 grade for a gastroenteropancreatic neuroendocrine neoplasm (Rindi 2022). The HIGHER of two proliferation indices decides the grade: G1 is under 2 mitoses per 2 mm2 AND Ki-67 under 3%; G2 is 2-20 mitoses OR Ki-67 3-20%; G3 is over 20 mitoses OR Ki-67 over 20%. A Ki-67 of 25% with one mitosis is still G3. Differentiation is a separate axis deciding the ENTITY: well differentiated is a NET and is graded, poorly differentiated is a NEC, high grade by definition and classified small-cell or large-cell on morphology.',
    compute: nenWhoGrade,
    fields: [
      { dom: 'nen-diff', arg: 'differentiation', kind: 'enum', values: ['well', 'poor'], required: false, label: 'Differentiation' },
      { dom: 'nen-ki67', arg: 'ki67', kind: 'number', required: false, label: 'Ki-67 index', unit: '%' },
      { dom: 'nen-mitoses', arg: 'mitoses', kind: 'number', required: false, label: 'Mitoses per 2 mm2' },
    ],
  },
];
