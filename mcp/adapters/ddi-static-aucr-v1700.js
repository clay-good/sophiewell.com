// spec-v1700 MCP adapter: ddi-static-aucr in lib/ddi-static-aucr-v1700.js. The dom keys mirror views/group-v1700.js and
// META['ddi-static-aucr'].example.

import * as DSA from '../../lib/ddi-static-aucr-v1700.js';

export default [
  {
    id: 'ddi-static-aucr',
    summary: "Predicted exposure change from ICH M12's mechanistic static model, gut and liver, for inhibition and induction. A drug that both inhibits and induces is run three ways.",
    compute: DSA.ddiStaticAucr,
    fields: [
      { dom: 'dsa-fm', arg: 'fm', kind: 'number', min: 0, max: 1, required: true, label: 'fm' },
      { dom: 'dsa-fg', arg: 'fg', kind: 'number', min: 0, max: 1, required: false, label: 'Substrate Fg' },
      { dom: 'dsa-ki', arg: 'ki', kind: 'number', required: false, label: 'Ki (µM)' },
      { dom: 'dsa-kinact', arg: 'kinact', kind: 'number', required: false, label: 'kinact (per minute)' },
      { dom: 'dsa-ki2', arg: 'kI', kind: 'number', required: false, label: 'KI (µM)' },
      { dom: 'dsa-enzyme', arg: 'enzyme', kind: 'enum', values: ['CYP1A2', 'CYP2B6', 'CYP2C8', 'CYP2C9', 'CYP2C19', 'CYP2D6', 'CYP3A4', 'CYP3A4-gut'], required: false, label: 'Enzyme for liver kdeg' },
      { dom: 'dsa-kdegh', arg: 'kdegH', kind: 'number', required: false, label: 'Liver kdeg (per minute)' },
      { dom: 'dsa-kdegg', arg: 'kdegG', kind: 'number', required: false, label: 'Gut kdeg (per minute)' },
      { dom: 'dsa-emax', arg: 'emax', kind: 'number', required: false, label: 'Induction Emax' },
      { dom: 'dsa-ec50', arg: 'ec50', kind: 'number', required: false, label: 'Induction EC50 (µM)' },
      { dom: 'dsa-d', arg: 'd', kind: 'number', required: false, label: 'Induction scaling factor d' },
      { dom: 'dsa-ih', arg: 'ih', kind: 'number', required: false, label: 'Liver concentration [I]h (µM)' },
      { dom: 'dsa-ig', arg: 'ig', kind: 'number', required: false, label: 'Gut concentration [I]g (µM)' },
      { dom: 'dsa-est', arg: 'estimate', kind: 'boolean', required: false, label: 'Estimate concentrations from the dose' },
      { dom: 'dsa-fup', arg: 'fup', kind: 'number', min: 0, max: 1, required: false, label: 'fu,p' },
      { dom: 'dsa-cmax', arg: 'cmax', kind: 'number', required: false, label: 'Cmax total (µM)' },
      { dom: 'dsa-dose', arg: 'dose', kind: 'number', required: false, label: 'Inhibitor dose (mg)' },
      { dom: 'dsa-mw', arg: 'mw', kind: 'number', required: false, label: 'Molecular weight (g/mol)' },
      { dom: 'dsa-rb', arg: 'rb', kind: 'number', required: false, label: 'Blood-to-plasma ratio RB' },
      { dom: 'dsa-fa', arg: 'fa', kind: 'number', required: false, label: 'Fa' },
      { dom: 'dsa-fgi', arg: 'fgInhibitor', kind: 'number', required: false, label: 'Inhibitor Fg' },
      { dom: 'dsa-ka', arg: 'kaPerMin', kind: 'number', required: false, label: 'ka (per minute)' },
      { dom: 'dsa-qh', arg: 'qh', kind: 'number', required: false, label: 'Qh (L/h)' },
      { dom: 'dsa-qen', arg: 'qen', kind: 'number', required: false, label: 'Qen (L/h)' },
    ]
  },
];
