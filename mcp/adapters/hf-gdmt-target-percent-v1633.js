// spec-v1633 MCP adapter: hf-gdmt-target-percent in lib/hf-gdmt-target-percent-v1633.js. The dom
// keys mirror views/group-v1633.js and META['hf-gdmt-target-percent'].example. Clinical domain.
// Every drug field is optional; at least one must be given.

import * as HG from '../../lib/hf-gdmt-target-percent-v1633.js';

export default [
  {
    id: 'hf-gdmt-target-percent',
    summary: 'Each heart failure drug dose as a percent of the guideline target dose. For the drugs in Table 14 of the 2022 AHA/ACC/HFSA heart failure guideline (reduced ejection fraction), it divides the total daily dose by the target total daily dose, shows both ends where the table prints a range, and lists the mean dose achieved in the trials. It does not judge why a dose is below target, and digoxin is not scored.',
    compute: HG.hfGdmtTargetPercent,
    fields: HG.DRUGS.map((d) => ({ dom: `hgt-${d.dom}`, arg: d.arg, kind: 'number', label: `${d.text}, total a day${d.entered ? `: ${d.entered}` : ''}`, unit: 'mg' })),
  },
];
