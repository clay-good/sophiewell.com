// spec-v309 MCP wave: adapter for the acute GVHD grade (modified Glucksberg) in
// lib/gvhd-v309.js. The dom keys mirror the browser renderer (views/group-v309.js)
// and META['gvhd-grade'].example. `skinStage` / `liverStage` / `giStage` are enums
// (0-4); all are optional (the compute defaults each to 0). The compute returns the
// overall acute GVHD grade (0-IV). The `band` carries the "liver stage 2 -> grade
// III" example, so it round-trips through the default makeToArgs with no custom
// toArgs.

import * as G from '../../lib/gvhd-v309.js';

export default [
  {
    id: 'gvhd-grade',
    summary: 'Acute graft-versus-host disease (GVHD) overall grade, modified Glucksberg (Przepiorka 1995): given the skin, liver, and gastrointestinal organ stages (0-4 each), reports the overall grade (0-IV) - IV if any organ is stage 4; III if liver or gut is stage 2-3; II if skin is stage 3 or liver/gut is stage 1; I if skin is stage 1-2. Grades III-IV are severe. Reports the classification grade, not a treatment order.',
    compute: G.gvhdGrade,
    fields: [
      { dom: 'gvhd-skin', arg: 'skinStage', kind: 'enum', required: false, values: ['0', '1', '2', '3', '4'], label: 'Skin stage (by BSA rash)' },
      { dom: 'gvhd-liver', arg: 'liverStage', kind: 'enum', required: false, values: ['0', '1', '2', '3', '4'], label: 'Liver stage (by bilirubin)' },
      { dom: 'gvhd-gi', arg: 'giStage', kind: 'enum', required: false, values: ['0', '1', '2', '3', '4'], label: 'Lower GI stage (by diarrhea volume)' },
    ],
  },
];
