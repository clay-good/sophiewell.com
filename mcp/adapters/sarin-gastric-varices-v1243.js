// spec-v1243: MCP adapter. The dom key mirrors views/group-v1243.js and this tile's META example.
// The type is required: the two isolated types are the ones that bleed most, so no default is safe.

import { sarinGastricVarices, SARIN_TYPES } from '../../lib/sarin-gastric-varices-v1243.js';

export default [
  {
    id: 'sarin-gastric-varices',
    summary: 'Sarin classification of gastric varices sorts them by whether they are continuous with esophageal varices and by where they sit. GOV1 runs along the lesser curvature and GOV2 into the fundus along the greater curvature, both continuous with esophageal varices; IGV1 is isolated in the fundus and IGV2 isolated elsewhere in the stomach or the first part of the duodenum. In the original 568-patient series GOV1 was the commonest type at 75 percent and the least likely to bleed, GOV2 bled in 55 percent of patients and IGV1 in 78 percent, so the commonest type is not the dangerous one. The finding that sits above all four is that gastric varices bled in 25 percent of patients against 64 percent for esophageal varices, and still took more blood and killed 45 percent of those who bled. IGV1 also raises splenic vein thrombosis, which is treated differently.',
    compute: sarinGastricVarices,
    fields: [
      { dom: 'sgv-type', arg: 'type', kind: 'enum', required: true, label: 'Sarin type', values: SARIN_TYPES.map((t) => t.value) },
    ],
  },
];
