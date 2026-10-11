// spec-v1631 MCP adapter: auc-trapezoid in lib/auc-trapezoid-v1631.js. The dom keys mirror
// views/group-v1631.js and META['auc-trapezoid'].example. Clinical domain. Arithmetic on the
// reader's samples; no empirical constant.

import * as AT from '../../lib/auc-trapezoid-v1631.js';

export default [
  {
    id: 'auc-trapezoid',
    summary: 'Area under the concentration-time curve from measured levels by the trapezoidal rule, linear or linear-up log-down. Can extrapolate to infinity along a terminal slope fitted through the last samples, giving the terminal half-life, the percent extrapolated, and clearance when a dose is entered.',
    compute: AT.aucTrapezoid,
    fields: [
      { dom: 'at-points', arg: 'points', kind: 'string', required: true, label: 'Samples, one per line: time in hours, then the concentration' },
      { dom: 'at-method', arg: 'method', kind: 'enum', required: true, values: AT.METHODS.map((m) => m.value), label: 'Method: linear, or linear-up-log-down' },
      { dom: 'at-extra', arg: 'extrapolate', kind: 'enum', required: true, values: AT.YES_NO.map((y) => y.value), label: 'Extrapolate to infinity (yes or no)' },
      { dom: 'at-n', arg: 'terminalPoints', kind: 'number', required: false, label: 'Last samples to fit the terminal slope through (when extrapolating)' },
      { dom: 'at-dose', arg: 'dose', kind: 'number', required: false, label: 'Dose, for clearance (optional)' },
    ],
  },
];
