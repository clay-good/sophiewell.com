// spec-v348 MCP wave: adapter for the Strasberg classification of a bile duct injury in
// lib/strasberg-bdi-v348.js. The dom key mirrors the browser renderer (views/group-v348.js) and
// META['strasberg-bdi'].example. `type` is an enum (A / B / C / D / E). The compute reports the
// Strasberg type and its injury description. The example sets type D; its expected text is the type
// description with no numeric facts (the type is a letter), so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/strasberg-bdi-v348.js';

export default [
  {
    id: 'strasberg-bdi',
    summary: 'Strasberg classification (Strasberg 1995) of an iatrogenic bile duct injury, most often during laparoscopic cholecystectomy — a modification of the Bismuth classification. A: bile leak from a small duct still in continuity with the biliary system (cystic-duct stump or a duct of Luschka); minor. B: occlusion (ligation) of an aberrant / sectoral right hepatic duct. C: bile leak from an aberrant / sectoral right hepatic duct not in continuity with the biliary system. D: lateral injury to the extrahepatic bile duct (partial, without loss of continuity). E: circumferential injury / transection of the main bile duct (the Bismuth-analogue class, E1-E5 by level). Minor (A-C) vs major (D-E). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.strasbergBdi,
    fields: [
      { dom: 'strasberg-type', arg: 'type', kind: 'enum', values: ['A', 'B', 'C', 'D', 'E'], label: 'Strasberg type' },
    ],
  },
];
