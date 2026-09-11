// spec-v1240: MCP adapter. The dom keys mirror views/group-v1240.js and this tile's META example.
// Each category is optional; at least one is required, and the lib refuses when none is given.

import { aastCholecystitis, AAST_CHOLECYSTITIS_ROUTES, AAST_CHOLECYSTITIS_GRADES } from '../../lib/aast-cholecystitis-v1240.js';

export default [
{
    id: 'aast-cholecystitis',
    summary: 'AAST anatomic severity grade I to V for acute cholecystitis measures how far the disease has spread. It is Tominaga 2016, validated against the Tokyo Guidelines by Hernandez 2018. Grade I is inflammation confined to the gallbladder, II a distended gallbladder with pus or hydrops or wall necrosis without perforation, III a non-iatrogenic perforation with bile confined to the right upper quadrant, IV a pericholecystic abscess or bilioenteric fistula or gallstone ileus, and V that with generalized peritonitis. The AAST rule is that where the clinical, imaging, operative and pathologic categories disagree, the HIGHEST is the final grade -- so a grade taken from imaging alone is a floor the operation can only raise. It grades the disease, not the patient: the Tokyo severity grade answers that question and the two do not convert.',
    compute: aastCholecystitis,
    fields: AAST_CHOLECYSTITIS_ROUTES.map((r) => ({
      dom: `aastc-${r.key}`,
      arg: r.key,
      kind: 'enum',
      required: false,
      label: r.label,
      values: AAST_CHOLECYSTITIS_GRADES.map((g) => g.value),
    })),
  },
];
