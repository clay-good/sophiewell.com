// spec-v1635 MCP adapter: radiopharm-dispense-volume in lib/radiopharm-dispense-volume-v1635.js. The
// dom keys mirror views/group-v1635.js and META['radiopharm-dispense-volume'].example. Operational
// domain. The half-lives are the decay tool's label rows; the clock is injected for them.

import * as RD from '../../lib/radioactive-decay-v1635.js';
import * as DV from '../../lib/radiopharm-dispense-volume-v1635.js';

export default [
  {
    id: 'radiopharm-dispense-volume',
    summary: 'The volume to draw from a vial for a prescribed radiopharmaceutical activity. It decays the vial to the draw time, decays the prescription back from the administration time, and divides; with a measured activity it gives the percent difference and whether the dosage is within the prescribed range and within 20% (10 CFR 35.63). It does not replace the required dosage determination.',
    compute: (args) => DV.radiopharmDispenseVolume(args, new Date()),
    fields: [
      { dom: 'rdv-nuclide', arg: 'nuclide', kind: 'enum', required: true, values: RD.NUCLIDES.map((n) => n.value), label: 'Radionuclide' },
      { dom: 'rdv-half-life', arg: 'halfLife', kind: 'number', label: 'Half-life, for another radionuclide' },
      { dom: 'rdv-half-life-unit', arg: 'halfLifeUnit', kind: 'enum', values: RD.HALF_LIFE_UNITS.map((u) => u.value), label: 'Half-life unit' },
      { dom: 'rdv-unit', arg: 'unit', kind: 'enum', required: true, values: RD.ACTIVITY_UNITS.map((u) => u.value), label: 'Activity unit' },
      { dom: 'rdv-vial-activity', arg: 'vialActivity', kind: 'number', required: true, label: 'Vial activity at calibration' },
      { dom: 'rdv-vial-volume', arg: 'vialVolume', kind: 'number', required: true, label: 'Vial volume', unit: 'mL' },
      { dom: 'rdv-calibration', arg: 'calibration', kind: 'string', required: true, label: 'Vial calibration date and time (YYYY-MM-DDTHH:MM)' },
      { dom: 'rdv-prescribed', arg: 'prescribed', kind: 'number', required: true, label: 'Prescribed activity at administration' },
      { dom: 'rdv-draw', arg: 'draw', kind: 'string', required: true, label: 'Draw date and time (YYYY-MM-DDTHH:MM)' },
      { dom: 'rdv-administration', arg: 'administration', kind: 'string', label: 'Administration date and time, if later than the draw' },
      { dom: 'rdv-measured', arg: 'measured', kind: 'number', label: 'Measured activity at draw time (optional)' },
      { dom: 'rdv-range-low', arg: 'rangeLow', kind: 'number', label: 'Prescribed range, lower end (optional)' },
      { dom: 'rdv-range-high', arg: 'rangeHigh', kind: 'number', label: 'Prescribed range, upper end (optional)' },
    ],
  },
];
