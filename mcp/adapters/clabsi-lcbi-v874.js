// spec-v874 MCP adapter: the NHSN CLABSI definition in lib/clabsi-lcbi-v874.js. The dom keys
// mirror the browser renderer (views/group-v874.js) and META['clabsi-lcbi'].example.
//
// It returns a surveillance attribution, not a clinical diagnosis. Clinical domain.

import { clabsiLcbi } from '../../lib/clabsi-lcbi-v874.js';

export default [
  {
    id: 'clabsi-lcbi',
    summary: 'Applies the NHSN definition of a central line-associated bloodstream infection, which has a laboratory part and a device part. LCBI 1 is a recognized pathogen from one or more blood cultures, with no sign or symptom required; LCBI 2 is a common commensal from two or more blood cultures drawn on separate occasions on the same or consecutive days, together with at least one sign or symptom. Neither may be related to an infection at another site. It is central line-associated when the line has been in place more than two consecutive calendar days, counting the day of insertion as day one, and was in place on the day of the event or the day before. IT IS A SURVEILLANCE DEFINITION, NOT A CLINICAL DIAGNOSIS: the association is a timing rule, not a statement that the line caused the infection. A SINGLE COMMENSAL CULTURE IS A CONTAMINANT under this definition. The accepted signs differ by age, and are needed only for the commensal route.',
    compute: clabsiLcbi,
    fields: [
      { dom: 'cl-age', arg: 'age', kind: 'enum', required: false, label: 'Age group', values: ['adult', 'infant'] },
      { dom: 'cl-organism', arg: 'organism', kind: 'enum', required: false, label: 'Blood culture result', values: ['none', 'recognized-pathogen', 'common-commensal'] },
      { dom: 'cl-commensaltwocultures', arg: 'commensalTwoCultures', kind: 'boolean', required: false, label: 'The commensal was grown from two or more blood cultures drawn on separate occasions, on the same or consecutive days' },
      { dom: 'cl-secondarysite', arg: 'secondarySite', kind: 'boolean', required: false, label: 'The organism is related to an infection at another site (a secondary bloodstream infection, not an LCBI)' },
      { dom: 'cl-fever', arg: 'fever', kind: 'boolean', required: false, label: 'Fever above 100.4 F (38.0 C)' },
      { dom: 'cl-chills', arg: 'chills', kind: 'boolean', required: false, label: 'Chills (accepted for a patient older than one year)' },
      { dom: 'cl-hypotension', arg: 'hypotension', kind: 'boolean', required: false, label: 'Hypotension (accepted for a patient older than one year)' },
      { dom: 'cl-hypothermia', arg: 'hypothermia', kind: 'boolean', required: false, label: 'Hypothermia below 96.8 F (36.0 C) (accepted for a patient one year old or younger)' },
      { dom: 'cl-apnea', arg: 'apnea', kind: 'boolean', required: false, label: 'Apnea (accepted for a patient one year old or younger)' },
      { dom: 'cl-bradycardia', arg: 'bradycardia', kind: 'boolean', required: false, label: 'Bradycardia (accepted for a patient one year old or younger)' },
      { dom: 'cl-linedays', arg: 'lineDays', kind: 'number', required: false, label: 'Consecutive calendar days the central line has been in place, counting the day of insertion as day 1' },
      { dom: 'cl-linepresentonordaybefore', arg: 'linePresentOnOrDayBefore', kind: 'boolean', required: false, label: 'The line was in place on the day of the event, or the day before' },
    ],
  },
];
