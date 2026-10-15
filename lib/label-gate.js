// spec-v1628 section 1, fail closed, for the older tools: these read figures from a watched FDA label
// without calling labelRow() themselves (they predate it). When any label a tool lists here is
// superseded or past its review date, the page shows no answer from the tool and the MCP server refuses,
// naming the label and linking the current one. test/unit/label-gate.test.js rebuilds this map from
// scripts/data/label-editions.json and the libraries, so a tool that starts calling labelRow() leaves it
// and a new one cannot be missed.
//
// Pure: `now` is passed in (or the SOPHIEWELL_NOW pin).

import { labelRow } from './label-row.js';

export const LEGACY_LABEL_TOOLS = {
  'naloxone': ['8535cc84-ad4a-4d67-8480-fb5a2e3406f8'],
  'electrolyte-replacement': ['f7702b2f-d0d1-4696-896d-571607fc0dc8'],
  'nac-dosing': ['472f158a-5ab9-4308-8e49-1116e6ea3d39'],
  'acetaminophen-nomogram': ['472f158a-5ab9-4308-8e49-1116e6ea3d39', '5558a5f5-e821-473b-7d8a-5d33d09f0586'],
  'anticoag-reversal': ['68fa4f90-8b01-6498-4140-e0be5247c3fe', 'eee1afb8-324c-42e4-8bf0-f0c9da5e6d42', 'c76876da-b9a8-45d0-9278-7df3288d3a06'],
  'calcium-replacement': ['5b0bd762-4c87-597e-e063-6394a90a8303', '16307c00-d0d5-4e05-821f-17b0c1a29fc9'],
  'tpn-macro': ['dccff103-8695-400c-a15d-cc2fd078760a', 'ae98eb03-c0e7-49d1-b024-77968e3d9d6e', '61e025f1-a38e-4af2-9e18-13ea12977cf5', '98460eae-5195-48d2-ab73-00d276879ef6', '5d9d0b24-e139-48bf-ab2d-536fb59cf8e0', 'e0e9d917-ff6f-488e-a6a8-0ad59dd17d80'],
  'iv-osmolarity': ['ae98eb03-c0e7-49d1-b024-77968e3d9d6e', '61e025f1-a38e-4af2-9e18-13ea12977cf5', '98460eae-5195-48d2-ab73-00d276879ef6', '5d9d0b24-e139-48bf-ab2d-536fb59cf8e0', 'e0e9d917-ff6f-488e-a6a8-0ad59dd17d80'],
  'co-cn-antidote': ['d56fcc8d-bd64-46ab-b0c0-2124bd745a6b', 'ff4941b3-9901-4aab-adcf-c5327bede34e'],
  'digoxin': ['dfac7f13-28be-423d-9389-9089da29da17'],
  'corrected-phenytoin': ['86dd27d1-9cee-48ae-b55d-e2d2f7dbc593'],
  'opioid-conversion': ['242759ef-cb6d-4e3e-9f8d-5e31efa1f289'],
  'vte-prophylaxis-dose': ['5017a927-2a24-4f27-89f9-27c805bf7d59'],
  'aminoglycoside': ['ac8134d9-a726-4508-b8b9-a536ef17243d'],
};

// Tools tied to a watched label that are not gated, and why: the label is not where their answer comes from.
export const NOT_GATED = {
  'dose-calendar': 'the Remicade label is only the worked example; every week and dose is the reader\'s entry',
  'rate-escalation-schedule': 'the Rituxan label is only the worked example; every rate is the reader\'s entry',
  'rabies-pep': 'its label figures come from lib/rabies-ig-volume-v1636.js, which calls labelRow() itself and withholds them',
  'bw-bsa-suite': 'one sentence names the tobramycin label\'s dosing-weight rule; the aminoglycoside tool, which carries the figures, is gated',
};

// labelGate(toolId, now) -> null when every listed label answers (or the tool is not listed), or
// { message, withheld: [{ edition, why, url }] }.
export function labelGate(toolId, now, table) {
  const ids = Object.prototype.hasOwnProperty.call(LEGACY_LABEL_TOOLS, toolId) ? LEGACY_LABEL_TOOLS[toolId] : null;
  if (!ids) return null;
  const withheld = ids.map((id) => labelRow(id, now, table)).filter((r) => !r.answers).map((r) => ({ edition: r.edition, why: r.why, url: r.url }));
  if (!withheld.length) return null;
  return {
    withheld,
    message: `No answer is given: this tool's figures come from FDA labels, and ${withheld.map((w) => w.why).join('; ')}. Read the current label${withheld.length === 1 ? '' : 's'} on DailyMed until the tool is checked against ${withheld.length === 1 ? 'it' : 'them'}.`,
  };
}
