// spec-v882 MCP adapter: the USMSTF post-polypectomy intervals in
// lib/polyp-surveillance-v882.js. The dom keys mirror the browser renderer
// (views/group-v882.js) and META['polyp-surveillance'].example.
//
// Every interval presumes a complete examination with an adequate preparation, which is why both
// are inputs. Clinical domain.

import { polypSurveillance } from '../../lib/polyp-surveillance-v882.js';

export default [
  {
    id: 'polyp-surveillance',
    summary: 'Returns the US Multi-Society Task Force interval to the next colonoscopy after polypectomy. A normal examination, or hyperplastic polyps under 10 mm in the rectum or sigmoid, is ten years; one or two tubular adenomas under 10 mm is seven to ten years; three or four is three to five years; five to ten is three years; more than ten is one year. Any adenoma 10 mm or larger, villous or tubulovillous, or with high-grade dysplasia is three years whatever the count. Piecemeal resection of an adenoma 20 mm or larger is six months. EVERY INTERVAL PRESUMES A COMPLETE EXAMINATION TO THE CECUM WITH AN ADEQUATE PREPARATION; without both, no number from the table applies and the recommendation is an early repeat. THE PIECEMEAL ROW IS A CHECK THAT RESECTION WAS COMPLETE, not a surveillance interval, and it outranks the rest. This is average-risk surveillance and does not cover a family history or inflammatory bowel disease.',
    compute: polypSurveillance,
    fields: [
      { dom: 'ps-completetocecum', arg: 'completeToCecum', kind: 'boolean', required: false, label: 'The examination was complete to the cecum' },
      { dom: 'ps-adequatepreparation', arg: 'adequatePreparation', kind: 'boolean', required: false, label: 'The bowel preparation was adequate' },
      { dom: 'ps-histology', arg: 'histology', kind: 'enum', required: false, label: 'Worst histology found', values: ['none', 'hyperplastic-small', 'tubular-adenoma', 'villous'] },
      { dom: 'ps-adenomacount', arg: 'adenomaCount', kind: 'number', required: false, label: 'Number of adenomas' },
      { dom: 'ps-largestsizemm', arg: 'largestSizeMm', kind: 'number', required: false, label: 'Largest adenoma, mm (10 mm or larger shortens the interval to 3 years on its own)', unit: 'mm' },
      { dom: 'ps-highgradedysplasia', arg: 'highGradeDysplasia', kind: 'boolean', required: false, label: 'High-grade dysplasia (shortens the interval to 3 years on its own)' },
      { dom: 'ps-piecemealtwentymm', arg: 'piecemealTwentyMm', kind: 'boolean', required: false, label: 'Piecemeal resection of an adenoma 20 mm or larger (a 6-month completeness check that outranks the table)' },
    ],
  },
];
