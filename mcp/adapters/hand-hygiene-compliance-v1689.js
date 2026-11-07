// spec-v1689 MCP adapter: hand-hygiene-compliance in lib/hand-hygiene-compliance-v1689.js. The dom keys
// mirror views/group-v1655.js and META['hand-hygiene-compliance'].example.

import * as HHC from '../../lib/hand-hygiene-compliance-v1689.js';

// A field pair per WHO moment. None is required on its own -- the compute asks for at least one
// moment and names the missing half of any pair that is half-entered -- so an agent can report a
// single moment's observation without inventing zeros for the other four.
const fields = [];
for (const m of HHC.MOMENTS) {
  fields.push({
    dom: `hhc-${m.key}-opp`, arg: `${m.key}Opportunities`, kind: 'number', required: false,
    label: `Moment ${m.n} (${m.label.toLowerCase()}): opportunities`,
  });
  fields.push({
    dom: `hhc-${m.key}-act`, arg: `${m.key}Actions`, kind: 'number', required: false,
    label: `Moment ${m.n} (${m.label.toLowerCase()}): actions at those opportunities`,
  });
}

export default [
  {
    id: 'hand-hygiene-compliance',
    summary: 'WHO hand hygiene compliance from observed opportunities: performed actions over opportunities, times 100, overall and per moment, as the WHO Hand Hygiene Technical Reference Manual (2009) section III.7 states it. Count an action only where it answered an opportunity. No target rate is implied, because the manual sets none.',
    compute: HHC.handHygieneCompliance,
    fields,
  },
];
