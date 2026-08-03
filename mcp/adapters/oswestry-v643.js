// spec-v643 MCP adapter: Oswestry Disability Index (ODI) in lib/oswestry-v643.js.
// The dom keys mirror the browser renderer (views/group-v643.js) and
// META['oswestry-odi'].example. Ten sections, each 0-5; VARIABLE DENOMINATOR:
// ODI% = round(sum / (5 x sections answered) x 100), so an omitted section drops
// the divisor by 5 rather than scoring zero. Every section is optional; at least
// one must be answered (else INCOMPLETE). Clinical domain.

import { oswestryDisabilityIndex, ODI_SECTIONS } from '../../lib/oswestry-v643.js';

const DOM = {
  pain: 'odi-pain', personalCare: 'odi-care', lifting: 'odi-lift', walking: 'odi-walk',
  sitting: 'odi-sit', standing: 'odi-stand', sleeping: 'odi-sleep', sexLife: 'odi-sex',
  socialLife: 'odi-social', travelling: 'odi-travel',
};

export default [
  {
    id: 'oswestry-odi',
    summary: 'Oswestry Disability Index (ODI) for low-back-pain disability: ten sections each rated 0-5, scored as round(sum / (5 x sections answered) x 100) percent (variable denominator, so an omitted section drops the divisor by 5). Bands: 0-20 minimal, 21-40 moderate, 41-60 severe, 61-80 crippled, 81-100 bed-bound.',
    compute: oswestryDisabilityIndex,
    fields: ODI_SECTIONS.map((s) => ({
      dom: DOM[s.key], arg: s.key, kind: 'enum', values: ['0', '1', '2', '3', '4', '5'],
      required: false, label: `${s.label} (0 none to 5 maximum disability; omit to exclude from the denominator)`,
    })),
  },
];
