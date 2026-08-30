// spec-v899 MCP adapter: periprocedural anticoagulant bridging in lib/periop-bridging-v899.js.
// The dom keys mirror the browser renderer (views/group-v899.js) and
// META['periop-bridging'].example.
//
// The default is NOT to bridge, and a DOAC is never bridged. Clinical domain.

import { periopBridging } from '../../lib/periop-bridging-v899.js';

export default [
  {
    id: 'periop-bridging',
    summary: 'Answers the two periprocedural anticoagulation questions: whether to interrupt, and whether to bridge. A direct oral anticoagulant is interrupted on the bleeding risk of the procedure and on renal function, and IS NEVER BRIDGED, since its short half-life is the bridge. Warfarin is interrupted, and bridging with heparin is reserved for the small high-thrombotic-risk group, because the BRIDGE trial showed that in most patients bridging increases major bleeding without reducing thromboembolism. THE DEFAULT IS NOT TO BRIDGE: the question is whether this patient is one of the few exceptions, not whether there is a reason to skip it. A PROCEDURE OF MINIMAL BLEEDING RISK MAY NEED NO INTERRUPTION AT ALL, and many dental, dermatologic, ophthalmic and endoscopic procedures are done on anticoagulation.',
    compute: periopBridging,
    fields: [
      { dom: 'pb-agent', arg: 'agent', kind: 'enum', required: false, label: 'What the patient takes', values: ['doac', 'warfarin'] },
      { dom: 'pb-procedurerisk', arg: 'procedureRisk', kind: 'enum', required: false, label: 'Bleeding risk of the procedure', values: ['minimal', 'low', 'high'] },
      { dom: 'pb-thromboticrisk', arg: 'thromboticRisk', kind: 'enum', required: false, label: 'Thrombotic risk of the patient (only the warfarin branch turns on this)', values: ['low', 'high'] },
    ],
  },
];
