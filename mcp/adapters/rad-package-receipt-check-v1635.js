// spec-v1635 MCP adapter: rad-package-receipt-check in lib/rad-package-receipt-check-v1635.js. The
// dom keys mirror views/group-v1635.js and META['rad-package-receipt-check'].example. Operational
// domain. Each part (the clock, the package questions, the wipe, the dose rates) is optional and is
// checked on its own.

import * as RR from '../../lib/rad-package-receipt-check-v1635.js';

export default [
  {
    id: 'rad-package-receipt-check',
    summary: 'Receiving a radioactive package: the monitoring deadline and the limits. It gives the 3-hour monitoring time under 10 CFR 20.1906, says which monitoring the rule requires, converts a wipe to dpm/cm² against 240 or 24 dpm/cm², and checks dose rates against 200 mrem/h and a transport index of 10. On an exceedance it states the duty to notify the carrier and the NRC immediately.',
    compute: RR.radPackageReceiptCheck,
    fields: [
      { dom: 'rpr-received', arg: 'received', kind: 'string', label: 'Date and time received (YYYY-MM-DDTHH:MM)' },
      { dom: 'rpr-working', arg: 'duringWorkingHours', kind: 'enum', values: ['yes', 'no'], label: 'Received during normal working hours' },
      { dom: 'rpr-next-day', arg: 'nextWorkingDayStart', kind: 'string', label: 'Start of the next working day, if received after hours (YYYY-MM-DDTHH:MM)' },
      { dom: 'rpr-labeled', arg: 'labeled', kind: 'enum', values: ['yes', 'no'], label: 'Bears a White I, Yellow II or Yellow III label' },
      { dom: 'rpr-damaged', arg: 'damaged', kind: 'enum', values: ['yes', 'no'], label: 'Evidence of degradation (crushed, wet or damaged)' },
      { dom: 'rpr-gas', arg: 'gasOrSpecialForm', kind: 'enum', values: ['yes', 'no'], label: 'Holds only a gas or special form material' },
      { dom: 'rpr-type-a', arg: 'aboveTypeA', kind: 'enum', values: ['yes', 'no'], label: 'Contents exceed a Type A quantity' },
      { dom: 'rpr-emitter', arg: 'emitter', kind: 'enum', values: RR.EMITTERS.map((e) => e.value), label: 'Emitter type (for the wipe limit)' },
      { dom: 'rpr-cpm', arg: 'netCpm', kind: 'number', label: 'Wipe: net counts per minute', unit: 'cpm' },
      { dom: 'rpr-eff', arg: 'efficiencyPercent', kind: 'number', label: 'Wipe: counter efficiency', unit: '%' },
      { dom: 'rpr-area', arg: 'areaCm2', kind: 'number', label: 'Wipe: area wiped', unit: 'cm²' },
      { dom: 'rpr-wipe-eff', arg: 'wipeEfficiencyPercent', kind: 'number', label: 'Wipe efficiency, if measured (the rule allows 10% to be assumed)', unit: '%' },
      { dom: 'rpr-surface', arg: 'surfaceMremH', kind: 'number', label: 'Dose rate at the package surface', unit: 'mrem/h' },
      { dom: 'rpr-one-meter', arg: 'oneMeterMremH', kind: 'number', label: 'Dose rate at 1 meter', unit: 'mrem/h' },
    ],
  },
];
