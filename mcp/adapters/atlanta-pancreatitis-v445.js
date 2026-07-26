// spec-v445 MCP wave: adapter for the Revised Atlanta pancreatitis severity in
// lib/atlanta-pancreatitis-v445.js. The dom key mirrors the browser renderer (views/group-v445.js) and
// META['atlanta-pancreatitis'].example. `severity` is an enum (mild/moderately-severe/severe). The compute
// reports the category and its definition. The example sets moderately-severe; its expected text carries no
// numeric facts (the definition is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/atlanta-pancreatitis-v445.js';

export default [
  {
    id: 'atlanta-pancreatitis',
    summary: 'The Revised Atlanta classification of acute pancreatitis severity, by the presence and duration of organ failure and of local/systemic complications, mild / moderately severe / severe. Mild: no organ failure, no complications. Moderately severe: transient organ failure (< 48 h) and/or local or systemic complications. Severe: persistent organ failure (> 48 h). Reports the severity category, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.atlantaPancreatitis,
    fields: [
      { dom: 'atlanta-sev', arg: 'severity', kind: 'enum', values: ['mild', 'moderately-severe', 'severe'], label: 'Revised Atlanta severity' },
    ],
  },
];
