// spec-v183 MCP wave 6: adapters for the six lib/uro-v130.js prostate
// instruments (volume, PSA density / velocity / doubling time, the D'Amico risk
// group, and the Gleason grade group). dom keys mirror views/group-v130.js; the
// dimensions and PSA values are numbers, the T stage and Gleason patterns are
// enums.

import * as F from '../../lib/uro-v130.js';

export default [
  {
    id: 'prostate-volume',
    summary: 'Prostate volume by the prolate-ellipsoid formula: AP x TR x CC x 0.52 (cc); above ~30 cc is the conventional enlarged (BPH) range.',
    compute: F.prostateVolume,
    fields: [
      { dom: 'pvol-ap', arg: 'ap', kind: 'number', required: true, label: 'Anteroposterior diameter', unit: 'cm' },
      { dom: 'pvol-tr', arg: 'tr', kind: 'number', required: true, label: 'Transverse diameter', unit: 'cm' },
      { dom: 'pvol-cc', arg: 'cc', kind: 'number', required: true, label: 'Craniocaudal diameter', unit: 'cm' },
    ],
  },
  {
    id: 'psa-density',
    summary: 'PSA density (Benson 1992): serum PSA divided by prostate volume (ng/mL/cc); above 0.15 raises suspicion for clinically significant cancer.',
    compute: F.psaDensity,
    fields: [
      { dom: 'psad-psa', arg: 'psa', kind: 'number', required: true, label: 'Serum PSA', unit: 'ng/mL' },
      { dom: 'psad-vol', arg: 'volume', kind: 'number', required: true, label: 'Prostate volume', unit: 'cc' },
    ],
  },
  {
    id: 'psa-velocity',
    summary: 'PSA velocity (Carter 1992): the annualized rate of PSA rise between two measurements (ng/mL/yr); above 0.75 ng/mL/yr raises suspicion for cancer.',
    compute: F.psaVelocity,
    fields: [
      { dom: 'psav-psa1', arg: 'psa1', kind: 'number', required: true, label: 'Earlier PSA', unit: 'ng/mL' },
      { dom: 'psav-psa2', arg: 'psa2', kind: 'number', required: true, label: 'Later PSA', unit: 'ng/mL' },
      { dom: 'psav-mo', arg: 'months', kind: 'number', required: true, label: 'Interval', unit: 'months' },
    ],
  },
  {
    id: 'psa-doubling-time',
    summary: 'PSA doubling time (Pound 1999): the time for PSA to double given two measurements (months); under ~12 months reflects more aggressive kinetics.',
    compute: F.psaDoublingTime,
    fields: [
      { dom: 'psadt-psa1', arg: 'psa1', kind: 'number', required: true, label: 'Earlier PSA', unit: 'ng/mL' },
      { dom: 'psadt-psa2', arg: 'psa2', kind: 'number', required: true, label: 'Later PSA', unit: 'ng/mL' },
      { dom: 'psadt-mo', arg: 'months', kind: 'number', required: true, label: 'Interval', unit: 'months' },
    ],
  },
  {
    id: 'damico-prostate-risk',
    summary: "D'Amico risk classification (D'Amico 1998): low / intermediate / high risk of biochemical recurrence from PSA, Gleason score, and clinical T stage; the worst feature governs.",
    compute: F.damicoProstateRisk,
    fields: [
      { dom: 'dam-psa', arg: 'psa', kind: 'number', required: true, label: 'Serum PSA', unit: 'ng/mL' },
      { dom: 'dam-gl', arg: 'gleason', kind: 'number', required: true, label: 'Gleason score (2-10)' },
      { dom: 'dam-stage', arg: 'stage', kind: 'enum', values: ['T1c', 'T2a', 'T2b', 'T2c', 'T3'], required: true, label: 'Clinical T stage' },
    ],
  },
  {
    id: 'gleason-grade-group',
    summary: 'Gleason grade group (Epstein 2016; ISUP 2014): maps the primary + secondary Gleason patterns to the 1-5 grade group with its prognostic band.',
    compute: F.gleasonGradeGroup,
    fields: [
      { dom: 'gl-pri', arg: 'primary', kind: 'enum', values: ['3', '4', '5'], required: true, label: 'Primary (most common) pattern' },
      { dom: 'gl-sec', arg: 'secondary', kind: 'enum', values: ['3', '4', '5'], required: true, label: 'Secondary pattern' },
    ],
  },
];
