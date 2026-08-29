// spec-v886 MCP adapter: allowable occupational noise exposure in lib/noise-exposure-v886.js.
// The dom keys mirror the browser renderer (views/group-v886.js) and
// META['noise-exposure'].example.
//
// It returns BOTH allowances and picks neither. Occupational domain.

import { noiseExposure } from '../../lib/noise-exposure-v886.js';

export default [
  {
    id: 'noise-exposure',
    summary: 'Computes the allowable daily exposure time for a sound level under both the NIOSH and OSHA noise limits, and returns both. NIOSH allows 85 dBA for eight hours with a 3 dB exchange rate; OSHA allows 90 dBA for eight hours with a 5 dB exchange rate and sets an action level at an eight-hour average of 85 dBA, at which a hearing conservation program is required. THE TWO STANDARDS USE DIFFERENT EXCHANGE RATES, so the same level gives very different allowances: 100 dBA is fifteen minutes under NIOSH and two hours under OSHA, and neither is offered as the answer. THE OSHA LIMIT IS A LEGAL CEILING, NOT A SAFETY THRESHOLD. A HEARING PROTECTOR RATING MUST BE DERATED as the rating minus 7, halved, so a protector labeled 33 dB is credited with 13 dB.',
    compute: noiseExposure,
    fields: [
      { dom: 'ne-leveldba', arg: 'levelDba', kind: 'number', required: true, label: 'Measured sound level, dBA', unit: 'dBA' },
      { dom: 'ne-exposurehours', arg: 'exposureHours', kind: 'number', required: false, label: 'Exposure duration, hours' , unit: 'h' },
      { dom: 'ne-protectornrr', arg: 'protectorNrr', kind: 'number', required: false, label: 'Hearing protector noise reduction rating on the label, dB (derated as rating minus 7, halved)', unit: 'dB' },
    ],
  },
];
