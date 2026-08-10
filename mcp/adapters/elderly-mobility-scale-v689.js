// spec-v689 MCP adapter: Elderly Mobility Scale in lib/elderly-mobility-scale-v689.js.
// The dom keys mirror the browser renderer (views/group-v689.js) and
// META['elderly-mobility-scale'].example. Seven per-item point enums; the sum 0-20 maps to
// an independence band. Clinical domain.

import { elderlyMobilityScale } from '../../lib/elderly-mobility-scale-v689.js';

export default [
  {
    id: 'elderly-mobility-scale',
    summary: 'Elderly Mobility Scale (EMS; Smith 1994): seven mobility items summed to max 20. Lying-to-sitting (0-2), sitting-to-lying (0-2), sit-to-stand (0-3), standing/reach (0-3), gait (0-3), timed 6m walk (1-3), functional reach (0/2/4). Bands: 14-20 independent (safe for home), 10-13 borderline, <10 dependent. Each field carries its point value.',
    compute: elderlyMobilityScale,
    fields: [
      { dom: 'ems-lie-sit', arg: 'lyingToSitting', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Lying to sitting (points)' },
      { dom: 'ems-sit-lie', arg: 'sittingToLying', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Sitting to lying (points)' },
      { dom: 'ems-sit-stand', arg: 'sitToStand', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sit to stand (points)' },
      { dom: 'ems-standing', arg: 'standing', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Standing and reach (points)' },
      { dom: 'ems-gait', arg: 'gait', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Gait (points)' },
      { dom: 'ems-walk', arg: 'timedWalk', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Timed 6 m walk (points)' },
      { dom: 'ems-reach', arg: 'functionalReach', kind: 'enum', values: ['0', '2', '4'], required: true, label: 'Functional reach (points)' },
    ],
  },
];
