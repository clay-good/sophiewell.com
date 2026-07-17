// spec-v366 MCP wave: adapter for the penetrating-neck-trauma zones in lib/neck-zone-v366.js. The dom
// key mirrors the browser renderer (views/group-v366.js) and META['neck-zone'].example. `zone` is an
// enum (I/II/III). The compute reports the zone and its boundary / structures-at-risk description. The
// example sets Zone II; its expected text is the zone description (a roman numeral, no numeric facts),
// so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/neck-zone-v366.js';

export default [
  {
    id: 'neck-zone',
    summary: 'Anatomic zones of the neck for penetrating trauma (Zones I-III), used to describe the location of an injury and the structures at risk. I: sternal notch / clavicles to the cricoid cartilage (aortic arch, subclavian and proximal carotid vessels, lung apices, trachea, esophagus); treated like an upper thoracic injury. II: cricoid cartilage to the angle of the mandible (carotid arteries, jugular veins, larynx, hypopharynx, proximal esophagus); the most surgically accessible zone. III: angle of the mandible to the base of the skull (distal internal/external carotid, vertebral artery, jugular veins); treated like a head injury. The modern no-zone approach drives management by hard signs + CT angiography. Reports the zone, not a diagnosis, a management decision, or a prognosis.',
    compute: C.neckZone,
    fields: [
      { dom: 'neck-zone', arg: 'zone', kind: 'enum', values: ['I', 'II', 'III'], label: 'Neck zone' },
    ],
  },
];
