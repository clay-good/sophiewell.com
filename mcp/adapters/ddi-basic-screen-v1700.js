// spec-v1700 MCP adapter: ddi-basic-screen in lib/ddi-basic-screen-v1700.js. The dom keys mirror views/group-v1700.js and
// META['ddi-basic-screen'].example.

import * as DBS from '../../lib/ddi-basic-screen-v1700.js';

export default [
  {
    id: 'ddi-basic-screen',
    summary: 'ICH M12 basic in vitro screen for CYP inhibition: Cmax,u/Ki,u under 0.02, the gut CYP3A test under 10, or the time-dependent ratio under 1.25 excludes the risk.',
    compute: DBS.ddiBasicScreen,
    fields: [
      { dom: 'dbs-mech', arg: 'mechanism', kind: 'enum', values: ['reversible', 'gut', 'tdi'], required: true, label: 'Mechanism' },
      { dom: 'dbs-unit', arg: 'unit', kind: 'enum', values: ['uM', 'nM', 'ngml'], required: true, label: 'Concentration unit' },
      { dom: 'dbs-mw', arg: 'mw', kind: 'number', required: false, label: 'Molecular weight (g/mol)' },
      { dom: 'dbs-cmax', arg: 'cmax', kind: 'number', required: false, label: 'Cmax at steady state (total)' },
      { dom: 'dbs-fup', arg: 'fup', kind: 'number', min: 0, max: 1, required: false, label: 'fu,p' },
      { dom: 'dbs-fupval', arg: 'fupValidated', kind: 'boolean', required: false, label: 'fu,p below 1% shown reliable' },
      { dom: 'dbs-cmaxu', arg: 'cmaxu', kind: 'number', required: false, label: 'Cmax,u directly' },
      { dom: 'dbs-ki', arg: 'ki', kind: 'number', required: false, label: 'Ki,u' },
      { dom: 'dbs-dose', arg: 'dose', kind: 'number', required: false, label: 'Maximum clinical dose (mg)' },
      { dom: 'dbs-ki2', arg: 'kI', kind: 'number', required: false, label: 'KI,u (time-dependent)' },
      { dom: 'dbs-kinact', arg: 'kinact', kind: 'number', required: false, label: 'kinact (per minute)' },
      { dom: 'dbs-enzyme', arg: 'enzyme', kind: 'enum', values: ['CYP1A2', 'CYP2B6', 'CYP2C8', 'CYP2C9', 'CYP2C19', 'CYP2D6', 'CYP3A4', 'CYP3A4-gut'], required: false, label: 'Enzyme for Table 6 kdeg' },
      { dom: 'dbs-kdeg', arg: 'kdeg', kind: 'number', required: false, label: 'kdeg (per minute)' },
    ]
  },
];
