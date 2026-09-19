// spec-v1396: MCP adapter. The dom keys mirror views/group-v1396.js and this tile's META example.

import * as NSR from '../../lib/nurse-staffing-ratio-check-v1396.js';

export default [
  {
    id: 'nurse-staffing-ratio-check',
    summary: 'Checks a hospital unit against California\'s or New York\'s nurse-to-patient ratio and counts any shortfall. California (22 CCR 70217) sets ratios for 17 unit types, such as 1:2 critical care, 1:4 ED and telemetry, and 1:5 medical/surgical, with no averaging, and the ED triage RN not counted. New York (10 NYCRR 405.22) sets 1 RN per 2 patients whose attending says they need intensive care. New Jersey and Texas are not offered.',
    compute: NSR.nurseStaffingRatioCheck,
    fields: [
      { dom: 'nsr-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: NSR.NSR_STATES.map((s) => s.value) },
      { dom: 'nsr-unit', arg: 'unit', kind: 'enum', label: 'Unit (California)', values: NSR.CA_UNITS.map((u) => u.value) },
      { dom: 'nsr-patients', arg: 'patients', kind: 'number', required: true, label: 'Patients (or occupied operating rooms)' },
      { dom: 'nsr-nurses', arg: 'nurses', kind: 'number', required: true, label: 'Licensed nurses on the unit' },
      { dom: 'nsr-excluded', arg: 'notCounted', kind: 'number', required: true, label: 'Nurses not in the ratio (triage, base radio, charge)' },
    ],
  },
];
