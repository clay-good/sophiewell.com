// spec-v183 MCP wave 7: adapters for the three lib/ophtho-v164.js ophthalmology
// calculators (SRK II IOL power, the Snellen / logMAR / decimal visual-acuity
// converter, and ocular perfusion pressure). dom keys mirror views/group-v164.js;
// the biometry / pressures / acuity value are numbers, the acuity notation is an
// enum.

import * as F from '../../lib/ophtho-v164.js';

export default [
  {
    id: 'iol-power',
    summary: 'Intraocular-lens power by the SRK II regression formula with the axial-length adjustment band (Sanders / Retzlaff / Kraff 1988).',
    compute: F.iolPower,
    fields: [
      { dom: 'iol-a', arg: 'aConst', kind: 'number', required: true, label: 'Lens A-constant' },
      { dom: 'iol-al', arg: 'al', kind: 'number', required: true, label: 'Axial length', unit: 'mm' },
      { dom: 'iol-k', arg: 'k', kind: 'number', required: true, label: 'Average keratometry', unit: 'D' },
      { dom: 'iol-target', arg: 'target', kind: 'number', required: false, label: 'Target refraction (0 for emmetropia)', unit: 'D' },
    ],
  },
  {
    id: 'visual-acuity-converter',
    summary: 'Convert between Snellen (20-foot and 6-metre), decimal, and logMAR visual-acuity notations.',
    compute: F.visualAcuityConverter,
    fields: [
      { dom: 'va-mode', arg: 'mode', kind: 'enum', values: ['snellen20', 'snellen6', 'decimal', 'logmar'], required: true, label: 'Notation entered' },
      { dom: 'va-value', arg: 'value', kind: 'number', required: true, label: 'Value (Snellen denominator / decimal / logMAR)' },
    ],
  },
  {
    id: 'ocular-perfusion-pressure',
    summary: 'Mean, systolic and diastolic ocular perfusion pressure from blood pressure and intraocular pressure; a low mean OPP is a glaucoma-risk marker.',
    compute: F.ocularPerfusionPressure,
    fields: [
      { dom: 'opp-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'opp-dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'opp-iop', arg: 'iop', kind: 'number', required: true, label: 'Intraocular pressure', unit: 'mmHg' },
    ],
  },
];
