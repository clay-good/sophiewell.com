// spec-v928 MCP adapter: auto-PEEP in lib/auto-peep-v928.js. The dom keys mirror the browser
// renderer (views/group-v928.js) and META['auto-peep'].example.
//
// A measured zero is never reported as an absence of gas trapping. Clinical domain.

import { autoPeep } from '../../lib/auto-peep-v928.js';

export default [
  {
    id: 'auto-peep',
    summary: 'Computes auto-PEEP from an end-expiratory hold: the total PEEP read during the hold minus the PEEP set on the ventilator. THE HOLD MEASURES IT ONLY IN A PASSIVE PATIENT -- expiratory muscle activity raises the pressure read and inspiratory effort lowers it, so on an actively breathing patient the number is not auto-PEEP, and this is the commonest reason a measurement is wrong. A MEASURED ZERO DOES NOT EXCLUDE GAS TRAPPING: where airways collapse during expiration the trapped gas never reaches the circuit during the hold, and the sign that survives that is the expiratory flow failing to return to zero before the next breath. IT PUTS AN ERROR INTO THE DRIVING PRESSURE, which is the plateau minus the TOTAL PEEP -- subtracting the set PEEP instead overstates it by exactly the auto-PEEP, and given a plateau this returns both. AND IT RAISES THE TRIGGER THRESHOLD, because the patient must generate all of it before any flow reaches the sensor. A total PEEP below the set PEEP is refused.',
    compute: autoPeep,
    fields: [
      { dom: 'ap-set', arg: 'setPeep', kind: 'number', required: true, label: 'PEEP set on the ventilator', unit: 'cmH2O' },
      { dom: 'ap-total', arg: 'totalPeep', kind: 'number', required: true, label: 'Total PEEP, from an end-expiratory hold', unit: 'cmH2O' },
      { dom: 'ap-plateau', arg: 'plateauPressure', kind: 'number', required: false, label: 'Plateau pressure, to see the effect on the driving pressure', unit: 'cmH2O' },
      { dom: 'ap-passive', arg: 'passive', kind: 'boolean', required: false, label: 'The patient was passive for the hold' },
      { dom: 'ap-flownotzero', arg: 'expiratoryFlowNotReturningToZero', kind: 'boolean', required: false, label: 'Expiratory flow does not return to zero before the next breath' },
    ],
  },
];
