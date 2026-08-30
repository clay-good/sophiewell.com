// spec-v916 MCP adapter: the I-PASS handoff structure in lib/ipass-handoff-v916.js. The dom keys
// mirror the browser renderer (views/group-v916.js) and META['ipass-handoff'].example.
//
// The receiver's synthesis is reported on its own, not as one blank among five. Non-clinical
// domain: this assembles and checks a handoff, it computes nothing about a patient.

import { ipassHandoff } from '../../lib/ipass-handoff-v916.js';

export default [
  {
    id: 'ipass-handoff',
    summary: 'Lays out a handoff in the I-PASS structure and reports which parts are blank. I is illness severity: stable, watcher or unstable. P is the patient summary: the summary statement, the events leading to admission, the hospital course, the ongoing assessment and the plan. A is the action list, with a time and an owner. The first S is situation awareness and contingency planning: what to watch for and what to do if it happens. The second S is synthesis by the receiver, who summarizes it back, asks questions and restates the key actions. THE SECOND S IS THE PART THAT GETS DROPPED AND THE PART THE EVIDENCE RESTS ON, so it is reported separately rather than counted as one blank among five: a handoff is not finished when the sender stops talking, it is finished when the receiver has said it back. WATCHER IS A CATEGORY, NOT A HEDGE -- it names a patient someone is worried about who is not yet unstable. The mnemonic orders what is said; it does not shorten it and it does not replace the conversation.',
    compute: ipassHandoff,
    fields: [
      { dom: 'ip-severity', arg: 'illnessSeverity', kind: 'enum', required: false, label: 'Illness severity', values: ['unset', 'stable', 'watcher', 'unstable'] },
      { dom: 'ip-summary', arg: 'patientSummary', kind: 'string', required: false, label: 'Patient summary: summary statement, events leading to admission, hospital course, ongoing assessment, plan' },
      { dom: 'ip-actions', arg: 'actionList', kind: 'string', required: false, label: 'Action list: what is to be done, by when, and by whom' },
      { dom: 'ip-awareness', arg: 'situationAwareness', kind: 'string', required: false, label: 'Situation awareness and contingency planning: what to watch for, and what to do if it happens' },
      { dom: 'ip-synthesis', arg: 'synthesisByReceiver', kind: 'string', required: false, label: 'Synthesis by the receiver: what the receiver said back' },
    ],
  },
];
