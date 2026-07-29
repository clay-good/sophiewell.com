// spec-v586 MCP wave: adapter for the up-to-seven (Metroticket) criteria in lib/up-to-seven-v586.js. The dom
// keys mirror the browser renderer (views/group-v586.js) and META['up-to-seven'].example.
//
// **THE CRITERION IS CONDITIONAL ON SOMETHING THAT CANNOT BE MEASURED WHEN THE DECISION IS MADE.** The
// published criterion applies "in the absence of microvascular invasion", and MICROVASCULAR INVASION CANNOT
// BE ASSESSED BEFORE TRANSPLANT: imaging shows only GROSS vascular invasion, and biopsy cannot exclude
// microvascular invasion because of sampling bias. The published survival describes patients who turned out
// ON THE EXPLANT not to have had it. Used prospectively to select a candidate, the criterion rests on a
// condition nobody can verify at the time of the decision. This tool asks only what is knowable before
// transplant and states the gap; do not report "no microvascular invasion" as a satisfied input.
//
// **"SEVEN" IS A SUM OF TWO DIFFERENT KINDS OF THING**: the largest tumor's size IN CENTIMETERS plus the
// NUMBER of tumors. It is an exchange rate between size and number, not a limit on either, so one 6 cm tumor
// (6 + 1) and four 3 cm tumors (3 + 4) sit at the same boundary.
//
// **ONLY THE LARGEST TUMOR'S SIZE ENTERS THE SUM.** Every other tumor contributes 1 by being counted,
// however large it is. Three tumors of 4.9, 4.8 and 4.7 cm and three of 4.9, 0.5 and 0.5 cm score
// identically. TOTAL TUMOR BURDEN IS NOT WHAT THIS MEASURES, and a consumer must not sum diameters.
//
// **MILAN IS FULLY CONTAINED WITHIN UP-TO-SEVEN**, so up-to-seven can only ADD candidates, never remove
// them. Both are returned from the same inputs.
//
// **UCSF IS DELIBERATELY NOT COMPUTED**: published renderings diverge on whether the nodule limit is two or
// three and on whether the size thresholds are strict or inclusive, so the divergent cell is reported rather
// than guessed.

import * as U from '../../lib/up-to-seven-v586.js';

export default [
  {
    id: 'up-to-seven',
    summary: `The UP-TO-SEVEN (METROTICKET) CRITERIA for liver transplantation in hepatocellular carcinoma (Mazzaferro and colleagues 2009). A patient is WITHIN the criteria when the size of the LARGEST tumor in centimeters PLUS the NUMBER of tumors is ${U.UP_TO_SEVEN_LIMIT} or less, in the absence of microvascular invasion; the derivation reported ${U.FIVE_YEAR_SURVIVAL_WITHIN} percent 5-year survival for that group. **THE CRITERION IS CONDITIONAL ON SOMETHING THAT CANNOT BE MEASURED WHEN THE DECISION IS MADE**: microvascular invasion CANNOT be assessed before transplant, because imaging shows only GROSS vascular invasion and biopsy cannot exclude microvascular invasion owing to sampling bias. The published survival therefore describes patients who turned out ON THE EXPLANT not to have had it, and applied prospectively the criterion rests on a condition nobody can verify at the time of the decision. This tool asks only what is knowable before transplant - gross vascular invasion and extrahepatic spread - and states the gap; never report "no microvascular invasion" as a satisfied input. **"SEVEN" IS A SUM OF TWO DIFFERENT KINDS OF THING**, centimeters plus a count, so it is an EXCHANGE RATE between size and number rather than a limit on either: one 6 cm tumor (6 + 1) and four 3 cm tumors (3 + 4) sit at the same boundary. **ONLY THE LARGEST TUMOR'S SIZE ENTERS THE SUM** - every other tumor contributes 1 by being counted, however large it is - so three tumors of 4.9, 4.8 and 4.7 cm and three of 4.9, 0.5 and 0.5 cm score identically. TOTAL TUMOR BURDEN IS NOT WHAT THIS MEASURES; do not sum diameters. **MILAN IS FULLY CONTAINED WITHIN UP-TO-SEVEN** (a single 5 cm tumor gives 6, three 3 cm tumors give 6), so up-to-seven can only ADD candidates and never remove them; both statuses are returned from the same inputs. **THE UCSF CRITERIA ARE DELIBERATELY NOT COMPUTED HERE**: their published renderings diverge on whether the nodule limit is two or three and on whether the size thresholds are strict or inclusive, and a divergent cell is reported rather than guessed. This reports a CRITERION, NOT A LISTING DECISION: candidacy also depends on MELD allocation and exception points, on response to downstaging or bridging therapy, on organ availability and on center policy, none of which is known here. It does not stage HCC, does not read imaging, and does not decide between transplantation, resection, ablation and locoregional therapy.`,
    compute: U.upToSeven,
    fields: [
      { dom: 'u7-count', arg: 'tumorCount', kind: 'number', unit: 'tumors', required: true, label: 'Number of tumors. Each tumor adds 1 to the sum, including the largest.' },
      { dom: 'u7-largest', arg: 'largestTumorCm', kind: 'number', unit: 'cm', required: true, label: 'Diameter of the LARGEST tumor. ONLY THIS SIZE ENTERS THE SUM - do not sum the diameters of the others.' },
      { dom: 'u7-gvi', arg: 'grossVascularInvasion', kind: 'enum', values: ['no', 'yes'], required: true, label: 'GROSS (macro) vascular invasion - what imaging can actually show. This is NOT microvascular invasion, which the published criterion assumes absent and which cannot be assessed before transplant.' },
      { dom: 'u7-extra', arg: 'extrahepaticSpread', kind: 'enum', values: ['no', 'yes'], required: true, label: 'Extrahepatic spread. Present places the patient outside these criteria regardless of the sum.' },
    ],
  },
];
