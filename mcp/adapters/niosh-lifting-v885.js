// spec-v885 MCP adapter: the revised NIOSH lifting equation in lib/niosh-lifting-v885.js. The dom
// keys mirror the browser renderer (views/group-v885.js) and META['niosh-lifting'].example.
//
// Every multiplier has a domain, and outside it the recommended weight limit is zero by the
// published rules. Occupational domain.

import { nioshLifting } from '../../lib/niosh-lifting-v885.js';

export default [
  {
    id: 'niosh-lifting',
    summary: 'Computes the revised NIOSH recommended weight limit and lifting index for a two-handed manual lift. A load constant of 51 lb is multiplied by six task multipliers taken from the horizontal distance from the ankles to the hands, the vertical height of the hands at the start, the vertical travel distance, the asymmetry angle of the trunk, the lifting frequency and duration, and the quality of the hand-to-object coupling; the lifting index is the load divided by that limit. THE LIFTING INDEX IS A DESIGN NUMBER, NOT A PREDICTION ABOUT A PERSON. EVERY MULTIPLIER HAS A DOMAIN, and a horizontal distance above 25 inches, a vertical height above 70, or an asymmetry angle above 135 degrees each drive the limit to zero, which means the task is outside what the equation can evaluate rather than that the safe weight is nothing. IT COVERS TWO-HANDED, SMOOTH, UNHURRIED LIFTS ONLY, not carrying, pushing, pulling or one-handed lifts.',
    compute: nioshLifting,
    fields: [
      { dom: 'nl-loadweightlb', arg: 'loadWeightLb', kind: 'number', required: true, label: 'Load weight, lb', unit: 'lb' },
      { dom: 'nl-horizontalinches', arg: 'horizontalInches', kind: 'number', required: true, label: 'Horizontal distance from the ankles to the hands, inches (above 25 puts the task outside the equation)', unit: 'in' },
      { dom: 'nl-verticalinches', arg: 'verticalInches', kind: 'number', required: true, label: 'Vertical height of the hands at the start of the lift, inches (above 70 puts the task outside the equation)', unit: 'in' },
      { dom: 'nl-travelinches', arg: 'travelInches', kind: 'number', required: true, label: 'Vertical travel distance, inches', unit: 'in' },
      { dom: 'nl-asymmetrydegrees', arg: 'asymmetryDegrees', kind: 'number', required: false, label: 'Asymmetry angle of the trunk, degrees (above 135 puts the task outside the equation)', unit: 'deg' },
      { dom: 'nl-liftsperminute', arg: 'liftsPerMinute', kind: 'number', required: false, label: 'Lifts per minute' },
      { dom: 'nl-duration', arg: 'duration', kind: 'enum', required: false, label: 'How long the lifting continues', values: ['short', 'moderate', 'long'] },
      { dom: 'nl-coupling', arg: 'coupling', kind: 'enum', required: false, label: 'Hand-to-object coupling', values: ['good', 'fair', 'poor'] },
    ],
  },
];
