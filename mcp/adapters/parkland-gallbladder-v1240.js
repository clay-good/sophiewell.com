// spec-v1240: MCP adapter. The dom keys mirror views/group-v1240.js and this tile's META example.
// Every field is optional. Grade 1 is a defensible "nothing is present" answer, and the lib says in
// as many words that an unfilled form is not that answer.

import { parklandGallbladder, PARKLAND_FINDINGS } from '../../lib/parkland-gallbladder-v1240.js';

export default [
{
    id: 'parkland-gallbladder',
    summary: 'Parkland Grading Scale for Cholecystitis (Madni 2018) grades a gallbladder 1 to 5 from what the surgeon sees once it is exposed. The grade is the highest finding present, never a sum: one grade 5 finding makes it a grade 5 whatever else is there. Grades 1-3 are the group associated with a straightforward cholecystectomy and grades 4-5 with a difficult one, longer operating time, and higher partial and open conversion rates. Grade 4 is the counterintuitive rung: its second clause attaches to an otherwise mild picture, so a gallbladder with no adhesions at all is a grade 4 when the liver anatomy is abnormal, the gallbladder is intrahepatic, or a stone is impacted. It grades the operative field, not how ill the patient is, and it cannot be assigned before the gallbladder has been seen; the Tokyo Guidelines severity grade answers that other question.',
    compute: parklandGallbladder,
    fields: PARKLAND_FINDINGS.map((f) => ({
      dom: `pgs-${f.key}`,
      arg: f.key,
      kind: 'boolean',
      required: false,
      label: `${f.label} (grade ${f.grade})`,
    })),
  },
];
