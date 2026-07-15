// spec-v323 MCP wave: adapter for the Siewert classification of GEJ adenocarcinoma in
// lib/siewert-v323.js. The dom key mirrors the browser renderer (views/group-v323.js) and
// META['siewert'].example. `type` is an enum (the select values '1'/'2'/'3'; the compute
// also accepts roman I-III). The compute reports the type and its standard definition. The
// example sets type 2; its band carries the "1" and "2" (cm) example numbers, so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as S from '../../lib/siewert-v323.js';

export default [
  {
    id: 'siewert',
    summary: 'Siewert classification of adenocarcinoma of the esophagogastric junction (Siewert & Stein 1998), by the location of the tumor center relative to the anatomic GEJ. Type I: center 1 to 5 cm above the GEJ (distal esophageal adenocarcinoma). Type II: center 1 cm above to 2 cm below the GEJ (true carcinoma of the cardia). Type III: center 2 to 5 cm below the GEJ (subcardial gastric carcinoma infiltrating the cardia). Informs the surgical approach; reports the anatomic classification, not a stage or a treatment order.',
    compute: S.siewert,
    fields: [
      { dom: 'siewert-type', arg: 'type', kind: 'enum', values: ['1', '2', '3'], label: 'Siewert type (1=I, 2=II, 3=III)' },
    ],
  },
];
