// spec-v1243: MCP adapter. The dom key mirrors views/group-v1243.js and this tile's META example.
// The grade is required and has no default; it is a finding that exists only while the endoscope is
// in the patient.

import { hillGrade, HILL_GRADES } from '../../lib/hill-grade-v1243.js';

export default [
  {
    id: 'hill-grade',
    summary: 'Hill grade of the gastroesophageal flap valve, read on a retroflexed view of the cardia. Grade I is a prominent fold of tissue along the lesser curvature closely apposed to the endoscope; grade II a fold that opens and closes around the scope with respiration; grade III a fold that is not prominent and does not grip, usually with a hiatal hernia; and grade IV no fold at all, with the lumen open, the squamous mucosa visible from below, and a hiatal hernia always present. Grades III and IV are the appearances associated with reflux disease. It grades the valve rather than the mucosa, so it is not the LA grade or the Savary-Miller classification, both of which grade esophagitis, and a grade IV valve above a normal esophagus is an ordinary combination.',
    compute: hillGrade,
    fields: [
      { dom: 'hill-grade', arg: 'grade', kind: 'enum', required: true, label: 'Flap valve appearance', values: HILL_GRADES.map((g) => g.value) },
    ],
  },
];
