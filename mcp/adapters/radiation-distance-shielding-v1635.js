// spec-v1635 MCP adapter: radiation-distance-shielding in lib/radiation-distance-shielding-v1635.js.
// The dom keys mirror views/group-v1635.js and META['radiation-distance-shielding'].example.
// Operational domain. Two label rows hold the attenuation tables; the clock is injected for them.

import * as RS from '../../lib/radiation-distance-shielding-v1635.js';

export default [
  {
    id: 'radiation-distance-shielding',
    summary: 'Dose rate at another distance and behind lead, as a point-source estimate. It applies the inverse square law to a measured rate, then a lead shield by the product label\'s attenuation table (Tc-99m, Rb-82) or a typed half-value layer, and gives the stay time to a dose the reader enters. Narrow-beam arithmetic for planning a survey; not a shielding design.',
    compute: (args) => RS.radiationDistanceShielding(args, new Date()),
    fields: [
      { dom: 'rds-rate', arg: 'rate', kind: 'number', required: true, label: 'Measured dose rate, per hour (any unit)' },
      { dom: 'rds-distance', arg: 'distance', kind: 'number', label: 'Distance of the measurement' },
      { dom: 'rds-new-distance', arg: 'newDistance', kind: 'number', label: 'New distance (same unit)' },
      { dom: 'rds-shield', arg: 'shield', kind: 'enum', values: RS.SHIELDS.map((s) => s.value), label: 'Lead shield: source' },
      { dom: 'rds-thickness', arg: 'thicknessCm', kind: 'number', label: 'Lead thickness', unit: 'cm' },
      { dom: 'rds-hvl', arg: 'halfValueLayerCm', kind: 'number', label: 'Half-value layer, for another source', unit: 'cm' },
      { dom: 'rds-limit', arg: 'doseLimit', kind: 'number', label: 'Dose to stay under, in the same dose unit (optional)' },
    ],
  },
];
