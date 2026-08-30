// spec-v917 MCP adapter: the WHO Surgical Safety Checklist phases in
// lib/who-surgical-checklist-v917.js. The dom keys mirror the browser renderer
// (views/group-v917.js) and META['who-surgical-checklist'].example.
//
// The result names the incomplete PHASE, not a percentage. Administrative domain: it checks a
// process, not a patient.

import { whoSurgicalChecklist, PHASES } from '../../lib/who-surgical-checklist-v917.js';

const fields = [];
for (const phase of PHASES) {
  for (const item of phase.items) {
    fields.push({
      dom: `wsc-${item.key.toLowerCase()}`,
      arg: item.key,
      kind: 'boolean',
      required: false,
      // Kept short: this label is what the worked example prints, and a long one is clamped
      // mid-phrase. The done-or-not-applicable rule is stated once, in the summary.
      label: `${phase.name}: ${item.short || item.text}`,
    });
  }
}

export default [
  {
    id: 'who-surgical-checklist',
    summary: 'Reports which phase of the WHO Surgical Safety Checklist is incomplete. Sign In runs before induction of anesthesia with at least the nurse and the anesthetist. Time Out runs before skin incision with the nurse, the anesthetist and the surgeon. Sign Out runs before the patient leaves the operating room. THE WHOLE CHECKLIST IS ROUTINELY CALLED "THE TIME OUT", and that is one phase of three: the phase that goes missing is SIGN OUT, which is where the instrument, sponge and needle counts sit, where specimens are read back, and where the concerns recovery needs are said aloud. So the result names the incomplete phase rather than giving one overall percentage. EACH PHASE HAS A MOMENT, and a phase carried out at a different moment is not that phase -- ticking it afterwards is not doing it. It is a prompt for something spoken aloud by a single coordinator, which the source expects to be adapted locally rather than completed as a form. Item labels here are neutral topic labels, not the published wording, and several are satisfied by "does not apply".',
    compute: whoSurgicalChecklist,
    fields,
  },
];
