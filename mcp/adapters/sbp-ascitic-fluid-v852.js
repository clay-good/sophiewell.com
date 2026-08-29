// spec-v852 MCP adapter: the ascitic-fluid criteria for spontaneous bacterial peritonitis in
// lib/sbp-ascitic-fluid-v852.js. The dom keys mirror the browser renderer (views/group-v852.js)
// and META['sbp-ascitic-fluid'].example.
//
// Pass the RED CELL COUNT whenever the tap drew blood: without it the neutrophil count is
// uncorrected and can cross the threshold on blood alone. Clinical domain.

import { sbpAsciticFluid } from '../../lib/sbp-ascitic-fluid-v852.js';

export default [
  {
    id: 'sbp-ascitic-fluid',
    summary: 'Applies the ascitic-fluid criterion for spontaneous bacterial peritonitis. The line is a corrected neutrophil count of 250 per cubic millimetre, where the correction subtracts one neutrophil for every 250 red cells, because a bloody tap carries neutrophils in with the blood and can cross 250 on blood alone. The threshold is the neutrophil count, not the total nucleated count. A count at or above the line with no growth is culture-negative neutrocytic ascites and is managed the same way as culture-positive disease; a single organism below the line is bacterascites; more than one organism points toward a perforated viscus. It also reports whether the albumin criteria studied in this setting are met. It does not select an antibiotic, a dose or a route.',
    compute: sbpAsciticFluid,
    fields: [
      { dom: 'sbp-pmn', arg: 'pmnCount', kind: 'number', required: false, label: 'Neutrophils in the fluid', unit: 'cells per cubic mm' },
      { dom: 'sbp-rbc', arg: 'redCellCount', kind: 'number', required: false, label: 'Red cells in the fluid, used to correct the neutrophil count', unit: 'cells per cubic mm' },
      { dom: 'sbp-wbc', arg: 'nucleatedCount', kind: 'number', required: false, label: 'Total nucleated cells, if the neutrophil count was reported as a percentage', unit: 'cells per cubic mm' },
      { dom: 'sbp-pct', arg: 'pmnPercent', kind: 'number', required: false, label: 'Percentage of the nucleated cells that are neutrophils', unit: 'percent' },
      { dom: 'sbp-cult', arg: 'culture', kind: 'enum', values: ['pending', 'none', 'single', 'polymicrobial'], required: false, label: 'What has grown in the culture' },
      { dom: 'sbp-cr', arg: 'creatinine', kind: 'number', required: false, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'sbp-bun', arg: 'bun', kind: 'number', required: false, label: 'Blood urea nitrogen', unit: 'mg/dL' },
      { dom: 'sbp-bili', arg: 'bilirubin', kind: 'number', required: false, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'sbp-wt', arg: 'weight', kind: 'number', required: false, label: 'Weight', unit: 'kg' },
    ],
  },
];
