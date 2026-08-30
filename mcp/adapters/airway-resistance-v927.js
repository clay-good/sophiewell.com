// spec-v927 MCP adapter: inspiratory airway resistance in lib/airway-resistance-v927.js. The dom
// keys mirror the browser renderer (views/group-v927.js) and META['airway-resistance'].example.
//
// The peak-versus-plateau distinction is in every result. Clinical domain.

import { airwayResistance } from '../../lib/airway-resistance-v927.js';

export default [
  {
    id: 'airway-resistance',
    summary: 'Computes inspiratory airway resistance on a ventilated patient: peak inspiratory pressure minus plateau pressure, divided by the inspiratory flow in liters per second. The numerator is the resistive pressure drop -- everything above the plateau is spent pushing gas through the tube and airways rather than distending the lung. THE DISTINCTION IT EXISTS TO MAKE: a rising peak with an UNCHANGED plateau is a RESISTANCE problem (secretions, a kinked or bitten tube, bronchospasm), while a rising PLATEAU is a COMPLIANCE problem (edema, consolidation, pneumothorax, abdominal pressure, chest wall) -- and the peak alone cannot tell them apart. FOUR CONDITIONS: the plateau must come from a real end-inspiratory hold with no flow; the flow must be constant square-wave in volume control, not pressure control or a decelerating pattern; the endotracheal tube is part of what is measured, so a smaller tube raises the number with no airway disease and the trend beats the absolute; and the patient must be passive. A plateau above the peak is refused rather than computed.',
    compute: airwayResistance,
    fields: [
      { dom: 'ar-peak', arg: 'peakPressure', kind: 'number', required: true, label: 'Peak inspiratory pressure', unit: 'cmH2O' },
      { dom: 'ar-plateau', arg: 'plateauPressure', kind: 'number', required: true, label: 'Plateau pressure, from an end-inspiratory hold', unit: 'cmH2O' },
      { dom: 'ar-flow', arg: 'inspiratoryFlow', kind: 'number', required: true, label: 'Set inspiratory flow', unit: 'L/min' },
    ],
  },
];
