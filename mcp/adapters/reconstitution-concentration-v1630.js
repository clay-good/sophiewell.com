// spec-v1630 MCP adapter: reconstitution-concentration in lib/reconstitution-concentration-v1630.js.
// The dom keys mirror views/group-v1630.js and META['reconstitution-concentration'].example. An
// arithmetic identity; administrative domain. No displacement value ships: the label's figures are input.

import * as RC from '../../lib/reconstitution-concentration-v1630.js';

export default [
  {
    id: 'reconstitution-concentration',
    summary: 'Powder volume, final volume and strength of a reconstituted vial or oral suspension, from the label\'s own figures. Also the strength with a different diluent volume, the diluent for a wanted strength, and the volume for a dose. One unit serves the amount, the strengths and the dose. Refuses without a label concentration, final volume or displacement: the powder is never assumed to take no space.',
    compute: RC.reconstitutionConcentration,
    fields: [
      { dom: 'rc-unit', arg: 'unit', kind: 'enum', required: true, values: RC.UNITS.map((u) => u.value), label: 'Unit of the drug amount (also used for the strengths and the dose)' },
      { dom: 'rc-amount', arg: 'amount', kind: 'number', required: true, label: 'Drug amount in the container' },
      { dom: 'rc-diluent', arg: 'labelDiluent', kind: 'number', required: true, label: 'Diluent volume the label states', unit: 'mL' },
      { dom: 'rc-conc', arg: 'labelConcentration', kind: 'number', required: false, label: 'Label: resulting concentration, per mL (enter one of the three label figures)' },
      { dom: 'rc-final', arg: 'labelFinalVolume', kind: 'number', required: false, label: 'Label: final volume', unit: 'mL' },
      { dom: 'rc-disp', arg: 'displacement', kind: 'number', required: false, label: 'Label: powder displacement volume', unit: 'mL' },
      { dom: 'rc-new', arg: 'newDiluent', kind: 'number', required: false, label: 'Diluent volume you intend to use (optional)', unit: 'mL' },
      { dom: 'rc-want', arg: 'wantedConcentration', kind: 'number', required: false, label: 'Concentration wanted, per mL (optional; not with the diluent volume above)' },
      { dom: 'rc-dose', arg: 'dose', kind: 'number', required: false, label: 'Ordered dose (optional)' },
    ],
  },
];
