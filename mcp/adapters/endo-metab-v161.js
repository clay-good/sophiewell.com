// spec-v183 MCP wave 8: adapters for four lib/endo-metab-v161.js
// endocrine / metabolic bedside computations — the aldosterone-renin ratio
// (ARR) primary-aldosteronism screen, the calcium-phosphate product, the Free
// Thyroxine Index (FTI / T7), and the nitrogen balance. dom keys mirror
// views/group-v161.js: the labs are numbers, and the renin assay unit and the
// calcium/phosphate input-unit system are enums (a compared-across-unit-systems
// mistake the tile is designed to prevent).

import * as F from '../../lib/endo-metab-v161.js';

export default [
  {
    id: 'arr',
    summary: 'Aldosterone-renin ratio for primary-aldosteronism screening: plasma aldosterone (ng/dL) ÷ renin, with the positive-screen cutoff read against the renin assay unit (PRA vs DRC) and aldosterone ≥ 15 ng/dL.',
    compute: F.arr,
    fields: [
      { dom: 'arr-aldo', arg: 'aldosterone', kind: 'number', required: true, label: 'Plasma aldosterone', unit: 'ng/dL' },
      { dom: 'arr-renin', arg: 'renin', kind: 'number', required: true, label: 'Renin value (> 0)' },
      { dom: 'arr-unit', arg: 'reninUnit', kind: 'enum', values: ['pra', 'drc'], required: true, label: 'Renin assay unit (PRA ng/mL/h or DRC mIU/L)' },
    ],
  },
  {
    id: 'calcium-phosphate-product',
    summary: 'Calcium-phosphate product (serum calcium × phosphate) for CKD-MBD context, against the historical 55 mg²/dL² caution threshold; contemporary KDIGO guidance tracks calcium and phosphate individually.',
    compute: F.calciumPhosphateProduct,
    fields: [
      { dom: 'capo4-unit', arg: 'unit', kind: 'enum', values: ['mg-dl', 'mmol-l'], required: false, label: 'Input units (mg/dL or mmol/L)' },
      { dom: 'capo4-ca', arg: 'calcium', kind: 'number', required: true, label: 'Serum calcium' },
      { dom: 'capo4-po', arg: 'phosphate', kind: 'number', required: true, label: 'Serum phosphate' },
    ],
  },
  {
    id: 'free-thyroxine-index',
    summary: 'Free Thyroxine Index (FTI / T7): total T4 × (T3-resin uptake % ÷ reference-mean T3RU %), the binding-corrected free-hormone estimate used where a direct free-T4 assay is unavailable.',
    compute: F.freeThyroxineIndex,
    fields: [
      { dom: 'fti-t4', arg: 't4', kind: 'number', required: true, label: 'Total T4', unit: 'µg/dL' },
      { dom: 'fti-t3ru', arg: 't3ru', kind: 'number', required: true, label: 'T3-resin uptake', unit: '%' },
      { dom: 'fti-ref', arg: 'reference', kind: 'number', required: false, label: 'Reference-mean T3RU % (default 30)', unit: '%' },
    ],
  },
  {
    id: 'nitrogen-balance',
    summary: 'Nitrogen balance for nutrition support: (24-h protein intake ÷ 6.25) − (24-h urine urea nitrogen + insensible losses). A positive balance is anabolic, a negative balance catabolic.',
    compute: F.nitrogenBalance,
    fields: [
      { dom: 'nbal-protein', arg: 'protein', kind: 'number', required: true, label: '24-hour protein intake', unit: 'g' },
      { dom: 'nbal-uun', arg: 'uun', kind: 'number', required: true, label: '24-hour urine urea nitrogen', unit: 'g' },
      { dom: 'nbal-insensible', arg: 'insensible', kind: 'number', required: false, label: 'Insensible losses (default 4)', unit: 'g/day' },
    ],
  },
];
