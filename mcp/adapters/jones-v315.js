// spec-v315 MCP wave: adapter for the 2015 revised Jones criteria (acute rheumatic
// fever) in lib/jones-v315.js. The dom keys mirror the browser renderer
// (views/group-v315.js) and META['jones-criteria'].example. `riskPopulation` and
// `episode` are enums; the rest are booleans (kind 'bool'), each optional (the
// compute defaults each to false). The compute reports whether the criteria are met,
// met-but-needs-strep-evidence, or not met. The example sets gas + carditis +
// polyarthritis (a 2-major low-risk initial case that is met); its band carries the
// "2 major" example number, so it round-trips through the default makeToArgs with no
// custom toArgs.

import * as J from '../../lib/jones-v315.js';

export default [
  {
    id: 'jones-criteria',
    summary: '2015 revised Jones criteria (AHA, Gewitz 2015) for diagnosing acute rheumatic fever. Requires evidence of preceding group A strep (except isolated Sydenham chorea). Initial ARF: 2 major, or 1 major + 2 minor. Recurrent ARF also allows 3 minor. Major/minor are risk-stratified: low-risk uses polyarthritis (major) and polyarthralgia (minor), fever >= 38.5 C, ESR >= 60 and/or CRP >= 3; moderate/high-risk also counts monoarthritis and polyarthralgia as major and monoarthralgia as minor, with fever >= 38 C and ESR >= 30. A prolonged PR counts only without carditis. Reports whether the criteria are met, not a diagnosis or an order.',
    compute: J.jonesCriteria,
    fields: [
      { dom: 'jones-risk', arg: 'riskPopulation', kind: 'enum', values: ['low', 'modhigh'], label: 'Population risk tier (low / moderate-high)' },
      { dom: 'jones-episode', arg: 'episode', kind: 'enum', values: ['initial', 'recurrent'], label: 'Episode (initial / recurrent ARF)' },
      { dom: 'jones-gas', arg: 'gasEvidence', kind: 'bool', label: 'Evidence of preceding group A strep' },
      { dom: 'jones-carditis', arg: 'carditis', kind: 'bool', label: 'Carditis (clinical and/or subclinical) [major]' },
      { dom: 'jones-chorea', arg: 'chorea', kind: 'bool', label: 'Sydenham chorea [major; sufficient alone]' },
      { dom: 'jones-em', arg: 'erythemaMarginatum', kind: 'bool', label: 'Erythema marginatum [major]' },
      { dom: 'jones-nodules', arg: 'subcutaneousNodules', kind: 'bool', label: 'Subcutaneous nodules [major]' },
      { dom: 'jones-polyarthritis', arg: 'polyarthritis', kind: 'bool', label: 'Polyarthritis [major, both tiers]' },
      { dom: 'jones-monoarthritis', arg: 'monoarthritis', kind: 'bool', label: 'Monoarthritis [major in moderate/high-risk only]' },
      { dom: 'jones-polyarthralgia', arg: 'polyarthralgia', kind: 'bool', label: 'Polyarthralgia [major in moderate/high-risk; minor in low-risk]' },
      { dom: 'jones-monoarthralgia', arg: 'monoarthralgia', kind: 'bool', label: 'Monoarthralgia [minor in moderate/high-risk only]' },
      { dom: 'jones-fever', arg: 'fever', kind: 'bool', label: 'Fever (>= 38.5 C low-risk / >= 38 C moderate-high-risk) [minor]' },
      { dom: 'jones-reactants', arg: 'elevatedAcuteReactants', kind: 'bool', label: 'Elevated ESR (>= 60 low / >= 30 moderate-high mm/h) and/or CRP >= 3 mg/dL [minor]' },
      { dom: 'jones-pr', arg: 'prolongedPr', kind: 'bool', label: 'Prolonged PR interval (counts only if carditis absent) [minor]' },
    ],
  },
];
