// spec-v831 MCP adapter: Quintero TTTS staging in lib/quintero-ttts-v831.js.
// The dom keys mirror the browser renderer (views/group-v831.js) and
// META['quintero-ttts'].example. The two fluid pockets are separate numbers because the
// sequence has two thresholds and one without the other is a different diagnosis.
// Clinical domain.

import { quinteroTtts } from '../../lib/quintero-ttts-v831.js';

export default [
  {
    id: 'quintero-ttts',
    summary: 'Stages twin-twin transfusion syndrome by Quintero. Requires a monochorionic diamniotic pregnancy with the oligohydramnios-polyhydramnios sequence: donor pocket under 2 cm AND recipient over 8 cm. Stage I visible donor bladder and normal Dopplers; II bladder not visible; III critically abnormal Dopplers; IV hydrops; V demise. Discordant growth WITHOUT the fluid sequence is selective fetal growth restriction, not this.',
    compute: quinteroTtts,
    fields: [
      { dom: 'ttts-mcda', arg: 'monochorionicDiamniotic', kind: 'boolean', required: false, label: 'Monochorionic diamniotic, confirmed' },
      { dom: 'ttts-donor', arg: 'donorMvp', kind: 'number', required: false, label: 'Donor maximum vertical pocket, cm' },
      { dom: 'ttts-recipient', arg: 'recipientMvp', kind: 'number', required: false, label: 'Recipient maximum vertical pocket, cm' },
      { dom: 'ttts-bladder', arg: 'donorBladderVisible', kind: 'boolean', required: false, label: 'Donor bladder visible' },
      { dom: 'ttts-doppler', arg: 'criticallyAbnormalDoppler', kind: 'boolean', required: false, label: 'Critically abnormal Doppler in either twin' },
      { dom: 'ttts-hydrops', arg: 'hydrops', kind: 'boolean', required: false, label: 'Hydrops' },
      { dom: 'ttts-demise', arg: 'demise', kind: 'boolean', required: false, label: 'Demise of one or both twins' },
    ],
  },
];
