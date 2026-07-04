// spec-v183 MCP wave 17: adapters for the four bedside ventilation /
// oxygenation indices in lib/vent-v195.js — the SpO₂/FiO₂ (S/F) ratio with an
// estimated P/F, the ventilatory ratio (VR), the oxygen saturation index (OSI),
// and the ventilation index (VI). dom keys mirror views/group-v195.js.

import * as F from '../../lib/vent-v195.js';

export default [
  {
    id: 'sf-ratio',
    summary: 'SpO₂/FiO₂ (S/F) ratio with an estimated P/F ratio (Rice 2007): a noninvasive surrogate for P/F that avoids an arterial gas; lower values mark ARDS-range oxygenation.',
    compute: F.sfRatio,
    fields: [
      { dom: 'sf-spo2', arg: 'spo2', kind: 'number', required: true, label: 'SpO₂', unit: '%' },
      { dom: 'sf-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO₂ (fraction, 0.21–1.0)' },
    ],
  },
  {
    id: 'ventilatory-ratio',
    summary: 'Ventilatory ratio (Sinha 2009): measured minute ventilation × PaCO₂ divided by predicted values; a ratio above 1 marks impaired CO₂ clearance / a larger dead-space fraction.',
    compute: F.ventilatoryRatio,
    fields: [
      { dom: 'vr-ve', arg: 've', kind: 'number', required: true, label: 'Measured minute ventilation', unit: 'mL/min' },
      { dom: 'vr-paco2', arg: 'paco2', kind: 'number', required: true, label: 'Measured PaCO₂', unit: 'mmHg' },
      { dom: 'vr-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'vr-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex (for predicted body weight)' },
    ],
  },
  {
    id: 'osi-oxygenation',
    summary: 'Oxygen saturation index (OSI = FiO₂ × mean airway pressure × 100 / SpO₂): a noninvasive oxygenation-severity index used for pediatric ARDS grading.',
    compute: F.osi,
    fields: [
      { dom: 'osi-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO₂ (fraction, 0.21–1.0)' },
      { dom: 'osi-map', arg: 'map', kind: 'number', required: true, label: 'Mean airway pressure', unit: 'cmH₂O' },
      { dom: 'osi-spo2', arg: 'spo2', kind: 'number', required: true, label: 'SpO₂', unit: '%' },
    ],
  },
  {
    id: 'ventilation-index',
    summary: 'Ventilation index (VI = respiratory rate × peak inspiratory pressure × PaCO₂ / 1000): a bedside marker of ventilatory burden; higher values track mortality and extubation-failure risk.',
    compute: F.ventilationIndex,
    fields: [
      { dom: 'vi-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'vi-pip', arg: 'pip', kind: 'number', required: true, label: 'Peak inspiratory pressure', unit: 'cmH₂O' },
      { dom: 'vi-paco2', arg: 'paco2', kind: 'number', required: true, label: 'PaCO₂', unit: 'mmHg' },
    ],
  },
];
