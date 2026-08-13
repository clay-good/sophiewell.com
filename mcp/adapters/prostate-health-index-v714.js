// spec-v714 MCP adapter: Prostate Health Index (phi) in
// lib/prostate-health-index-v714.js. The dom keys mirror the browser renderer
// (views/group-v714.js) and META['prostate-health-index'].example. Three numbers; a formula
// returns the phi with a biopsy-probability band. Clinical domain.

import { prostateHealthIndex } from '../../lib/prostate-health-index-v714.js';

export default [
  {
    id: 'prostate-health-index',
    summary: 'Prostate Health Index (phi; Catalona 2011): phi = (p2PSA / free PSA) x sqrt(total PSA), with p2PSA ([-2]proPSA) in pg/mL and free/total PSA in ng/mL. Reference probability of prostate cancer on biopsy (total PSA 2-10 ng/mL, normal DRE): phi 0-26.9 ~11%, 27-35.9 ~21%, 36-54.9 ~33%, >=55 ~50%. Refines the biopsy decision; does not diagnose cancer.',
    compute: prostateHealthIndex,
    fields: [
      { dom: 'phi-total', arg: 'totalPsa', kind: 'number', unit: 'ng/mL', required: true, label: 'Total PSA (ng/mL)' },
      { dom: 'phi-free', arg: 'freePsa', kind: 'number', unit: 'ng/mL', required: true, label: 'Free PSA (ng/mL)' },
      { dom: 'phi-p2', arg: 'p2psa', kind: 'number', unit: 'pg/mL', required: true, label: 'p2PSA / [-2]proPSA (pg/mL)' },
    ],
  },
];
