// spec-v725 MCP adapter: Glickman furcation grade in lib/glickman-furcation-v725.js.
// The dom keys mirror the browser renderer (views/group-v725.js) and
// META['glickman-furcation'].example. One enum (furcation finding); decision logic returns
// the Glickman grade. Clinical domain.

import { glickmanFurcation } from '../../lib/glickman-furcation-v725.js';

export default [
  {
    id: 'glickman-furcation',
    summary: 'Glickman furcation involvement grade (Glickman 1953): grades interradicular bone loss in multi-rooted teeth. Grade I = incipient, bone intact (suprabony soft-tissue pocket); Grade II = partial / cul-de-sac, not through-and-through; Grade III = through-and-through but occluded by gingiva (not visible); Grade IV = through-and-through and clinically visible.',
    compute: glickmanFurcation,
    fields: [
      { dom: 'glick-furcation', arg: 'furcation', kind: 'enum', values: ['I', 'II', 'III', 'IV'], required: true, label: 'Furcation finding' },
    ],
  },
];
