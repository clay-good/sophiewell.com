// spec-v1661 MCP adapter: donor-recipient-size-match in lib/donor-recipient-size-match-v1661.js. The dom keys mirror views/group-v1661.js and
// META['donor-recipient-size-match'].example.

import * as DRS from '../../lib/donor-recipient-size-match-v1661.js';

export default [
  {
    id: 'donor-recipient-size-match',
    summary: 'Donor-to-recipient weight, height and body surface area ratios, with each difference as a percentage. BSA is by Mosteller; no acceptable range is built in.',
    compute: DRS.donorRecipientSizeMatch,
    fields: [
      { dom: 'drs-wunit', arg: 'weightUnit', kind: 'enum', values: ['kg', 'lb'], required: true, label: 'Weight unit' },
      { dom: 'drs-hunit', arg: 'heightUnit', kind: 'enum', values: ['cm', 'in'], required: true, label: 'Height unit' },
      // spec-v1793: both weights are refused outside lib/bounds.js's weightKg envelope -- but AFTER the
      // lb-to-kg conversion, so no static declaration is true of both units. Naming the envelope published
      // "0.2 to 500" and probe-declared-cap-configs answered at 525 lb straight away, which is 238 kg and
      // well inside it. These wait for a declaration that can carry a unit.
      { dom: 'drs-dw', arg: 'donorWeight', kind: 'number', required: true, label: 'Donor weight' },
      { dom: 'drs-rw', arg: 'recipientWeight', kind: 'number', required: true, label: 'Recipient weight' },
      { dom: 'drs-dh', arg: 'donorHeight', kind: 'number', required: true, label: 'Donor height', min: 45 },
      { dom: 'drs-rh', arg: 'recipientHeight', kind: 'number', required: true, label: 'Recipient height', min: 45 },
    ]
  },
];
