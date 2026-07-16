// spec-v338 MCP wave: adapter for the ICRS cartilage lesion classification in lib/icrs-v338.js. The
// dom key mirrors the browser renderer (views/group-v338.js) and META['icrs-cartilage'].example.
// `grade` is an enum (0 / 1 / 2 / 3 / 4). The compute reports the cartilage grade and its
// description. The example sets grade 4; its expected text is the grade description (the grade
// number already appears in the field value; the 50% depth figures appear only in grades 2/3), so
// it round-trips through the default makeToArgs with no custom toArgs.

import * as I from '../../lib/icrs-v338.js';

export default [
  {
    id: 'icrs-cartilage',
    summary: 'ICRS classification (International Cartilage Repair Society; Brittberg 2003) of a chondral defect graded at arthroscopy by depth. 0: normal. 1: nearly normal (surface intact, softening/superficial fissures). 2: abnormal (<50% of cartilage depth, no exposed bone). 3: severely abnormal (>50% depth, to but not through subchondral bone; subdivided 3a-3d). 4: severely abnormal (complete loss through the subchondral bone plate, osteochondral). ICRS grades by percentage of cartilage depth and subdivides grade 3, complementing the diameter-based Outerbridge classification. Reports the cartilage grade, not a diagnosis, a surgical recommendation, or an outcome prediction.',
    compute: I.icrs,
    fields: [
      { dom: 'icrs-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'ICRS grade' },
    ],
  },
];
