// spec-v183 MCP wave 7: adapters for the three lib/hemodynamics-v87.js
// critical-care hemodynamic / ventilation formulas (invasive hemodynamic suite,
// mechanical power of ventilation, physiologic dead-space fraction). dom keys
// mirror views/group-v25.js; every input is a number except the dead-space
// expired-CO2 source, which is a two-value enum the lib branches on.

import * as F from '../../lib/hemodynamics-v87.js';

export default [
  {
    id: 'hemodynamic-suite',
    summary: 'Cardiac index, stroke volume / index, and SVR / PVR from thermodilution cardiac output and invasive pressures (Swan-Ganz; ESC/ERS 2022).',
    compute: F.hemodynamicSuite,
    fields: [
      { dom: 'hs-co', arg: 'cardiacOutput', kind: 'number', required: true, label: 'Cardiac output', unit: 'L/min' },
      { dom: 'hs-hr', arg: 'heartRate', kind: 'number', required: false, label: 'Heart rate', unit: 'bpm' },
      { dom: 'hs-bsa', arg: 'bsa', kind: 'number', required: false, label: 'Body surface area', unit: 'm^2' },
      { dom: 'hs-map', arg: 'map', kind: 'number', required: false, label: 'Mean arterial pressure', unit: 'mmHg' },
      { dom: 'hs-cvp', arg: 'cvp', kind: 'number', required: false, label: 'Central venous pressure', unit: 'mmHg' },
      { dom: 'hs-mpap', arg: 'mpap', kind: 'number', required: false, label: 'Mean pulmonary artery pressure', unit: 'mmHg' },
      { dom: 'hs-pcwp', arg: 'pcwp', kind: 'number', required: false, label: 'Pulmonary capillary wedge pressure', unit: 'mmHg' },
    ],
  },
  {
    id: 'mechanical-power',
    summary: 'Mechanical power of ventilation (Gattinoni simplified equation); above ~17 J/min is associated with higher ventilator-induced lung injury risk (Serpa Neto 2018).',
    compute: F.mechanicalPower,
    // The lib renders the driving-pressure unit as "cmH₂O" (subscript ₂); surface
    // the plain-ASCII unit so the JSON result is self-describing for an agent.
    formatResult: (raw) => (raw && raw.valid ? { ...raw, drivingPressureUnit: 'cmH2O' } : raw),
    fields: [
      { dom: 'mp-rr', arg: 'respiratoryRate', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'mp-vt', arg: 'tidalVolume', kind: 'number', required: true, label: 'Tidal volume', unit: 'mL' },
      { dom: 'mp-plat', arg: 'plateau', kind: 'number', required: true, label: 'Plateau pressure', unit: 'cmH2O' },
      { dom: 'mp-peep', arg: 'peep', kind: 'number', required: true, label: 'PEEP', unit: 'cmH2O' },
      { dom: 'mp-peak', arg: 'peak', kind: 'number', required: true, label: 'Peak pressure', unit: 'cmH2O' },
    ],
  },
  {
    id: 'dead-space',
    summary: 'Physiologic dead-space fraction (Vd/Vt) by the Bohr-Enghoff equation; above 0.6 carried independent mortality risk in ARDS (Nuckton 2002).',
    compute: F.deadSpace,
    fields: [
      { dom: 'ds-paco2', arg: 'paco2', kind: 'number', required: true, label: 'Arterial PaCO2', unit: 'mmHg' },
      { dom: 'ds-source', arg: 'source', kind: 'enum', values: ['peco2', 'etco2'], required: true, label: 'Expired CO2 source' },
      { dom: 'ds-eco2', arg: 'expiredCo2', kind: 'number', required: true, label: 'Expired CO2 value', unit: 'mmHg' },
    ],
  },
];
