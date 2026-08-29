// spec-v876 MCP adapter: the NHSN ventilator-associated event algorithm in lib/nhsn-vae-v876.js.
// The dom keys mirror the browser renderer (views/group-v876.js) and META['nhsn-vae'].example.
//
// Every setting passed here is a DAILY MINIMUM. It returns a surveillance tier, not a diagnosis.
// Clinical domain.

import { nhsnVae } from '../../lib/nhsn-vae-v876.js';

export default [
  {
    id: 'nhsn-vae',
    summary: 'Applies the NHSN ventilator-associated event algorithm and returns its tier. A ventilator-associated condition is, after at least two calendar days of stable or decreasing daily minimum settings, a rise of at least 20 points in daily minimum FiO2 or at least 3 cmH2O in daily minimum PEEP, sustained for at least two calendar days. Adding an abnormal temperature or white count together with a NEW antimicrobial continued at least four calendar days makes it an infection-related complication; adding a qualifying microbiological criterion makes it possible ventilator-associated pneumonia. NHSN REPLACED VENTILATOR-ASSOCIATED PNEUMONIA WITH THIS and uses NO CHEST RADIOGRAPH and no clinical judgment at any step. THE THRESHOLDS ARE ON THE DAILY MINIMUM, so a transient rise does not start an event. PEEP VALUES BELOW 5 ARE TREATED AS 5. A stability period is required, or there is no baseline and no event.',
    compute: nhsnVae,
    fields: [
      { dom: 'vae-stabilityperiod', arg: 'stabilityPeriod', kind: 'boolean', required: false, label: 'At least two calendar days of stable or decreasing daily minimum settings' },
      { dom: 'vae-baselinefio2', arg: 'baselineFio2', kind: 'number', required: false, label: 'Baseline daily minimum FiO2, percent', unit: '%' },
      { dom: 'vae-baselinepeep', arg: 'baselinePeep', kind: 'number', required: false, label: 'Baseline daily minimum PEEP, cmH2O', unit: 'cmH2O' },
      { dom: 'vae-eventfio2', arg: 'eventFio2', kind: 'number', required: false, label: 'Event daily minimum FiO2, percent', unit: '%' },
      { dom: 'vae-eventpeep', arg: 'eventPeep', kind: 'number', required: false, label: 'Event daily minimum PEEP, cmH2O', unit: 'cmH2O' },
      { dom: 'vae-sustainedtwodays', arg: 'sustainedTwoDays', kind: 'boolean', required: false, label: 'The rise was sustained for at least two calendar days' },
      { dom: 'vae-temperatureabnormal', arg: 'temperatureAbnormal', kind: 'boolean', required: false, label: 'Temperature above 100.4 F or below 96.8 F' },
      { dom: 'vae-whitecountabnormal', arg: 'whiteCountAbnormal', kind: 'boolean', required: false, label: 'White cell count at or above 12,000 or at or below 4,000 per cubic millimeter' },
      { dom: 'vae-newantimicrobialfourdays', arg: 'newAntimicrobialFourDays', kind: 'boolean', required: false, label: 'A NEW antimicrobial started and continued for at least four calendar days' },
      { dom: 'vae-microbiologicalcriterion', arg: 'microbiologicalCriterion', kind: 'boolean', required: false, label: 'A qualifying microbiological criterion is met' },
    ],
  },
];
