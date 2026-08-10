// spec-v703 MCP adapter: Reimers migration percentage in
// lib/reimers-migration-percentage-v703.js. The dom keys mirror the browser renderer
// (views/group-v703.js) and META['reimers-migration-percentage'].example. Two millimetre
// widths; a ratio returns the hip migration percentage. Clinical domain.

import { reimersMigrationPercentage } from '../../lib/reimers-migration-percentage-v703.js';

export default [
  {
    id: 'reimers-migration-percentage',
    summary: "Reimers migration percentage / hip migration index (Reimers 1980): MP = (a / b) x 100, where a = femoral-head width lateral to Perkin's line and b = total femoral-head width (mm). <= 33% normal/contained; > 33% subluxated (cerebral-palsy hip-surveillance referral threshold); ~90-100% dislocated.",
    compute: reimersMigrationPercentage,
    fields: [
      { dom: 'reimers-a', arg: 'lateralWidth', kind: 'number', unit: 'mm', required: true, label: "Femoral-head width lateral to Perkin's line, a (mm)" },
      { dom: 'reimers-b', arg: 'totalWidth', kind: 'number', unit: 'mm', required: true, label: 'Total femoral-head width, b (mm)' },
    ],
  },
];
