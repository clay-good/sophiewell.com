// spec-v706 MCP adapter: Leeds Enthesitis Index in lib/leeds-enthesitis-index-v706.js.
// The dom keys mirror the browser renderer (views/group-v706.js) and
// META['leeds-enthesitis-index'].example. Six booleans (one per enthesis site); a count 0-6
// gives the index. Clinical domain.

import { leedsEnthesitisIndex } from '../../lib/leeds-enthesitis-index-v706.js';

export default [
  {
    id: 'leeds-enthesitis-index',
    summary: 'Leeds Enthesitis Index (LEI; Healy 2008): count of tender entheses used mainly in psoriatic arthritis. Six sites, each tender (1) or not (0): left/right lateral epicondyle of the humerus, left/right medial femoral condyle, left/right Achilles insertion. Total 0-6; no severity bands (a count of involved entheses). Companion to the 13-site MASES index.',
    compute: leedsEnthesitisIndex,
    fields: [
      { dom: 'lei-le', arg: 'leftEpicondyle', kind: 'boolean', required: false, label: 'Left lateral epicondyle tender' },
      { dom: 'lei-re', arg: 'rightEpicondyle', kind: 'boolean', required: false, label: 'Right lateral epicondyle tender' },
      { dom: 'lei-lf', arg: 'leftFemoralCondyle', kind: 'boolean', required: false, label: 'Left medial femoral condyle tender' },
      { dom: 'lei-rf', arg: 'rightFemoralCondyle', kind: 'boolean', required: false, label: 'Right medial femoral condyle tender' },
      { dom: 'lei-la', arg: 'leftAchilles', kind: 'boolean', required: false, label: 'Left Achilles insertion tender' },
      { dom: 'lei-ra', arg: 'rightAchilles', kind: 'boolean', required: false, label: 'Right Achilles insertion tender' },
    ],
  },
];
