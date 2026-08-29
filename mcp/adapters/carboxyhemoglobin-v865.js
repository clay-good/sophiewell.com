// spec-v865 MCP adapter: carboxyhemoglobin level interpretation in
// lib/carboxyhemoglobin-v865.js. The dom keys mirror the browser renderer
// (views/group-v865.js) and META.carboxyhemoglobin.example.
//
// The level never grades severity. The clinical features are what escalation rests on, and the
// oximeter reading is accepted only so the tool can refuse it. Clinical domain.

import { carboxyhemoglobin } from '../../lib/carboxyhemoglobin-v865.js';

export default [
  {
    id: 'carboxyhemoglobin',
    summary: 'Reads a co-oximetry carboxyhemoglobin level against a baseline. Above about 3 percent in a non-smoker, or about 10 percent in a smoker, confirms exposure. THE LEVEL DOES NOT GRADE SEVERITY AND DOES NOT PREDICT OUTCOME, so a modest level in someone who lost consciousness is still a serious poisoning; severity and escalation rest on loss of consciousness, neurologic findings, cardiac ischemia, pregnancy, and symptoms persisting on oxygen. A STANDARD PULSE OXIMETER READS CARBOXYHEMOGLOBIN AS OXYHEMOGLOBIN, so the saturation is falsely normal or high — the opposite failure from methemoglobin, where it plateaus low — and the arterial oxygen tension is normal too. OXYGEN STARTED BEFORE THE SAMPLE MEANS THE LEVEL UNDERSTATES THE PEAK: the half-life is about 4 to 5 hours on room air, 60 to 90 minutes on high-flow oxygen, and 20 to 30 minutes hyperbaric. It does not grade severity or decide hyperbaric oxygen.',
    compute: carboxyhemoglobin,
    fields: [
      { dom: 'cx-level', arg: 'level', kind: 'number', required: true, label: 'Carboxyhemoglobin measured by co-oximetry', unit: 'percent' },
      { dom: 'cx-smoker', arg: 'smoker', kind: 'boolean', required: false, label: 'Smoker, whose baseline runs up to about 10 percent' },
      { dom: 'cx-unconscious', arg: 'unconscious', kind: 'boolean', required: false, label: 'Loss of consciousness at any point' },
      { dom: 'cx-neurologic', arg: 'neurologic', kind: 'boolean', required: false, label: 'Any neurologic finding, including confusion' },
      { dom: 'cx-cardiac', arg: 'cardiac', kind: 'boolean', required: false, label: 'Cardiac ischemia, arrhythmia, or a raised troponin' },
      { dom: 'cx-pregnant', arg: 'pregnant', kind: 'boolean', required: false, label: 'Pregnancy' },
      { dom: 'cx-persistent', arg: 'persistent', kind: 'boolean', required: false, label: 'Symptoms persisting after high-flow oxygen' },
      { dom: 'cx-oxygen', arg: 'oxygen', kind: 'enum', values: ['', 'none', 'high-flow', 'hyperbaric'], required: false, label: 'Oxygen already running when the sample was drawn' },
      { dom: 'cx-hours', arg: 'hoursOnOxygen', kind: 'number', required: false, label: 'Hours on oxygen before the sample', unit: 'hours' },
      { dom: 'cx-spo2', arg: 'spo2', kind: 'number', required: false, label: 'Pulse oximeter reading, which does not measure carboxyhemoglobin', unit: 'percent' },
    ],
  },
];
