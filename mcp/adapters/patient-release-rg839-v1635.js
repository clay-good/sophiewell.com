// spec-v1635 MCP adapter: patient-release-rg839 in lib/patient-release-rg839-v1635.js. The dom keys
// mirror views/group-v1635.js and META['patient-release-rg839'].example. Clinical domain.

import * as PR from '../../lib/patient-release-rg839-v1635.js';

export default [
  {
    id: 'patient-release-rg839',
    summary: 'Patient release after a radiopharmaceutical, by NRC Regulatory Guide 8.39. It checks the activity or the dose rate at 1 meter against the guide\'s release and instruction tables, applies its equation to a radionuclide the tables do not list, and for I-131 runs the patient-specific equation with the reader\'s two occupancy factors. It chooses no occupancy factor, and Agreement State rules may differ.',
    compute: PR.patientReleaseRg839,
    fields: [
      { dom: 'prg-nuclide', arg: 'nuclide', kind: 'enum', required: true, values: PR.NUCLIDES.map((n) => n.value), label: 'Radionuclide' },
      { dom: 'prg-activity', arg: 'activity', kind: 'number', label: 'Administered activity' },
      { dom: 'prg-unit', arg: 'unit', kind: 'enum', values: PR.UNITS.map((u) => u.value), label: 'Activity unit' },
      { dom: 'prg-rate', arg: 'doseRateMremH', kind: 'number', label: 'Measured dose rate at 1 meter', unit: 'mrem/h' },
      { dom: 'prg-gamma', arg: 'gamma', kind: 'number', label: 'Another radionuclide: exposure rate constant', unit: 'R·cm²/(mCi·h)' },
      { dom: 'prg-half-life', arg: 'halfLifeDays', kind: 'number', label: 'Another radionuclide: physical half-life', unit: 'days' },
      { dom: 'prg-condition', arg: 'condition', kind: 'enum', values: PR.CONDITIONS.map((c) => c.value), label: 'I-131 patient-specific: condition treated' },
      { dom: 'prg-e1', arg: 'occupancyFirst8h', kind: 'number', label: 'I-131 patient-specific: occupancy factor, first 8 hours' },
      { dom: 'prg-e2', arg: 'occupancyAfter', kind: 'number', label: 'I-131 patient-specific: occupancy factor after 8 hours' },
    ],
  },
];
