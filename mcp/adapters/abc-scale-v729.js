// spec-v729 MCP adapter: Activities-specific Balance Confidence Scale in lib/abc-scale-v729.js.
// The dom keys mirror the browser renderer (views/group-v729.js) and META['abc-scale'].example.
// Sixteen 0-100% numbers; the mean maps to a balance-confidence / fall-risk band. Clinical domain.

import { abcScale } from '../../lib/abc-scale-v729.js';

const ACTIVITIES = [
  'Walk around the house', 'Walk up/down stairs', 'Bend over and pick up', 'Reach at eye level',
  'Reach on tiptoes', 'Stand on a chair to reach', 'Sweep the floor', 'Walk outside to a car',
  'Get in/out of a car', 'Walk across a parking lot', 'Walk up/down a ramp', 'Walk in a crowded mall',
  'Walk in a crowd / get bumped', 'Escalator holding the rail', 'Escalator not holding the rail', 'Walk on icy sidewalks',
];

export default [
  {
    id: 'abc-scale',
    summary: 'Activities-specific Balance Confidence (ABC) Scale (Powell & Myers 1995): rate confidence 0-100% of not losing balance during 16 everyday activities. ABC score = mean of the 16 ratings (0-100). < 67% indicates increased fall risk in community-dwelling older adults; functioning bands: < 50 low, 50-80 moderate, > 80 high.',
    compute: abcScale,
    fields: ACTIVITIES.map((label, i) => ({
      dom: `abc-a${i + 1}`, arg: `a${i + 1}`, kind: 'number', unit: '%', required: true, label: `${label} (% confidence)`,
    })),
  },
];
