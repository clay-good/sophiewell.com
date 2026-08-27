// spec-v820 MCP adapter: ICHD-3 SUNCT and SUNA in lib/sunct-suna-ichd3-v820.js.
// The dom keys mirror the browser renderer (views/group-v820.js) and
// META['sunct-suna-ichd3'].example. conjunctivalInjection and lacrimation are separate args
// because the subtype turns on having BOTH. Clinical domain.

import { sunctSunaIchd3 } from '../../lib/sunct-suna-ichd3-v820.js';

export default [
  {
    id: 'sunct-suna-ichd3',
    summary: 'Applies the ICHD-3 criteria for section 3.3 and returns the SUNCT or SUNA subtype. These are short-lasting unilateral neuralgiform headache attacks. Attacks last 1-600 SECONDS, against 2-30 minutes for paroxysmal hemicrania and 15-180 minutes for cluster headache. A cranial autonomic sign is REQUIRED here - restlessness is not an alternative as it is in 3.1 and 3.2. Both conjunctival injection and tearing is SUNCT; one or neither is SUNA.',
    compute: sunctSunaIchd3,
    fields: [
      { dom: 'ss-attacks', arg: 'attackCount', kind: 'number', required: false, label: 'Number of attacks' },
      { dom: 'ss-pain', arg: 'moderateOrSevereUnilateral', kind: 'boolean', required: false, label: 'Moderate or severe one-sided trigeminal pain' },
      { dom: 'ss-seconds', arg: 'attackSeconds', kind: 'number', required: false, label: 'Attack duration, seconds' },
      { dom: 'ss-pattern', arg: 'stabbingPattern', kind: 'boolean', required: false, label: 'Stabs or saw-tooth pattern' },
      { dom: 'ss-perday', arg: 'attacksPerDay', kind: 'number', required: false, label: 'Attacks per day' },
      { dom: 'ss-conjunctival', arg: 'conjunctivalInjection', kind: 'boolean', required: false, label: 'Conjunctival injection' },
      { dom: 'ss-lacrimation', arg: 'lacrimation', kind: 'boolean', required: false, label: 'Tearing' },
      { dom: 'ss-nasal', arg: 'nasalCongestion', kind: 'boolean', required: false, label: 'Nasal congestion or rhinorrhea' },
      { dom: 'ss-eyelid', arg: 'eyelidEdema', kind: 'boolean', required: false, label: 'Eyelid edema' },
      { dom: 'ss-sweating', arg: 'sweating', kind: 'boolean', required: false, label: 'Forehead and facial sweating' },
      { dom: 'ss-flushing', arg: 'flushing', kind: 'boolean', required: false, label: 'Forehead and facial flushing' },
      { dom: 'ss-ear', arg: 'earFullness', kind: 'boolean', required: false, label: 'Sensation of fullness in the ear' },
      { dom: 'ss-miosis', arg: 'miosisPtosis', kind: 'boolean', required: false, label: 'Miosis or ptosis' },
      { dom: 'ss-restless', arg: 'restlessness', kind: 'boolean', required: false, label: 'Restlessness (not an alternative here)' },
      { dom: 'ss-noother', arg: 'noBetterExplanation', kind: 'boolean', required: false, label: 'No better ICHD-3 explanation' },
    ],
  },
];
