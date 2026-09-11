// spec-v1242: MCP adapter. The dom keys mirror views/group-v1242.js and this tile's META example.
// All four findings are required. A blank venous Doppler is not an audible one, and that single
// finding is the line between a limb to revascularize now and one where revascularization is the
// wrong operation.

import { rutherfordAli, ALI_SENSORY, ALI_MOTOR, ALI_DOPPLER } from '../../lib/rutherford-ali-v1242.js';

export default [
  {
    id: 'rutherford-ali',
    summary: 'Rutherford classification of acute limb ischemia sorts a threatened limb into four categories, I, IIa, IIb and III. Those are viable, marginally threatened, immediately threatened and irreversible. It reads four findings: the sensory loss, the muscle weakness, and whether the arterial and the venous Doppler signals are audible. The line that decides the limb is the venous signal, because IIb and III look alike at the bedside and are managed in opposite directions, and an inaudible venous signal is what makes a limb irreversible. That is also the finding most easily left unrecorded, since the arterial signal is the one everyone reaches for, so all four are required and a blank is not an audible signal. This is not the Rutherford category for chronic limb ischemia, which runs 0 to 6 over months and is also in this catalog.',
    compute: rutherfordAli,
    fields: [
      { dom: 'ali-sensory', arg: 'sensory', kind: 'enum', required: true, label: 'Sensory loss', values: ALI_SENSORY.map((s) => s.value) },
      { dom: 'ali-motor', arg: 'motor', kind: 'enum', required: true, label: 'Muscle weakness', values: ALI_MOTOR.map((m) => m.value) },
      { dom: 'ali-arterialDoppler', arg: 'arterialDoppler', kind: 'enum', required: true, label: 'Arterial Doppler signal', values: ALI_DOPPLER.map((d) => d.value) },
      { dom: 'ali-venousDoppler', arg: 'venousDoppler', kind: 'enum', required: true, label: 'Venous Doppler signal', values: ALI_DOPPLER.map((d) => d.value) },
    ],
  },
];
