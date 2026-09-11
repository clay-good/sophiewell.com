// spec-v1240: MCP adapter. The dom keys mirror views/group-v1240.js and this tile's META example.
// Each axis is optional because the lib returns a floor rather than a grade when one is missing --
// except at grade 4, where the ceiling settles it.

import { nassarGallbladder, NASSAR_AXES } from '../../lib/nassar-gallbladder-v1240.js';

export default [
{
    id: 'nassar-gallbladder',
    summary: 'Nassar operative difficulty grade (Griffiths 2019) grades three findings at laparoscopic cholecystectomy 1 to 4 each. It comes from Nassar 1995 and was validated across 7,000 operations by the CholeS study. The gallbladder, the cystic pedicle and the adhesions are graded separately and THE OVERALL GRADE IS THE WORST OF THE THREE, not an average and not the gallbladder alone: a floppy, non-adherent gallbladder with a pedicle that cannot be clarified is a grade 4 operation. Rising grade tracks operating time, conversion to open, 30-day complications and reintervention. An axis left ungraded can only raise the answer, so the tool returns a floor rather than a grade -- unless one axis is already 4, where nothing left to grade can move it. It describes the operation, not the patient.',
    compute: nassarGallbladder,
    fields: NASSAR_AXES.map((a) => ({
      dom: `nas-${a.key}`,
      arg: a.key,
      kind: 'enum',
      required: false,
      label: a.label,
      values: ['1', '2', '3', '4'],
    })),
  },
];
