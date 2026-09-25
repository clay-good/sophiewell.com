// spec-v1441: MCP adapter. The dom keys mirror views/group-v1441.js and this tile's META example.

import * as WE from '../../lib/wellens-criteria-v1441.js';

const v = (list) => list.map((x) => x.value);

export default [
  {
    id: 'wellens-criteria',
    summary: 'Checks a 12-lead tracing against the Wellens criteria, the precordial T-wave pattern of critical proximal LAD stenosis. It names each criterion that fails and shows where sources disagree about cardiac markers.',
    compute: WE.wellensCriteria,
    fields: [
      { dom: 'wel-t', arg: 'tWave', kind: 'enum', required: true, label: 'T waves in V2-V3', values: v(WE.WELLENS_T) },
      { dom: 'wel-st', arg: 'st', kind: 'enum', required: true, label: 'ST segment in V2-V3', values: v(WE.WELLENS_ST) },
      { dom: 'wel-q', arg: 'qWaves', kind: 'enum', required: true, label: 'Precordial Q waves', values: v(WE.WELLENS_YES_NO) },
      { dom: 'wel-r', arg: 'rProgression', kind: 'enum', required: true, label: 'Precordial R-wave progression', values: v(WE.WELLENS_R) },
      { dom: 'wel-angina', arg: 'angina', kind: 'enum', required: true, label: 'Recent anginal chest pain', values: v(WE.WELLENS_YES_NO) },
      { dom: 'wel-painfree', arg: 'painFree', kind: 'enum', required: true, label: 'Tracing taken while pain-free', values: v(WE.WELLENS_YES_NO) },
      { dom: 'wel-markers', arg: 'markers', kind: 'enum', required: true, label: 'Cardiac markers', values: v(WE.WELLENS_MARKERS) },
    ],
  },
];
