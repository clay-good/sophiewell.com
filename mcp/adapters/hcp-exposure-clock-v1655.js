// spec-v1655 MCP adapter: hcp-exposure-clock in lib/hcp-exposure-clock-v1655.js. The dom keys mirror views/group-v1655.js and
// META['hcp-exposure-clock'].example.

import * as HCE from '../../lib/hcp-exposure-clock-v1655.js';

const YES_NO = ['yes', 'no'];

export default [
  {
    id: 'hcp-exposure-clock',
    summary: 'Work exclusion or monitoring dates for a healthcare worker exposed to measles, mumps, rubella, varicella or pertussis (CDC). The dates depend on immunity, immune globulin and prophylaxis, as CDC\'s section pages state.',
    compute: HCE.hcpExposureClock,
    fields: [
      { dom: 'hce-pathogen', arg: 'pathogen', kind: 'enum', values: HCE.PATHOGENS.map((p) => p.value), required: true, label: 'Exposed to' },
      { dom: 'hce-first', arg: 'firstExposure', kind: 'string', required: true, label: 'First exposure (YYYY-MM-DD)' },
      { dom: 'hce-last', arg: 'lastExposure', kind: 'string', required: false, label: 'Last exposure (YYYY-MM-DD; blank for a single exposure)' },
      { dom: 'hce-immunity', arg: 'immunity', kind: 'enum', values: HCE.IMMUNITY.map((i) => i.value), required: false, label: 'Immunity (measles, mumps, rubella, varicella)' },
      { dom: 'hce-mmr', arg: 'firstMmrBeforeExposure', kind: 'enum', values: YES_NO, required: false, label: 'Mumps, not immune: first MMR dose before the exposure' },
      { dom: 'hce-second-dose', arg: 'secondDoseWithin5Days', kind: 'enum', values: YES_NO, required: false, label: 'Varicella, not immune: one prior dose and the second within 5 days after exposure' },
      { dom: 'hce-varizig', arg: 'immuneGlobulin', kind: 'enum', values: YES_NO, required: false, label: 'Varicella, not immune: varicella-zoster immune globulin given' },
      { dom: 'hce-high-risk', arg: 'highRiskContact', kind: 'enum', values: YES_NO, required: false, label: 'Pertussis: likely to interact with persons at increased risk' },
      { dom: 'hce-pep', arg: 'prophylaxis', kind: 'enum', values: YES_NO, required: false, label: 'Pertussis: receiving postexposure prophylaxis' },
    ]
  },
];
