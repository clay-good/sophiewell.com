// spec-v302 MCP wave: adapter for the Instability Severity Index Score (ISIS) in
// lib/isis-v302.js. The dom keys mirror the browser renderer (views/group-v302.js)
// and META['isis-shoulder'].example. Each field is a boolean preoperative factor
// (all optional; a point score has no mandatory single input - none checked is 0);
// the compute returns the 0-10 total and the >6 high-recurrence-risk flag. The
// `band` carries the "8 of 10 / >6" example, so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as I from '../../lib/isis-v302.js';

export default [
  {
    id: 'isis-shoulder',
    summary: 'Instability Severity Index Score (ISIS; Balg & Boileau 2007): sums six preoperative factors for anterior shoulder instability (age ≤20 = 2, competitive sport = 2, contact/overhead sport = 1, shoulder hyperlaxity = 1, Hill-Sachs on AP radiograph = 2, glenoid loss of contour = 2; max 10) and flags a score >6 as high recurrence risk after an arthroscopic Bankart repair, favoring an open procedure (Latarjet or open Bankart). Reports the cited score and threshold, not a surgical decision.',
    compute: I.isisScore,
    fields: [
      { dom: 'isis-age', arg: 'ageUnder20', kind: 'bool', required: false, label: 'Age ≤20 years at surgery' },
      { dom: 'isis-comp', arg: 'competitive', kind: 'bool', required: false, label: 'Competitive sport participation' },
      { dom: 'isis-contact', arg: 'contactSport', kind: 'bool', required: false, label: 'Contact or forced-overhead sport' },
      { dom: 'isis-lax', arg: 'hyperlaxity', kind: 'bool', required: false, label: 'Shoulder hyperlaxity (anterior or inferior)' },
      { dom: 'isis-hs', arg: 'hillSachs', kind: 'bool', required: false, label: 'Hill-Sachs on AP external-rotation radiograph' },
      { dom: 'isis-glenoid', arg: 'glenoidLoss', kind: 'bool', required: false, label: 'Glenoid loss of contour on AP radiograph' },
    ],
  },
];
