// spec-v1558 MCP adapter: WHO Labour Care Guide alert thresholds in lib/labor-care-guide-alert-v1558.js.
// The dom keys mirror views/group-v1558.js and META['labor-care-guide-alert'].example. Clinical domain.

import * as L from '../../lib/labor-care-guide-alert-v1558.js';

const e = (dom, arg, label, opts) => ({ dom, arg, kind: 'enum', label, values: opts.map((d) => d.value) });
const n = (dom, arg, label, min, max) => ({ dom, arg, kind: 'number', label, min, max });

export default [
  {
    id: 'labor-care-guide-alert',
    summary: 'Flags the labor observations that meet a WHO Labour Care Guide alert threshold. Each row is compared as the guide prints it, with its action; a blank row is listed as not assessed, never read as normal.',
    compute: L.laborCareGuideAlert,
    fields: [
      { dom: 'lcg-stage', arg: 'stage', kind: 'enum', required: true, label: 'Stage of labor', values: L.STAGE_OPTIONS.map((d) => d.value) },
      e('lcg-companion', 'companion', 'Companion present', L.YN),
      e('lcg-pain', 'painRelief', 'Pain relief', L.YN),
      e('lcg-oral', 'oralFluid', 'Oral fluid', L.YN),
      e('lcg-posture', 'posture', 'Posture', L.POSTURE_OPTIONS),
      n('lcg-fhr', 'fhr', 'Baseline fetal heart rate per minute', 50, 250),
      e('lcg-decel', 'decel', 'Fetal heart decelerations', L.DECEL_OPTIONS),
      e('lcg-fluid', 'fluid', 'Amniotic fluid', L.FLUID_OPTIONS),
      e('lcg-position', 'position', 'Fetal position', L.POSITION_OPTIONS),
      e('lcg-caput', 'caput', 'Caput', L.GRADE_OPTIONS),
      e('lcg-moulding', 'moulding', 'Moulding', L.GRADE_OPTIONS),
      n('lcg-pulse', 'pulse', 'Maternal pulse per minute', 20, 250),
      n('lcg-sbp', 'sbp', 'Systolic pressure, mmHg', 30, 260),
      n('lcg-dbp', 'dbp', 'Diastolic pressure, mmHg', 10, 200),
      n('lcg-temp', 'temp', 'Axillary temperature, °C', 30, 44),
      e('lcg-protein', 'protein', 'Urine protein', L.DIP_OPTIONS),
      e('lcg-acetone', 'acetone', 'Urine acetone', L.DIP_OPTIONS),
      n('lcg-contractions', 'contractions', 'Contractions per 10 minutes', 0, 15),
      n('lcg-duration', 'duration', 'Contraction duration in seconds', 0, 300),
      n('lcg-dilatation', 'dilatation', 'Cervical dilatation in cm (first stage)', 5, 10),
      n('lcg-lag', 'lagHours', 'Hours at this dilatation without progress', 0, 48),
      e('lcg-parity', 'parity', 'Parity (second stage)', L.PARITY_OPTIONS),
      n('lcg-second', 'secondHours', 'Hours in the second stage', 0, 12),
    ],
  },
];
