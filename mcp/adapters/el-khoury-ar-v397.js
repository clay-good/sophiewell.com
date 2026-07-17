// spec-v397 MCP wave: adapter for the El Khoury classification of aortic regurgitation in
// lib/el-khoury-ar-v397.js. The dom key mirrors the browser renderer (views/group-v397.js) and
// META['el-khoury-ar'].example. `type` is an enum (I/II/III). The compute reports the type and its
// mechanism description. The example sets type II; its expected text is the type description (a roman
// numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/el-khoury-ar-v397.js';

export default [
  {
    id: 'el-khoury-ar',
    summary: 'El Khoury (Boodhwani 2009) repair-oriented functional classification of aortic regurgitation (types I/II/III), by the mechanism of the aortic insufficiency - the aortic analog of Carpentier\'s mitral classification, used to plan aortic-valve-sparing / repair surgery. I: normal cusp motion with dilatation of the functional aortic annulus (subtypes Ia sinotubular junction, Ib aortic root, Ic annular, Id cusp perforation). II: cusp prolapse - excessive cusp motion (prolapse or free-edge fenestration). III: cusp restriction - restrictive cusp motion (retraction, calcification, or thickening). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.elKhouryAr,
    fields: [
      { dom: 'elk-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'El Khoury type' },
    ],
  },
];
