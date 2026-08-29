// spec-v866 MCP adapter: the Broset Violence Checklist in lib/broset-v866.js. The dom keys
// mirror the browser renderer (views/group-v866.js) and META.broset.example.
//
// Pass what is being observed now. The instrument covers the next 24 hours only and is rescored
// every shift. Clinical domain.

import { brosetViolence } from '../../lib/broset-v866.js';

export default [
  {
    id: 'broset',
    summary: 'Scores the Broset Violence Checklist over six observed behaviors, one point each: confused, irritable, boisterous, physically threatening, verbally threatening, and attacking objects. A total of 0 means the risk of violence is small; 1 or 2 means moderate, and preventive measures should be taken; 3 or more means very high, preventive measures are required, and a plan for managing an attack should be made. IT PREDICTS THE NEXT 24 HOURS AND ONLY THAT, so it is scored on what is observed now and rescored every shift. A TOTAL OF 0 IS A SMALL RISK, NOT NO RISK. THE SCORE IS AN OBSERVATION, NOT AN INTERVENTION, and it is never a justification for restraint or seclusion, which have their own standards. The confusion item records behavior rather than a diagnosis. It does not decide what to do.',
    compute: brosetViolence,
    fields: [
      { dom: 'bv-confused', arg: 'confused', kind: 'boolean', required: false, label: 'Confused' },
      { dom: 'bv-irritable', arg: 'irritable', kind: 'boolean', required: false, label: 'Irritable' },
      { dom: 'bv-boisterous', arg: 'boisterous', kind: 'boolean', required: false, label: 'Boisterous' },
      { dom: 'bv-physicallythreatening', arg: 'physicallyThreatening', kind: 'boolean', required: false, label: 'Physically threatening' },
      { dom: 'bv-verballythreatening', arg: 'verballyThreatening', kind: 'boolean', required: false, label: 'Verbally threatening' },
      { dom: 'bv-attackingobjects', arg: 'attackingObjects', kind: 'boolean', required: false, label: 'Attacking objects' },
    ],
  },
];
