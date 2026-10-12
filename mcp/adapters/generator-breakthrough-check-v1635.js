// spec-v1635 MCP adapter: generator-breakthrough-check in lib/generator-breakthrough-check-v1635.js.
// The dom keys mirror views/group-v1635.js and META['generator-breakthrough-check'].example.
// Operational domain. Two label rows (Technelite, Cardiogen-82); the clock is injected for them.

import * as GB from '../../lib/generator-breakthrough-check-v1635.js';

export default [
  {
    id: 'generator-breakthrough-check',
    summary: 'Generator eluate breakthrough against the NRC limits and the generator label. For a technetium generator it gives the Mo-99 ratio at elution and at a later time, and the latest administration time; for a rubidium generator it checks Sr-82 and Sr-85 against 10 CFR 35.204 and the Cardiogen-82 Alert and Expiration Limits. The rule and the label are shown side by side.',
    compute: (args) => GB.generatorBreakthroughCheck(args, new Date()),
    fields: [
      { dom: 'gbc-generator', arg: 'generator', kind: 'enum', required: true, values: GB.GENERATORS.map((g) => g.value), label: 'Generator' },
      { dom: 'gbc-mo99', arg: 'mo99MicroCi', kind: 'number', label: 'Technetium generator: Mo-99 at elution', unit: 'µCi' },
      { dom: 'gbc-tc99m', arg: 'tc99mMilliCi', kind: 'number', label: 'Technetium generator: Tc-99m at elution', unit: 'mCi' },
      { dom: 'gbc-hours', arg: 'hoursToAdministration', kind: 'number', label: 'Technetium generator: hours from elution to administration (optional)', unit: 'h' },
      { dom: 'gbc-aluminum', arg: 'aluminumMcgPerMl', kind: 'number', label: 'Technetium generator: aluminum in the eluate (optional)', unit: 'µg/mL' },
      { dom: 'gbc-sr82', arg: 'sr82', kind: 'number', label: 'Rubidium generator: Sr-82 per mCi Rb-82', unit: 'µCi/mCi' },
      { dom: 'gbc-sr85', arg: 'sr85', kind: 'number', label: 'Rubidium generator: Sr-85 per mCi Rb-82', unit: 'µCi/mCi' },
      { dom: 'gbc-volume', arg: 'cumulativeVolumeL', kind: 'number', label: 'Rubidium generator: cumulative eluate volume (optional)', unit: 'L' },
      { dom: 'gbc-days', arg: 'daysSinceCalibration', kind: 'number', label: 'Rubidium generator: days since calibration (optional)', unit: 'days' },
    ],
  },
];
