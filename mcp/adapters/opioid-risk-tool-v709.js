// spec-v709 MCP adapter: Opioid Risk Tool in lib/opioid-risk-tool-v709.js.
// The dom keys mirror the browser renderer (views/group-v709.js) and
// META['opioid-risk-tool'].example. A sex enum plus ten booleans; a sex-specific weighted
// sum maps to an aberrant-behavior risk band. Clinical domain.

import { opioidRiskTool } from '../../lib/opioid-risk-tool-v709.js';

export default [
  {
    id: 'opioid-risk-tool',
    summary: 'Opioid Risk Tool (ORT; Webster 2005): sex-specific screen for aberrant drug-related behavior before long-term opioids. Points (Female/Male): family hx alcohol 1/3, illegal 2/3, rx 4/4; personal hx alcohol 3/3, illegal 4/4, rx 5/5; age 16-45 1/1; preadolescent sexual abuse 3/0; ADD/OCD/bipolar/schizophrenia 2/2; depression 1/1. Total 0-3 low, 4-7 moderate, >=8 high. A screening aid, not a reason to withhold pain treatment.',
    compute: opioidRiskTool,
    fields: [
      { dom: 'ort-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex (points are sex-specific)' },
      { dom: 'ort-fam-alc', arg: 'famAlcohol', kind: 'boolean', required: false, label: 'Family history of alcohol abuse' },
      { dom: 'ort-fam-illegal', arg: 'famIllegal', kind: 'boolean', required: false, label: 'Family history of illegal drug use' },
      { dom: 'ort-fam-rx', arg: 'famRx', kind: 'boolean', required: false, label: 'Family history of prescription drug abuse' },
      { dom: 'ort-per-alc', arg: 'personalAlcohol', kind: 'boolean', required: false, label: 'Personal history of alcohol abuse' },
      { dom: 'ort-per-illegal', arg: 'personalIllegal', kind: 'boolean', required: false, label: 'Personal history of illegal drug use' },
      { dom: 'ort-per-rx', arg: 'personalRx', kind: 'boolean', required: false, label: 'Personal history of prescription drug abuse' },
      { dom: 'ort-age', arg: 'age16to45', kind: 'boolean', required: false, label: 'Age 16 to 45 years' },
      { dom: 'ort-abuse', arg: 'sexualAbuse', kind: 'boolean', required: false, label: 'History of preadolescent sexual abuse' },
      { dom: 'ort-psych', arg: 'psychAddBipolar', kind: 'boolean', required: false, label: 'ADD, OCD, bipolar, or schizophrenia' },
      { dom: 'ort-depression', arg: 'psychDepression', kind: 'boolean', required: false, label: 'Depression' },
    ],
  },
];
