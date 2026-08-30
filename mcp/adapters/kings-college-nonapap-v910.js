// spec-v910 MCP adapter: the non-acetaminophen arm of the King's College criteria in
// lib/kings-college-nonapap-v910.js. The dom keys mirror the browser renderer
// (views/group-v910.js) and META['kings-college-nonapap'].example.
//
// A negative result is NOT reassurance and the summary says so. Clinical domain.

import { kingsCollegeNonApap } from '../../lib/kings-college-nonapap-v910.js';

export default [
  {
    id: 'kings-college-nonapap',
    summary: `Checks the non-acetaminophen arm of the King's College criteria for acute liver failure. Either limb marks a poor prognosis: an INR above 6.5, or a prothrombin time above 100 seconds, on its own and whatever the grade of encephalopathy; or any three of five -- age under 10 or over 40 years, a cause of non-A non-B hepatitis, halothane hepatitis or an idiosyncratic drug reaction, more than 7 days from the onset of jaundice to encephalopathy, an INR above 3.5 or a prothrombin time above 50 seconds, and a bilirubin above 17.5 mg/dL, which is 300 micromol per liter. THIS IS A DIFFERENT SET OF VARIABLES FROM THE ACETAMINOPHEN ARM, which turns on arterial pH, creatinine and encephalopathy grade and is a separate tool. THE CRITERIA ARE SPECIFIC AND NOT SENSITIVE: meeting them marks a poor prognosis, and NOT meeting them is not reassurance, because a large share of the patients who go on to die never meet them. MEETING THEM IS A REASON TO REFER, NOT A DECISION TO TRANSPLANT, and referral does not wait on them.`,
    compute: kingsCollegeNonApap,
    fields: [
      { dom: 'kn-inr', arg: 'inr', kind: 'number', required: false, label: 'INR' },
      { dom: 'kn-pt', arg: 'pt', kind: 'number', required: false, label: 'Prothrombin time, if the INR is not available', unit: 's' },
      { dom: 'kn-age', arg: 'age', kind: 'number', required: false, label: 'Age', unit: 'years' },
      { dom: 'kn-etiology', arg: 'etiology', kind: 'enum', required: false, label: 'Cause of the liver failure', values: ['other', 'seronegative', 'halothane', 'idiosyncratic-drug'] },
      { dom: 'kn-days', arg: 'jaundiceToEncephalopathyDays', kind: 'number', required: false, label: 'Days from the onset of jaundice to encephalopathy' },
      { dom: 'kn-bilirubin', arg: 'bilirubin', kind: 'number', required: false, label: 'Total bilirubin' },
      { dom: 'kn-bilirubinunit', arg: 'bilirubinUnit', kind: 'enum', required: false, label: 'Bilirubin unit', values: ['mg/dl', 'umol/l'] },
    ],
  },
];
